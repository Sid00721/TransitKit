import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { auth } from "./middleware/auth";
import { initDb } from "./lib/db";
import { departuresHandler } from "./routes/departures";
import { nearbyHandler } from "./routes/nearby";
import { stopsSearchHandler } from "./routes/stops";
import { createKeyHandler } from "./routes/keys";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

app.use(cors());
app.use(express.json());

// Health check (no auth)
app.get("/", (_req, res) => {
  res.json({
    name: "TransitKit API",
    version: "1.0.0",
    docs: "https://transitkit.dev/docs",
  });
});

// Self-serve key provisioning (no auth)
app.post("/v1/keys", createKeyHandler);

// Authenticated routes
app.get("/v1/departures", auth, departuresHandler);
app.get("/v1/nearby", auth, nearbyHandler);
app.get("/v1/stops/search", auth, stopsSearchHandler);

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found. See https://transitkit.dev/docs for available endpoints.",
      docs: "https://transitkit.dev/docs",
    },
  });
});

// Init DB and start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`TransitKit API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB init failed:", err.message);
    // Start anyway — legacy keys still work without DB
    app.listen(PORT, () => {
      console.log(`TransitKit API running on port ${PORT} (no database)`);
    });
  });
