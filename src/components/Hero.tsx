import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import InventoryHeroVisual from "@/components/InventoryHeroVisual";

export default function Hero() {
  return (
      <section className="relative isolate overflow-hidden border-b border-[var(--sl-color-border)] bg-[var(--sl-color-canvas)] px-6 pb-16 pt-12 md:pb-24 md:pt-20">
        <div className="pointer-events-none absolute -right-32 top-12 -z-10 h-96 w-96 rounded-full bg-[var(--sl-color-action-soft)] blur-3xl opacity-80" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">

          <div className="sl-enter">
            <p className="sl-eyebrow mb-5">
              Food Inventory Intelligence
            </p>

            <h1 className="max-w-2xl text-5xl font-semibold text-[var(--sl-color-text)] md:text-7xl">
              Know what&apos;s on your shelf.
              <span className="mt-2 block text-[var(--sl-color-action)]">
                Before it goes to waste.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--sl-color-text-muted)]">
              ShelfLife helps individuals and businesses track inventory, monitor expiry dates, and make smarter decisions about their food stock.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/get-started"
                className="sl-focus-ring inline-flex min-h-12 items-center gap-2 rounded-[var(--sl-radius-pill)] bg-[var(--sl-color-action)] px-7 py-3.5 font-semibold text-[var(--sl-color-on-action)] transition hover:bg-[var(--sl-color-action-hover)]"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/dashboard"
                className="sl-focus-ring inline-flex min-h-12 items-center gap-2 rounded-[var(--sl-radius-pill)] border border-[var(--sl-color-action)] bg-transparent px-7 py-3.5 font-semibold text-[var(--sl-color-action)] transition hover:bg-[var(--sl-color-action-soft)]"
              >
                Open Dashboard
                <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--sl-color-text-muted)]">
              {['No credit card required', 'Free forever plan', 'Start in seconds'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check size={15} className="text-[var(--sl-color-success)]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="sl-enter sl-enter-delay-3 relative min-h-[420px] lg:min-h-[600px]">
            <InventoryHeroVisual />
          </div>
        </div>
      </section>
  )
}