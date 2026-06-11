import { Request, Response } from "express";
import { fetchTrip, UpstreamError, TfNSWLogicError } from "../tfnsw";
import { classToMode, extractPlatform, extractAlerts } from "../transform";

export async function tripsHandler(req: Request, res: Response): Promise<void> {
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  const date = req.query.date as string | undefined;
  const time = req.query.time as string | undefined;
  const arriveByStr = req.query.arrive_by as string | undefined;
  const limitStr = req.query.limit as string | undefined;

  if (!from || !to) {
    res.status(400).json({
      error: {
        code: "MISSING_PARAM",
        message:
          "Required parameters 'from' and 'to' are missing. Both must be TfNSW stop IDs from /v1/stops/search.",
        docs: "https://transitkit.dev/docs/endpoints/trips",
      },
    });
    return;
  }

  let limit = 5;
  if (limitStr) {
    const parsed = parseInt(limitStr, 10);
    if (isNaN(parsed) || parsed < 1) {
      res.status(400).json({
        error: {
          code: "INVALID_PARAM",
          message: "Parameter 'limit' must be a positive integer.",
          docs: "https://transitkit.dev/docs/endpoints/trips",
        },
      });
      return;
    }
    limit = Math.min(parsed, 6);
  }

  const arriveBy = arriveByStr === "true" || arriveByStr === "1";

  try {
    const raw = await fetchTrip({
      originId: from,
      destinationId: to,
      date,
      time,
      arriveBy,
    });
    const result = transformTrips(raw, from, to, limit);

    if (result.journeys.length === 0) {
      res.status(404).json({
        error: {
          code: "NO_JOURNEYS_FOUND",
          message: `No journeys found between '${from}' and '${to}'. Check both stop IDs via /v1/stops/search.`,
          docs: "https://transitkit.dev/docs/errors#NO_JOURNEYS_FOUND",
        },
      });
      return;
    }

    res.json(result);
  } catch (err) {
    if (err instanceof TfNSWLogicError) {
      res.status(400).json({
        error: {
          code: "INVALID_STOP",
          message: `Could not plan a trip between '${from}' and '${to}'. Use /v1/stops/search to find valid stop IDs.`,
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

// ── Transform ────────────────────────────────────────────────────

interface TripStopPoint {
  stop_id: string;
  name: string;
  platform: string | null;
  lat: number | null;
  lng: number | null;
}

interface TripLeg {
  mode: string;
  route: string | null;
  line_name: string | null;
  direction: string | null;
  origin: TripStopPoint & {
    departs_at: string;
    departs_at_realtime: string | null;
  };
  destination: TripStopPoint & {
    arrives_at: string;
    arrives_at_realtime: string | null;
  };
  duration_minutes: number;
  distance_metres: number | null;
  stops: number;
  is_live: boolean;
  path: [number, number][];
  alerts: string[];
}

interface TripJourney {
  departs_at: string;
  departs_at_realtime: string | null;
  arrives_at: string;
  arrives_at_realtime: string | null;
  duration_minutes: number;
  changes: number;
  is_live: boolean;
  legs: TripLeg[];
}

/** Strip platform/stand suffixes: "Central Station, Platform 16" → "Central Station" */
function cleanStopName(loc: any): string {
  const name = loc?.disassembledName || loc?.name || "";
  const cleaned = name
    .replace(/,?\s*(Platform|Stand|Wharf|Side)\s+[A-Z0-9]+\s*$/i, "")
    .trim();
  if (cleaned) return cleaned;

  // Name was only "Platform 2" etc. — fall back to the parent stop's name
  return (
    loc?.parent?.disassembledName ||
    loc?.parent?.name ||
    name
  ).trim();
}

function toStopPoint(loc: any): TripStopPoint {
  const coord: number[] = Array.isArray(loc?.coord) ? loc.coord : [];
  return {
    stop_id: loc?.id || "",
    name: cleanStopName(loc),
    platform: extractPlatform(loc),
    lat: typeof coord[0] === "number" ? coord[0] : null,
    lng: typeof coord[1] === "number" ? coord[1] : null,
  };
}

function toPath(coords: any): [number, number][] {
  if (!Array.isArray(coords)) return [];
  return coords
    .filter(
      (c: any) =>
        Array.isArray(c) &&
        typeof c[0] === "number" &&
        typeof c[1] === "number"
    )
    .map((c: any) => [c[0], c[1]] as [number, number]);
}

function transformLeg(leg: any): TripLeg {
  const transportation = leg.transportation || {};
  const productClass = transportation.product?.class;
  const mode =
    typeof productClass === "number" ? classToMode(productClass) : "walk";
  const isWalk = mode === "walk";

  // disassembledName is the short badge ("T1", "L2", "333"); number is the
  // long form for rail ("T1 North Shore & Western Line") but the same short
  // code for buses — fall back to description for a human line name.
  const shortName = transportation.disassembledName || transportation.number || null;
  const longName =
    transportation.number && transportation.number !== shortName
      ? transportation.number
      : transportation.description || transportation.name || null;

  const originDeparts = leg.origin?.departureTimePlanned || "";
  const originRealtime = leg.origin?.departureTimeEstimated || null;
  const destArrives = leg.destination?.arrivalTimePlanned || "";
  const destRealtime = leg.destination?.arrivalTimeEstimated || null;

  // stopSequence includes origin and destination
  const stopSequence: any[] = leg.stopSequence || [];
  const intermediateStops = Math.max(0, stopSequence.length - 2);

  return {
    mode,
    route: isWalk ? null : shortName,
    line_name: isWalk ? null : longName,
    direction: isWalk ? null : transportation.destination?.name || null,
    origin: {
      ...toStopPoint(leg.origin),
      departs_at: originDeparts,
      departs_at_realtime: originRealtime,
    },
    destination: {
      ...toStopPoint(leg.destination),
      arrives_at: destArrives,
      arrives_at_realtime: destRealtime,
    },
    duration_minutes: Math.round((leg.duration || 0) / 60),
    distance_metres: isWalk && leg.distance != null ? Math.round(leg.distance) : null,
    stops: isWalk ? 0 : intermediateStops,
    is_live: !isWalk && !!originRealtime,
    path: toPath(leg.coords),
    alerts: extractAlerts(leg),
  };
}

function transformTrips(raw: any, from: string, to: string, limit: number) {
  const rawJourneys: any[] = raw.journeys || [];

  const journeys: TripJourney[] = rawJourneys.slice(0, limit).map((j) => {
    const legs = (j.legs || []).map(transformLeg);
    const first = legs[0];
    const last = legs[legs.length - 1];

    const departsAt = first?.origin.departs_at || "";
    const departsRealtime = first?.origin.departs_at_realtime || null;
    const arrivesAt = last?.destination.arrives_at || "";
    const arrivesRealtime = last?.destination.arrives_at_realtime || null;

    const bestDepart = departsRealtime || departsAt;
    const bestArrive = arrivesRealtime || arrivesAt;
    const durationMs =
      bestDepart && bestArrive
        ? new Date(bestArrive).getTime() - new Date(bestDepart).getTime()
        : 0;

    const transitLegs = legs.filter((l: TripLeg) => l.mode !== "walk");

    return {
      departs_at: departsAt,
      departs_at_realtime: departsRealtime,
      arrives_at: arrivesAt,
      arrives_at_realtime: arrivesRealtime,
      duration_minutes: Math.max(0, Math.round(durationMs / 60000)),
      changes: Math.max(0, transitLegs.length - 1),
      is_live: legs.some((l: TripLeg) => l.is_live),
      legs,
    };
  });

  const firstJourney = journeys[0];

  return {
    origin: {
      stop_id: from,
      name: firstJourney?.legs[0]?.origin.name || "",
    },
    destination: {
      stop_id: to,
      name:
        firstJourney?.legs[firstJourney.legs.length - 1]?.destination.name ||
        "",
    },
    retrieved_at: new Date().toISOString(),
    journeys,
  };
}
