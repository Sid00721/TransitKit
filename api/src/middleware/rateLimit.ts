import { Request, Response, NextFunction } from "express";

// Simple in-memory token bucket rate limiter: 10 requests per second per IP
const WINDOW_MS = 1000;
const MAX_REQUESTS = 10;

const ipRequests = new Map<string, { count: number; resetAt: number }>();

// Clean up stale entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRequests) {
    if (now > entry.resetAt) {
      ipRequests.delete(ip);
    }
  }
}, 60_000);

export function rateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  let entry = ipRequests.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    ipRequests.set(ip, entry);
    next();
    return;
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    res.status(429).set("Retry-After", "1").json({
      error: {
        code: "RATE_LIMITED",
        message:
          "Too many requests. Please slow down and retry after the indicated delay.",
        docs: "https://transitkit.dev/docs/errors#RATE_LIMITED",
      },
    });
    return;
  }

  next();
}
