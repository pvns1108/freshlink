/**
 * priorityEngine.js
 *
 * Transparent, explainable priority scoring for food items.
 * Every score comes with a plain-English list of "reasons" so the UI
 * (and the hackathon judges) can see exactly why a score was produced —
 * this is deliberately NOT a black box.
 */

const LARGE_QUANTITY_THRESHOLD = 10;

function daysUntil(date) {
  const now = new Date();
  const target = new Date(date);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / msPerDay);
}

function expiryUrgencyScore(days) {
  if (days <= 1) return { points: 50, reason: days < 0 ? "Already expired" : "Expires within 1 day" };
  if (days <= 3) return { points: 35, reason: `Expires in ${days} days` };
  if (days <= 7) return { points: 20, reason: `Expires in ${days} days` };
  return { points: 5, reason: `Expires in ${days} days (not urgent yet)` };
}

function conditionScore(condition) {
  switch (condition) {
    case "Fresh":
      return { points: 0, reason: null };
    case "Near Expiry":
      return { points: 20, reason: "Near-expiry status" };
    case "Possible Deterioration":
      return { points: 35, reason: "Possible deterioration detected" };
    case "Inspection Required":
      return { points: 40, reason: "Inspection required" };
    default:
      return { points: 0, reason: null };
  }
}

function quantityScore(quantity) {
  if (quantity >= LARGE_QUANTITY_THRESHOLD) {
    return { points: 10, reason: "Large quantity" };
  }
  return { points: 0, reason: null };
}

function temperatureScore(temperatureC, category) {
  // Simple informational threshold: cold-chain categories above 8C is a flag.
  const coldChainCategories = ["Dairy", "Produce", "Bakery"];
  if (temperatureC === null || temperatureC === undefined) return { points: 0, reason: null };
  if (coldChainCategories.includes(category) && temperatureC > 8) {
    return { points: 15, reason: "Temperature excursion detected" };
  }
  return { points: 0, reason: null };
}

function levelFromScore(score) {
  if (score >= 80) return "CRITICAL";
  if (score >= 55) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

function recommendedActionFor(level, condition, days) {
  if (condition === "Possible Deterioration" || condition === "Inspection Required") {
    return "Inspection required before use or donation";
  }
  if (level === "CRITICAL" || level === "HIGH") {
    return days <= 1 ? "Use soon / Donate today" : "Discount / Donate";
  }
  if (level === "MEDIUM") {
    return "Use soon / Consider discount";
  }
  return "Keep in inventory";
}

/**
 * calculateFoodPriority
 * @param {Object} foodItem - { expiryDate, category, quantity, aiCondition, temperatureC }
 * @returns {{ priorityScore: number, priorityLevel: string, recommendedAction: string, reasons: string[], daysUntilExpiry: number }}
 */
export function calculateFoodPriority(foodItem) {
  const { expiryDate, category, quantity = 1, aiCondition = "Normal", temperatureC = null } = foodItem;

  const days = daysUntil(expiryDate);
  const expiry = expiryUrgencyScore(days);
  const condition = conditionScore(aiCondition);
  const qty = quantityScore(quantity);
  const temp = temperatureScore(temperatureC, category);

  const totalScoreRaw = expiry.points + condition.points + qty.points + temp.points;
  const priorityScore = Math.min(totalScoreRaw, 100);
  const priorityLevel = levelFromScore(priorityScore);

  const reasons = [expiry.reason, condition.reason, qty.reason, temp.reason].filter(Boolean);

  return {
    priorityScore,
    priorityLevel,
    recommendedAction: recommendedActionFor(priorityLevel, aiCondition, days),
    reasons,
    daysUntilExpiry: days,
  };
}

export default { calculateFoodPriority };
