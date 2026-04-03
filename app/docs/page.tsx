import { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { highlight } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Getting Started",
};

const authCode = `Authorization: Bearer tk_live_xxxxxxxxxxxx`;

const curlCode = `curl https://api.transitkit.dev/v1/departures \\
  -H "Authorization: Bearer tk_live_xxxxxxxxxxxx" \\
  -G \\
  --data-urlencode "stop=200060" \\
  --data-urlencode "limit=5"`;

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
      "occupancy": "MANY_SEATS"
    },
    {
      "route": "422",
      "destination": "Strathfield Station",
      "scheduled_at": "2026-04-03T17:04:00Z",
      "realtime_at": null,
      "minutes_away": 11,
      "is_live": false,
      "wheelchair_accessible": true,
      "occupancy": null
    }
  ]
}`;

export default async function DocsHome() {
  const [authHtml, curlHtml, responseHtml] = await Promise.all([
    highlight(authCode, "http"),
    highlight(curlCode, "bash"),
    highlight(responseCode, "json"),
  ]);

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Getting Started</h1>
      <p className="mt-4 text-lg text-text-secondary leading-relaxed">
        TransitKit wraps the Transport for NSW Trip Planner API into a clean,
        modern REST API. Get real-time bus departures, nearby stops, and route
        search with proper JSON responses, CORS support, and real HTTP status
        codes.
      </p>

      <hr className="my-10 border-border" />

      <h2 className="text-xl font-semibold" id="step-1">Step 1 — Get an API Key</h2>
      <p className="mt-3 text-text-secondary leading-relaxed">
        Register at{" "}
        <a href="https://tally.so" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          transitkit.dev/signup
        </a>
        . Your key will be emailed instantly. It looks like:{" "}
        <code className="rounded bg-code-bg px-2 py-1 font-mono text-sm text-accent">
          tk_live_xxxxxxxxxxxx
        </code>
      </p>

      <h2 className="mt-10 text-xl font-semibold" id="step-2">Step 2 — Authenticate</h2>
      <p className="mt-3 text-text-secondary leading-relaxed">
        Pass your key in the Authorization header:
      </p>
      <div className="mt-4">
        <CodeBlock code={authCode} html={authHtml} />
      </div>
      <div className="mt-4 rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary">
        <strong className="text-white">Note:</strong> TransitKit uses standard Bearer auth.
        The underlying TfNSW API uses a non-standard{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs">apikey &lt;jwt&gt;</code>{" "}
        format — TransitKit handles this translation for you.
      </div>

      <h2 className="mt-10 text-xl font-semibold" id="step-3">Step 3 — Make your first request</h2>
      <div className="mt-4">
        <CodeBlock code={curlCode} html={curlHtml} filename="Terminal" />
      </div>

      <h3 className="mt-10 text-lg font-semibold">Response</h3>
      <div className="mt-4">
        <CodeBlock code={responseCode} html={responseHtml} filename="200 OK" />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Important Notes</h2>

      <div className="mt-6 space-y-4">
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary leading-relaxed">
          <strong className="text-white">Real-time coverage:</strong> Coverage varies
          significantly by stop and time of day. During testing: Newtown Station had
          ~25% of departures with real-time data, Central Station had ~12%, Circular
          Quay had ~2.5%. Night buses (N-routes) do receive real-time tracking.
          TransitKit always indicates <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs">is_live</code> accurately.
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary leading-relaxed">
          <strong className="text-white">40 event hard cap:</strong> The TfNSW API always
          returns exactly 40 departure events regardless of query parameters. At busy
          multi-modal stops like Central, filtering to buses only may leave you with
          as few as 8 departures. TransitKit&apos;s{" "}
          <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs">limit</code> parameter
          works post-filter, so <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs">limit=10</code> always returns 10 buses.
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary leading-relaxed">
          <strong className="text-white">Disruptions:</strong> Each departure may include
          alerts from TfNSW. TransitKit surfaces these as clean plain-text strings in
          an <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs">alerts</code> array —
          no HTML parsing needed.
        </div>
      </div>
    </article>
  );
}
