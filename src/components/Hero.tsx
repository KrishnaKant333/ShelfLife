import Link from "next/link";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import InventoryHeroVisual from "@/components/InventoryHeroVisual";
import { brand } from "@/data/brand";

export default function Hero(){
  return(
      <section className="relative overflow-hidden px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">

          <div>
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-[var(--shelf-green)]">
              {brand.productType}
            </p>

            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-[var(--shelf-dark)] md:text-7xl">
              Know what&apos;s on your shelf.
              <span className="block text-[var(--shelf-green)]">
                Before it goes to waste.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--shelf-muted)]">
              ShelfLife helps households and businesses track inventory,
              monitor expiry dates and make smarter decisions before products
              become waste.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="#product"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--shelf-green)] px-6 py-3 font-medium text-white transition hover:bg-[var(--shelf-dark)]"
              >
                Explore ShelfLife
                <ArrowRight size={17} />
              </Link>

                            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--shelf-border)] bg-white px-6 py-3 font-medium text-[var(--shelf-dark)] transition hover:-translate-y-0.5 hover:bg-[var(--shelf-light)]"
              >
                Open Dashboard
                <ArrowUpRight size={17} />
              </Link>
            </div>
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