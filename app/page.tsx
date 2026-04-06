import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { Footer } from "@/components/Footer";
import { highlight } from "@/lib/highlight";

const rawTfnswCode = `{
  "realtimeStatus": ["MONITORED"],
  "isRealtimeControlled": true,
  "location": {
    "id": "204238",
    "name": "Newtown Station, King St, Stand B",
    "type": "platform",
    "coord": [-33.898167, 151.178277],
    "properties": {
      "occupancy": "MANY_SEATS",
      "stopId": "10101214",
      "platform": "B",
      "platformName": "Newtown Station, King St, Stand B"
    },
    "parent": {
      "id": "204210",
      "name": "Newtown Station, King St, Stand B, Newtown",
      "type": "stop"
    }
  },
  "departureTimePlanned": "2026-04-03T16:59:00Z",
  "departureTimeBaseTimetable": "2026-04-03T16:59:00Z",
  "departureTimeEstimated": "2026-04-03T17:05:24Z",
  "transportation": {
    "id": "nsw:31N10: :R:sj2",
    "name": "Sydney Buses Network N10",
    "number": "N10",
    "description": "Sutherland to City Town Hall",
    "product": { "class": 5, "name": "Sydney Buses Network" },
    "operator": { "id": "2510", "name": "U-Go Mobility" },
    "destination": {
      "id": "10101101",
      "name": "Town Hall Station",
      "type": "stop"
    }
  },
  "properties": {
    "WheelchairAccess": "true",
    "RealtimeTripId": "2197798"
  }
}
// ...and you still need to infer isLive yourself,
// filter out trains, fix the coordinate order,
// and handle 200 OK "errors" in systemMessages`;

const transitKitCode = `{
  "stop": "Newtown Station, King St, Stand B",
  "departures": [
    {
      "route": "N10",
      "destination": "Town Hall Station",
      "scheduled": "2026-04-03T16:59:00Z",
      "realtime": "2026-04-03T17:05:24Z",
      "minutesAway": 6,
      "isLive": true,
      "wheelchairAccessible": true,
      "occupancy": "MANY_SEATS"
    }
  ]
}`;

const quickstartCode = `# 1. Get your free API key at transitkit.dev

# 2. Make your first request
curl https://api.transitkit.dev/v1/departures?stop=200060 \\
  -H "Authorization: Bearer YOUR_API_KEY"

# 3. Get clean JSON back instantly`;

const features = [
  {
    title: "Works from the browser",
    subtitle: "The raw API doesn't",
    description:
      "TfNSW has zero CORS support. Every OPTIONS preflight returns HTTP 500 with a SOAP XML fault. TransitKit has full CORS support — call it directly from any frontend.",
  },
  {
    title: "No more type inference",
    subtitle: "Clean boolean fields",
    description:
      'TfNSW has no isLive boolean. You have to compare timestamps and handle null values. TransitKit returns a clean is_live: true/false.',
  },
  {
    title: "Buses only, guaranteed",
    subtitle: "No more filtering",
    description:
      "TfNSW returns all transport modes together. Central Station dumps trains, metro, light rail and buses in one response. TransitKit filters to buses only.",
  },
  {
    title: "Ghost stop protection",
    subtitle: "No phantom results",
    description:
      "The TfNSW nearby API returns decommissioned stops with no flag. They claim to serve buses but return zero departures forever. TransitKit silently filters them.",
  },
  {
    title: "Fixed coordinates",
    subtitle: "Consistent lat, lng everywhere",
    description:
      "TfNSW query params take lng:lat, responses return [lat, lng]. TransitKit uses lat, lng consistently everywhere.",
  },
  {
    title: "Real HTTP status codes",
    subtitle: "No more 200 OK errors",
    description:
      "TfNSW returns HTTP 200 for errors, burying them in systemMessages. TransitKit returns proper 4xx/5xx codes with consistent JSON error shapes.",
  },
  {
    title: "Future departures",
    subtitle: "Query any date and time",
    description:
      "Pass date and time params in Sydney local time (AEST/AEDT) to get departures at any future point. Response timestamps are returned in UTC.",
  },
  {
    title: "Clean disruption alerts",
    subtitle: "Plain text, no HTML parsing",
    description:
      'TransitKit exposes disruption summaries as plain text — no HTML parsing required. e.g. "Buses replace trains between Waterfall and Sutherland".',
  },
  {
    title: "Free tier",
    subtitle: "1,000 requests/day",
    description:
      "Get started with 1,000 requests per day free. No credit card required. Upgrade when you need more.",
  },
];

