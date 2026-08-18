import { distanceKm } from "../utils/geo.js";

/**
 * ngoMatchingService.js
 *
 * Scores and ranks NGOs for a given donation candidate based on:
 *  - Distance (closer is better)
 *  - Food category compatibility
 *  - Available capacity
 *  - The NGO's stated urgency of need
 *  - Pickup availability
 *
 * The score is normalized to 0-100 ("Match Score: 94%") and every result
 * includes the distance so the UI can show it directly.
 */

const WEIGHTS = {
  distance: 35,
  category: 25,
  capacity: 20,
  urgency: 10,
  pickup: 10,
};

function distanceComponent(km) {
  if (km === null) return WEIGHTS.distance * 0.5; // unknown location, neutral score
  if (km <= 2) return WEIGHTS.distance;
  if (km <= 5) return WEIGHTS.distance * 0.85;
  if (km <= 10) return WEIGHTS.distance * 0.6;
  if (km <= 20) return WEIGHTS.distance * 0.3;
  return WEIGHTS.distance * 0.1;
}

function categoryComponent(ngoCategories, foodCategory) {
  if (!foodCategory) return WEIGHTS.category * 0.5;
  return ngoCategories.includes(foodCategory) ? WEIGHTS.category : WEIGHTS.category * 0.2;
}

function capacityComponent(ngo) {
  const available = Math.max((ngo.maxCapacityKg || 0) - (ngo.currentLoadKg || 0), 0);
  const ratio = ngo.maxCapacityKg ? available / ngo.maxCapacityKg : 0;
  return WEIGHTS.capacity * Math.min(ratio * 1.2, 1);
}

function urgencyComponent(ngo) {
  const map = { HIGH: 1, MEDIUM: 0.6, LOW: 0.3 };
  return WEIGHTS.urgency * (map[ngo.urgencyNeed] ?? 0.5);
}

function pickupComponent(ngo) {
  return ngo.pickupAvailable ? WEIGHTS.pickup : 0;
}

/**
 * rankNGOsForDonation
 * @param {Array} ngos - list of NGO documents
 * @param {Object} donation - { lat, lng, category }
 * @returns {Array} NGOs annotated with matchScore (0-100) and distanceKm, sorted best-first
 */
export function rankNGOsForDonation(ngos, donation) {
  const { lat, lng, category } = donation;

  const scored = ngos
    .filter((ngo) => ngo.isActive !== false)
    .map((ngo) => {
      const km = distanceKm(lat, lng, ngo.location?.lat, ngo.location?.lng);
      const score =
        distanceComponent(km) +
        categoryComponent(ngo.categoriesAccepted || [], category) +
        capacityComponent(ngo) +
        urgencyComponent(ngo) +
        pickupComponent(ngo);

      return {
        ngo,
        matchScore: Math.round(Math.min(score, 100)),
        distanceKm: km === null ? null : Math.round(km * 10) / 10,
      };
    });

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}

export default { rankNGOsForDonation };
