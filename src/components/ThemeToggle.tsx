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
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted) {
    // Render a placeholder of the same size to avoid layout shift
    return (
      <div className="h-11 w-11 rounded-[var(--sl-radius-md)] border border-[var(--sl-color-border)]" />
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
      className="sl-focus-ring flex h-11 w-11 items-center justify-center rounded-[var(--sl-radius-md)] border border-[var(--sl-color-border)] text-[var(--sl-color-text-muted)] transition hover:bg-[var(--sl-color-surface-inset)] hover:text-[var(--sl-color-text)]"
    >
      <Icon size={16} strokeWidth={1.8} />
    </button>
  );
}
