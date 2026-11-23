"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/files";

/** Copies a value; the icon swaps to a tick for 1.5s. */
export function CopyChip({ value, label, className }: { value: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      title={`Copy ${value}`}
      onClick={async () => {
        if (await copyText(value)) {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }
      }}
      className={className}
    >
      <span className="truncate font-mono bg-surface/50 text-muted-foreground pr-1">{label ?? value}</span>
      {done ? <Check data-icon="inline-end" className="text-muted-foreground" /> : <Copy data-icon="inline-end" className="text-muted-foreground" />}
    </Button>
  );
}
