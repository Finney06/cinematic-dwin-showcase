import nodemailer from "nodemailer";
import { contactNotificationEmail } from "./emailTemplates.js";

/**
 * Emails a copy of each contact enquiry to the studio, and admin recovery
 * links to the recovery inbox. The database stays the source of truth
 * (Admin → Messages): if email isn't configured or a send fails, the enquiry
 * is still saved and nothing is shown to the visitor.
 *
 * With a Resend key, mail goes through Resend's HTTPS API (port 443). Hosts
 * such as Render's free tier block outbound SMTP ports, where a plain SMTP
 * send would hang until it timed out. Any other provider uses SMTP.
 */
const notifyTo = () => process.env.CONTACT_NOTIFY_EMAIL || "cra8.academy@gmail.com";
const SEND_TIMEOUT_MS = 15000;

// RESEND_API_KEY, or the key already set as SMTP_PASS for smtp.resend.com.
const resendKey = () =>
  process.env.RESEND_API_KEY ||
  (process.env.SMTP_HOST?.trim() === "smtp.resend.com" ? process.env.SMTP_PASS : "") ||
  "";

const smtpConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const mailConfigured = () => Boolean(resendKey() || smtpConfigured());
const sender = () => process.env.MAIL_FROM || `CRA8 Website <${process.env.SMTP_USER}>`;

let transporter = null;
const getTransporter = () => {
  if (transporter) return transporter;
  if (!smtpConfigured()) return null;
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: SEND_TIMEOUT_MS,
    greetingTimeout: SEND_TIMEOUT_MS,
    socketTimeout: SEND_TIMEOUT_MS,
  });
  return transporter;
};

async function deliver({ to, subject, text, html, replyTo }) {
  const key = resendKey();
  if (key) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: sender(), to: [to], subject, text, html, ...(replyTo ? { reply_to: replyTo.address } : {}) }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(`Resend rejected the email (${response.status}): ${detail.message || detail.name || "unknown error"}`);
    }
    return;
  }
  const mail = getTransporter();
  if (!mail) throw new Error("Email is not configured");
  await mail.sendMail({ from: sender(), to, subject, text, html, ...(replyTo ? { replyTo } : {}) });
}

export function recoveryConfigured() {
  return Boolean(process.env.ADMIN_RECOVERY_EMAIL && process.env.ADMIN_USERNAME && process.env.SITE_URL && mailConfigured());
}

export async function sendRecoveryEmail(subject, text, html) {
  if (!recoveryConfigured()) throw new Error("Admin recovery email is not configured");
  await deliver({ to: process.env.ADMIN_RECOVERY_EMAIL, subject, text, html });
}

export const sendContactNotification = async ({ name, email, topic, message }) => {
  if (!mailConfigured()) {
    console.warn("Contact email skipped: set RESEND_API_KEY, or SMTP_HOST, SMTP_USER and SMTP_PASS.");
    return;
  }
  const { subject, text, html } = contactNotificationEmail({ name, email, topic, message });
  // Hitting Reply in the inbox answers the visitor, not the website.
  await deliver({ to: notifyTo(), subject, text, html, replyTo: { name, address: email } });
};
