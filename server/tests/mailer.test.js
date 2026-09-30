import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { sendContactNotification, sendRecoveryEmail } from "../utils/mailer.js";

const env = { ...process.env };
beforeEach(() => {
  Object.assign(process.env, {
    SMTP_HOST: "smtp.resend.com", SMTP_USER: "resend", SMTP_PASS: "re_test_key",
    MAIL_FROM: "CRA8 Website <noreply@cra8limited.com>",
    ADMIN_USERNAME: "owner", ADMIN_RECOVERY_EMAIL: "owner@example.com", SITE_URL: "https://example.com",
    CONTACT_NOTIFY_EMAIL: "studio@example.com",
  });
  delete process.env.RESEND_API_KEY;
});
afterEach(() => { process.env = { ...env }; vi.unstubAllGlobals(); });

test("Resend settings send over the HTTPS API, not SMTP", async () => {
  const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  await sendRecoveryEmail("Subject", "text", "<p>html</p>");
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe("https://api.resend.com/emails");
  expect(options.headers.Authorization).toBe("Bearer re_test_key");
  expect(options.signal).toBeInstanceOf(AbortSignal);
  expect(JSON.parse(options.body)).toMatchObject({ from: "CRA8 Website <noreply@cra8limited.com>", to: ["owner@example.com"], subject: "Subject" });
});

test("contact emails reply to the visitor, and Resend errors surface", async () => {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ message: "Domain not verified" }), { status: 403 }));
  vi.stubGlobal("fetch", fetchMock);
  await expect(sendContactNotification({ name: "Ada", email: "ada@example.com", topic: "Film", message: "Hello there, a quote please" }))
    .rejects.toThrow("Domain not verified");
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ to: ["studio@example.com"], reply_to: "ada@example.com" });
});
