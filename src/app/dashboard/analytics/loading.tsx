export default function AnalyticsLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-3 w-36 rounded-full bg-[var(--shelf-border)]" />
        <div className="h-8 w-56 rounded-xl bg-[var(--shelf-border)]" />
        <div className="h-3 w-72 rounded-full bg-[var(--shelf-border)]" />
      </div>

      {/* KPI metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 h-24"
          />
        ))}
      </div>

      {/* Chart grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] h-56"
          />
        ))}
      </div>
    </div>
  );
}
