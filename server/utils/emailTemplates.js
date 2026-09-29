/**
 * Branded CRA8 emails. Each builder returns { subject, text, html }: the plain
 * text part is the fallback every client can read, the HTML part matches the
 * site's black-and-white look. Everything interpolated into HTML is escaped,
 * so visitor input can never be rendered as markup.
 */
const escapeHtml = value => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const siteUrl = () => (process.env.SITE_URL || "https://cra8limited.com").replace(/\/$/, "");
// Inboxes can only load images from a public HTTPS address, so local test
// emails still point at the live logo.
const logoUrl = () => {
  const site = siteUrl();
  return `${site.startsWith("https://") ? site : "https://cra8limited.com"}/email/cra8-logo.png`;
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function layout({ preheader, heading, body, footer }) {
  const site = siteUrl();
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#f2f2f2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr><td align="center" style="background:#000000;padding:28px 24px;">
      <a href="${escapeHtml(site)}" style="text-decoration:none;"><img src="${escapeHtml(logoUrl())}" width="120" alt="CRA8" style="display:block;width:120px;height:auto;border:0;color:#ffffff;font:700 28px ${FONT};letter-spacing:2px;"></a>
    </td></tr>
    <tr><td style="padding:36px 36px 12px;font-family:${FONT};color:#111111;">
      <h1 style="margin:0 0 20px;font-size:20px;line-height:1.3;font-weight:600;letter-spacing:0.2px;">${escapeHtml(heading)}</h1>
      ${body}
    </td></tr>
    <tr><td style="padding:12px 36px 32px;font-family:${FONT};font-size:12px;line-height:1.6;color:#8a8a8a;border-top:1px solid #eeeeee;">
      ${footer}<br>CRA8 Limited · <a href="${escapeHtml(site)}" style="color:#8a8a8a;">${escapeHtml(site.replace(/^https?:\/\//, ""))}</a>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

const paragraph = html => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333333;">${html}</p>`;
const button = (href, label) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr>
  <td style="background:#000000;border-radius:8px;"><a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:13px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a></td>
</tr></table>`;

export function passwordResetRequestEmail(link) {
  const url = String(link);
  return {
    subject: "Reset your CRA8 admin password",
    text: `Open this link to choose a new password:\n\n${url}\n\nThis link expires in 15 minutes and works once. If you did not request it, ignore this email.`,
    html: layout({
      preheader: "Your password reset link. It expires in 15 minutes.",
      heading: "Reset your admin password",
      body: paragraph("Someone asked to reset the password for the CRA8 admin portal. Click the button below to choose a new one.")
        + button(url, "Choose new password")
        + paragraph(`This link expires in <strong>15 minutes</strong> and works only once.`)
        + `<p style="margin:0 0 16px;font-size:12px;line-height:1.6;color:#8a8a8a;word-break:break-all;">If the button doesn't work, copy this link into your browser:<br><a href="${escapeHtml(url)}" style="color:#555555;">${escapeHtml(url)}</a></p>`,
      footer: "Didn't ask for this? You can ignore this email. Your password stays the same.",
    }),
  };
}

export function passwordResetDoneEmail() {
  return {
    subject: "Your CRA8 admin password was reset",
    text: "Your admin password was reset and all sessions were signed out. If this was not you, contact your server operator immediately.",
    html: layout({
      preheader: "Your admin password was changed and all devices were signed out.",
      heading: "Your password was reset",
      body: paragraph("The password for the CRA8 admin portal was just changed. Every device that was signed in has been signed out.")
        + button(`${siteUrl()}/admin/login`, "Sign in")
        + paragraph("<strong>Wasn't you?</strong> Contact your website administrator immediately."),
      footer: "This is an automatic security notice.",
    }),
  };
}

export function contactNotificationEmail({ name, email, topic, message }) {
  const site = siteUrl();
  const row = (label, value) => `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8a8a8a;width:90px;vertical-align:top;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:15px;color:#111111;">${value}</td>
  </tr>`;
  const mailto = `mailto:${email}?subject=${encodeURIComponent(`Re: your enquiry to CRA8 (${topic})`)}`;
  return {
    subject: `New enquiry from ${name} (${topic})`,
    // Plain text only for this part: visitor input never gets rendered as HTML.
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Topic: ${topic}`,
      "",
      message,
      "",
      "—",
      `Sent from the contact form on ${site}. Also saved in Admin → Messages: ${site}/admin/messages`,
    ].join("\n"),
    html: layout({
      preheader: `${name}: ${message.slice(0, 90)}`,
      heading: "New enquiry from the website",
      body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;font-family:${FONT};">
          ${row("Name", escapeHtml(name))}
          ${row("Email", `<a href="${escapeHtml(`mailto:${email}`)}" style="color:#111111;">${escapeHtml(email)}</a>`)}
          ${row("Topic", escapeHtml(topic))}
        </table>
        <div style="margin:0 0 24px;padding:20px;background:#f7f7f7;border-left:3px solid #000000;border-radius:4px;font-size:15px;line-height:1.7;color:#222222;white-space:pre-wrap;word-wrap:break-word;">${escapeHtml(message)}</div>`
        + button(mailto, `Reply to ${name.split(/\s+/)[0]}`)
        + `<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#8a8a8a;">Or just press Reply: it goes straight to ${escapeHtml(email)}. This message is also saved in <a href="${escapeHtml(`${site}/admin/messages`)}" style="color:#555555;">Admin → Messages</a>.</p>`,
      footer: "Sent from the contact form on your website.",
    }),
  };
}
