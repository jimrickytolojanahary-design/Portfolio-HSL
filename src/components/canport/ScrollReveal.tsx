import React from "react";
import { useScrollReveal } from "../../hooks/use-scroll-reveal";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
  rootMargin?: string;
  as?: React.ElementType;
}

/**
 * ScrollReveal wrapper component using native IntersectionObserver.
 * - Triggers only ONCE when entering the viewport.
 * - Uses hardware acceleration (will-change: transform, opacity) for smooth 60 FPS.
 * - Transitions smoothly from opacity: 0 & translateY(20px) to opacity: 1 & translateY(0).
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = "",
  delayMs = 0,
  threshold = 0.1,
  rootMargin = "0px 0px -40px 0px",
  as: Component = "div",
}) => {
  const { ref, isRevealed, hasSettled } = useScrollReveal<HTMLDivElement>({
    threshold,
    rootMargin,
    delayMs,
  });

  return (
    <Component
      ref={ref}
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? "translate3d(0, 0, 0)" : "translate3d(0, 20px, 0)",
        willChange: hasSettled ? "auto" : "transform, opacity",
        transition:
          "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none ${className}`}
    >
      {children}
    </Component>
  );
};
