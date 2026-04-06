import { Metadata } from "next";
import { EndpointBadge } from "@/components/EndpointBadge";
import { ParamTable } from "@/components/ParamTable";
import { CodeBlock } from "@/components/CodeBlock";
import { highlight } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Transit Score Endpoint",
};

const curlCode = `curl "https://api.transitkit.dev/v1/score?lat=-33.8982&lng=151.1783" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

const responseCode = `{
  "location": { "lat": -33.8982, "lng": 151.1783 },
  "score": 92,
  "summary": "Excellent",
  "nearby_stops": 30,
  "closest_stop": {
    "stop_id": "204210",
    "name": "Newtown Station, Newtown",
    "distance_metres": 61
  }
}`;

const params = [
  {
    name: "lat",
    type: "float",
    required: true,
    description: "Latitude (e.g. -33.8982)",
  },
  {
    name: "lng",
    type: "float",
    required: true,
    description: "Longitude (e.g. 151.1783)",
  },
];

export default async function ScorePage() {
  const [curlHtml, responseHtml] = await Promise.all([
    highlight(curlCode, "bash"),
    highlight(responseCode, "json"),
  ]);

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Transit Score</h1>
      <p className="mt-4 text-text-secondary leading-relaxed">
        Get a bus transit accessibility score (0–100) for any coordinates. Useful
        for property listings, venue pages, or any application that needs to
        communicate transit access without requiring users to look up stops manually.
      </p>

      <div className="mt-6">
        <EndpointBadge method="GET" path="/v1/score" />
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

      <h2 className="mt-10 text-xl font-semibold">Scoring</h2>
      <p className="mt-3 text-text-secondary leading-relaxed">
        Scores are calculated from three components based on bus stops within 1km:
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 font-medium text-text-secondary">Component</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Points</th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-b [&>tr]:border-border [&>tr:last-child]:border-0">
            <tr>
              <td className="px-4 py-3 text-text-secondary">Stops within 500m</td>
              <td className="px-4 py-3 font-mono text-text-secondary">4 pts each, max 10 stops (40 pts)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-text-secondary">Stops within 1000m</td>
              <td className="px-4 py-3 font-mono text-text-secondary">2 pts each, max 10 stops (20 pts)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-text-secondary">Closest stop &lt;100m</td>
              <td className="px-4 py-3 font-mono text-text-secondary">+40 pts</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-text-secondary">Closest stop &lt;200m</td>
              <td className="px-4 py-3 font-mono text-text-secondary">+30 pts</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-text-secondary">Closest stop &lt;400m</td>
              <td className="px-4 py-3 font-mono text-text-secondary">+20 pts</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-text-secondary">Closest stop &lt;800m</td>
              <td className="px-4 py-3 font-mono text-text-secondary">+10 pts</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Summary Labels</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 font-medium text-text-secondary">Score</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Summary</th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-b [&>tr]:border-border [&>tr:last-child]:border-0">
            <tr><td className="px-4 py-3 font-mono text-text-secondary">81–100</td><td className="px-4 py-3 text-accent font-medium">Excellent</td></tr>
            <tr><td className="px-4 py-3 font-mono text-text-secondary">61–80</td><td className="px-4 py-3 text-white">Good</td></tr>
            <tr><td className="px-4 py-3 font-mono text-text-secondary">41–60</td><td className="px-4 py-3 text-text-secondary">Average</td></tr>
            <tr><td className="px-4 py-3 font-mono text-text-secondary">21–40</td><td className="px-4 py-3 text-text-secondary">Below Average</td></tr>
            <tr><td className="px-4 py-3 font-mono text-text-secondary">0–20</td><td className="px-4 py-3 text-text-secondary">Minimal</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Example Scores</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 font-medium text-text-secondary">Location</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Score</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Summary</th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-b [&>tr]:border-border [&>tr:last-child]:border-0">
            <tr>
              <td className="px-4 py-3 text-text-secondary">Newtown Station</td>
              <td className="px-4 py-3 font-mono text-accent">92</td>
              <td className="px-4 py-3 text-accent">Excellent</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-text-secondary">Sydney CBD</td>
              <td className="px-4 py-3 font-mono text-white">64</td>
              <td className="px-4 py-3 text-white">Good</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-text-secondary">Penrith</td>
              <td className="px-4 py-3 font-mono text-text-secondary">~20</td>
              <td className="px-4 py-3 text-text-secondary">Minimal</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-text-secondary">Ocean / harbour</td>
              <td className="px-4 py-3 font-mono text-text-secondary">0</td>
              <td className="px-4 py-3 text-text-secondary">Minimal</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary leading-relaxed">
        <strong className="text-white">Note:</strong> Scores reflect <strong className="text-white">bus stop accessibility specifically</strong>,
        not all transport modes. A location next to a train station with no bus stops
        nearby may score lower than expected.
      </div>
    </article>
  );
}
