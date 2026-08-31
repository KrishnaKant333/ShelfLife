import Link from "next/link";
import Image from "next/image";

const footerGroups = [
  {
    heading: "Product",
    links: [
      { label: "How it Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "For Business",
    links: [
      { label: "Business", href: "#business" },
      { label: "Inventory Intelligence", href: "#business" },
      { label: "Waste Management", href: "#waste-impact" },
    ],
  },
  {
    heading: "For Consumers",
    links: [
      { label: "Consumer", href: "#consumer" },
      { label: "AI Recipes", href: "#consumer" },
      { label: "Smart Inventory", href: "#consumer" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Get Started", href: "/dashboard" },
      { label: "Sign In", href: "/consumer/login" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--shelf-border)] bg-[var(--background)] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/logo/shelflife.png"
                alt="ShelfLife"
                width={150}
                height={150}
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--shelf-muted)]">
              ShelfLife helps households and businesses keep inventory visible, actionable, and waste-aware.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--shelf-dark)]">
                {group.heading}
              </h3>

              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--shelf-muted)] transition hover:text-[var(--shelf-dark)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--shelf-border)] pt-6 text-sm text-[var(--shelf-muted)] md:flex-row md:items-center md:justify-between">
          <p>© 2026 ShelfLife. All rights reserved.</p>
          <p>Built to reduce food waste.</p>
        </div>
      </div>
    </footer>
  );
}