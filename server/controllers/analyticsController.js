import FoodItem from "../models/FoodItem.js";
import Donation from "../models/Donation.js";
import NGO from "../models/NGO.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const scopeQuery = (req) => (req.user.role === "admin" || req.user.role === "ngo" ? {} : { owner: req.user._id });
const donationScopeQuery = (req) => (req.user.role === "admin" || req.user.role === "ngo" ? {} : { donor: req.user._id });

const AVG_ITEM_WEIGHT_KG = 0.6; // rough estimate used purely for the "kg saved" demo insight

// @route GET /api/analytics/dashboard
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const foodQuery = scopeQuery(req);
  const donationQuery = donationScopeQuery(req);

  const [totalFoodItems, nearExpiry, donationCandidates, inspectionRequired, donatedOrUsed, activeDonations, statusAgg] =
    await Promise.all([
      FoodItem.countDocuments(foodQuery),
      FoodItem.countDocuments({ ...foodQuery, status: "Near Expiry" }),
      FoodItem.countDocuments({ ...foodQuery, status: "Donation Candidate" }),
      FoodItem.countDocuments({ ...foodQuery, status: "Inspection Required" }),
      FoodItem.countDocuments({ ...foodQuery, status: { $in: ["Donated", "Used"] } }),
      Donation.countDocuments({
        ...donationQuery,
        status: { $in: ["Pending", "Matched", "Accepted", "Pickup Scheduled"] },
      }),
      FoodItem.aggregate([{ $match: foodQuery }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

  const statusDistribution = {
    Fresh: 0,
    "Near Expiry": 0,
    "Donation Candidate": 0,
    "Inspection Required": 0,
  };
  statusAgg.forEach((s) => {
    if (statusDistribution[s._id] !== undefined) statusDistribution[s._id] = s.count;
  });

  // Monthly waste-reduction trend: count completed donations per month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyAgg = await Donation.aggregate([
    { $match: { ...donationQuery, status: "Completed", updatedAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$updatedAt" }, month: { $month: "$updatedAt" } },
        completedDonations: { $sum: 1 },
        itemsSaved: { $sum: "$quantity" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrend = buildLastSixMonths(monthNames).map((m) => {
    const found = monthlyAgg.find((a) => a._id.year === m.year && a._id.month === m.monthIndex + 1);
    return {
      month: m.label,
      itemsSaved: found?.itemsSaved || 0,
      donationsCompleted: found?.completedDonations || 0,
    };
  });

  // Donation status breakdown (for a donations-completed style chart)
  const donationStatusAgg = await Donation.aggregate([
    { $match: donationQuery },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const donationStatusBreakdown = donationStatusAgg.map((d) => ({ status: d._id, count: d.count }));

  // Expiry timeline: bucket active food items by days-until-expiry
  const activeItems = await FoodItem.find({
    ...foodQuery,
    status: { $nin: ["Donated", "Used", "Discarded", "Expired"] },
  }).select("expiryDate name quantity");

  const timelineBuckets = { "Expired": 0, "0-1 days": 0, "2-3 days": 0, "4-7 days": 0, "8+ days": 0 };
  const now = new Date();
  activeItems.forEach((item) => {
    const days = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
    if (days < 0) timelineBuckets["Expired"] += 1;
    else if (days <= 1) timelineBuckets["0-1 days"] += 1;
    else if (days <= 3) timelineBuckets["2-3 days"] += 1;
    else if (days <= 7) timelineBuckets["4-7 days"] += 1;
    else timelineBuckets["8+ days"] += 1;
  });
  const expiryTimeline = Object.entries(timelineBuckets).map(([bucket, count]) => ({ bucket, count }));

  const foodWastePreventedKg = Math.round(donatedOrUsed * AVG_ITEM_WEIGHT_KG * 10) / 10;

  const extra =
    req.user.role === "admin"
      ? {
          totalUsers: await User.countDocuments(),
          activeNGOs: await NGO.countDocuments({ isActive: true }),
        }
      : {};

  res.json({
    cards: {
      totalFoodItems,
      nearExpiry,
      donationCandidates,
      itemsSaved: donatedOrUsed,
      foodWastePreventedKg,
      activeDonations,
      ...extra,
    },
    statusDistribution,
    monthlyTrend,
    donationStatusBreakdown,
    expiryTimeline,
  });
});

function buildLastSixMonths(monthNames) {
  const result = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 5; i >= 0; i -= 1) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    result.push({ label: monthNames[dt.getMonth()], monthIndex: dt.getMonth(), year: dt.getFullYear() });
  }
  return result;
}

export default { getDashboardAnalytics };
