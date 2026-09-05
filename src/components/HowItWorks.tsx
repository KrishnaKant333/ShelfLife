import { Upload, AlertCircle, TrendingDown, Sparkles } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Add Your Inventory",
      description: "Manually add products, scan labels, or upload invoices.",
      icon: Upload,
    },
    {
      number: "2",
      title: "ShelfLife Understands It",
      description: "AI processes labels, extracts data, and organizes your stock.",
      icon: Sparkles,
    },
    {
      number: "3",
      title: "Track & Alert",
      description: "Monitor expiry dates and get real-time alerts before items expire.",
      icon: AlertCircle,
    },
    {
      number: "4",
      title: "Make Smarter Decisions",
      description: "Get insights, suggestions, and actionable recommendations to reduce waste.",
      icon: TrendingDown,
    },
  ];

  return (
    <section id="how-it-works" className="border-b border-[var(--sl-color-border)] bg-[var(--sl-color-canvas)] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="sl-eyebrow">A simpler operating rhythm</p>
          <h2 className="mt-4 text-4xl font-semibold text-[var(--sl-color-text)] md:text-5xl">
            How ShelfLife Works
          </h2>
          <p className="mt-4 text-lg text-[var(--sl-color-text-muted)]">
            Simple, intelligent, and automated from start to finish.
          </p>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="pointer-events-none absolute left-[8%] right-[8%] top-8 hidden h-px bg-[var(--sl-color-border-strong)] md:block" />
          <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-4 md:gap-0 md:overflow-visible md:px-0 md:pb-0">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative flex min-w-[82vw] snap-start flex-col items-start px-1 sm:min-w-[60vw] md:min-w-0 md:items-center md:px-5">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-[var(--sl-radius-pill)] border border-[var(--sl-color-border-strong)] bg-[var(--sl-color-action-soft)] text-[var(--sl-color-action)] shadow-[var(--sl-shadow-sm)]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--sl-color-action)] md:text-center">Step {step.number}</p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--sl-color-text)] md:text-center">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--sl-color-text-muted)] md:text-center">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
