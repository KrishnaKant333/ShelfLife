"use client";

import { useEffect, useState } from "react";

interface GreetingHeaderProps {
  userName?: string | null;
  badge: string;
  subtitle: string;
}

function getLocalGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return "Good morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }
  if (hour >= 17 && hour < 22) {
    return "Good evening";
  }
  return "Good night";
}

export default function GreetingHeader({
  userName,
  badge,
  subtitle,
}: GreetingHeaderProps) {
  const [greeting, setGreeting] = useState<string>("Hello");

  useEffect(() => {
    setGreeting(getLocalGreeting());
  }, []);

  return (
    <div>
      <p className="text-sm font-semibold text-[var(--shelf-forest)]">
        {badge}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--shelf-dark)] md:text-4xl">
        {greeting}{userName ? `, ${userName}` : ""}
      </h1>
      <p className="mt-2 text-sm text-[var(--shelf-muted)]">
        {subtitle}
      </p>
    </div>
  );
}
