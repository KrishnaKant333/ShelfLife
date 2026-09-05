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
    <article
      className={`relative flex min-w-[86vw] snap-start flex-col justify-between rounded-2xl border p-6 transition sm:min-w-0 md:p-10 ${recommended
          ? "border-[var(--sl-color-action)] bg-[var(--sl-color-action-soft)] shadow-[var(--sl-shadow-lg)] ring-2 ring-[var(--sl-color-action)]/20"
          : "border-[var(--sl-color-border)] bg-[var(--sl-color-surface)]"
        }`}
    >
      {recommended && (
        <div className="absolute -top-4 left-6 inline-block rounded-[var(--sl-radius-pill)] bg-[var(--sl-color-action)] px-3 py-1 text-xs font-bold text-[var(--sl-color-on-action)]">
          Recommended
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-[var(--sl-color-text)]">{name}</h3>

        <div className="mt-4 flex items-end gap-2">
          <span className="text-4xl font-semibold text-[var(--sl-color-text)]">
            ₹{price}
          </span>
          {price > 0 && (
            <span className="text-sm text-[var(--sl-color-text-muted)]">/month</span>
          )}
        </div>

        <p className="mt-4 text-sm text-[var(--sl-color-text-muted)]">{description}</p>

        <div className="my-8 h-px bg-[var(--sl-color-border)]" />

        <ul className="grid grid-cols-2 gap-x-3 gap-y-2 md:block md:space-y-3">
          {features.map((feature) => (
            <li
              key={feature}
                className="flex items-start gap-2 text-sm text-[var(--sl-color-text)] md:gap-3"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sl-color-success)] md:h-5 md:w-5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={ctaHref}
        className={`sl-focus-ring mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-[var(--sl-radius-md)] px-6 py-3 font-semibold transition ${recommended
            ? "bg-[var(--sl-color-action)] text-[var(--sl-color-on-action)] hover:bg-[var(--sl-color-action-hover)]"
            : "border border-[var(--sl-color-border-strong)] text-[var(--sl-color-text)] hover:bg-[var(--sl-color-surface-inset)]"
          }`}
      >
        {cta}
      </Link>
    </article>
  );
}

export default function PricingSection() {
  const consumerPlans = getPlansByAccountType("consumer");
  const businessPlans = getPlansByAccountType("business");

  return (
    <section id="pricing" className="sl-scroll-reveal border-b border-[var(--sl-color-border)] bg-[var(--sl-color-canvas)] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="sl-eyebrow">
            Pricing
          </p>

          <h2 className="mt-4 text-4xl font-semibold text-[var(--sl-color-text)] md:text-5xl">
            Start free. Upgrade when you need more.
          </h2>

          <p className="mt-6 text-lg text-[var(--sl-color-text-muted)]">
            Choose a plan that fits your needs. No credit card required to get started.
          </p>
        </div>

        {/* Consumer Plans */}
        <div className="mb-20">
          <h3 className="mb-8 text-2xl font-semibold text-[var(--sl-color-text)]">
            For Individuals
          </h3>

          <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:max-w-2xl md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
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
          <h3 className="mb-8 text-2xl font-semibold text-[var(--sl-color-text)]">
            For Businesses
          </h3>

          <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
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
