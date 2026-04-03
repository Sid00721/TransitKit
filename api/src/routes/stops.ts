import { Request, Response } from "express";
import { fetchStopSearch, UpstreamError } from "../tfnsw";

export async function stopsSearchHandler(req: Request, res: Response): Promise<void> {
  const q = req.query.q as string | undefined;
  const limitStr = req.query.limit as string | undefined;

  // Validate required params
  if (!q) {
    res.status(400).json({
      error: {
        code: "MISSING_PARAM",
        message: "Required parameter 'q' is missing.",
        docs: "https://transitkit.dev/docs/endpoints/stops-search",
      },
    });
    return;
  }

  // Parse and clamp limit
  let limit = 10;
  if (limitStr) {
    const parsed = parseInt(limitStr, 10);
    if (isNaN(parsed) || parsed < 1) {
      res.status(400).json({
        error: {
          code: "INVALID_PARAM",
          message: "Parameter 'limit' must be a positive integer.",
          docs: "https://transitkit.dev/docs/endpoints/stops-search",
        },
      });
      return;
    }
    limit = Math.min(parsed, 50);
  }

  try {
    const raw = await fetchStopSearch({ query: q });
    const result = transformStopSearch(raw, q, limit);
    res.json(result);
  } catch (err) {
    if (err instanceof UpstreamError) {
      res.status(503).json({
        error: {
          code: "UPSTREAM_ERROR",
          message: "TfNSW API is unavailable. Please try again later.",
          docs: "https://transitkit.dev/docs/errors#UPSTREAM_ERROR",
        },
      });
      return;
    }

    console.error("Unexpected error:", err);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
        docs: "https://transitkit.dev/docs/errors",
      },
    });
  }
}

interface StopSearchResult {
  stop_id: string;
  name: string;
  suburb: string;
}

function transformStopSearch(raw: any, query: string, limit: number) {
  const locations: any[] = raw.locations || [];

  const results: StopSearchResult[] = [];

  for (const loc of locations) {
    // Filter to actual stops only — exclude streets, suburbs, POIs, etc.
    if (loc.type !== "stop") continue;

    const suburb =
      loc.parent?.name ||
      loc.parent?.disassembledName ||
      "";

    results.push({
      stop_id: loc.id || "",
      name: loc.name || loc.disassembledName || "",
      suburb,
    });
  }

  const limited = results.slice(0, limit);

  return {
    query,
    results: limited,
  };
}
