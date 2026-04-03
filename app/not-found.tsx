import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-3 text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-black hover:bg-accent/90 transition-colors"
        >
          Go home
        </Link>
        <Link
          href="/docs"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-white hover:bg-surface transition-colors"
        >
          Read the docs
        </Link>
      </div>
    </div>
  );
}
