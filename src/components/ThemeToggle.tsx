"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const themes = ["light", "dark", "system"] as const;
type Theme = (typeof themes)[number];

const icons: Record<Theme, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const labels: Record<Theme, string> = {
  light: "Switch to dark mode",
  dark: "Switch to system mode",
  system: "Switch to light mode",
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder of the same size to avoid layout shift
    return (
      <div className="h-9 w-9 rounded-full border border-[var(--shelf-border)]" />
    );
  }

  const currentTheme = (theme as Theme) ?? "system";
  const Icon = icons[currentTheme] ?? Monitor;
  const label = labels[currentTheme] ?? "Toggle theme";

  function cycleTheme() {
    const idx = themes.indexOf(currentTheme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--shelf-border)] text-[var(--shelf-muted)] transition hover:bg-[var(--shelf-cream)] hover:text-[var(--shelf-dark)]"
    >
      <Icon size={16} strokeWidth={1.8} />
    </button>
  );
}
