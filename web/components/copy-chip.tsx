"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { copyText } from "@/lib/files";
import { cn } from "@/lib/utils";

/** A bordered mono chip that copies its value; the icon swaps to a tick for 1.5s. */
export function CopyChip({ value, label, className }: { value: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      title={`Copy ${value}`}
      onClick={async () => {
        if (await copyText(value)) {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }
      }}
      className={cn(
        "type-meta inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none",
        className,
      )}
    >
      <span className="truncate">{label ?? value}</span>
      {done ? <Check className="size-3 shrink-0 text-foreground" /> : <Copy className="size-3 shrink-0 opacity-60" />}
    </button>
  );
}
