import { Request, Response } from "express";
import { fetchNearby, UpstreamError } from "../tfnsw";

export async function nearbyHandler(req: Request, res: Response): Promise<void> {
  const latStr = req.query.lat as string | undefined;
  const lngStr = req.query.lng as string | undefined;
  const radiusStr = req.query.radius as string | undefined;
  const limitStr = req.query.limit as string | undefined;

  // Validate required params
  if (!latStr || !lngStr) {
    res.status(400).json({
      error: {
        code: "MISSING_PARAM",
        message: "Required parameters 'lat' and 'lng' are missing.",
        docs: "https://transitkit.dev/docs/endpoints/nearby",
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
        docs: "https://transitkit.dev/docs/endpoints/nearby",
      },
    });
    return;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({
      error: {
        code: "INVALID_COORDINATES",
        message:
          "Latitude must be between -90 and 90, longitude between -180 and 180.",
        docs: "https://transitkit.dev/docs/errors#INVALID_COORDINATES",
      },
    });
    return;
  }

  // Parse and clamp radius
  let radius = 500;
  if (radiusStr) {
    const parsed = parseInt(radiusStr, 10);
    if (isNaN(parsed) || parsed < 1) {
      res.status(400).json({
        error: {
          code: "INVALID_PARAM",
          message: "Parameter 'radius' must be a positive integer.",
          docs: "https://transitkit.dev/docs/endpoints/nearby",
        },
      });
      return;
    }
    radius = Math.min(parsed, 2000);
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
          docs: "https://transitkit.dev/docs/endpoints/nearby",
        },
      });
      return;
    }
    limit = Math.min(parsed, 50);
  }

  try {
    const raw = await fetchNearby({ lat, lng, radius });
    const result = transformNearby(raw, lat, lng, radius, limit);
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

interface NearbyStop {
  stop_id: string;
  name: string;
  distance_metres: number;
  routes: string[];
}

function transformNearby(raw: any, lat: number, lng: number, radius: number, limit: number) {
  // The stop_finder coord response has one location with assignedStops
  const locations: any[] = raw.locations || [];
  const firstLocation = locations[0];
  const assignedStops: any[] = firstLocation?.assignedStops || [];

  const stops: NearbyStop[] = [];

  for (const stop of assignedStops) {
    const distance = stop.distance != null ? Math.round(stop.distance) : 0;

    // Filter by radius (TfNSW ignores our radius param, returns up to ~1.3km)
    if (distance > radius) continue;

    // Filter to stops that serve buses (mode 5)
    const modes: number[] = stop.modes || [];
    if (!modes.includes(5)) continue;

    stops.push({
      stop_id: stop.id || "",
      name: stop.name || "",
      distance_metres: distance,
      routes: [], // Routes not available in assignedStops — would need per-stop queries
    });
  }

  // Sort by distance and apply limit
  stops.sort((a, b) => a.distance_metres - b.distance_metres);
  const limited = stops.slice(0, limit);

  return {
    location: { lat, lng },
    stops: limited,
  };
}
