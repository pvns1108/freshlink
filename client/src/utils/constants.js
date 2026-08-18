export const CATEGORIES = [
  "Dairy",
  "Bakery",
  "Produce",
  "Grains",
  "Packaged Food",
  "Canned Food",
  "Other",
];

export const STATUSES = [
  "Fresh",
  "Near Expiry",
  "Donation Candidate",
  "Inspection Required",
  "Expired",
  "Donated",
  "Used",
  "Discarded",
];

export const PRIORITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const DONATION_STATUSES = [
  "Pending",
  "Matched",
  "Accepted",
  "Pickup Scheduled",
  "Picked Up",
  "Completed",
  "Cancelled",
];

export const STATUS_COLORS = {
  Fresh: { bg: "bg-primary-light", text: "text-primary-dark", dot: "bg-primary" },
  "Near Expiry": { bg: "bg-accent-light", text: "text-accent-dark", dot: "bg-accent" },
  "Donation Candidate": { bg: "bg-primary-light", text: "text-primary-dark", dot: "bg-primary" },
  "Inspection Required": { bg: "bg-critical-light", text: "text-critical", dot: "bg-critical" },
  Expired: { bg: "bg-critical-light", text: "text-critical", dot: "bg-critical" },
  Donated: { bg: "bg-primary-light", text: "text-primary-dark", dot: "bg-primary" },
  Used: { bg: "bg-line", text: "text-ink-muted", dot: "bg-ink-faint" },
  Discarded: { bg: "bg-line", text: "text-ink-muted", dot: "bg-ink-faint" },
};

export const PRIORITY_COLORS = {
  LOW: { bg: "bg-line", text: "text-ink-muted" },
  MEDIUM: { bg: "bg-accent-light", text: "text-accent-dark" },
  HIGH: { bg: "bg-orange-100", text: "text-orange-700" },
  CRITICAL: { bg: "bg-critical-light", text: "text-critical" },
};

export const DONATION_STATUS_COLORS = {
  Pending: { bg: "bg-line", text: "text-ink-muted" },
  Matched: { bg: "bg-primary-light", text: "text-primary-dark" },
  Accepted: { bg: "bg-primary-light", text: "text-primary-dark" },
  "Pickup Scheduled": { bg: "bg-accent-light", text: "text-accent-dark" },
  "Picked Up": { bg: "bg-accent-light", text: "text-accent-dark" },
  Completed: { bg: "bg-primary-light", text: "text-primary-dark" },
  Cancelled: { bg: "bg-critical-light", text: "text-critical" },
};
