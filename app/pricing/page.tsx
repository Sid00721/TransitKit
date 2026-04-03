import { Metadata } from "next";
import { PricingCard } from "@/components/PricingCard";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    features: [
      "1,000 requests/day",
      "All endpoints",
      "Community support",
      "No credit card required",
    ],
    cta: "Get started free",
  },
  {
    name: "Developer",
    price: "$19",
    period: "month",
    features: [
      "50,000 requests/day",
      "All endpoints",
      "Email support",
      "SLA: best effort",
    ],
    cta: "Subscribe",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$79",
    period: "month",
    features: [
      "Unlimited requests",
      "All endpoints",
      "Priority support",
      "99.9% uptime SLA",
      "Commercial use licence",
    ],
    cta: "Subscribe",
  },
];

export default function PricingPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Start free. Scale when you need to.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-text-secondary">
          Need higher limits or a custom plan?{" "}
          <a
            href="mailto:hey@transitkit.dev"
            className="text-accent hover:underline"
          >
            Email us
          </a>
        </p>

        <div className="mt-16 rounded-lg border border-border bg-surface p-6 text-center text-sm text-text-secondary">
          TransitKit uses data from the Transport for NSW Open Data platform
          under the Transport for NSW data licence.
        </div>
      </div>
      <Footer />
    </>
  );
}
