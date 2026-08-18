import AutomationLog from "../models/AutomationLog.js";
import Donation from "../models/Donation.js";
import NGO from "../models/NGO.js";
import { rankNGOsForDonation } from "./ngoMatchingService.js";
import { notify } from "./notificationService.js";

/**
 * automationEngine.js
 *
 * This is the "not just CRUD" heart of FreshLink. After a food item is
 * scanned or added, this engine:
 *   1. Picks a workflow based on condition + days-until-expiry.
 *   2. Logs every decision to AutomationLog (shown on the Automation Center page).
 *   3. For donation-worthy items: creates a Donation, ranks nearby NGOs,
 *      attaches the best match, and fires a notification.
 *   4. For near-expiry shop items: suggests a discount.
 *
 * The engine NEVER states that AI has certified food safety — every
 * donation created here carries an explicit inspection disclaimer.
 */

async function log(user, action, message, meta = {}, relatedFoodItem, relatedDonation) {
  return AutomationLog.create({
    user: user?._id,
    relatedFoodItem,
    relatedDonation,
    action,
    message,
    meta,
  });
}

function decideWorkflow(foodItem) {
  const { status, priorityLevel, daysUntilExpiry, aiCondition } = foodItem;

  if (aiCondition === "Possible Deterioration" || aiCondition === "Inspection Required") {
    return "INSPECTION_REQUIRED";
  }
  if (status === "Donation Candidate" || (daysUntilExpiry <= 3 && priorityLevel !== "LOW")) {
    return "DONATION_CANDIDATE";
  }
  if (status === "Near Expiry" || daysUntilExpiry <= 7) {
    return "NEAR_EXPIRY";
  }
  return "FRESH";
}

/**
 * runFoodWorkflow
 * @param {Object} params
 * @param {Object} params.foodItem - a saved FoodItem mongoose document
 * @param {Object} params.user - the owner (mongoose User document)
 * @returns {Promise<{ workflow: string, donation: Object|null, ngoMatches: Array }>}
 */
export async function runFoodWorkflow({ foodItem, user }) {
  const workflow = decideWorkflow({
    status: foodItem.status,
    priorityLevel: foodItem.priorityLevel,
    daysUntilExpiry: daysBetween(foodItem.expiryDate),
    aiCondition: foodItem.aiCondition,
  });

  await log(
    user,
    "AI_ANALYSIS",
    `AI detected "${foodItem.name}" — condition: ${foodItem.aiCondition} (confidence ${Math.round(
      (foodItem.aiConfidence || 0) * 100
    )}%).`,
    { foodItemId: foodItem._id },
    foodItem._id
  );

  await log(
    user,
    "PRIORITY_SCORED",
    `Priority score calculated: ${foodItem.priorityScore} (${foodItem.priorityLevel}).`,
    { reasons: foodItem.priorityReasons },
    foodItem._id
  );

  let donation = null;
  let ngoMatches = [];

  if (workflow === "INSPECTION_REQUIRED") {
    foodItem.status = "Inspection Required";
    await log(
      user,
      "INSPECTION_FLAGGED",
      `Inspection recommended for "${foodItem.name}" due to possible deterioration.`,
      {},
      foodItem._id
    );
    await notify({
      userId: user._id,
      userEmail: user.email,
      title: "Inspection recommended",
      message: `Inspection recommended for ${foodItem.name} due to possible deterioration.`,
      type: "inspection",
      relatedFoodItem: foodItem._id,
    });
  } else if (workflow === "DONATION_CANDIDATE") {
    foodItem.status = "Donation Candidate";
    await log(user, "DONATION_CANDIDATE_IDENTIFIED", `Donation candidates identified for "${foodItem.name}".`, {}, foodItem._id);

    const result = await createDonationWithMatching({ foodItem, user });
    donation = result.donation;
    ngoMatches = result.ngoMatches;
  } else if (workflow === "NEAR_EXPIRY") {
    foodItem.status = "Near Expiry";
    if (user.role === "shop" && foodItem.discountSuggested === null) {
      const discount = suggestDiscount(daysBetween(foodItem.expiryDate));
      foodItem.discountSuggested = discount;
      await log(
        user,
        "DISCOUNT_SUGGESTED",
        `Recommended discount: ${discount}% for "${foodItem.name}".`,
        { discount },
        foodItem._id
      );
    }
    await notify({
      userId: user._id,
      userEmail: user.email,
      title: "Item nearing expiry",
      message: `${foodItem.name} expires in ${daysBetween(foodItem.expiryDate)} day(s).`,
      type: "expiry",
      relatedFoodItem: foodItem._id,
    });
  } else {
    foodItem.status = "Fresh";
    await log(user, "KEEP_IN_INVENTORY", `"${foodItem.name}" is fresh — kept in inventory with an expiry reminder.`, {}, foodItem._id);
  }

  await foodItem.save();

  return { workflow, donation, ngoMatches };
}

