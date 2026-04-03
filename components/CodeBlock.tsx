"use client";

import { useState } from "react";

interface CodeBlockProps {
  code: string;
  html: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, html, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-lg border border-border bg-code-bg overflow-hidden">
      {filename && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="font-mono text-xs text-text-secondary">{filename}</span>
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute right-3 top-3 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-secondary opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="overflow-x-auto text-sm [&>pre]:!bg-code-bg [&>pre]:p-4"
        />
      </div>
    </div>
  );
}
