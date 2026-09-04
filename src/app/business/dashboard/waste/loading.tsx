export default function BusinessWasteLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-28 rounded-full bg-[var(--shelf-border)]" />
        <div className="h-8 w-56 rounded-xl bg-[var(--shelf-border)]" />
        <div className="h-3 w-72 rounded-full bg-[var(--shelf-border)]" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] h-56" />
        <div className="md:col-span-2 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] h-56" />
      </div>
      <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] h-48" />
    </div>
  );
}
