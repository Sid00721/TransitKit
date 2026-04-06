import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why TransitKit?",
};

const limitations = [
  {
    title: "Real-time predictions are snapshots, not live streams",
    description:
      "TfNSW serves a frozen GTFS-RT prediction for each departure. The realtime_at value does not update between calls \u2014 minutes_away counts down against the original snapshot. This is an upstream constraint no wrapper can solve. TransitKit surfaces this honestly via is_live so you always know what you're working with.",
  },
  {
    title: "Real-time coverage varies by operator and route",
    description:
      "Private bus operators (Transit Systems, Transdev) have 25\u201360% real-time coverage. Some routes like 20T4 and 339 are 100% tracked. Government heavy rail (Sydney Trains) has 0% real-time in TfNSW departure data \u2014 but TransitKit filters those out entirely. For bus departure boards, is_live: true is meaningful and reliable on well-tracked routes.",
  },
  {
    title: "Stop search is name-matching only",
    description:
      'Searching by street address (e.g. "42 King St Newtown") will not find nearby stops. The TfNSW stop finder matches against canonical stop names, not geocoded locations. Use /v1/nearby with lat/lng coordinates for address-based lookups.',
  },
  {
    title: "NightRide real-time coverage is sparse",
    description:
      "Night bus routes (N10, N30, N40 etc.) have significantly lower real-time tracking coverage than daytime services. During testing, N10 had zero real-time data across all departures. is_live: false accurately reflects this \u2014 TransitKit never fabricates real-time data.",
  },
];

const issues = [
  {
    title: "The API cannot be called from a browser",
    description:
      'Every OPTIONS preflight to the TfNSW API returns HTTP 500 with a SOAP XML fault: "Policy Falsified" from their API Gateway. There is no Access-Control-Allow-Origin header on any response. This means any fetch() from a web app, React app, or Next.js frontend will fail instantly at the preflight check. Without TransitKit, you must build and maintain your own backend proxy just to access the data.',
  },
  {
    title: "No isLive boolean",
    description:
      'realtimeStatus: ["MONITORED"] sounds like it means a trip is live — it just means the stop is monitored, not the specific trip. Real-time data is inferred by comparing departureTimeEstimated vs departureTimePlanned, handling null, missing, and identical values. Real-time coverage varies wildly: at Circular Quay, 0/40 events had real-time data during testing. At Newtown, 10/30 did. TransitKit infers this correctly and returns a clean is_live boolean.',
  },
  {
    title: "All transport modes mixed together — 40 events hard cap",
    description:
      "The API returns exactly 40 departure events regardless of what you request — limit=5 and maxResults=100 both return 40. At Central Station those 40 events cover trains, metro, light rail, and buses combined. Filter client-side to buses and you might end up with 8 results covering the next 51 minutes. TransitKit handles the filtering and returns only buses.",
  },
  {
    title: "Ghost stops in nearby results",
    description:
      "The nearby stops API returns decommissioned stops alongside active ones. Stop G200096 (Bridge St at Gresham St) appears in nearby results with modes: [5] indicating it serves buses — but querying it for departures returns zero results with error code -4050. There is no flag to distinguish ghost stops from active ones. TransitKit filters these silently.",
  },
  {
    title: "Stop search returns 47 junk results for every 1 real stop",
    description:
      'Searching for "Newtown" with anyObjFilter_sf=2 (supposedly "stops only") returns 48 results: streets, suburbs, restaurants, hotels, and parks — and exactly 1 actual stop at position 48. type_sf=stop returns an error. TransitKit\'s search returns only stops.',
  },
  {
    title: "Two coordinate systems, one API",
    description:
      "Query parameters use longitude:latitude:EPSG:4326 order. Response coord arrays are [latitude, longitude]. The radius parameter for nearby stops is completely ignored — the API has its own internal ~1.3km cap regardless of what you pass. TransitKit uses lat, lng everywhere and exposes a radius parameter that actually works.",
  },
  {
    title: "Timezone mismatch between input and output",
    description:
      "The itdDate/itdTime parameters for future departures accept local Sydney time (AEDT/AEST). The response times are always UTC. Send 0800 for 8am, get back 21:00:00Z (UTC day before during AEDT). TransitKit accepts UTC for both input and output.",
  },
  {
    title: "HTTP 200 for errors",
    description:
      'No departures at this stop? HTTP 200 with systemMessages: [{type: "error", code: -4050, text: "no serving lines found"}]. Ambiguous query? HTTP 200 with a partial result and an error in systemMessages. Your HTTP client treats all of these as successful responses. TransitKit returns proper 4xx/5xx codes.',
  },
  {
    title: "Non-standard auth",
    description:
      "Authorization: apikey <jwt> — not Bearer, not Basic. TransitKit uses standard Bearer auth.",
  },
];

export default function WhyTransitKitPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Why TransitKit?</h1>
      <p className="mt-4 text-lg text-text-secondary leading-relaxed">
        What TransitKit handles for you. These are real findings from building
        against the TfNSW Trip Planner API.
      </p>

      <hr className="my-10 border-border" />

      <div className="space-y-10">
        {issues.map((issue, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                {i + 1}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {issue.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {issue.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className="my-10 border-border" />

      <h2 className="text-2xl font-bold tracking-tight">
        Known TfNSW Limitations
      </h2>
      <p className="mt-4 text-base text-text-secondary leading-relaxed">
        We believe in documenting what doesn&apos;t work as clearly as what
        does. These are upstream TfNSW constraints that TransitKit surfaces
        transparently.
      </p>

      <div className="mt-8 space-y-8">
        {limitations.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-surface p-6"
          >
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
