import { Metadata } from "next";
import { EndpointBadge } from "@/components/EndpointBadge";
import { ParamTable } from "@/components/ParamTable";
import { CodeBlock } from "@/components/CodeBlock";
import { highlight } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Nearby Stops Endpoint",
};

const curlCode = `curl "https://api.transitkit.dev/v1/nearby?lat=-33.8688&lng=151.2093&radius=500" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

const responseCode = `{
  "location": { "lat": -33.8688, "lng": 151.2093 },
  "stops": [
    {
      "stop_id": "200060",
      "name": "Circular Quay, Stand A",
      "distance_metres": 120,
      "routes": ["431", "X31", "372"]
    },
    {
      "stop_id": "200061",
      "name": "Circular Quay, Stand B",
      "distance_metres": 180,
      "routes": ["380", "343", "392"]
    }
  ]
}`;

const params = [
  {
    name: "lat",
    type: "float",
    required: true,
    description: "Latitude (e.g. -33.8688)",
  },
  {
    name: "lng",
    type: "float",
    required: true,
    description: "Longitude (e.g. 151.2093)",
  },
  {
    name: "radius",
    type: "integer",
    required: false,
    description: "Radius in metres. Default: 500, Max: 2000",
  },
  {
    name: "limit",
    type: "integer",
    required: false,
    description: "Max stops to return. Default: 10",
  },
];

export default async function NearbyPage() {
  const [curlHtml, responseHtml] = await Promise.all([
    highlight(curlCode, "bash"),
    highlight(responseCode, "json"),
  ]);

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Nearby Stops</h1>
      <p className="mt-4 text-text-secondary leading-relaxed">
        Find bus stops near a location. Ghost stops (decommissioned stops that
        return zero departures) are automatically filtered out.
      </p>

      <div className="mt-6">
        <EndpointBadge method="GET" path="/v1/nearby" />
      </div>

      <hr className="my-10 border-border" />

      <h2 className="text-xl font-semibold">Parameters</h2>
      <div className="mt-4">
        <ParamTable params={params} />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Example</h2>
      <div className="mt-4">
        <CodeBlock code={curlCode} html={curlHtml} filename="cURL" />
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
              <td className="px-4 py-3 font-mono text-accent">stop_id</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string</td>
              <td className="px-4 py-3 text-text-secondary">TfNSW stop identifier</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">name</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string</td>
              <td className="px-4 py-3 text-text-secondary">Human-readable stop name</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">distance_metres</td>
              <td className="px-4 py-3 font-mono text-text-secondary">integer</td>
              <td className="px-4 py-3 text-text-secondary">Distance from queried location in metres</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">routes</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string[]</td>
              <td className="px-4 py-3 text-text-secondary">Bus routes serving this stop</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-10 rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary leading-relaxed">
        <strong className="text-white">Note on coordinates:</strong> The raw
        TfNSW API accepts longitude:latitude order in query parameters but
        returns [latitude, longitude] in responses. TransitKit uses standard{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs">lat, lng</code> order
        everywhere.
      </div>
    </article>
  );
}
