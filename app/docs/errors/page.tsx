import { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { highlight } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Errors",
};

const errorShapeCode = `{
  "error": {
    "code": "INVALID_STOP",
    "message": "No stop found with ID '99999'. Use /v1/stops/search to find valid stop IDs.",
    "docs": "https://transitkit.dev/docs/errors#INVALID_STOP"
  }
}`;

export default async function ErrorsPage() {
  const errorShapeHtml = await highlight(errorShapeCode, "json");

  const errors = [
    { status: "401", code: "UNAUTHORIZED", description: "Missing or invalid API key" },
    { status: "400", code: "INVALID_STOP", description: "Stop ID not found in TfNSW system" },
    { status: "400", code: "MISSING_PARAM", description: "Required parameter not provided" },
    { status: "429", code: "RATE_LIMITED", description: "Daily request limit exceeded" },
    { status: "503", code: "UPSTREAM_ERROR", description: "TfNSW API unavailable" },
  ];

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Errors</h1>
      <p className="mt-4 text-text-secondary leading-relaxed">
        TransitKit returns proper HTTP status codes and a consistent JSON error
        shape for all error responses. No more digging through{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs">systemMessages</code>{" "}
        in 200 OK responses.
      </p>

      <hr className="my-10 border-border" />

      <h2 className="text-xl font-semibold">Error Shape</h2>
      <p className="mt-3 text-text-secondary leading-relaxed">
        All errors return this consistent JSON structure:
      </p>
      <div className="mt-4">
        <CodeBlock code={errorShapeCode} html={errorShapeHtml} filename="Error Response" />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Error Codes</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 font-medium text-text-secondary">HTTP Status</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Error Code</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Description</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((error) => (
              <tr key={error.code} className="border-b border-border last:border-0" id={error.code}>
                <td className="px-4 py-3 font-mono text-white">{error.status}</td>
                <td className="px-4 py-3 font-mono text-accent">{error.code}</td>
                <td className="px-4 py-3 text-text-secondary">{error.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Compared to TfNSW</h2>
      <p className="mt-3 text-text-secondary leading-relaxed">
        The raw TfNSW API returns HTTP 200 for nearly all responses, including
        errors. Error information is buried in a{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs">systemMessages</code>{" "}
        array within the response body. Your HTTP client treats these as
        successful responses, making error handling unreliable.
      </p>
      <p className="mt-3 text-text-secondary leading-relaxed">
        TransitKit translates these into proper HTTP status codes so you can use
        standard error handling patterns in any language.
      </p>
    </article>
  );
}
