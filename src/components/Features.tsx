import SpotlightCard from "@/components/ui/SpotlightCard";
import FeatureDecoration from "@/components/ui/FeatureDecoration";

const features = [
  {
    number: "01",
    title: "Expiry Tracking",
    description:
      "Track product expiry dates and know which items need attention before they become waste.",
  },
  {
    number: "02",
    title: "Smart Alerts",
    description:
      "Get timely alerts for products that are approaching their expiry date.",
  },
  {
    number: "03",
    title: "Batch Tracking",
    description:
      "Keep track of product batches and quantities for better stock rotation and visibility.",
  },
  {
    number: "04",
    title: "Barcode & OCR",
    description:
      "Speed up inventory entry by scanning products or extracting information from invoices.",
  },
  {
    number: "05",
    title: "Waste Analytics",
    description:
      "Understand what is being wasted and identify patterns that can help reduce inventory losses.",
  },
  {
    number: "06",
    title: "AI Recommendations",
    description:
      "Turn inventory data into useful recommendations, from what to use first to what to buy next.",
  },
];

export default function Features() {
  return (
    <section id="product" className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">

        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--shelf-green)]">
            One intelligent platform
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--shelf-dark)] md:text-5xl">
            Everything you need to stay ahead of your inventory.
          </h2>

          <p className="mt-6 text-lg leading-8 text-[var(--shelf-muted)]">
            From the first product you add to the insights that help you make
            better decisions, ShelfLife keeps your inventory visible and
            actionable.
          </p>
        </div>

        

        <div className="mt-16 grid gap-5 overflow-hidden rounded-3xl md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <SpotlightCard key={feature.number}>
              <FeatureDecoration feature={feature.title} />
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-[var(--shelf-green)]">
                  {feature.number}
                </span>

                <span className="text-sm text-[var(--shelf-green)]">
                  →
                </span>
              </div>

              <h3 className="mt-12 text-xl font-semibold text-[var(--shelf-dark)]">
                {feature.title}
              </h3>

              <p className="mt-4 leading-7 text-[var(--shelf-muted)]">
                {feature.description}
              </p>
            </SpotlightCard>
          ))}
        </div>

      </div>
    </section>
  );
}