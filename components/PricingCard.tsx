interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export function PricingCard({ name, price, period, features, cta, highlighted }: PricingCardProps) {
  return (
    <div className={`flex flex-col rounded-xl border p-8 ${
      highlighted
        ? "border-accent bg-accent/5"
        : "border-border bg-surface"
    }`}>
      <h3 className="text-lg font-semibold text-white">{name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-white">{price}</span>
        {period && <span className="text-text-secondary">/{period}</span>}
      </div>
      <ul className="mt-8 flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-text-secondary">
            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <a
        href="https://tally.so"
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-8 block rounded-md py-3 text-center text-sm font-medium transition-colors ${
          highlighted
            ? "bg-accent text-black hover:bg-accent/90"
            : "border border-border bg-surface text-white hover:bg-border"
        }`}
      >
        {cta}
      </a>
    </div>
  );
}
