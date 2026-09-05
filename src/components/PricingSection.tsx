"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { PLANS, getPlansByAccountType, type AccountType } from "@/lib/plans";

interface PricingCardProps {
  planId: string;
  name: string;
  price: number;
  description: string;
  recommended?: boolean;
  features: string[];
  cta: string;
  ctaHref: string;
}

function PricingCard({
  planId,
  name,
  price,
  description,
  recommended,
  features,
  cta,
  ctaHref,
}: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border p-8 md:p-10 transition ${
        recommended
          ? "border-[var(--shelf-forest)] bg-[var(--shelf-cream)]/60 shadow-lg ring-2 ring-[var(--shelf-forest)]/20"
          : "border-[var(--shelf-border)] bg-[var(--shelf-surface)]"
      }`}
    >
      {recommended && (
        <div className="absolute -top-4 left-6 inline-block bg-[var(--shelf-forest)] px-3 py-1 rounded-full text-xs font-bold text-white">
          Recommended
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-[var(--shelf-dark)]">{name}</h3>

        <div className="mt-4 flex items-end gap-2">
          <span className="text-4xl font-bold text-[var(--shelf-dark)]">
            ₹{price}
          </span>
          {price > 0 && (
            <span className="text-sm text-[var(--shelf-muted)]">/month</span>
          )}
        </div>

        <p className="mt-4 text-sm text-[var(--shelf-muted)]">{description}</p>

        <div className="my-8 h-px bg-[var(--shelf-border)]" />

        <ul className="space-y-3">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm text-[var(--shelf-dark)]"
            >
              <Check className="h-5 w-5 shrink-0 text-[var(--shelf-forest)] mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link href={ctaHref} className="block mt-8">
        <button
          className={`w-full rounded-xl px-6 py-3 font-semibold transition ${
            recommended
              ? "bg-[var(--shelf-forest)] text-white hover:opacity-90"
              : "border border-[var(--shelf-border)] text-[var(--shelf-dark)] hover:bg-[var(--shelf-cream)]"
          }`}
        >
          {cta}
        </button>
      </Link>
    </div>
  );
}

export default function PricingSection() {
  const consumerPlans = getPlansByAccountType("consumer");
  const businessPlans = getPlansByAccountType("business");

  return (
    <section id="pricing" className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--shelf-forest)]">
            Pricing
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--shelf-dark)] md:text-5xl">
            Start free. Upgrade when you need more.
          </h2>

          <p className="mt-6 text-lg text-[var(--shelf-muted)]">
            Choose a plan that fits your needs. No credit card required to get started.
          </p>
        </div>

        {/* Consumer Plans */}
        <div className="mb-20">
          <h3 className="mb-8 text-2xl font-bold text-[var(--shelf-dark)]">
            For Individuals
          </h3>

          <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
            {consumerPlans.map((plan) => {
              const displayFeatures =
                plan.id === "consumer_free"
                  ? [
                      "Inventory management",
                      "AI label scanning",
                      "CSV import",
                      "Expiry tracking",
                      "AI recipes",
                      "Waste insights",
                      "Analytics",
                      "CSV & PDF export",
                    ]
                  : [
                      "Everything in Free",
                      "Advanced AI recipes",
                      "Weekly meal planning",
                      "Historical analytics",
                      "Consumption trends",
                      "XLSX export",
                      "Extended history",
                      "Priority support",
                    ];

              return (
                <PricingCard
                  key={plan.id}
                  planId={plan.id}
                  name={plan.name}
                  price={plan.price}
                  description={plan.description}
                  features={displayFeatures}
                  cta={plan.price === 0 ? "Get Started" : "Upgrade"}
                  ctaHref={
                    plan.price === 0 ? "/get-started" : "/#upgrade-coming-soon"
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Business Plans */}
        <div>
          <h3 className="mb-8 text-2xl font-bold text-[var(--shelf-dark)]">
            For Businesses
          </h3>

          <div className="grid gap-6 md:grid-cols-3">
            {businessPlans.map((plan) => {
              const displayFeatures =
                plan.id === "business_starter"
                  ? [
                      "Inventory management",
                      "AI label scanning",
                      "CSV import",
                      "FIFO prioritization",
                      "Expiry alerts",
                      "Analytics",
                      "Waste insights",
                      "CSV & PDF export",
                    ]
                  : plan.id === "business_pro"
                  ? [
                      "Everything in Starter",
                      "Advanced inventory strategy",
                      "Advanced analytics",
                      "Team members",
                      "Historical insights",
                      "Advanced reports",
                      "XLSX export",
                      "Priority support",
                    ]
                  : [
                      "Everything in Pro",
                      "Multiple locations",
                      "Centralized dashboard",
                      "Forecasting",
                      "Integrations",
                      "Advanced reporting",
                      "More team members",
                      "Dedicated support",
                    ];

              return (
                <PricingCard
                  key={plan.id}
                  planId={plan.id}
                  name={plan.name}
                  price={plan.price}
                  description={plan.description}
                  recommended={plan.recommended}
                  features={displayFeatures}
                  cta={plan.price === 0 ? "Get Started" : "Upgrade"}
                  ctaHref={
                    plan.price === 0 ? "/get-started" : "/#upgrade-coming-soon"
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Coming Soon Note */}
        <div className="mt-12 rounded-xl border border-[var(--shelf-info-border)] bg-[var(--shelf-info-bg)] p-6 text-center text-sm text-[var(--shelf-info-text)]">
        <p className="font-semibold">Premium subscriptions are coming soon</p>
        <p className="mt-1 text-[var(--shelf-info-text)]">
          Free plans include full access to core features. Premium plans will unlock advanced analytics, AI features and team collaboration.
        </p>
      </div>
      </div>
    </section>
  );
}
