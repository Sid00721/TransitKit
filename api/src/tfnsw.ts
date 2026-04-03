const TFNSW_BASE = "https://api.transport.nsw.gov.au/v1/tp/departure_mon";

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

  const url = `${TFNSW_BASE}?${query.toString()}`;

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
