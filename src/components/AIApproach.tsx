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
    <section className="border-b border-[var(--sl-color-border)] bg-[var(--sl-color-surface-inset)] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="sl-eyebrow">
              AI + safety
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-[var(--sl-color-text)] md:text-5xl">
              Intelligent. Trustworthy. Verified.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--sl-color-text-muted)]">
              ShelfLife combines deterministic inventory logic with AI to give you both safety and intelligence.
            </p>

            <div className="mt-8 rounded-[var(--sl-radius-xl)] border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] p-6 md:p-8">
              <p className="sl-eyebrow">
                Your data stays safe
              </p>
              <p className="mt-3 text-base leading-7 text-[var(--sl-color-text-muted)]">
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
                  className="rounded-[var(--sl-radius-lg)] border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] p-6 transition hover:-translate-y-1 hover:shadow-[var(--sl-shadow-md)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sl-color-action-soft)] text-[var(--sl-color-action)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--sl-color-text)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--sl-color-text-muted)]">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
