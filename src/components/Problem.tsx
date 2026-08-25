const problems = [
  "Forgotten expiry dates",
  "Duplicate purchases",
  "Overstocking and waste",
  "Inventory-related financial loss",
];

export default function Problem() {
  return (
    <section className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--shelf-green)]">
              The problem
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--shelf-dark)] md:text-5xl">
              What&apos;s on your shelf shouldn&apos;t be a mystery.
            </h2>

            <p className="mt-5 max-w-lg leading-7 text-[var(--shelf-muted)]">
              Poor inventory visibility leads to forgotten products,
              unnecessary purchases, waste and financial loss.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {problems.map((problem, index) => (
              <div
                key={problem}
                className="flex items-center gap-4 rounded-2xl border border-[var(--shelf-border)] bg-white p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--shelf-light)] text-xs font-semibold text-[var(--shelf-green)]">
                  0{index + 1}
                </span>

                <p className="text-sm font-medium text-[var(--shelf-dark)]">
                  {problem}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}