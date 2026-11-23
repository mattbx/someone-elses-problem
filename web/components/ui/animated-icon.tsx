"use client";

import * as React from "react";

/** Every icon from pqoqubbw/icons exposes this handle. */
export interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type IconComponent = React.ForwardRefExoticComponent<
  { className?: string; "data-icon"?: string } & React.RefAttributes<IconHandle>
>;

/**
 * Lets a whole button (not just the icon's own box) drive the icon's animation.
 * Spread `hover` onto the button and render `icon`. The button sizes the icon,
 * and `position` sets `data-icon` so it tightens its padding on that side.
 */
export function useAnimatedIcon(Icon: unknown, position: "inline-start" | "inline-end" = "inline-start") {
  const ref = React.useRef<IconHandle>(null);
  const C = Icon as IconComponent;
  return {
    icon: <C ref={ref} data-icon={position} className="pointer-events-none" />,
    hover: {
      onMouseEnter: () => ref.current?.startAnimation(),
      onMouseLeave: () => ref.current?.stopAnimation(),
      onFocus: () => ref.current?.startAnimation(),
      onBlur: () => ref.current?.stopAnimation(),
    },
    play: () => {
      ref.current?.startAnimation();
      window.setTimeout(() => ref.current?.stopAnimation(), 600);
    },
  };
}
