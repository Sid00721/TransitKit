const TFNSW_BASE = "https://api.transport.nsw.gov.au/v1/tp";

const DEPARTURE_MON = `${TFNSW_BASE}/departure_mon`;
const COORD = `${TFNSW_BASE}/coord`;
const STOP_FINDER = `${TFNSW_BASE}/stop_finder`;

interface TfNSWRequestParams {
  stopId: string;
  date?: string; // YYYYMMDD
  time?: string; // HHmm
}

export async function fetchDepartures(params: TfNSWRequestParams): Promise<any> {
  const apiKey = process.env.TFNSW_API_KEY;
  if (!apiKey) {
    throw new Error("TFNSW_API_KEY not configured");
  }

  const query = new URLSearchParams({
    outputFormat: "rapidJSON",
    coordOutputFormat: "EPSG:4326",
    mode: "direct",
    type_dm: "stop",
    name_dm: params.stopId,
    departureMonitorMacro: "true",
    TfNSWDM: "true",
    version: "10.2.1.42",
  });

  if (params.date) {
    query.set("itdDate", params.date);
  }
  if (params.time) {
    query.set("itdTime", params.time);
  }

  const url = `${DEPARTURE_MON}?${query.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `apikey ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new UpstreamError(`TfNSW returned ${res.status}: ${text}`);
  }

  const data: any = await res.json();

  // TfNSW returns 200 for errors — check systemMessages
  if (data.systemMessages) {
    const err = data.systemMessages.find(
      (m: any) => m.type === "error" || m.type === "warning"
    );
    if (err && (!data.stopEvents || data.stopEvents.length === 0)) {
      throw new TfNSWLogicError(err.code, err.text);
    }
  }

  return data;
}

// ── Nearby (stop_finder with coord) ─────────────────────────────

interface CoordRequestParams {
  lat: number;
  lng: number;
  radius: number;
}

export async function fetchNearby(params: CoordRequestParams): Promise<any> {
  const apiKey = process.env.TFNSW_API_KEY;
  if (!apiKey) {
    throw new Error("TFNSW_API_KEY not configured");
  }

  // Use stop_finder with coord type — the coord endpoint returns empty.
  // serverRequest + doServerFiltering populate assignedStops with nearby stops.
  const query = new URLSearchParams({
    outputFormat: "rapidJSON",
    type_sf: "coord",
    name_sf: `${params.lng}:${params.lat}:EPSG:4326`,
    coordOutputFormat: "EPSG:4326",
    anyMaxSizeHitList: "40",
    doServerFiltering: "1",
    serverInfo: "1",
    w_regPrefAm: "1",
    serverRequest: "1",
  });

  const url = `${STOP_FINDER}?${query.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `apikey ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new UpstreamError(`TfNSW returned ${res.status}: ${text}`);
  }

  return res.json();
}

// ── Stop search (stop_finder) ───────────────────────────────────

interface StopSearchParams {
  query: string;
}

export async function fetchStopSearch(params: StopSearchParams): Promise<any> {
  const apiKey = process.env.TFNSW_API_KEY;
  if (!apiKey) {
    throw new Error("TFNSW_API_KEY not configured");
  }

  const query = new URLSearchParams({
    outputFormat: "rapidJSON",
    type_sf: "any",
    name_sf: params.query,
    coordOutputFormat: "EPSG:4326",
    TfNSWSF: "true",
    version: "10.2.1.42",
  });

  const url = `${STOP_FINDER}?${query.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `apikey ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new UpstreamError(`TfNSW returned ${res.status}: ${text}`);
  }

  return res.json();
}

export class UpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpstreamError";
  }
}

export class TfNSWLogicError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.name = "TfNSWLogicError";
    this.code = code;
  }
}
