import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { pool } from "../lib/db";

// Legacy: hardcoded API keys from env var (backward compatible)
const LEGACY_API_KEYS = new Set(
  (process.env.API_KEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
);

// Plan rate limits (requests per day)
const PLAN_LIMITS: Record<string, number> = {
  free: 1000,
  developer: 50000,
  pro: Infinity,
};

export async function auth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message:
          "Missing or invalid API key. Include your key in the Authorization header as: Bearer tk_live_xxx",
        docs: "https://transitkit.dev/docs/authentication",
      },
    });
    return;
  }

  const token = header.slice(7);

  // 1. Check legacy hardcoded keys first
  if (LEGACY_API_KEYS.has(token)) {
    next();
    return;
  }

  // 2. Check database-managed keys
  if (!pool) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid API key.",
        docs: "https://transitkit.dev/docs/authentication",
      },
    });
    return;
  }

  const keyHash = crypto.createHash("sha256").update(token).digest("hex");

  let keyRow: any;
  try {
    const result = await pool.query(
      `SELECT id, plan, requests_today, last_request_date, is_active FROM api_keys WHERE key_hash = $1`,
      [keyHash]
    );
    keyRow = result.rows[0];
  } catch (err: any) {
    console.error("DB auth lookup failed:", err.message);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Authentication service error.",
        docs: "https://transitkit.dev/docs/errors",
      },
    });
    return;
  }

  if (!keyRow) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid API key.",
        docs: "https://transitkit.dev/docs/authentication",
      },
    });
    return;
  }

  if (!keyRow.is_active) {
    res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "This API key has been deactivated.",
        docs: "https://transitkit.dev/docs/authentication",
      },
    });
    return;
  }

  // Determine today's date (UTC)
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = keyRow.last_request_date
    ? new Date(keyRow.last_request_date).toISOString().slice(0, 10)
    : null;
  const isNewDay = lastDate !== today;
  const currentCount = isNewDay ? 0 : keyRow.requests_today;

  // Check rate limit
  const limit = PLAN_LIMITS[keyRow.plan] ?? PLAN_LIMITS.free;
  if (currentCount >= limit) {
    res.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message: `Daily request limit of ${limit} reached for the '${keyRow.plan}' plan. Upgrade at https://transitkit.dev/pricing`,
        docs: "https://transitkit.dev/docs/errors#RATE_LIMITED",
      },
    });
    return;
  }

  // Increment request count (reset if new day)
  try {
    await pool.query(
      `UPDATE api_keys SET requests_today = $1, last_request_date = $2 WHERE id = $3`,
      [currentCount + 1, today, keyRow.id]
    );
  } catch (err: any) {
    console.error("Failed to update request count:", err.message);
    // Don't block the request over a counter update failure
  }

  next();
}
