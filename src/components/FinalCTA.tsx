import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-[var(--shelf-border)] bg-gradient-to-br from-[var(--shelf-cream)]/40 to-[var(--shelf-surface)] p-12 md:p-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--shelf-dark)] mb-6">
            Ready to waste less?
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-[var(--shelf-muted)] mb-10">
            Start your free account today. No credit card required. Full access to core features, forever free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--shelf-forest)] px-8 py-4 font-semibold text-white hover:opacity-90 transition"
            >
              Get Started for Free
              <ArrowRight size={20} />
            </Link>

            <Link
              href="/get-started"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--shelf-forest)] bg-[var(--shelf-surface)] px-8 py-4 font-semibold text-[var(--shelf-forest)] hover:bg-[var(--shelf-cream)] transition"
            >
              For Your Business
            </Link>
          </div>

          <p className="mt-8 text-sm text-[var(--shelf-muted)]">
            Trusted by individuals and small businesses to reduce food waste.
          </p>
        </div>
      </div>
    </section>
  );
}
