import SolutionSteps from "@/components/ui/SolutionSteps";

export default function Solution() {
  return (
    <section className="bg-[var(--shelf-dark)] px-6 py-10 text-white md:py-10">
      <div className="mx-auto max-w-7xl">

        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--shelf-light)]">
            The ShelfLife approach
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            From inventory chaos to intelligent decisions.
          </h2>

          <p className="mt-5 leading-7 text-white/60">
            ShelfLife brings inventory, expiry tracking and intelligent
            recommendations together in one place.
          </p>
        </div>

         <SolutionSteps />

      </div>
    </section>
  );
}