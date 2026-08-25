import Link from "next/link";

const plans = [
  {
    name: "Business",
    price: "₹999",
    description:
      "Everything a growing business needs to manage inventory and reduce avoidable waste.",
    features: [
      "Inventory management",
      "Batch tracking",
      "Expiry alerts",
      "Waste analytics",
      "Smart inventory insights",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">

        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--shelf-green)]">
            Simple pricing
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--shelf-dark)] md:text-5xl">
            Start with smarter inventory.
          </h2>

          <p className="mt-6 text-lg leading-8 text-[var(--shelf-muted)]">
            A simple subscription designed for small businesses that want
            better inventory visibility without complicated systems.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-xl">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="shadow-2xl rounded-[2rem] border border-[var(--shelf-border)] bg-[var(--shelf-light)] p-8 md:p-10"
            >
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--shelf-green)]">
                {plan.name}
              </p>

              <div className="mt-5 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-tight text-[var(--shelf-dark)]">
                  {plan.price}
                </span>

                <span className="mb-2 text-sm text-[var(--shelf-muted)]">
                  / business / month
                </span>
              </div>

              <p className="mt-5 leading-7 text-[var(--shelf-muted)]">
                {plan.description}
              </p>

              <div className="my-8 h-px bg-[var(--shelf-border)]" />

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm font-medium text-[var(--shelf-dark)]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--shelf-green)] text-xs text-white">
                      ✓
                    </span>

                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={"/dashboard"}>
              <button className="mt-10 w-full rounded-full bg-[var(--shelf-dark)] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[var(--shelf-green)]">
                Get started
              </button>
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[var(--shelf-muted)]">
          Additional premium analytics, enterprise plans and integrations can
          be introduced as ShelfLife grows.
        </p>

      </div>
    </section>
  );
}