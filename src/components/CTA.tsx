import Link from "next/link";

export default function CTA() {
  return (
    <section className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] bg-[var(--shelf-dark)] px-8 py-16 text-center md:px-16 md:py-24">

          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--shelf-light)]">
            Start with visibility
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Know your inventory.
            <span className="block text-[var(--shelf-light)]">
              Waste less.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/60">
            ShelfLife brings inventory tracking, expiry intelligence and
            actionable insights together in one place.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-full bg-white px-6 py-3 font-medium text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-light)]"
            >
              Explore ShelfLife
            </Link>

            <a
              href="#pricing"
              className="rounded-full border border-white/20 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              View pricing
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}