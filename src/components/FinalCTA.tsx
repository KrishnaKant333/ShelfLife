import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="sl-scroll-reveal px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-400 drop-shadow-sm">
            Make the next decision clearer
          </p>
          <h2 className="mt-4 text-4xl font-semibold text-white md:text-6xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Ready to waste less?
          </h2>

          <p className="mx-auto mb-10 mt-6 max-w-2xl text-lg text-neutral-200 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
            Start your free account today. No credit card required. Full access to core features, forever free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-started"
              className="sl-focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--sl-radius-pill)] bg-[#2d6042] hover:bg-[#36704d] px-8 py-4 font-semibold text-white shadow-xl transition"
            >
              Get Started for Free
              <ArrowRight size={20} />
            </Link>

            <Link
              href="/business/signup"
              className="sl-focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--sl-radius-pill)] border border-white/40 bg-white/10 hover:bg-white/20 px-8 py-4 font-semibold text-white backdrop-blur-md transition"
            >
              For Your Business
            </Link>
          </div>

          <p className="mt-8 text-sm text-neutral-300 drop-shadow-sm">
            Trusted by individuals and small businesses to reduce food waste.
          </p>
        </div>
      </div>
    </section>
  );
}
