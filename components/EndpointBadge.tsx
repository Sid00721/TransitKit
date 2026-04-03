interface EndpointBadgeProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
}

const methodColors = {
  GET: "bg-accent/20 text-accent",
  POST: "bg-blue-500/20 text-blue-400",
  PUT: "bg-yellow-500/20 text-yellow-400",
  DELETE: "bg-red-500/20 text-red-400",
};

export function EndpointBadge({ method, path }: EndpointBadgeProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-code-bg px-4 py-3 font-mono">
      <span className={`rounded px-2 py-0.5 text-xs font-bold ${methodColors[method]}`}>
        {method}
      </span>
      <span className="text-sm text-white">{path}</span>
    </div>
  );
}
