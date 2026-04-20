"use client";

import Link from "next/link";
import { useState } from "react";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-mono text-lg font-bold text-white">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
          TransitKit
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/docs" className="text-sm text-text-secondary hover:text-white transition-colors">
            Docs
          </Link>
          <Link href="/pricing" className="text-sm text-text-secondary hover:text-white transition-colors">
            Pricing
          </Link>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSeJd8FMTsiUnJlXVtfpTexlP_GKjh0nNGgKJfmrsPJ-qXoX1A/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent/90 transition-colors"
          >
            Get API Key
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-text-secondary hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/docs" onClick={() => setOpen(false)} className="text-sm text-text-secondary hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/pricing" onClick={() => setOpen(false)} className="text-sm text-text-secondary hover:text-white transition-colors">
              Pricing
            </Link>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeJd8FMTsiUnJlXVtfpTexlP_GKjh0nNGgKJfmrsPJ-qXoX1A/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent/90 transition-colors"
            >
              Get API Key
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
