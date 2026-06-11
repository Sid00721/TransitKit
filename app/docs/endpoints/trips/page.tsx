import { Metadata } from "next";
import { EndpointBadge } from "@/components/EndpointBadge";
import { ParamTable } from "@/components/ParamTable";
import { CodeBlock } from "@/components/CodeBlock";
import { highlight } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Trip Planner Endpoint",
};

const curlCode = `curl "https://api.transitkit.dev/v1/trips?from=200060&to=2150135" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

const jsCode = `const res = await fetch(
  'https://api.transitkit.dev/v1/trips?from=200060&to=2150135',
  {
    headers: {
      'Authorization': \`Bearer \${process.env.TRANSITKIT_API_KEY}\`
    }
  }
)
const data = await res.json()
const best = data.journeys[0]
console.log(\`\${best.duration_minutes} min, \${best.changes} changes\`)`;

const responseCode = `{
  "origin": { "stop_id": "200060", "name": "Central Station" },
  "destination": { "stop_id": "2150135", "name": "Church Street Light Rail" },
  "retrieved_at": "2026-06-11T07:40:00.000Z",
  "journeys": [
    {
      "departs_at": "2026-06-11T07:43:00Z",
      "departs_at_realtime": "2026-06-11T07:45:36Z",
      "arrives_at": "2026-06-11T08:19:48Z",
      "arrives_at_realtime": null,
      "duration_minutes": 36,
      "changes": 1,
      "is_live": true,
      "legs": [
        {
          "mode": "train",
          "route": "T1",
          "line_name": "T1 North Shore & Western Line",
          "direction": "Penrith via Parramatta",
          "origin": {
            "stop_id": "2000336",
            "name": "Central Station",
            "platform": "Platform 18",
            "lat": -33.884052,
            "lng": 151.206982,
            "departs_at": "2026-06-11T07:43:00Z",
            "departs_at_realtime": "2026-06-11T07:45:36Z"
          },
          "destination": {
            "stop_id": "2150222",
            "name": "Parramatta Station",
            "platform": "Platform 2",
            "lat": -33.817403,
            "lng": 151.005245,
            "arrives_at": "2026-06-11T08:08:00Z",
            "arrives_at_realtime": "2026-06-11T08:10:30Z"
          },
          "duration_minutes": 25,
          "distance_metres": null,
          "stops": 14,
          "is_live": true,
          "path": [[-33.884052, 151.206982], "...(hundreds of [lat, lng] points)"],
          "alerts": []
        },
        {
          "mode": "walk",
          "route": null,
          "line_name": null,
          "direction": null,
          "duration_minutes": 7,
          "distance_metres": 350,
          "stops": 0,
          "is_live": false,
          "...": "..."
        }
      ]
    }
  ]
}`;

const params = [
  {
    name: "from",
    type: "string",
    required: true,
    description: "Origin TfNSW stop ID. Use /v1/stops/search to find IDs.",
  },
  {
    name: "to",
    type: "string",
    required: true,
    description: "Destination TfNSW stop ID.",
  },
  {
    name: "date",
    type: "string",
    required: false,
    description:
      "Date in YYYYMMDD format, Sydney local time. Defaults to today.",
  },
  {
    name: "time",
    type: "string",
    required: false,
    description:
      "Time in HHmm 24-hour format, Sydney local time. Defaults to now.",
  },
  {
    name: "arrive_by",
    type: "boolean",
    required: false,
    description:
      "If true, plan journeys arriving by date/time instead of departing at it. Default: false.",
  },
  {
    name: "limit",
    type: "integer",
    required: false,
    description: "Max journey options to return. Default: 5, Max: 6",
  },
];

export default async function TripsPage() {
  const [curlHtml, jsHtml, responseHtml] = await Promise.all([
    highlight(curlCode, "bash"),
    highlight(jsCode, "javascript"),
    highlight(responseCode, "json"),
  ]);

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Trip Planner</h1>
      <p className="mt-4 text-text-secondary leading-relaxed">
        Plan complete journeys between two stops across all transport modes —
        trains, metro, buses, light rail, and ferries. Each journey includes
        per-leg real-time departure and arrival times, platforms, interchanges,
        walking connections, and the full route geometry for rendering on a
        map.
      </p>

      <div className="mt-6">
        <EndpointBadge method="GET" path="/v1/trips" />
      </div>

      <hr className="my-10 border-border" />

      <h2 className="text-xl font-semibold">Parameters</h2>
      <div className="mt-4">
        <ParamTable params={params} />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Examples</h2>
      <div className="mt-4 space-y-4">
        <CodeBlock code={curlCode} html={curlHtml} filename="cURL" />
        <CodeBlock code={jsCode} html={jsHtml} filename="JavaScript" />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Response</h2>
      <div className="mt-4">
        <CodeBlock code={responseCode} html={responseHtml} filename="200 OK" />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Journey Fields</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 font-medium text-text-secondary">Field</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Type</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Description</th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-b [&>tr]:border-border [&>tr:last-child]:border-0">
            <tr>
              <td className="px-4 py-3 font-mono text-accent">departs_at / arrives_at</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string</td>
              <td className="px-4 py-3 text-text-secondary">Planned journey start/end times (UTC ISO 8601)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">departs_at_realtime / arrives_at_realtime</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string | null</td>
              <td className="px-4 py-3 text-text-secondary">Real-time estimates, null when no live data</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">duration_minutes</td>
              <td className="px-4 py-3 font-mono text-text-secondary">integer</td>
              <td className="px-4 py-3 text-text-secondary">Total journey duration using best-known times</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">changes</td>
              <td className="px-4 py-3 font-mono text-text-secondary">integer</td>
              <td className="px-4 py-3 text-text-secondary">Number of interchanges between transit legs</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">is_live</td>
              <td className="px-4 py-3 font-mono text-text-secondary">boolean</td>
              <td className="px-4 py-3 text-text-secondary">Whether any leg has real-time tracking</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">legs</td>
              <td className="px-4 py-3 font-mono text-text-secondary">Leg[]</td>
              <td className="px-4 py-3 text-text-secondary">Ordered legs including walking connections</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Leg Fields</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 font-medium text-text-secondary">Field</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Type</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Description</th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-b [&>tr]:border-border [&>tr:last-child]:border-0">
            <tr>
              <td className="px-4 py-3 font-mono text-accent">mode</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string</td>
              <td className="px-4 py-3 text-text-secondary">train, metro, lightrail, bus, coach, ferry, schoolbus, or walk</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">route</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string | null</td>
              <td className="px-4 py-3 text-text-secondary">Short route name (&quot;T1&quot;, &quot;333&quot;, &quot;L2&quot;), null for walking legs</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">line_name</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string | null</td>
              <td className="px-4 py-3 text-text-secondary">Full line name (&quot;T1 North Shore &amp; Western Line&quot;)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">direction</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string | null</td>
              <td className="px-4 py-3 text-text-secondary">Headsign the vehicle displays</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">origin / destination</td>
              <td className="px-4 py-3 font-mono text-text-secondary">object</td>
              <td className="px-4 py-3 text-text-secondary">Stop with name, platform, lat/lng, and planned + real-time times</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">stops</td>
              <td className="px-4 py-3 font-mono text-text-secondary">integer</td>
              <td className="px-4 py-3 text-text-secondary">Number of intermediate stops on the leg</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">distance_metres</td>
              <td className="px-4 py-3 font-mono text-text-secondary">integer | null</td>
              <td className="px-4 py-3 text-text-secondary">Walking distance — only set on walk legs</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">path</td>
              <td className="px-4 py-3 font-mono text-text-secondary">[lat, lng][]</td>
              <td className="px-4 py-3 text-text-secondary">Route geometry — render directly as a map polyline</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">alerts</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string[]</td>
              <td className="px-4 py-3 text-text-secondary">Plain-text disruption alerts for the leg</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-10 rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary leading-relaxed">
        <strong className="text-white">No journeys?</strong> If no route exists
        between the two stops, the API returns{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs">404 NO_JOURNEYS_FOUND</code>{" "}
        rather than an empty array, so you can distinguish &quot;no route&quot;
        from a malformed request.
      </div>
    </article>
  );
}
