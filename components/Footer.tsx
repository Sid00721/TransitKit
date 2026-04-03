import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-lg font-bold text-white">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
              TransitKit
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              The Sydney transit API developers actually want to use.
            </p>
          </div>
          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Product</span>
              <Link href="/docs" className="text-sm text-text-secondary hover:text-white transition-colors">Docs</Link>
              <Link href="/pricing" className="text-sm text-text-secondary hover:text-white transition-colors">Pricing</Link>
              <a href="https://tally.so" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-white transition-colors">Get API Key</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">Resources</span>
              <Link href="/docs/endpoints/departures" className="text-sm text-text-secondary hover:text-white transition-colors">API Reference</Link>
              <Link href="/docs/errors" className="text-sm text-text-secondary hover:text-white transition-colors">Errors</Link>
              <a href="mailto:hey@transitkit.dev" className="text-sm text-text-secondary hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 mb-6">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#002664] text-[10px] font-bold text-white leading-none">
              NSW
            </div>
            <p className="text-xs text-text-secondary">
              TransitKit uses data from the{" "}
              <span className="text-white font-medium">Transport for NSW Open Data</span>{" "}
              platform under the Transport for NSW data licence. Not affiliated with or endorsed by Transport for NSW.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-xs text-text-secondary md:flex-row md:items-center md:justify-between">
            <p>Built in Sydney</p>
            <p>&copy; {new Date().getFullYear()} TransitKit</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
