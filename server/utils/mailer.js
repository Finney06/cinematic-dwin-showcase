import nodemailer from "nodemailer";
import { contactNotificationEmail } from "./emailTemplates.js";

/**
 * Emails a copy of each contact enquiry to the studio. The database stays the
 * source of truth (Admin → Messages): if SMTP isn't configured or a send
 * fails, the enquiry is still saved and nothing is shown to the visitor.
 */
const NOTIFY_TO = process.env.CONTACT_NOTIFY_EMAIL || "cra8.academy@gmail.com";

let transporter = null;
export function recoveryConfigured() {
  return Boolean(process.env.ADMIN_RECOVERY_EMAIL && process.env.ADMIN_USERNAME &&
    process.env.SITE_URL && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendRecoveryEmail(subject, text, html) {
  const mail = getTransporter();
  if (!mail || !recoveryConfigured()) throw new Error("Admin recovery email is not configured");
  await mail.sendMail({
    from: process.env.MAIL_FROM || `CRA8 Website <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_RECOVERY_EMAIL,
    subject, text, html,
  });
}
const getTransporter = () => {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
};

export const sendContactNotification = async ({ name, email, topic, message }) => {
  const mail = getTransporter();
  if (!mail) {
    console.warn("Contact email skipped: SMTP_HOST, SMTP_USER and SMTP_PASS are not all set.");
    return;
  }
  const { subject, text, html } = contactNotificationEmail({ name, email, topic, message });
  await mail.sendMail({
    from: process.env.MAIL_FROM || `CRA8 Website <${process.env.SMTP_USER}>`,
    to: NOTIFY_TO,
    // Hitting Reply in the inbox answers the visitor, not the website.
    replyTo: { name, address: email },
    subject, text, html,
  });
};
