import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="sl-scroll-reveal bg-[var(--sl-color-action)] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--sl-color-on-action)]/70">Make the next decision clearer</p>
          <h2 className="mt-4 text-4xl font-semibold text-[var(--sl-color-on-action)] md:text-6xl">
            Ready to waste less?
          </h2>

          <p className="mx-auto mb-10 mt-6 max-w-2xl text-lg text-[var(--sl-color-on-action)]/80">
            Start your free account today. No credit card required. Full access to core features, forever free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-started"
              className="sl-focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--sl-radius-pill)] bg-[var(--sl-color-on-action)] px-8 py-4 font-semibold text-[var(--sl-color-action)] transition hover:bg-white"
            >
              Get Started for Free
              <ArrowRight size={20} />
            </Link>

            <Link
              href="/business/signup"
              className="sl-focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--sl-radius-pill)] border border-[var(--sl-color-on-action)]/60 bg-transparent px-8 py-4 font-semibold text-[var(--sl-color-on-action)] transition hover:bg-[var(--sl-color-on-action)]/10"
            >
              For Your Business
            </Link>
          </div>

          <p className="mt-8 text-sm text-[var(--sl-color-on-action)]/70">
            Trusted by individuals and small businesses to reduce food waste.
          </p>
        </div>
      </div>
    </section>
  );
}
