"use client";

import * as React from "react";

/** Every icon from pqoqubbw/icons exposes this handle. */
export interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

type IconComponent = React.ForwardRefExoticComponent<
  { size?: number; className?: string; style?: React.CSSProperties } & React.RefAttributes<IconHandle>
>;

/**
 * Keeps an icon at its own size inside shadcn's Button, whose base class
 * sizes any unclassed svg to 16px. Spread onto the icon component.
 */
export function iconSize(size: number) {
  return {
    size,
    className: "pointer-events-none [&_svg]:size-(--icon-size)!",
    style: { "--icon-size": `${size}px` } as React.CSSProperties,
  };
}

/**
 * Lets a whole button (not just the icon's own box) drive the icon's animation.
 * Spread `hover` onto the button and render `icon`.
 */
export function useAnimatedIcon(Icon: unknown, size = 16) {
  const ref = React.useRef<IconHandle>(null);
  const C = Icon as IconComponent;
  return {
    icon: <C ref={ref} {...iconSize(size)} />,
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
