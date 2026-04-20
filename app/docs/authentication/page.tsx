import { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { highlight } from "@/lib/highlight";

export const metadata: Metadata = {
  title: "Authentication",
};

const bearerCode = `curl https://api.transitkit.dev/v1/departures?stop=200060 \\
  -H "Authorization: Bearer tk_live_xxxxxxxxxxxx"`;

const jsCode = `const res = await fetch('https://api.transitkit.dev/v1/departures?stop=200060', {
  headers: {
    'Authorization': \`Bearer \${process.env.TRANSITKIT_API_KEY}\`
  }
})`;

const pythonCode = `import requests

response = requests.get(
  'https://api.transitkit.dev/v1/departures',
  params={'stop': '200060'},
  headers={'Authorization': f'Bearer {API_KEY}'}
)`;

const errorCode = `{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid API key. Include your key in the Authorization header as: Bearer tk_live_xxx",
    "docs": "https://transitkit.dev/docs/authentication"
  }
}`;

export default async function AuthenticationPage() {
  const [bearerHtml, jsHtml, pythonHtml, errorHtml] = await Promise.all([
    highlight(bearerCode, "bash"),
    highlight(jsCode, "javascript"),
    highlight(pythonCode, "python"),
    highlight(errorCode, "json"),
  ]);

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Authentication</h1>
      <p className="mt-4 text-text-secondary leading-relaxed">
        All API requests require a valid API key passed in the{" "}
        <code className="rounded bg-code-bg px-2 py-1 font-mono text-sm text-accent">Authorization</code>{" "}
        header using the Bearer scheme.
      </p>

      <hr className="my-10 border-border" />

      <h2 className="text-xl font-semibold">Getting a Key</h2>
      <p className="mt-3 text-text-secondary leading-relaxed">
        Register at{" "}
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSeJd8FMTsiUnJlXVtfpTexlP_GKjh0nNGgKJfmrsPJ-qXoX1A/viewform" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          the signup form
        </a>{" "}
        to get a free API key. Keys are prefixed with{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs text-accent">tk_live_</code>{" "}
        and emailed instantly.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Using Your Key</h2>
      <p className="mt-3 text-text-secondary leading-relaxed">
        Include your API key in every request:
      </p>

      <div className="mt-6 space-y-4">
        <CodeBlock code={bearerCode} html={bearerHtml} filename="cURL" />
        <CodeBlock code={jsCode} html={jsHtml} filename="JavaScript" />
        <CodeBlock code={pythonCode} html={pythonHtml} filename="Python" />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Error Response</h2>
      <p className="mt-3 text-text-secondary leading-relaxed">
        Requests without a valid key return{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs">401 Unauthorized</code>:
      </p>
      <div className="mt-4">
        <CodeBlock code={errorCode} html={errorHtml} filename="401 Unauthorized" />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Rate Limits</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 font-medium text-text-secondary">Plan</th>
              <th className="px-4 py-3 font-medium text-text-secondary">Daily Limit</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="px-4 py-3 text-white">Free</td>
              <td className="px-4 py-3 font-mono text-text-secondary">1,000 requests/day</td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-4 py-3 text-white">Developer</td>
              <td className="px-4 py-3 font-mono text-text-secondary">50,000 requests/day</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-white">Pro</td>
              <td className="px-4 py-3 font-mono text-text-secondary">Unlimited</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-text-secondary">
        When you exceed your rate limit, the API returns{" "}
        <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs">429 Too Many Requests</code>.
        Limits reset daily at midnight UTC.
      </p>
    </article>
  );
}
