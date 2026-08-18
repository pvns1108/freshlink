/**
 * aiService.js
 *
 * Modular AI food-condition analysis service.
 *
 * SAFETY NOTE (see README "Important AI Limitation"):
 * This service NEVER claims to certify food safety. It only produces an
 * indicative, AI-assisted visual screening result. All condition labels
 * are deliberately hedged ("Possible Deterioration", "Inspection Required")
 * and every result carries an explicit disclaimer string for the UI.
 *
 * Two modes, selected by AI_MODE (falls back to demo automatically):
 *  - "demo": deterministic mock results, keyed off the declared food name /
 *            filename so the same input always gives the same, explainable
 *            output — ideal for a live hackathon demo.
 *  - "api":  placeholder for a real vision model call. If AI_API_KEY is
 *            missing or the call fails, we ALWAYS fall back to demo mode
 *            rather than crash or block the request.
 */

export const AI_DISCLAIMER =
  "AI screening is indicative only. Inspect food before consumption or donation.";

// Deterministic per-food-type demo "knowledge base". Keeps the live demo
// realistic and explainable instead of fully random.
const DEMO_PROFILES = {
  milk: { condition: "Near Expiry", confidence: 0.87, issues: [] },
  dairy: { condition: "Near Expiry", confidence: 0.85, issues: [] },
  bread: { condition: "Near Expiry", confidence: 0.83, issues: ["Slight firmness change"] },
  bakery: { condition: "Near Expiry", confidence: 0.82, issues: ["Slight firmness change"] },
  tomato: {
    condition: "Possible Deterioration",
    confidence: 0.81,
    issues: ["Visible discoloration", "Possible surface damage"],
  },
  vegetable: {
    condition: "Possible Deterioration",
    confidence: 0.78,
    issues: ["Visible discoloration"],
  },
  fruit: { condition: "Near Expiry", confidence: 0.8, issues: ["Minor softening"] },
  rice: { condition: "Fresh", confidence: 0.92, issues: [] },
  "packaged food": { condition: "Normal", confidence: 0.9, issues: [] },
  "canned food": { condition: "Fresh", confidence: 0.95, issues: [] },
};

const DEFAULT_PROFILE = { condition: "Normal", confidence: 0.75, issues: [] };

function pickProfile(foodName = "") {
  const key = foodName.toLowerCase().trim();
  if (DEMO_PROFILES[key]) return DEMO_PROFILES[key];
  const partial = Object.keys(DEMO_PROFILES).find((k) => key.includes(k));
  return partial ? DEMO_PROFILES[partial] : DEFAULT_PROFILE;
}

/**
 * analyzeFoodImage
 * @param {Object} opts
 * @param {string} [opts.declaredFoodName] - name entered/detected for the food
 * @param {string} [opts.imagePath] - path to uploaded image, if any
 * @returns {Promise<{foodType, condition, confidence, possibleIssues, inspectionRequired, aiMode, disclaimer}>}
 */
export async function analyzeFoodImage({ declaredFoodName, imagePath } = {}) {
  const configuredMode = (process.env.AI_MODE || "demo").toLowerCase();
  const hasKey = !!(process.env.AI_API_KEY && process.env.AI_API_KEY.trim());
  const mode = configuredMode === "api" && hasKey ? "api" : "demo";

  if (mode === "api") {
    try {
      // Placeholder for a real vision-model integration. Intentionally left
      // as an extension point — wire up your provider of choice here and
      // return the same shape as the demo branch below.
      throw new Error("Live AI API integration not configured in this build.");
    } catch (err) {
      console.warn("[aiService] API mode failed, falling back to demo:", err.message);
      return buildDemoResult(declaredFoodName, imagePath, true);
    }
  }

  return buildDemoResult(declaredFoodName, imagePath, false);
}

function buildDemoResult(declaredFoodName, imagePath, wasApiFallback) {
  const foodType = declaredFoodName?.trim() || guessFoodTypeFromPath(imagePath) || "Unrecognized item";
  const profile = pickProfile(foodType);
  const inspectionRequired =
    profile.condition === "Possible Deterioration" || profile.condition === "Inspection Required";

  return {
    foodType,
    condition: profile.condition,
    confidence: profile.confidence,
    possibleIssues: profile.issues,
    inspectionRequired,
    aiMode: "demo",
    apiFallback: wasApiFallback,
    disclaimer: AI_DISCLAIMER,
  };
}

function guessFoodTypeFromPath(imagePath) {
  if (!imagePath) return null;
  const lower = imagePath.toLowerCase();
  const found = Object.keys(DEMO_PROFILES).find((k) => lower.includes(k.replace(" ", "")));
  return found || null;
}

export default { analyzeFoodImage, AI_DISCLAIMER };
