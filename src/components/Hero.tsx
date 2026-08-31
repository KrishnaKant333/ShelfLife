import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import InventoryHeroVisual from "@/components/InventoryHeroVisual";

export default function Hero(){
  return(
      <section className="relative overflow-hidden px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">

          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--shelf-forest)]">
              Food Inventory Intelligence
            </p>

            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-[var(--shelf-dark)] md:text-6xl">
              Know what&apos;s on your shelf.
              <span className="block text-[var(--shelf-green)]">
                Before it goes to waste.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--shelf-muted)]">
              ShelfLife helps individuals and businesses track inventory, monitor expiry dates, and make smarter decisions about their food stock.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--shelf-forest)] px-7 py-3.5 font-semibold text-white transition hover:bg-[var(--shelf-green)]"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/business/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--shelf-forest)] bg-white px-7 py-3.5 font-semibold text-[var(--shelf-forest)] transition hover:bg-[var(--shelf-cream)]"
              >
                For Businesses
                <ArrowUpRight size={18} />
              </Link>
            </div>

            <p className="mt-8 text-sm text-[var(--shelf-muted)]">
              ✓ No credit card required  •  ✓ Free forever plan  •  ✓ Start in seconds
            </p>
          </div>

          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-[2rem] ]">
              <InventoryHeroVisual  />
            </div>
          </div>

        </div>
      </section>
  )
}