const useCases = [
  { title: "Mobile apps", description: "iOS, Android, React Native transit apps" },
  { title: "Property listings", description: "Show transit scores for real estate" },
  { title: "Hotel & venue displays", description: "Real-time transport info for guests" },
  { title: "Campus wayfinding", description: "University and campus transit boards" },
  { title: "Internal dashboards", description: "Operations and monitoring tools" },
];

export default async function Home() {
  const [rawHtml, cleanHtml, quickstartHtml] = await Promise.all([
    highlight(rawTfnswCode, "jsonc"),
    highlight(transitKitCode, "json"),
    highlight(quickstartCode, "bash"),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 md:pt-32">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            The Sydney transit API you&apos;ll actually{" "}
            <span className="text-accent">enjoy using</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-text-secondary leading-relaxed">
            The TfNSW API can&apos;t be called from a browser. TransitKit can.
            Clean JSON, real bus departures, full CORS support. Live in 5
            minutes.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="https://tally.so"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-black hover:bg-accent/90 transition-colors"
            >
              Get API Key &rarr;
            </a>
            <Link
              href="/docs"
              className="rounded-md border border-border px-6 py-3 text-sm font-medium text-white hover:bg-surface transition-colors"
            >
              Read the docs
            </Link>
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            Free to start. No credit card required.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2">
            <svg className="h-4 w-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            <span className="text-xs text-text-secondary">
              Powered by{" "}
              <span className="text-white font-medium">Transport for NSW Open Data</span>
            </span>
          </div>
        </div>
      </section>

      {/* Code Comparison */}
      <section className="mx-auto max-w-6xl px-6 pb-32">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-text-secondary">
                Without TransitKit — one departure, 40+ lines
              </span>
            </div>
            <CodeBlock code={rawTfnswCode} html={rawHtml} filename="TfNSW API Response" />
          </div>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              <span className="text-sm font-medium text-text-secondary">
                With TransitKit
              </span>
            </div>
            <CodeBlock code={transitKitCode} html={cleanHtml} filename="TransitKit Response" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything the raw API should have been
          </h2>
          <p className="mt-4 max-w-2xl text-text-secondary">
            TransitKit handles the painful parts so you can focus on building.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-lg border border-border bg-background p-6">
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="mt-1 text-sm text-accent">{feature.subtitle}</p>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl font-bold tracking-tight">
          Live in 5 minutes
        </h2>
        <p className="mt-4 text-text-secondary">
          Three steps. No SDK needed.
        </p>
        <div className="mt-8 max-w-2xl">
          <CodeBlock code={quickstartCode} html={quickstartHtml} filename="Terminal" />
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-3xl font-bold tracking-tight">
            Who builds with TransitKit
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="flex items-start gap-4 rounded-lg border border-border bg-background p-6">
                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                <div>
                  <h3 className="font-medium text-white">{useCase.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {useCase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Ready to build?
        </h2>
        <p className="mt-4 text-text-secondary">
          Get your free API key and make your first request in under a minute.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="https://tally.so"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-black hover:bg-accent/90 transition-colors"
          >
            Get API Key &rarr;
          </a>
          <Link
            href="/docs"
            className="rounded-md border border-border px-6 py-3 text-sm font-medium text-white hover:bg-surface transition-colors"
          >
            Read the docs
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
