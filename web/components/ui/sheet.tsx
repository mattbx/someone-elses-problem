"use client";

import { Dialog } from "@base-ui/react/dialog";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export const SheetTitle = Dialog.Title;

type Side = "floating" | "bottom";

const sides: Record<Side, string> = {
  // Desktop: detached panel, 16px in from the top, right and bottom edges.
  floating:
    "inset-y-4 right-4 left-auto h-[calc(100svh-2rem)] w-[min(32rem,calc(100vw-2rem))] rounded-xl border " +
    "data-open:slide-in-from-right-10 data-closed:slide-out-to-right-10",
  // Phone: full-width sheet from the bottom.
  bottom:
    "inset-x-0 bottom-0 max-h-[85svh] w-full rounded-t-xl border-t " +
    "data-open:slide-in-from-bottom-10 data-closed:slide-out-to-bottom-10",
};

export function SheetContent({
  side = "floating",
  className,
  children,
  ...props
}: React.ComponentProps<typeof Dialog.Popup> & { side?: Side }) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[4px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
      <Dialog.Popup
        className={cn(
          "fixed z-50 flex flex-col gap-0 overflow-hidden bg-surface-elevated p-0 text-foreground shadow-lg outline-none",
          "duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          sides[side],
          className,
        )}
        {...props}
      >
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}
