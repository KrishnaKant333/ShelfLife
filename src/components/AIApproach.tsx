import { Zap, Shield, Brain, CheckCircle2 } from "lucide-react";

export default function AIApproach() {
  const approaches = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Expired products are NEVER recommended. Safety-critical decisions use deterministic logic, never guesswork.",
    },
    {
      icon: Brain,
      title: "AI Enhancement",
      description: "AI learns your patterns, suggests recipes, and personalizes insights based on your inventory.",
    },
    {
      icon: Zap,
      title: "OCR & Scanning",
      description: "Smart label scanning captures product details without manual data entry.",
    },
    {
      icon: CheckCircle2,
      title: "Verified Data",
      description: "Every inventory entry is tracked, verified, and auditable for accuracy and compliance.",
    },
  ];

  return (
    <section className="px-6 py-16 md:py-24 bg-[var(--shelf-cream)]/40">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--shelf-forest)]">
              AI + safety
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--shelf-dark)]">
              Intelligent. Trustworthy. Verified.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--shelf-muted)]">
              ShelfLife combines deterministic inventory logic with AI to give you both safety and intelligence.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--shelf-forest)]">
                Your data stays safe
              </p>
              <p className="mt-3 text-base leading-7 text-[var(--shelf-muted)]">
                Every expired product detection, every inventory alert, and every waste calculation is verified by application logic. AI enhances, but never overrides, food safety.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {approaches.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--shelf-cream)] text-[var(--shelf-forest)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[var(--shelf-dark)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--shelf-muted)]">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
