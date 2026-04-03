import { Metadata } from "next";
import { EndpointBadge } from "@/components/EndpointBadge";
import { ParamTable } from "@/components/ParamTable";
import { CodeBlock } from "@/components/CodeBlock";
import { highlight } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Stop Search Endpoint",
};

const curlCode = `curl "https://api.transitkit.dev/v1/stops/search?q=circular+quay" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

const responseCode = `{
  "query": "circular quay",
  "results": [
    {
      "stop_id": "200060",
      "name": "Circular Quay, Stand A",
      "suburb": "Sydney"
    },
    {
      "stop_id": "200061",
      "name": "Circular Quay, Stand B",
      "suburb": "Sydney"
    }
  ]
}`;

const params = [
  {
    name: "q",
    type: "string",
    required: true,
    description: 'Stop name search query (e.g. "circular quay")',
  },
  {
    name: "limit",
    type: "integer",
    required: false,
    description: "Max results. Default: 10",
  },
];

export default async function StopsSearchPage() {
  const [curlHtml, responseHtml] = await Promise.all([
    highlight(curlCode, "bash"),
    highlight(responseCode, "json"),
  ]);

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Stop Search</h1>
      <p className="mt-4 text-text-secondary leading-relaxed">
        Search for bus stops by name. Returns only actual stops — no streets,
        suburbs, restaurants, or other junk results.
      </p>

      <div className="mt-6">
        <EndpointBadge method="GET" path="/v1/stops/search" />
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
              <td className="px-4 py-3 text-text-secondary">Full stop name</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-accent">suburb</td>
              <td className="px-4 py-3 font-mono text-text-secondary">string</td>
              <td className="px-4 py-3 text-text-secondary">Suburb or locality</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-10 rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary leading-relaxed">
        <strong className="text-white">Why this matters:</strong> Searching for
        &quot;Newtown&quot; in the raw TfNSW API returns 48 results — streets,
        suburbs, restaurants, and parks. The actual stop is at position 48.
        TransitKit returns only stops.
      </div>
    </article>
  );
}
