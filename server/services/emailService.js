/**
 * emailService.js
 *
 * Abstraction over outbound email so a real provider (SendGrid, SES, Resend,
 * etc.) can be plugged in later without touching call sites. In this
 * hackathon build there's no SMTP configured, so we simulate delivery by
 * logging — every notification is still recorded in-app regardless.
 */
export async function sendEmail({ to, subject, body }) {
  console.log(`[emailService] (simulated) -> ${to} | ${subject} | ${body}`);
  return { simulated: true, to, subject };
}

export default { sendEmail };
