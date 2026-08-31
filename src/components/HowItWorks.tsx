import { Barcode, Upload, AlertCircle, TrendingDown } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Add Your Inventory",
      description: "Manually add products, scan barcodes, or upload invoices.",
      icon: Barcode,
    },
    {
      number: "2",
      title: "ShelfLife Understands It",
      description: "AI processes labels, extracts data, and organizes your stock.",
      icon: Upload,
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
    <section id="how-it-works" className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-[var(--shelf-dark)]">
            How ShelfLife Works
          </h2>
          <p className="mt-4 text-lg text-[var(--shelf-muted)]">
            Simple, intelligent, and automated from start to finish.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex flex-col items-start">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--shelf-cream)] mb-4">
                  <Icon className="h-8 w-8 text-[var(--shelf-forest)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--shelf-dark)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--shelf-muted)]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
