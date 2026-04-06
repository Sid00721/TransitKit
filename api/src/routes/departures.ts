import { Request, Response } from "express";
import { fetchDepartures, UpstreamError, TfNSWLogicError } from "../tfnsw";
import { transformDepartures } from "../transform";

export async function departuresHandler(req: Request, res: Response): Promise<void> {
  const stop = req.query.stop as string | undefined;
  const limitStr = req.query.limit as string | undefined;
  const routes = req.query.routes as string | undefined;
  const date = req.query.date as string | undefined;
  const time = req.query.time as string | undefined;

  // Validate required params
  if (!stop) {
    res.status(400).json({
      error: {
        code: "MISSING_PARAM",
        message: "Required parameter 'stop' is missing.",
        docs: "https://transitkit.dev/docs/endpoints/departures",
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
          code: "MISSING_PARAM",
          message: "Parameter 'limit' must be a positive integer.",
          docs: "https://transitkit.dev/docs/endpoints/departures",
        },
      });
      return;
    }
    limit = Math.min(parsed, 50);
  }

  // Parse route filter
  const routeFilter = routes
    ? routes.split(",").map((r) => r.trim()).filter(Boolean)
    : undefined;

  try {
    const raw = await fetchDepartures({ stopId: stop, date, time });
    const result = transformDepartures(raw, limit, routeFilter);

    // If TfNSW returned no stop info AND no departures, it's an invalid stop
    if (!result.stop_id && result.departures.length === 0) {
      res.status(400).json({
        error: {
          code: "INVALID_STOP",
          message: `No stop found with ID '${stop}'. Use /v1/stops/search to find valid stop IDs.`,
          docs: "https://transitkit.dev/docs/errors#INVALID_STOP",
        },
      });
      return;
    }

    // If stop is valid but no departures and a date was explicitly provided,
    // the timetable likely isn't published yet for that far-future date
    if (result.stop_id && result.departures.length === 0 && date) {
      res.status(400).json({
        error: {
          code: "TIMETABLE_NOT_AVAILABLE",
          message:
            "Timetable data is not yet published for this date. TfNSW typically publishes schedules 3-4 weeks in advance.",
          docs: "https://transitkit.dev/docs/errors#TIMETABLE_NOT_AVAILABLE",
        },
      });
      return;
    }

    res.json(result);
  } catch (err) {
    if (err instanceof TfNSWLogicError) {
      // e.g. code -4050 "no serving lines found" → invalid/ghost stop
      res.status(400).json({
        error: {
          code: "INVALID_STOP",
          message: `No stop found with ID '${stop}'. Use /v1/stops/search to find valid stop IDs.`,
          docs: "https://transitkit.dev/docs/errors#INVALID_STOP",
        },
      });
      return;
    }

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
