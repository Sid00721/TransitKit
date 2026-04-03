import { Request, Response, NextFunction } from "express";

const API_KEYS = new Set(
  (process.env.API_KEYS || "").split(",").map((k) => k.trim()).filter(Boolean)
);

export function auth(req: Request, res: Response, next: NextFunction): void {
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

  if (!API_KEYS.has(token)) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid API key.",
        docs: "https://transitkit.dev/docs/authentication",
      },
    });
    return;
  }

  next();
}