/**
 * createDonationWithMatching
 * Creates a Donation record for a food item and immediately ranks nearby NGOs,
 * attaching the top match. Mirrors steps 1-4 of the spec's Workflow 3.
 */
export async function createDonationWithMatching({ foodItem, user }) {
  const donationCode = `FL${Math.floor(1000 + Math.random() * 9000)}`;

  const donation = await Donation.create({
    donationCode,
    donor: user._id,
    foodItem: foodItem._id,
    foodDescription: `${foodItem.quantity} ${foodItem.unit} ${foodItem.name}`,
    quantity: foodItem.quantity,
    unit: foodItem.unit,
    category: foodItem.category,
    expiryDate: foodItem.expiryDate,
    priorityLevel: foodItem.priorityLevel,
    status: "Pending",
  });

  await log(
    user,
    "DONATION_CREATED",
    `Donation listing #${donation.donationCode} created for ${donation.foodDescription}.`,
    {},
    foodItem._id,
    donation._id
  );

  await log(user, "NGO_MATCHING_STARTED", `Nearby NGO matching started for donation #${donation.donationCode}.`, {}, foodItem._id, donation._id);

  const ngos = await NGO.find({ isActive: true });
  const ngoMatches = rankNGOsForDonation(ngos, {
    lat: user.location?.lat,
    lng: user.location?.lng,
    category: foodItem.category,
  });

  if (ngoMatches.length > 0) {
    const top = ngoMatches[0];
    donation.matchedNGO = top.ngo._id;
    donation.matchScore = top.matchScore;
    donation.status = "Matched";
    await donation.save();

    await log(
      user,
      "NGO_RANKED",
      `${top.ngo.name} ranked #1 (${top.matchScore}% match, ${top.distanceKm ?? "?"} km).`,
      { matchScore: top.matchScore, distanceKm: top.distanceKm },
      foodItem._id,
      donation._id
    );

    await notify({
      userId: user._id,
      userEmail: user.email,
      title: "Donation candidate matched",
      message: `${donation.foodDescription} matched with ${top.ngo.name} (${top.matchScore}% match). Notification sent.`,
      type: "donation",
      relatedFoodItem: foodItem._id,
      relatedDonation: donation._id,
    });

    await log(
      user,
      "NOTIFICATION_SENT",
      `Donation notification sent for #${donation.donationCode}.`,
      {},
      foodItem._id,
      donation._id
    );
  }

  return { donation, ngoMatches: ngoMatches.slice(0, 5) };
}

function suggestDiscount(daysUntilExpiry) {
  if (daysUntilExpiry <= 1) return 30;
  if (daysUntilExpiry <= 3) return 25;
  return 20;
}

function daysBetween(date) {
  const now = new Date();
  const target = new Date(date);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / msPerDay);
}

export default { runFoodWorkflow, createDonationWithMatching };
