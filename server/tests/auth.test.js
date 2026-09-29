import { beforeAll, afterAll, beforeEach, expect, test, vi } from "vitest";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { bootstrapAdmin } from "../utils/bootstrapAdmin.js";
import { isStrongPassword } from "../utils/password.js";

const query = vi.hoisted(() => vi.fn());
const mail = vi.hoisted(() => vi.fn());
vi.mock("../utils/mailer.js", () => ({ recoveryConfigured: () => true, sendRecoveryEmail: mail }));
vi.mock("../db.js", () => ({ default: { query } }));
vi.mock("../utils/audit.js", () => ({ logAudit: vi.fn() }));
import authRoutes from "../routes/auth.js";

let server, base, user;
const original = "Original-Password123!";
const changed = "Changed-Password456!";
beforeAll(async () => {
  process.env.JWT_SECRET = "test-only-secret-with-at-least-32-characters";
  const app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);
  server = await new Promise(resolve => { const s = app.listen(0, "127.0.0.1", () => resolve(s)); });
  base = `http://127.0.0.1:${server.address().port}/auth`;
});
afterAll(() => new Promise(resolve => server.close(resolve)));
beforeEach(async () => {
  process.env.ADMIN_USERNAME = "owner";
  process.env.SITE_URL = "https://example.com";
  mail.mockReset();
  user = { id: 1, username: "owner", password_hash: await bcrypt.hash(original, 4), session_version: 0 };
  query.mockImplementation(async (sql, args) => {
    if (sql.includes("SET reset_token_hash = $1")) {
      user.reset_token_hash = args[0]; user.reset_token_expires_at = Date.now() + 900000;
      return { rows: [{ id: user.id }] };
    }
    if (sql.includes("WHERE reset_token_hash = $2")) {
      if (args[1] !== user.reset_token_hash || user.reset_token_expires_at <= Date.now()) return { rows: [] };
      user.password_hash = args[0]; user.session_version++; user.reset_token_hash = null;
      return { rows: [{ ...user }] };
    }
    if (sql.startsWith("UPDATE")) {
      if (args[2] !== user.password_hash || args[3] !== user.session_version) return { rows: [] };
      user.password_hash = args[0]; user.session_version++;
      user.reset_token_hash = null;
    }
    if (sql.includes("WHERE username") && args[0] !== user.username) return { rows: [] };
    return { rows: [{ ...user }] };
  });
});
async function request(path, method = "GET", body, token) {
  const response = await fetch(base + path, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, body: await response.json() };
}
async function login(password = original) {
  return request("/login", "POST", { username: "owner", password });
}
test("password change revokes all previous tokens and old credentials", async () => {
  const first = await login(); const second = await login();
  expect(first.status).toBe(200);
  expect((await request("/change-password", "PUT", { currentPassword: original, newPassword: changed }, first.body.token)).status).toBe(200);
  for (const token of [first.body.token, second.body.token]) expect((await request("/me", "GET", null, token)).status).toBe(401);
  expect((await login()).status).toBe(401);
  const fresh = await login(changed);
  expect((await request("/me", "GET", null, fresh.body.token)).status).toBe(200);
  expect(user.password_hash).not.toBe(changed);
});
test("requires authentication and current password; rejects weak, reused and oversized passwords", async () => {
  expect((await request("/change-password", "PUT", {})).status).toBe(401);
  const { body } = await login();
  for (const [currentPassword, newPassword] of [["wrong", changed], [original, "weak"], [original, original], [original, "Aa1!" + "é".repeat(35)], [{}, changed]]) {
    expect((await request("/change-password", "PUT", { currentPassword, newPassword }, body.token)).status).toBe(400);
  }
  expect(user.session_version).toBe(0);
  expect((await request("/me", "GET", null, body.token)).status).toBe(200);
});
test("rejects pre-upgrade tokens and malformed login values", async () => {
  const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { issuer: "dwindik-cms", audience: "dwindik-admin" });
  expect((await request("/me", "GET", null, token)).status).toBe(401);
  expect((await request("/login", "POST", { username: [], password: {} })).status).toBe(400);
});
test("bootstraps once, hashes credentials and preserves changed accounts", async () => {
  let saved;
  const client = { release: vi.fn(), query: vi.fn(async (sql, args) => {
    if (sql.startsWith("SELECT")) return { rows: saved ? [saved] : [] };
    if (sql.startsWith("INSERT")) saved = { username: args[0], hash: args[1] };
    return { rows: [] };
  }) };
  const pool = { connect: async () => client };
  await expect(bootstrapAdmin(pool, {})).rejects.toThrow("ADMIN_USERNAME");
  await bootstrapAdmin(pool, { ADMIN_USERNAME: "owner", ADMIN_PASSWORD: original });
  expect(await bcrypt.compare(original, saved.hash)).toBe(true);
  const firstHash = saved.hash;
  await bootstrapAdmin(pool, { ADMIN_USERNAME: "other", ADMIN_PASSWORD: changed });
  expect(saved).toEqual({ username: "owner", hash: firstHash });
  expect(isStrongPassword("Aa1!" + "é".repeat(35))).toBe(false);
});

test("recovery hides unknown accounts and stores only a token hash", async () => {
  const unknown = await request("/forgot-password", "POST", { username: "unknown" });
  expect(mail).not.toHaveBeenCalled();
  const known = await request("/forgot-password", "POST", { username: "owner" });
  expect(known.body).toEqual(unknown.body);
  const token = mail.mock.calls[0][1].match(/token=([a-f0-9]{64})/)[1];
  expect(user.reset_token_hash).not.toBe(token);
  expect(user.password_hash).toBeTruthy();
});

test("reset consumes its link once, rejects expired links and revokes sessions", async () => {
  const session = await login();
  await request("/forgot-password", "POST", { username: "owner" });
  const token = mail.mock.calls[0][1].match(/token=([a-f0-9]{64})/)[1];
  user.reset_token_expires_at = Date.now() - 1;
  expect((await request("/reset-password", "POST", { token, newPassword: changed })).status).toBe(400);
  user.reset_token_expires_at = Date.now() + 900000;
  expect((await request("/reset-password", "POST", { token, newPassword: "weak" })).status).toBe(400);
  expect((await request("/reset-password", "POST", { token, newPassword: changed })).status).toBe(200);
  expect((await request("/reset-password", "POST", { token, newPassword: changed })).status).toBe(400);
  expect((await request("/me", "GET", null, session.body.token)).status).toBe(401);
  expect((await login(original)).status).toBe(401);
  expect((await login(changed)).status).toBe(200);
});
