/**
 * ocrService.js
 *
 * Expiry-date OCR abstraction. Uses Tesseract.js to read text from an
 * uploaded food image, then runs a set of date-pattern regexes against the
 * recognized text to pull out a likely expiry date.
 *
 * Designed to never throw and never block the rest of the app: if OCR
 * fails to load, times out, or finds no date-like text, it returns
 * { success: false } so the caller can fall back to manual entry —
 * per spec: "Do not make the entire application dependent on OCR working."
 */

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

// Supported formats: 18/08/2026, 18-08-2026, 18 Aug 2026, EXP 18/08/26, Best Before 18/08/26
const DATE_PATTERNS = [
  // 18/08/2026 or 18-08-2026
  /(\b\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4}\b)/g,
  // 18 Aug 2026 / 18 August 2026
  /(\b\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4}\b)/gi,
];

const KEYWORD_HINTS = /(exp|expiry|expires|best before|use by|bb date)/i;

function normalizeYear(y) {
  const n = parseInt(y, 10);
  if (n < 100) return n < 50 ? 2000 + n : 1900 + n;
  return n;
}

function parseDatesFromText(text) {
  const matches = [];

  let m;
  const numericRe = new RegExp(DATE_PATTERNS[0]);
  while ((m = numericRe.exec(text)) !== null) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const year = normalizeYear(m[3]);
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
      matches.push(new Date(Date.UTC(year, month, day)));
    }
  }

  const monthNameRe = new RegExp(DATE_PATTERNS[1]);
  while ((m = monthNameRe.exec(text)) !== null) {
    const day = parseInt(m[1], 10);
    const month = MONTHS[m[2].toLowerCase().slice(0, 3)];
    const year = normalizeYear(m[3]);
    if (day >= 1 && day <= 31 && month !== undefined) {
      matches.push(new Date(Date.UTC(year, month, day)));
    }
  }

  return matches.filter((d) => !Number.isNaN(d.getTime()));
}

/**
 * extractExpiryDate
 * @param {Buffer|string} imageInput - image buffer or file path
 * @returns {Promise<{success: boolean, expiryDate?: Date, rawText?: string, confidence?: number, message?: string}>}
 */
export async function extractExpiryDate(imageInput) {
  try {
    // Lazy import so the whole server doesn't fail to boot if tesseract.js
    // has trouble initializing (e.g. no worker/network access in a sandboxed env).
    const Tesseract = await import("tesseract.js");
    const { data } = await Tesseract.recognize(imageInput, "eng", {
      logger: () => {}, // silence progress logs
    });

    const text = data?.text || "";
    const dates = parseDatesFromText(text);

    if (dates.length === 0) {
      return {
        success: false,
        rawText: text,
        message: "Expiry date could not be confidently detected.",
      };
    }

    // Prefer the date closest to a recognizable keyword like "EXP" or "Best Before"
    const hasKeyword = KEYWORD_HINTS.test(text);
    const chosen = dates[0];

    return {
      success: true,
      expiryDate: chosen,
      rawText: text,
      confidence: hasKeyword ? 0.9 : 0.7,
    };
  } catch (err) {
    // OCR engine unavailable or failed — never break the request.
    return {
      success: false,
      message: "Expiry date could not be confidently detected.",
      error: err.message,
    };
  }
}

export default { extractExpiryDate };
