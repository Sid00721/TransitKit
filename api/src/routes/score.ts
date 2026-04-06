import { Request, Response } from "express";
import { fetchNearby, UpstreamError } from "../tfnsw";

export async function scoreHandler(req: Request, res: Response): Promise<void> {
  const latStr = req.query.lat as string | undefined;
  const lngStr = req.query.lng as string | undefined;

  // Validate required params
  if (!latStr || !lngStr) {
    res.status(400).json({
      error: {
        code: "MISSING_PARAM",
        message: "Required parameters 'lat' and 'lng' are missing.",
        docs: "https://transitkit.dev/docs/endpoints/score",
      },
    });
    return;
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({
      error: {
        code: "INVALID_PARAM",
        message: "Parameters 'lat' and 'lng' must be valid numbers.",
        docs: "https://transitkit.dev/docs/endpoints/score",
      },
    });
    return;
  }

  try {
    const raw = await fetchNearby({ lat, lng, radius: 1000 });
    const result = computeScore(raw, lat, lng);
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

interface BusStop {
  stop_id: string;
  name: string;
  distance_metres: number;
}

function computeScore(raw: any, lat: number, lng: number) {
  const locations: any[] = raw.locations || [];
  const firstLocation = locations[0];
  const assignedStops: any[] = firstLocation?.assignedStops || [];

  const busStops: BusStop[] = [];

  for (const stop of assignedStops) {
    const distance = stop.distance != null ? Math.round(stop.distance) : 0;

    // Filter to 1000m
    if (distance > 1000) continue;

    // Filter to bus stops (mode 5)
    const modes: number[] = stop.modes || [];
    if (!modes.includes(5)) continue;

    busStops.push({
      stop_id: stop.id || "",
      name: stop.name || "",
      distance_metres: distance,
    });
  }

  // Sort by distance
  busStops.sort((a, b) => a.distance_metres - b.distance_metres);

  // Stops within 500m
  const within500 = busStops.filter((s) => s.distance_metres <= 500);
  // Stops within 1000m (all of them, since we already filtered)
  const within1000 = busStops;

  // Number of stops within 500m: 4 points per stop, max 10 stops = 40 points
  const densityClose = Math.min(within500.length, 10) * 4;

  // Number of stops within 1000m: 2 points per stop, max 10 stops = 20 points
  const densityFar = Math.min(within1000.length, 10) * 2;

  // Closest stop distance bonus: max 40 points
  let proximityBonus = 0;
  if (busStops.length > 0) {
    const closest = busStops[0].distance_metres;
    if (closest < 100) proximityBonus = 40;
    else if (closest < 200) proximityBonus = 30;
    else if (closest < 400) proximityBonus = 20;
    else if (closest < 800) proximityBonus = 10;
  }

  const score = Math.min(densityClose + densityFar + proximityBonus, 100);

  // Summary label
  let summary: string;
  if (score <= 20) summary = "Minimal";
  else if (score <= 40) summary = "Below Average";
  else if (score <= 60) summary = "Average";
  else if (score <= 80) summary = "Good";
  else summary = "Excellent";

  const result: any = {
    location: { lat, lng },
    score,
    summary,
    nearby_stops: busStops.length,
  };

  if (busStops.length > 0) {
    result.closest_stop = {
      stop_id: busStops[0].stop_id,
      name: busStops[0].name,
      distance_metres: busStops[0].distance_metres,
    };
  } else {
    result.closest_stop = null;
  }

  return result;
}
