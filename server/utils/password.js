export const passwordRequirements = "Use at least 12 characters, including uppercase, lowercase, a number and a symbol (maximum 72 UTF-8 bytes).";

export function isStrongPassword(password) {
  return typeof password === "string" && password.length >= 12 &&
    Buffer.byteLength(password, "utf8") <= 72 && /[A-Z]/.test(password) &&
    /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}
