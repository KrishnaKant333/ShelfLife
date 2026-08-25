"use client";

import React, { useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  spotlightColor = "rgba(36, 56, 35, 0.5)",
  onMouseEnter,
  onMouseLeave,
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const [opacity, setOpacity] = useState(0);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();

    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(0.6);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={() => {
        setOpacity(0.6);
        onMouseEnter?.();
      }}
      onMouseLeave={() => {
        setOpacity(0);
        onMouseLeave?.();
      }}
      className={`group relative overflow-hidden rounded-3xl border border-[var(--shelf-border)] shelf-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(
            circle at ${position.x}px ${position.y}px,
            ${spotlightColor},
            transparent 70%
          )`,
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default SpotlightCard;