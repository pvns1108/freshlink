import NGO from "../models/NGO.js";
import asyncHandler from "../utils/asyncHandler.js";
import { rankNGOsForDonation } from "../services/ngoMatchingService.js";

// @route GET /api/ngos
export const getNGOs = asyncHandler(async (req, res) => {
  const ngos = await NGO.find({ isActive: true }).sort({ name: 1 });
  res.json({ ngos });
});

// @route GET /api/ngos/nearby?lat=&lng=&category=
export const getNearbyNGOs = asyncHandler(async (req, res) => {
  const lat = parseFloat(req.query.lat ?? req.user.location?.lat);
  const lng = parseFloat(req.query.lng ?? req.user.location?.lng);
  const category = req.query.category || null;

  const ngos = await NGO.find({ isActive: true });
  const ranked = rankNGOsForDonation(ngos, { lat, lng, category });

  res.json({
    ngos: ranked.map((r) => ({
      ...r.ngo.toObject(),
      matchScore: r.matchScore,
      distanceKm: r.distanceKm,
    })),
  });
});

export default { getNGOs, getNearbyNGOs };
