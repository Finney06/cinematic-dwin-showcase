import { expect, test } from "vitest";
import { contactNotificationEmail, passwordResetRequestEmail } from "../utils/emailTemplates.js";

test("contact email escapes visitor input in the HTML part", () => {
  const { html, text } = contactNotificationEmail({
    name: `<img src=x onerror=alert(1)>`, email: "a@b.co", topic: `"><script>`, message: "<script>alert(1)</script>",
  });
  expect(html).not.toMatch(/<script|<img src=x/);
  expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  expect(text).toContain("<script>alert(1)</script>");
});

test("reset email keeps the full link in both parts", () => {
  const link = "https://cra8limited.com/admin/reset-password#token=" + "a".repeat(64);
  const { html, text } = passwordResetRequestEmail(link);
  expect(text).toContain(link);
  expect(html).toContain(`href="${link}"`);
});
