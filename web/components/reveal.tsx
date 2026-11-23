"use client";

import { Effect, Effects } from "@animate-ui/react/primitives/effects/effect";

/**
 * Entrance motion for the page, from animate-ui's Effect. animate-ui swaps slide and
 * blur for a plain fade when the visitor prefers reduced motion.
 */

/** Cards cascade in: fade, rise 12px and sharpen, 50ms apart. Change `batch` to replay. */
export function RevealList({ batch, children }: { batch: number; children: React.ReactElement[] }) {
  return (
    <Effects key={batch} fade slide={{ offset: 12 }} blur={{ initialBlur: 4 }} holdDelay={50}>
      {children}
    </Effects>
  );
}

/** A section fades and rises 16px once, as it scrolls into view. */
export function RevealOnScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Effect fade slide={{ offset: 16 }} inView inViewOnce inViewMargin="0px 0px -10% 0px" className={className}>
      {children}
    </Effect>
  );
}
