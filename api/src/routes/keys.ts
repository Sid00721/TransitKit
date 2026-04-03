import { Request, Response } from "express";
import crypto from "crypto";
import { pool } from "../lib/db";

export async function createKeyHandler(
  req: Request,
  res: Response
): Promise<void> {
  const { email } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "A valid email address is required.",
      },
    });
    return;
  }

  if (!pool) {
    res.status(503).json({
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "API key provisioning is not available. Database is not configured.",
      },
    });
    return;
  }

  // Generate key: tk_live_ + 32 random hex chars
  const randomHex = crypto.randomBytes(16).toString("hex");
  const apiKey = `tk_live_${randomHex}`;
  const keyPrefix = apiKey.slice(0, 16) + "...";

  // SHA-256 hash of the full key
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

  try {
    await pool.query(
      `INSERT INTO api_keys (email, key_hash, key_prefix, plan) VALUES ($1, $2, $3, 'free')`,
      [email, keyHash, keyPrefix]
    );
  } catch (err: any) {
    console.error("Failed to create API key:", err.message);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create API key. Please try again.",
      },
    });
    return;
  }

  res.status(201).json({
    api_key: apiKey,
    message: "Save this key — it won't be shown again.",
    docs: "https://transitkit.dev/docs/authentication",
  });
}
