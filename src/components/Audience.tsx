"use client";

import { Home, Store } from "lucide-react";
import { useEffect, useState } from "react";


const audiences = {
  business: {
    label: "For Businesses",
    icon: Store,
    title: "Inventory intelligence for growing businesses.",
    description:
      "Give restaurants, cafés, bakeries and other businesses better visibility into stock, batches and waste.",
    features: [
      "Inventory dashboard",
      "Batch tracking",
      "Expiry monitoring",
      "Waste analytics",
    ],
  },
  consumer: {
    label: "For Consumers",
    icon: Home,
    title: "A smarter pantry at home.",
    description:
      "Keep track of the food you already have, know what's expiring and make better purchasing decisions.",
    features: [
      "Virtual pantry",
      "Expiry alerts",
      "Duplicate purchase prevention",
      "AI recipe suggestions",
    ],
  },
};

export default function Audience() {
  const [active, setActive] =
    useState<keyof typeof audiences>("business");

    useEffect(() => {
      function handleAudienceChange(
        event: Event
      ) {
        const customEvent = event as CustomEvent<
          "business" | "consumer"
        >;

        setActive(customEvent.detail);
      }

      window.addEventListener(
        "shelflife-audience",
        handleAudienceChange
      );

      return () => {
        window.removeEventListener(
          "shelflife-audience",
          handleAudienceChange
        );
      };
    }, []);
  const current = audiences[active];
  const Icon = current.icon;

  return (
    <section id="audience" className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--shelf-green)]">
            Built for both
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--shelf-dark)] md:text-5xl">
            One platform. Different needs.
          </h2>

          <p className="mt-5 text-lg leading-8 text-[var(--shelf-muted)]">
            ShelfLife adapts to the way businesses and households manage
            their inventory.
          </p>
        </div>

        {/* Toggle */}
        <div className="mx-auto mt-10 flex w-fit rounded-full border border-[var(--shelf-border)] bg-[var(--shelf-light)] p-1">
          {(
            Object.keys(audiences) as Array<keyof typeof audiences>
          ).map((key) => {
            const item = audiences[key];

            return (
              <button
                key={key}
                onClick={() => {
                  setActive(key);
                  window.history.replaceState(
                    null,
                    "",
                    `#audience-${key}`
                  );
                }}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  active === key
                    ? "bg-[var(--shelf-dark)] text-white shadow-sm"
                    : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="shadow-2xl mx-auto mt-12 max-w-5xl rounded-[2rem] border border-[var(--shelf-border)] bg-[var(--shelf-light)] p-8 md:p-12">

          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-center">

            {/* Icon */}
            <div className="flex justify-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-[2rem] border border-[var(--shelf-border)] bg-white shadow-sm">
                <Icon
                  size={56}
                  strokeWidth={1.4}
                  className="text-[var(--shelf-green)]"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--shelf-green)]">
                {current.label}
              </p>

              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shelf-dark)] md:text-4xl">
                {current.title}
              </h3>

              <p className="mt-5 max-w-xl leading-7 text-[var(--shelf-muted)]">
                {current.description}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {current.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-xl border border-[var(--shelf-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--shelf-dark)] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}