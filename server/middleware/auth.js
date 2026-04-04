import jwt from "jsonwebtoken";

const jwtIssuer = process.env.JWT_ISSUER || "dwindik-cms";
const jwtAudience = process.env.JWT_AUDIENCE || "dwindik-admin";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: jwtIssuer,
      audience: jwtAudience,
    });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
