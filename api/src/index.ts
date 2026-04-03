import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { auth } from "./middleware/auth";
import { departuresHandler } from "./routes/departures";

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

// Authenticated routes
app.get("/v1/departures", auth, departuresHandler);

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

app.listen(PORT, () => {
  console.log(`TransitKit API running on port ${PORT}`);
});
