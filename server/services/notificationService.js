import Notification from "../models/Notification.js";
import { sendEmail } from "./emailService.js";

/**
 * notify — creates an in-app notification and simulates an email alongside it.
 */
export async function notify({ userId, title, message, type = "system", relatedFoodItem, relatedDonation, userEmail }) {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    relatedFoodItem,
    relatedDonation,
  });

  if (userEmail) {
    await sendEmail({ to: userEmail, subject: title, body: message });
  }

  return notification;
}

export default { notify };
