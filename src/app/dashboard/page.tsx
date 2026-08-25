import { inventory } from "@/data/inventory";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex max-w-7xl">

        {/* Sidebar */}
        <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[var(--shelf-border)] bg-white p-6 md:block">
          <div className="text-2xl font-semibold tracking-tight text-[var(--shelf-dark)]">
            shelflife
          </div>

          <nav className="mt-10 space-y-2">
            <a
              href="/dashboard"
              className="block rounded-xl bg-[var(--shelf-light)] px-4 py-3 text-sm font-medium text-[var(--shelf-dark)]"
            >
              Dashboard
            </a>

            <a
              href="#"
              className="block rounded-xl px-4 py-3 text-sm text-[var(--shelf-muted)] transition hover:bg-[var(--shelf-light)]"
            >
              Inventory
            </a>

            <a
              href="#"
              className="block rounded-xl px-4 py-3 text-sm text-[var(--shelf-muted)] transition hover:bg-[var(--shelf-light)]"
            >
              Expiring Soon
            </a>

            <a
              href="#"
              className="block rounded-xl px-4 py-3 text-sm text-[var(--shelf-muted)] transition hover:bg-[var(--shelf-light)]"
            >
              Analytics
            </a>

            <a
              href="#"
              className="block rounded-xl px-4 py-3 text-sm text-[var(--shelf-muted)] transition hover:bg-[var(--shelf-light)]"
            >
              Pantry
            </a>

            <a
              href="#"
              className="block rounded-xl px-4 py-3 text-sm text-[var(--shelf-muted)] transition hover:bg-[var(--shelf-light)]"
            >
              Recipes
            </a>
          </nav>
        </aside>

        {/* Main dashboard */}
        <section className="min-w-0 flex-1 p-6 md:p-10">

          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-[var(--shelf-muted)]">
                Inventory overview
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--shelf-dark)]">
                Good morning
              </h1>
            </div>

            <button className="w-fit rounded-full bg-[var(--shelf-green)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--shelf-dark)]">
              + Add Product
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-2xl border border-[var(--shelf-border)] bg-white p-6">
              <p className="text-sm text-[var(--shelf-muted)]">
                Total items
              </p>

              <p className="mt-3 text-3xl font-semibold text-[var(--shelf-dark)]">
                128
              </p>

              <p className="mt-2 text-sm text-[var(--shelf-muted)]">
                Across your inventory
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--shelf-border)] bg-white p-6">
              <p className="text-sm text-[var(--shelf-muted)]">
                Expiring soon
              </p>

              <p className="mt-3 text-3xl font-semibold text-[var(--shelf-dark)]">
                12
              </p>

              <p className="mt-2 text-sm text-[var(--shelf-muted)]">
                Need your attention
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--shelf-border)] bg-white p-6 sm:col-span-2 lg:col-span-1">
              <p className="text-sm text-[var(--shelf-muted)]">
                Potential waste saved
              </p>

              <p className="mt-3 text-3xl font-semibold text-[var(--shelf-dark)]">
                ₹4.2K
              </p>

              <p className="mt-2 text-sm text-[var(--shelf-muted)]">
                This month
              </p>
            </div>

          </div>

          {/* Inventory */}
          <div className="mt-8 rounded-2xl border border-[var(--shelf-border)] bg-white">

            <div className="flex items-center justify-between border-b border-[var(--shelf-border)] p-6">
              <div>
                <h2 className="font-semibold text-[var(--shelf-dark)]">
                  Inventory
                </h2>

                <p className="mt-1 text-sm text-[var(--shelf-muted)]">
                  Products that need attention
                </p>
              </div>

              <button className="text-sm font-medium text-[var(--shelf-green)]">
                View all
              </button>
            </div>

            <div className="divide-y divide-[var(--shelf-border)]">
              {inventory.map((item) => (
                <div
                  key={item.name}
                  className="grid gap-4 p-6 sm:grid-cols-[1fr_100px_100px_100px] sm:items-center"
                >
                  <div>
                    <p className="font-medium text-[var(--shelf-dark)]">
                      {item.name}
                    </p>

                    <p className="mt-1 text-sm text-[var(--shelf-muted)]">
                      {item.category}
                    </p>
                  </div>

                  <p className="text-sm text-[var(--shelf-muted)]">
                    Qty: {item.quantity}
                  </p>

                  <p className="text-sm text-[var(--shelf-muted)]">
                    {item.expiry}
                  </p>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                      item.status === "Expiring"
                        ? "bg-[#fff3d6] text-[#9a6b00]"
                        : "bg-[var(--shelf-light)] text-[var(--shelf-green)]"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </section>
      </div>
    </main>
  );
}