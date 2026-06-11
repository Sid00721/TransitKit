export interface TransitKitDeparture {
  route: string;
  mode: string;
  destination: string;
  platform: string | null;
  scheduled_at: string;
  realtime_at: string | null;
  minutes_away: number;
  is_live: boolean;
  wheelchair_accessible: boolean;
  occupancy: string | null;
  alerts: string[];
}

// ── Transport modes (TfNSW product classes) ─────────────────────

export const MODE_CLASSES: Record<string, number> = {
  train: 1,
  metro: 2,
  lightrail: 4,
  bus: 5,
  coach: 7,
  ferry: 9,
  schoolbus: 11,
};

const CLASS_MODES: Record<number, string> = Object.fromEntries(
  Object.entries(MODE_CLASSES).map(([mode, cls]) => [cls, mode])
);

export function classToMode(productClass: number): string {
  // 99/100/107 are walking/footpath classes used in trip legs
  if (productClass === 99 || productClass === 100 || productClass === 107) {
    return "walk";
  }
  return CLASS_MODES[productClass] || "other";
}

/**
 * Parse a `modes` query param ("bus,train", "all") into product classes.
 * Returns null if the param contains an unknown mode.
 */
export function parseModesParam(param: string): number[] | "all" | null {
  if (param.trim().toLowerCase() === "all") return "all";

  const classes: number[] = [];
  for (const part of param.split(",")) {
    const mode = part.trim().toLowerCase();
    if (!mode) continue;
    const cls = MODE_CLASSES[mode];
    if (cls === undefined) return null;
    classes.push(cls);
  }
  return classes.length > 0 ? classes : null;
}

export function extractPlatform(location: any): string | null {
  const name = location?.disassembledName || location?.name || "";
  const match = name.match(/(Platform|Stand|Wharf|Side)\s+([A-Z0-9]+)/i);
  if (match) return `${match[1]} ${match[2]}`;

  const platform = location?.properties?.platform;
  if (platform) return `Platform ${platform}`;

  return null;
}

export interface TransitKitResponse {
  stop_id: string;
  stop_name: string;
  retrieved_at: string;
  departures: TransitKitDeparture[];
}

function isLive(event: any): boolean {
  const estimated = event.departureTimeEstimated;
  const planned = event.departureTimePlanned;

  // No estimated time = not live
  if (!estimated) return false;

  // If estimated exists and differs from planned, it's live
  // If they're identical, it could still be live (just on time)
  // Check realtimeStatus as a secondary signal
  if (estimated !== planned) return true;

  // Same times — check if the stop is monitored AND has an estimated time
  const status = event.realtimeStatus;
  if (Array.isArray(status) && status.includes("MONITORED") && estimated) {
    return true;
  }

  return false;
}

function minutesFromNow(isoTime: string): number {
  const diff = new Date(isoTime).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 60000));
}

function matchesModes(event: any, modeClasses: number[] | "all"): boolean {
  const productClass = event.transportation?.product?.class;
  if (typeof productClass !== "number") return false;
  if (modeClasses === "all") return true;
  return modeClasses.includes(productClass);
}

function mapOccupancy(event: any): string | null {
  const occ =
    event.location?.properties?.occupancy ||
    event.properties?.occupancy;
  if (!occ || occ === "UNKNOWN") return null;
  return occ;
}

export function extractAlerts(event: any): string[] {
  const infos = event.infos || [];
  const alerts: string[] = [];

  for (const info of infos) {
    if (info.subtitle) {
      alerts.push(info.subtitle);
    } else if (info.content) {
      // Strip HTML tags from content
      const text = info.content.replace(/<[^>]*>/g, "").trim();
      if (text) alerts.push(text);
    }
  }

  return alerts;
}

export function transformDepartures(
  raw: any,
  limit: number,
  routeFilter?: string[],
  modeClasses: number[] | "all" = [MODE_CLASSES.bus]
): TransitKitResponse {
  const stopEvents: any[] = raw.stopEvents || [];

  // Resolve stop info from first event or from the response
  const firstEvent = stopEvents[0];
  const stopLocation = firstEvent?.location?.parent || firstEvent?.location;

  const stopId = stopLocation?.id || "";
  const stopName = stopLocation?.name || "";

  // Filter to requested modes (defaults to bus for backward compatibility)
  let events = stopEvents.filter((e) => matchesModes(e, modeClasses));

  // Apply route filter if provided — match short name ("T1") or full number
  if (routeFilter && routeFilter.length > 0) {
    const routes = new Set(routeFilter.map((r) => r.toUpperCase()));
    events = events.filter((e) => {
      const num = (e.transportation?.number || "").toUpperCase();
      const short = (e.transportation?.disassembledName || "").toUpperCase();
      return routes.has(num) || routes.has(short);
    });
  }

  // Apply limit
  const limited = events.slice(0, limit);

  const departures: TransitKitDeparture[] = limited.map((event) => {
    const scheduled = event.departureTimePlanned || "";
    const realtime = event.departureTimeEstimated || null;
    const live = isLive(event);
    const bestTime = realtime || scheduled;

    const productClass = event.transportation?.product?.class;

    return {
      // disassembledName is the short badge ("T1", "L2", "333");
      // number is the long form for rail ("T1 North Shore & Western Line")
      route:
        event.transportation?.disassembledName ||
        event.transportation?.number ||
        "",
      mode: typeof productClass === "number" ? classToMode(productClass) : "other",
      destination: event.transportation?.destination?.name || "",
      platform: extractPlatform(event.location),
      scheduled_at: scheduled,
      realtime_at: live ? realtime : null,
      minutes_away: minutesFromNow(bestTime),
      is_live: live,
      wheelchair_accessible: event.properties?.WheelchairAccess === "true",
      occupancy: mapOccupancy(event),
      alerts: extractAlerts(event),
    };
  });

  return {
    stop_id: stopId,
    stop_name: stopName,
    retrieved_at: new Date().toISOString(),
    departures,
  };
}
