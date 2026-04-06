import { Metadata } from "next";
import { EndpointBadge } from "@/components/EndpointBadge";
import { ParamTable } from "@/components/ParamTable";
import { CodeBlock } from "@/components/CodeBlock";
import { highlight } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Departures Endpoint",
};

const curlCode = `curl "https://api.transitkit.dev/v1/departures?stop=200060&limit=5" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

const jsCode = `const res = await fetch(
  'https://api.transitkit.dev/v1/departures?stop=200060',
  {
    headers: {
      'Authorization': \`Bearer \${process.env.TRANSITKIT_API_KEY}\`
    }
  }
)
const data = await res.json()
console.log(data.departures[0].minutes_away) // 2`;

const pythonCode = `import requests

response = requests.get(
  'https://api.transitkit.dev/v1/departures',
  params={'stop': '200060', 'limit': 5},
  headers={'Authorization': f'Bearer {API_KEY}'}
)
departures = response.json()['departures']`;

const responseCode = `{
  "stop_id": "204210",
  "stop_name": "Newtown Station, King St, Stand B",
  "retrieved_at": "2026-04-03T16:53:00Z",
  "departures": [
    {
      "route": "N10",
      "destination": "Town Hall Station",
      "scheduled_at": "2026-04-03T16:59:00Z",
      "realtime_at": "2026-04-03T17:05:24Z",
      "minutes_away": 6,
      "is_live": true,
      "wheelchair_accessible": true,
      "occupancy": "MANY_SEATS",
      "alerts": []
    },
    {
      "route": "422",
      "destination": "Strathfield Station",
      "scheduled_at": "2026-04-03T17:04:00Z",
      "realtime_at": null,
      "minutes_away": 11,
      "is_live": false,
      "wheelchair_accessible": true,
      "occupancy": null,
      "alerts": [
        "Some buses run to a changed timetable"
      ]
    }
  ]
}`;

const params = [
  {
    name: "stop",
    type: "string",
    required: true,
    description:
      'TfNSW stop ID. Use numeric format e.g. 204210 (Newtown), 200060 (Central), 200020 (Circular Quay), 202210 (Bondi Junction). G-prefix street stops also work e.g. G200059.',
  },
  {
    name: "limit",
    type: "integer",
    required: false,
    description: "Max bus departures to return. Default: 10, Max: 50. Applied after filtering to buses only.",
  },
  {
    name: "routes",
    type: "string",
    required: false,
    description: "Comma-separated route filter e.g. 431,X31,N10",
  },
  {
    name: "date",
    type: "string",
    required: false,
    description: "Future date in YYYYMMDD format e.g. 20260410. Interpreted as Sydney local time (AEST/AEDT). Defaults to today.",
  },
  {
    name: "time",
    type: "string",
    required: false,
    description: "Time in HHmm 24-hour format e.g. 2200 for 10pm Sydney time. Interpreted as Sydney local time (AEST/AEDT). Defaults to now.",
  },
];

export default async function DeparturesPage() {
  const [curlHtml, jsHtml, pythonHtml, responseHtml] = await Promise.all([
    highlight(curlCode, "bash"),
    highlight(jsCode, "javascript"),
    highlight(pythonCode, "python"),
    highlight(responseCode, "json"),
  ]);

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Departures</h1>
      <p className="mt-4 text-text-secondary leading-relaxed">
        Get live and scheduled bus departures for a specific stop.
      </p>

      <div className="mt-6">
        <EndpointBadge method="GET" path="/v1/departures" />
      </div>

      <hr className="my-10 border-border" />

      <h2 className="text-xl font-semibold">Parameters</h2>
      <div className="mt-4">
        <ParamTable params={params} />
      </div>

      <div className="mt-6 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
        <p className="text-sm font-semibold text-yellow-400">Timezone note</p>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          The <code className="text-white">date</code> and <code className="text-white">time</code> parameters
          are interpreted as <strong className="text-white">Sydney local time (AEST/AEDT)</strong>, because that
          is how the underlying TfNSW API processes them. However, all timestamps in the response
          (<code className="text-white">scheduled_at</code>, <code className="text-white">realtime_at</code>,
          <code className="text-white">retrieved_at</code>) are returned in <strong className="text-white">UTC</strong>.
          For example, passing <code className="text-white">time=0800</code> means 8:00 AM Sydney time, not 8:00 AM UTC.
        </p>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Examples</h2>
      <div className="mt-4 space-y-4">
        <CodeBlock code={curlCode} html={curlHtml} filename="cURL" />
        <CodeBlock code={jsCode} html={jsHtml} filename="JavaScript" />
        <CodeBlock code={pythonCode} html={pythonHtml} filename="Python" />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Response</h2>
      <div className="mt-4">
        <CodeBlock code={responseCode} html={responseHtml} filename="200 OK" />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Response Fields</h2>
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
              <td className="px-4 py-3 font-mono text-accent">route</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string</td>
              <td className="px-4 py-3 text-text-secondary">Route number (e.g. &quot;N10&quot;, &quot;422&quot;)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">destination</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string</td>
              <td className="px-4 py-3 text-text-secondary">Final stop name</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">scheduled_at</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string</td>
              <td className="px-4 py-3 text-text-secondary">Scheduled departure time (UTC ISO 8601)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">realtime_at</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string | null</td>
              <td className="px-4 py-3 text-text-secondary">Estimated real-time departure (null if no live data)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">minutes_away</td>
              <td className="px-4 py-3 font-mono text-text-secondary">integer</td>
              <td className="px-4 py-3 text-text-secondary">Minutes until departure (uses realtime if available)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">is_live</td>
              <td className="px-4 py-3 font-mono text-text-secondary">boolean</td>
              <td className="px-4 py-3 text-text-secondary">Whether real-time tracking data is available</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">wheelchair_accessible</td>
              <td className="px-4 py-3 font-mono text-text-secondary">boolean</td>
              <td className="px-4 py-3 text-text-secondary">Whether the vehicle is wheelchair accessible</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">occupancy</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string | null</td>
              <td className="px-4 py-3 text-text-secondary">MANY_SEATS, FEW_SEATS, STANDING_ONLY, or null</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">alerts</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string[]</td>
              <td className="px-4 py-3 text-text-secondary">Plain-text disruption alerts (empty array if none)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
