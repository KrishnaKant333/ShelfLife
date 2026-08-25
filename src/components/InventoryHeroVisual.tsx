import {
  AlertTriangle,
  ArrowDownRight,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { inventory } from "@/data/inventory";

export default function InventoryHeroVisual() {
  const expiringItems = inventory.filter(
    (item) => item.status === "Expiring"
  );

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[600px]">

      {/* Ambient background */}
      <div className="absolute inset-10 rounded-full bg-[var(--shelf-light)] blur-3xl" />

      {/* Main dashboard */}
      <div className="absolute left-[8%] top-[10%] w-[84%] rounded-[2rem] border border-[var(--shelf-border)] bg-white p-5 shadow-2xl shadow-black/5 sm:p-7">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--shelf-muted)]">
              Inventory Intelligence
            </p>

            <h3 className="mt-1 text-lg font-semibold text-[var(--shelf-dark)]">
              Overview
            </h3>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--shelf-light)]">
            <BarChart3
              size={17}
              className="text-[var(--shelf-green)]"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[var(--shelf-light)] p-4">
            <p className="text-xs text-[var(--shelf-muted)]">
              Total items
            </p>

            <p className="mt-2 text-2xl font-semibold text-[var(--shelf-dark)]">
              128
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--shelf-border)] p-4">
            <p className="text-xs text-[var(--shelf-muted)]">
              Need attention
            </p>

            <div className="mt-2 flex items-center gap-2">
              <p className="text-2xl font-semibold text-[var(--shelf-dark)]">
                12
              </p>

              <AlertTriangle
                size={15}
                className="text-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--shelf-dark)]">
              Expiring soon
            </p>

            <span className="text-[10px] text-[var(--shelf-green)]">
              View inventory
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {expiringItems.slice(0, 3).map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl border border-[var(--shelf-border)] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[var(--shelf-dark)]">
                    {item.name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-[var(--shelf-muted)]">
                    {item.category}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-600">
                  {item.expiry}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expiry alert */}
      <div className="absolute right-0 top-[28%] hidden w-44 rounded-2xl border border-[var(--shelf-border)] bg-white p-4 shadow-xl shadow-black/5 sm:block animate-[heroFloat_5s_ease-in-out_infinite]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
            <AlertTriangle size={14} className="text-amber-600" />
          </div>

          <p className="text-xs font-medium text-[var(--shelf-dark)]">
            Smart Alert
          </p>
        </div>

        <p className="mt-3 text-xs leading-5 text-[var(--shelf-muted)]">
          3 products are approaching their expiry date.
        </p>
      </div>

      {/* Analytics card */}
      <div className="absolute bottom-[7%] left-0 hidden w-48 rounded-2xl border border-[var(--shelf-border)] bg-white p-4 shadow-xl shadow-black/5 sm:block animate-[heroFloatReverse_6s_ease-in-out_infinite]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--shelf-dark)]">
            Waste trend
          </p>

          <ArrowDownRight
            size={15}
            className="text-[var(--shelf-green)]"
          />
        </div>

        <p className="mt-2 text-2xl font-semibold text-[var(--shelf-dark)]">
          18%
        </p>

        <div className="mt-3 flex h-8 items-end gap-1">
          {[35, 50, 42, 65, 55, 78, 88].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-sm bg-[var(--shelf-green)] opacity-30"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      {/* AI recommendation */}
      <div className="absolute bottom-[13%] right-[2%] hidden w-48 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-dark)] p-4 shadow-xl shadow-black/10 sm:block animate-[heroFloat_5.5s_ease-in-out_infinite]">
        <div className="flex items-center gap-2">
          <Sparkles
            size={15}
            className="text-[var(--shelf-light)]"
          />

          <p className="text-xs font-medium text-white">
            AI Insight
          </p>
        </div>

        <p className="mt-3 text-xs leading-5 text-white/60">
          Use your tomatoes soon. They could work well in a quick pasta
          recipe.
        </p>
      </div>
    </div>
  );
}