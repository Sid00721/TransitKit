interface Param {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ParamTableProps {
  params: Param[];
}

export function ParamTable({ params }: ParamTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <th className="px-4 py-3 font-medium text-text-secondary">Parameter</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Type</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Required</th>
            <th className="px-4 py-3 font-medium text-text-secondary">Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) => (
            <tr key={param.name} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-mono text-accent">{param.name}</td>
              <td className="px-4 py-3 font-mono text-text-secondary">{param.type}</td>
              <td className="px-4 py-3">
                {param.required ? (
                  <span className="rounded bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">Required</span>
                ) : (
                  <span className="text-text-secondary">Optional</span>
                )}
              </td>
              <td className="px-4 py-3 text-text-secondary">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
