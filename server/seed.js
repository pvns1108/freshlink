/**
 * seed.js
 *
 * Populates a fresh database with realistic demo data so FreshLink looks
 * fully populated the moment a judge logs in — no manual setup required.
 *
 * Run with: npm run seed  (from /server, or `npm run seed` at the repo root)
 *
 * Design choice: food items are pushed through the SAME priority engine and
 * automation engine used by the live API (calculateFoodPriority,
 * runFoodWorkflow), so seeded donations, NGO matches, notifications and
 * automation logs are generated exactly as they would be from a real scan —
 * not hand-faked — which keeps the demo internally consistent.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

import User from "./models/User.js";
import FoodItem from "./models/FoodItem.js";
import NGO from "./models/NGO.js";
import Donation from "./models/Donation.js";
import Notification from "./models/Notification.js";
import AutomationLog from "./models/AutomationLog.js";
import TemperatureReading from "./models/TemperatureReading.js";

import { calculateFoodPriority } from "./services/priorityEngine.js";
import { runFoodWorkflow } from "./services/automationEngine.js";
import { notify } from "./services/notificationService.js";

dotenv.config();

const CITY = "Rivermill"; // fictional city used for all demo locations
const CENTER = { lat: 28.52, lng: 77.06 };

const addDays = (n) => {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
};

const jitter = (base, spread = 0.05) => base + (Math.random() - 0.5) * spread;

async function run() {
  console.log("🌱 Seeding FreshLink demo data...\n");
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error("❌ Could not establish a database connection — aborting seed.");
    process.exit(1);
  }

  console.log("Clearing existing collections...");
  await Promise.all([
    User.deleteMany({}),
    FoodItem.deleteMany({}),
    NGO.deleteMany({}),
    Donation.deleteMany({}),
    Notification.deleteMany({}),
    AutomationLog.deleteMany({}),
    TemperatureReading.deleteMany({}),
  ]);

  // ---------------------------------------------------------------------
  // 1. Demo users (credentials documented in README)
  // ---------------------------------------------------------------------
  console.log("Creating demo users...");
  const admin = await User.create({
    name: "Ava Patel",
    email: "admin@freshlink.demo",
    password: "admin123",
    role: "admin",
    location: { address: "FreshLink HQ", city: CITY, lat: CENTER.lat, lng: CENTER.lng },
    isDemoAccount: true,
  });

  const shopUser = await User.create({
    name: "Marcus Chen",
    email: "shop@freshlink.demo",
    password: "shop123",
    role: "shop",
    organizationName: "GreenMart Supermarket",
    location: { address: "12 Market Street", city: CITY, lat: jitter(CENTER.lat), lng: jitter(CENTER.lng) },
    isDemoAccount: true,
  });

  const ngoUser = await User.create({
    name: "Priya Nair",
    email: "ngo@freshlink.demo",
    password: "ngo123",
    role: "ngo",
    organizationName: "FoodBridge NGO",
    location: { address: "45 Community Ave", city: CITY, lat: jitter(CENTER.lat), lng: jitter(CENTER.lng) },
    isDemoAccount: true,
  });

  const householdUser = await User.create({
    name: "Sam Rivera",
    email: "user@freshlink.demo",
    password: "user123",
    role: "household",
    location: { address: "8 Willow Lane", city: CITY, lat: jitter(CENTER.lat), lng: jitter(CENTER.lng) },
    isDemoAccount: true,
  });

  // ---------------------------------------------------------------------
  // 2. NGOs
  // ---------------------------------------------------------------------
  console.log("Creating NGOs...");
  const ngoDefs = [
    {
      name: "Hope Foundation",
      description: "Community kitchen serving families across Rivermill.",
      location: { address: "3 Hope St", city: CITY, lat: jitter(CENTER.lat), lng: jitter(CENTER.lng) },
      categoriesAccepted: ["Dairy", "Bakery", "Produce", "Packaged Food"],
      maxCapacityKg: 150,
      currentLoadKg: 40,
      pickupAvailable: true,
      urgencyNeed: "HIGH",
      contactName: "Elena Ross",
      contactPhone: "555-0101",
      contactEmail: "contact@hopefoundation.demo",
    },
    {
      name: "Feeding Hands",
      description: "Volunteer-run food redistribution network.",
      location: { address: "21 Elm Rd", city: CITY, lat: jitter(CENTER.lat), lng: jitter(CENTER.lng) },
      categoriesAccepted: ["Grains", "Canned Food", "Packaged Food", "Produce"],
      maxCapacityKg: 200,
      currentLoadKg: 120,
      pickupAvailable: true,
      urgencyNeed: "MEDIUM",
      contactName: "David Kim",
      contactPhone: "555-0102",
      contactEmail: "contact@feedinghands.demo",
    },
    {
      name: "FoodBridge NGO",
      description: "Bridging surplus food from shops to shelters same-day.",
      location: { address: "45 Community Ave", city: CITY, lat: jitter(CENTER.lat), lng: jitter(CENTER.lng) },
      categoriesAccepted: ["Dairy", "Bakery", "Packaged Food"],
      maxCapacityKg: 120,
      currentLoadKg: 30,
      pickupAvailable: true,
      urgencyNeed: "HIGH",
      contactName: "Priya Nair",
      contactPhone: "555-0103",
      contactEmail: "contact@foodbridge.demo",
    },
    {
      name: "Helping Plate",
      description: "Meal-prep charity supporting shelters and elder care homes.",
      location: { address: "9 Baker's Row", city: CITY, lat: jitter(CENTER.lat), lng: jitter(CENTER.lng) },
      categoriesAccepted: ["Produce", "Dairy", "Grains", "Canned Food"],
      maxCapacityKg: 100,
      currentLoadKg: 75,
      pickupAvailable: false,
      urgencyNeed: "LOW",
      contactName: "Omar Farid",
      contactPhone: "555-0104",
      contactEmail: "contact@helpingplate.demo",
    },
    {
      name: "Community Harvest Trust",
      description: "Rescues surplus produce for community pantries.",
      location: { address: "60 Orchard Way", city: CITY, lat: jitter(CENTER.lat, 0.12), lng: jitter(CENTER.lng, 0.12) },
      categoriesAccepted: ["Produce", "Bakery", "Other"],
      maxCapacityKg: 90,
      currentLoadKg: 20,
      pickupAvailable: true,
      urgencyNeed: "MEDIUM",
      contactName: "Lena Wu",
      contactPhone: "555-0105",
      contactEmail: "contact@harvesttrust.demo",
    },
  ];
  const ngos = await NGO.insertMany(ngoDefs);

  // ---------------------------------------------------------------------
  // 3. Food items — pushed through the real priority + automation engine
  // ---------------------------------------------------------------------
  console.log("Creating food items and running the automation engine on each...");

  const foodDefs = [
    // --- Shop (GreenMart Supermarket) — includes the core demo scenario ---
    { owner: shopUser, name: "Bread Packets", category: "Bakery", quantity: 25, unit: "packets", days: 1, condition: "Near Expiry", confidence: 0.83, issues: [] },
    { owner: shopUser, name: "Milk Cartons", category: "Dairy", quantity: 15, unit: "cartons", days: 2, condition: "Near Expiry", confidence: 0.87, issues: [] },
    { owner: shopUser, name: "Tomato Boxes", category: "Produce", quantity: 10, unit: "boxes", days: 4, condition: "Possible Deterioration", confidence: 0.81, issues: ["Visible discoloration", "Possible surface damage"] },
    { owner: shopUser, name: "Yogurt Cups", category: "Dairy", quantity: 20, unit: "cups", days: 3, condition: "Near Expiry", confidence: 0.85, issues: [] },
    { owner: shopUser, name: "Bananas (Case)", category: "Produce", quantity: 12, unit: "kg", days: 2, condition: "Near Expiry", confidence: 0.79, issues: ["Minor softening"] },
    { owner: shopUser, name: "Croissants", category: "Bakery", quantity: 18, unit: "pieces", days: 1, condition: "Near Expiry", confidence: 0.82, issues: [] },
    { owner: shopUser, name: "Cheese Blocks", category: "Dairy", quantity: 8, unit: "blocks", days: 10, condition: "Fresh", confidence: 0.93, issues: [] },
    { owner: shopUser, name: "Rice Bags", category: "Grains", quantity: 30, unit: "kg", days: 60, condition: "Fresh", confidence: 0.95, issues: [] },
    { owner: shopUser, name: "Canned Beans", category: "Canned Food", quantity: 40, unit: "cans", days: 200, condition: "Fresh", confidence: 0.97, issues: [] },
    { owner: shopUser, name: "Packaged Chips", category: "Packaged Food", quantity: 50, unit: "packets", days: 90, condition: "Normal", confidence: 0.9, issues: [] },
    // --- Household (Sam Rivera) ---
    { owner: householdUser, name: "Milk (1L Carton)", category: "Dairy", quantity: 2, unit: "cartons", days: 1, condition: "Near Expiry", confidence: 0.86, issues: [] },
    { owner: householdUser, name: "Leftover Vegetables", category: "Produce", quantity: 1, unit: "bag", days: 2, condition: "Near Expiry", confidence: 0.77, issues: [] },
    { owner: householdUser, name: "Bread Loaf", category: "Bakery", quantity: 1, unit: "loaf", days: 3, condition: "Near Expiry", confidence: 0.8, issues: [] },
    { owner: householdUser, name: "Apples", category: "Produce", quantity: 6, unit: "pieces", days: 5, condition: "Fresh", confidence: 0.9, issues: [] },
    { owner: householdUser, name: "Eggs", category: "Other", quantity: 12, unit: "pieces", days: 12, condition: "Fresh", confidence: 0.94, issues: [] },
    { owner: householdUser, name: "Frozen Peas", category: "Packaged Food", quantity: 2, unit: "bags", days: 120, condition: "Fresh", confidence: 0.96, issues: [] },
    { owner: householdUser, name: "Rice", category: "Grains", quantity: 5, unit: "kg", days: 200, condition: "Fresh", confidence: 0.95, issues: [] },
    { owner: householdUser, name: "Canned Soup", category: "Canned Food", quantity: 4, unit: "cans", days: 300, condition: "Fresh", confidence: 0.97, issues: [] },
    { owner: householdUser, name: "Spinach", category: "Produce", quantity: 1, unit: "bag", days: 0, condition: "Possible Deterioration", confidence: 0.76, issues: ["Visible discoloration", "Wilting"] },
    { owner: householdUser, name: "Yogurt", category: "Dairy", quantity: 3, unit: "cups", days: 6, condition: "Normal", confidence: 0.88, issues: [] },
  ];

  const createdFoodItems = [];
  const createdDonations = [];

  for (const def of foodDefs) {
    const expiryDate = addDays(def.days);
    const priority = calculateFoodPriority({
      expiryDate,
      category: def.category,
      quantity: def.quantity,
      aiCondition: def.condition,
      temperatureC: null,
    });

    const item = await FoodItem.create({
      owner: def.owner._id,
      name: def.name,
      category: def.category,
      quantity: def.quantity,
      unit: def.unit,
      expiryDate,
      storageLocation: def.owner.role === "shop" ? "Store Cold Room" : "Home Fridge",
      aiCondition: def.condition,
      aiConfidence: def.confidence,
      possibleIssues: def.issues,
      inspectionRequired: def.condition === "Possible Deterioration" || def.condition === "Inspection Required",
      aiMode: "demo",
      priorityScore: priority.priorityScore,
      priorityLevel: priority.priorityLevel,
      priorityReasons: priority.reasons,
      recommendedAction: priority.recommendedAction,
      status: "Fresh", // set by runFoodWorkflow below
    });

    const { donation } = await runFoodWorkflow({ foodItem: item, user: def.owner });
    createdFoodItems.push(item);
    if (donation) createdDonations.push(donation);
  }

  // ---------------------------------------------------------------------
  // 4. Diversify donation statuses so every status/filter has an example
  // ---------------------------------------------------------------------
  console.log("Diversifying donation statuses for a realistic Donations page...");
  const statusPlan = ["Accepted", "Pickup Scheduled", "Picked Up", "Completed"];
  for (let i = 0; i < statusPlan.length && i < createdDonations.length; i += 1) {
    const donation = createdDonations[i];
    donation.status = statusPlan[i];
    if (statusPlan[i] === "Pickup Scheduled" || statusPlan[i] === "Accepted") {
      donation.pickupTime = addDays(0);
      donation.pickupTime.setHours(17, 30, 0, 0);
    }
    if (statusPlan[i] === "Picked Up" || statusPlan[i] === "Completed") {
      donation.pickupTime = addDays(-1);
    }
    await donation.save();

    await AutomationLog.create({
      user: donation.donor,
      relatedDonation: donation._id,
      action: "DONATION_STATUS_UPDATED",
      message: `Donation #${donation.donationCode} status updated to "${donation.status}".`,
    });
  }

  // A couple of extra standalone historical donations for richer analytics charts
  console.log("Adding historical donations for analytics trend data...");
  const historicalDefs = [
    { monthsAgo: 1, status: "Completed", desc: "40 Sandwich Packs", qty: 40, category: "Packaged Food", donor: shopUser },
    { monthsAgo: 2, status: "Completed", desc: "60 kg Mixed Produce", qty: 60, category: "Produce", donor: shopUser },
    { monthsAgo: 3, status: "Completed", desc: "15 kg Rice & Grains", qty: 15, category: "Grains", donor: shopUser },
    { monthsAgo: 0, status: "Cancelled", desc: "10 Canned Goods", qty: 10, category: "Canned Food", donor: householdUser },
  ];

  for (const h of historicalDefs) {
    const donationCode = `FL${Math.floor(1000 + Math.random() * 9000)}`;
    const historicalDate = new Date();
    historicalDate.setMonth(historicalDate.getMonth() - h.monthsAgo);

    const donation = await Donation.create({
      donationCode,
      donor: h.donor._id,
      foodDescription: h.desc,
      quantity: h.qty,
      unit: "units",
      category: h.category,
      expiryDate: historicalDate,
      priorityLevel: "MEDIUM",
      matchedNGO: ngos[Math.floor(Math.random() * ngos.length)]._id,
      matchScore: 70 + Math.floor(Math.random() * 25),
      status: h.status,
    });

    // Backdate timestamps directly, bypassing the timestamps hook, for chart realism
    await Donation.collection.updateOne(
      { _id: donation._id },
      { $set: { createdAt: historicalDate, updatedAt: historicalDate } }
    );
  }

  // ---------------------------------------------------------------------
  // 5. Temperature history (simulated IoT cold-chain sensor + excursion)
  // ---------------------------------------------------------------------
  console.log("Creating simulated temperature sensor history...");
  const milkItem = createdFoodItems.find((f) => f.name === "Milk Cartons");
  const tempSeries = [
    { hour: 10, temp: 4 },
    { hour: 11, temp: 5 },
    { hour: 12, temp: 6 },
    { hour: 13, temp: 11 },
    { hour: 14, temp: 12 },
  ];
  for (const point of tempSeries) {
    const recordedAt = new Date();
    recordedAt.setHours(point.hour, 0, 0, 0);
    const excursion = point.temp > 8;
    await TemperatureReading.create({
      foodItem: milkItem._id,
      owner: shopUser._id,
      temperatureC: point.temp,
      recordedAt,
      excursion,
      source: "simulated",
    });
    if (excursion) {
      await AutomationLog.create({
        user: shopUser._id,
        relatedFoodItem: milkItem._id,
        action: "TEMPERATURE_EXCURSION",
        message: `Temperature excursion detected (${point.temp}°C) — inspection recommended.`,
      });
    }
  }
  await notify({
    userId: shopUser._id,
    title: "Temperature excursion detected",
    message: "Temperature excursion detected (12°C) — inspection recommended for Milk Cartons.",
    type: "inspection",
    relatedFoodItem: milkItem._id,
  });

  // ---------------------------------------------------------------------
  // 6. A few extra hand-written notifications matching the spec examples
  // ---------------------------------------------------------------------
  console.log("Seeding a few extra illustrative notifications...");
  const foodBridge = ngos.find((n) => n.name === "FoodBridge NGO");
  await notify({
    userId: shopUser._id,
    title: "Donation accepted",
    message: `${foodBridge.name} accepted your donation.`,
    type: "donation",
  });
  await notify({
    userId: shopUser._id,
    title: "Pickup scheduled",
    message: "Pickup scheduled for today at 5:30 PM.",
    type: "pickup",
  });
  await notify({
    userId: householdUser._id,
    title: "Item nearing expiry",
    message: "Milk (1L Carton) expires in 1 day.",
    type: "expiry",
  });

  console.log("\n✅ Seed complete!");
  console.log(`   Users: 4 demo accounts (admin, shop, ngo, household)`);
  console.log(`   Food items: ${createdFoodItems.length}`);
  console.log(`   NGOs: ${ngos.length}`);
  console.log(`   Donations: ${createdDonations.length + historicalDefs.length}`);
  console.log(`   Temperature readings: ${tempSeries.length}`);
  console.log("\nDemo credentials:");
  console.log("   Admin:     admin@freshlink.demo / admin123");
  console.log("   Shop:      shop@freshlink.demo  / shop123");
  console.log("   NGO:       ngo@freshlink.demo   / ngo123");
  console.log("   Household: user@freshlink.demo  / user123\n");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
