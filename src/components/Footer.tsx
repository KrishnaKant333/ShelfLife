const footerLinks = {
  Product: ["Features", "Dashboard", "Pricing"],
  Solutions: ["For Consumers", "For Businesses", "Analytics"],
  Company: ["About ShelfLife", "Contact"],
};

export default function Footer() {
  return (
    <footer className="border-t border-[var(--shelf-border)] bg-[var(--background)] px-6 py-12">
      <div className="mx-auto max-w-7xl">

        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">

          <div>
            <p className="text-2xl font-semibold tracking-tight text-[var(--shelf-dark)]">
              shelflife
            </p>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--shelf-muted)]">
              Inventory intelligence for a less wasteful future.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-[var(--shelf-dark)]">
                {category}
              </h3>

              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--shelf-muted)] transition hover:text-[var(--shelf-dark)]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--shelf-border)] pt-6 text-sm text-[var(--shelf-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 ShelfLife. All rights reserved.
          </p>

          <p>
            Inventory Intelligence Platform
          </p>
        </div>

      </div>
    </footer>
  );
}