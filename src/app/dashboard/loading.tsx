export default function DashboardLoading() {
  return (
    <main className="p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
        {/* Page header skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-32 rounded-full bg-[var(--shelf-border)]" />
          <div className="h-8 w-64 rounded-xl bg-[var(--shelf-border)]" />
          <div className="h-3 w-48 rounded-full bg-[var(--shelf-border)]" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 h-24"
            />
          ))}
        </div>

        {/* AI Brief + Use First widgets skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] h-36" />
          <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] h-36" />
        </div>

        {/* Quick Actions skeleton */}
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] h-20" />

        {/* Breakdown grid skeleton */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] h-48" />
          <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] h-48" />
        </div>
      </div>
    </main>
  );
}
