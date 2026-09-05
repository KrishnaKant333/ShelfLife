"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 700);
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`sl-focus-ring fixed bottom-6 right-6 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-[var(--sl-radius-pill)] border border-[var(--sl-color-border)] bg-[var(--sl-color-surface-raised)] text-[var(--sl-color-text)] shadow-[var(--sl-shadow-md)] transition-all duration-300 ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-16 scale-75 opacity-0"
      }`}
    >
      <ArrowUp size={17} />
    </button>
  );
}