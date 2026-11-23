"use client";

import { Tabs as T } from "@base-ui/react/tabs";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Tabs = T.Root;

export function TabsList({ className, children, ...props }: React.ComponentProps<typeof T.List>) {
  return (
    <T.List className={cn("relative flex items-center gap-1", className)} {...props}>
      {children}
      <T.Indicator className="absolute left-(--active-tab-left) z-0 h-(--active-tab-height) w-(--active-tab-width) rounded-md bg-background/60 transition-all duration-200 ease-out motion-reduce:transition-none top-(--active-tab-top)" />
    </T.List>
  );
}

export function TabsTab({ className, ...props }: React.ComponentProps<typeof T.Tab>) {
  return (
    <T.Tab
      className={cn(
        "relative z-10 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[14px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-active:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export const TabsPanel = T.Panel;
