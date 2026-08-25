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
      className={`fixed cursor-pointer bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-[var(--shelf-dark)] shadow-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-16 scale-75 opacity-0"
      }`}
    >
      <ArrowUp size={17} />
    </button>
  );
}