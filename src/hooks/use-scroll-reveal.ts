import { useEffect, useRef, useState } from "react";

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  delayMs?: number;
}

/**
 * Hook to trigger a one-time scroll reveal animation using the native IntersectionObserver API.
 * Ensures hardware acceleration (will-change: transform, opacity) and unobserves immediately
 * after entering viewport to guarantee optimal 60 FPS performance.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = "0px 0px -40px 0px",
  delayMs = 0,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasSettled, setHasSettled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Support prefers-reduced-motion immediately
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsRevealed(true);
      setHasSettled(true);
      return;
    }

    // Fallback if IntersectionObserver is unavailable
    if (typeof IntersectionObserver === "undefined") {
      setIsRevealed(true);
      setHasSettled(true);
      return;
    }

    let revealTimer: ReturnType<typeof setTimeout> | null = null;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          // Trigger once: unobserve immediately to eliminate any scroll observer overhead
          observer.unobserve(entry.target);

          if (delayMs > 0) {
            revealTimer = setTimeout(() => {
              setIsRevealed(true);
            }, delayMs);
            settleTimer = setTimeout(() => {
              setHasSettled(true);
            }, delayMs + 650);
          } else {
            setIsRevealed(true);
            settleTimer = setTimeout(() => {
              setHasSettled(true);
            }, 650);
          }
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (revealTimer) clearTimeout(revealTimer);
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [threshold, rootMargin, delayMs]);

  return { ref, isRevealed, hasSettled };
}
