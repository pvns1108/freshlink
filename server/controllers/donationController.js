import Donation from "../models/Donation.js";
import NGO from "../models/NGO.js";
import AutomationLog from "../models/AutomationLog.js";
import asyncHandler from "../utils/asyncHandler.js";
import { notify } from "../services/notificationService.js";

// @route GET /api/donations
export const getDonations = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = {};

  if (req.user.role === "ngo") {
    // NGOs see donations matched to any NGO (demo simplification: all NGOs
    // share visibility of the matching pool, mirroring a shared marketplace).
    query = {};
  } else if (req.user.role !== "admin") {
    query.donor = req.user._id;
  }

  if (status && status !== "All") query.status = status;

  const donations = await Donation.find(query)
    .sort({ createdAt: -1 })
    .populate("donor", "name role")
    .populate("matchedNGO", "name location contactPhone contactEmail")
    .populate("foodItem");

  res.json({ donations });
});

// @route GET /api/donations/:id
export const getDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id)
    .populate("donor", "name role email")
    .populate("matchedNGO")
    .populate("foodItem");
  if (!donation) return res.status(404).json({ message: "Donation not found." });
  res.json({ donation });
});

// @route POST /api/donations  (manual donation creation, e.g. without a scanned food item)
export const createDonation = asyncHandler(async (req, res) => {
  const donationCode = `FL${Math.floor(1000 + Math.random() * 9000)}`;
  const donation = await Donation.create({ ...req.body, donationCode, donor: req.user._id });
  res.status(201).json({ donation });
});

// @route PUT /api/donations/:id  (status updates: accept, schedule pickup, cancel, complete)
export const updateDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id).populate("matchedNGO");
  if (!donation) return res.status(404).json({ message: "Donation not found." });

  const previousStatus = donation.status;
  Object.assign(donation, req.body);
  await donation.save();

  if (previousStatus !== donation.status) {
    await AutomationLog.create({
      user: req.user._id,
      relatedDonation: donation._id,
      action: "DONATION_STATUS_UPDATED",
      message: `Donation #${donation.donationCode} status changed: ${previousStatus} -> ${donation.status}.`,
    });

    await notify({
      userId: donation.donor,
      title: `Donation ${donation.status.toLowerCase()}`,
      message: `Donation #${donation.donationCode} is now "${donation.status}".${
        donation.matchedNGO?.name ? ` (${donation.matchedNGO.name})` : ""
      }`,
      type: "pickup",
      relatedDonation: donation._id,
    });
  }

  res.json({ donation });
});

export default { getDonations, getDonation, createDonation, updateDonation };
