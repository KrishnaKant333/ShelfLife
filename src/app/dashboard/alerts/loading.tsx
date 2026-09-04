export default function AlertsLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-3 w-28 rounded-full bg-[var(--shelf-border)]" />
        <div className="h-8 w-40 rounded-xl bg-[var(--shelf-border)]" />
        <div className="h-3 w-72 rounded-full bg-[var(--shelf-border)]" />
      </div>

      {/* Alert rows */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 h-20 flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-xl bg-[var(--shelf-border)] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-48 rounded-full bg-[var(--shelf-border)]" />
              <div className="h-3 w-64 rounded-full bg-[var(--shelf-border)]" />
            </div>
            <div className="h-6 w-20 rounded-full bg-[var(--shelf-border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
