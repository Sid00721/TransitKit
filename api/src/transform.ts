export interface TransitKitDeparture {
  route: string;
  destination: string;
  scheduled_at: string;
  realtime_at: string | null;
  minutes_away: number;
  is_live: boolean;
  wheelchair_accessible: boolean;
  occupancy: string | null;
  alerts: string[];
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

function isBus(event: any): boolean {
  const productClass = event.transportation?.product?.class;
  // TfNSW product class 5 = bus
  return productClass === 5;
}

function mapOccupancy(event: any): string | null {
  const occ =
    event.location?.properties?.occupancy ||
    event.properties?.occupancy;
  if (!occ || occ === "UNKNOWN") return null;
  return occ;
}

function extractAlerts(event: any): string[] {
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
  routeFilter?: string[]
): TransitKitResponse {
  const stopEvents: any[] = raw.stopEvents || [];

  // Resolve stop info from first event or from the response
  const firstEvent = stopEvents[0];
  const stopLocation = firstEvent?.location?.parent || firstEvent?.location;

  const stopId = stopLocation?.id || "";
  const stopName = stopLocation?.name || "";

  // Filter to buses only
  let busEvents = stopEvents.filter(isBus);

  // Apply route filter if provided
  if (routeFilter && routeFilter.length > 0) {
    const routes = new Set(routeFilter.map((r) => r.toUpperCase()));
    busEvents = busEvents.filter((e) => {
      const num = (e.transportation?.number || "").toUpperCase();
      return routes.has(num);
    });
  }

  // Apply limit
  const limited = busEvents.slice(0, limit);

  const departures: TransitKitDeparture[] = limited.map((event) => {
    const scheduled = event.departureTimePlanned || "";
    const realtime = event.departureTimeEstimated || null;
    const live = isLive(event);
    const bestTime = realtime || scheduled;

    return {
      route: event.transportation?.number || "",
      destination: event.transportation?.destination?.name || "",
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
