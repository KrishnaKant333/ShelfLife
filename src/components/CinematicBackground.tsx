"use client";

import { useEffect, useRef, useState } from "react";

export default function CinematicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDesktopMotion, setIsDesktopMotion] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Detect reduced motion preferences and mobile/touch viewport capabilities
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");

    const evaluateCapabilities = () => {
      const prefersReducedMotion = motionQuery.matches;
      const isMobile = mobileQuery.matches;
      setIsDesktopMotion(!prefersReducedMotion && !isMobile);
    };

    evaluateCapabilities();

    motionQuery.addEventListener("change", evaluateCapabilities);
    mobileQuery.addEventListener("change", evaluateCapabilities);

    return () => {
      motionQuery.removeEventListener("change", evaluateCapabilities);
      mobileQuery.removeEventListener("change", evaluateCapabilities);
    };
  }, []);

  useEffect(() => {
    if (!isDesktopMotion) return;

    const video = videoRef.current;
    if (!video) return;

    let rafId: number;
    let targetTime = 0;
    let currentTime = 0;
    let isSeeking = false;

    // Map scroll progress across the entire marketing page document
    const calculateScrollTarget = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const maxScroll = Math.max(docHeight, 1);
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

      targetTime = progress * video.duration;
    };

    const handleLoadedMetadata = () => {
      setVideoLoaded(true);
      calculateScrollTarget();
      currentTime = targetTime;
      try {
        video.currentTime = targetTime;
      } catch {
        // Safe seek fallback
      }
    };

    const handleScroll = () => {
      calculateScrollTarget();
    };

    const handleSeeking = () => {
      isSeeking = true;
    };

    const handleSeeked = () => {
      isSeeking = false;
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Smooth linear interpolation (lerp) loop for fluid, cinematic scrubbing
    const smoothLerpLoop = () => {
      const delta = targetTime - currentTime;
      if (Math.abs(delta) > 0.003) {
        // Easing interpolation factor for silky responsive scrubbing
        currentTime += delta * 0.12;

        if (video.readyState >= 2 && !isSeeking) {
          try {
            video.currentTime = currentTime;
          } catch {
            // Safe fallback during rapid scrubbing
          }
        }
      }

      rafId = requestAnimationFrame(smoothLerpLoop);
    };

    rafId = requestAnimationFrame(smoothLerpLoop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [isDesktopMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden select-none"
    >
      {/* Static Fallback Poster (Mobile Viewports, Reduced Motion, & Initial Load) */}
      <picture>
        <source srcSet="/videos/hero_poster.webp" type="image/webp" />
        <img
          src="/videos/hero_poster.jpg"
          alt=""
          className={`absolute inset-0 h-full w-full object-cover brightness-[0.78] contrast-[0.95] transition-opacity duration-700 ${
            isDesktopMotion && videoLoaded ? "opacity-0" : "opacity-100"
          }`}
          loading="eager"
        />
      </picture>

      {/* Cinematic Scroll-Scrubbed Video (Desktop Viewports with Motion Enabled) */}
      {isDesktopMotion && (
        <video
          ref={videoRef}
          src="/videos/shelflife-cinematic-sequence.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.80] contrast-[0.95]"
        />
      )}

      {/* Subtle dark forest / charcoal overlay hierarchy prioritizing typography & UI while keeping the cinematic pantry video distinct */}
      {/* 1. Base dark forest tone: calibrates overall luminosity (slightly deeper on mobile for stacked content) */}
      <div className="absolute inset-0 bg-[#0c120e]/60 md:bg-[#0c120e]/48 transition-colors duration-300" />

      {/* 2. Directional atmospheric vertical gradient for navbar grounding and section rhythm */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c120e]/85 via-[#0c120e]/30 to-[#0c120e]/75" />

      {/* 3. Text focus vignette: soft calibrated gradient behind primary reading areas (hero headline & copy) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_22%_25%,rgba(12,18,14,0.65)_0%,rgba(12,18,14,0.2)_65%,transparent_100%)] pointer-events-none" />
    </div>
  );
}
