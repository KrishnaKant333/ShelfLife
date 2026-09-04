export default function InventoryLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded-full bg-[var(--shelf-border)]" />
          <div className="h-8 w-48 rounded-xl bg-[var(--shelf-border)]" />
          <div className="h-3 w-64 rounded-full bg-[var(--shelf-border)]" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-xl bg-[var(--shelf-border)]" />
          <div className="h-10 w-24 rounded-xl bg-[var(--shelf-border)]" />
          <div className="h-10 w-32 rounded-xl bg-[var(--shelf-border)]" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] h-16" />

      {/* Table */}
      <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] overflow-hidden">
        {/* Table header */}
        <div className="border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20 h-12" />
        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-[var(--shelf-border)] last:border-0 h-14 px-6 flex items-center gap-4"
          >
            <div className="h-4 w-4 rounded bg-[var(--shelf-border)]" />
            <div className="h-3 flex-1 rounded-full bg-[var(--shelf-border)]" />
            <div className="h-3 w-20 rounded-full bg-[var(--shelf-border)]" />
            <div className="h-3 w-16 rounded-full bg-[var(--shelf-border)]" />
            <div className="h-3 w-24 rounded-full bg-[var(--shelf-border)]" />
            <div className="h-5 w-16 rounded-full bg-[var(--shelf-border)]" />
            <div className="h-3 w-20 rounded-full bg-[var(--shelf-border)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
