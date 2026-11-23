"use client";

import type { Suggestion } from "@sep/core";
import { Star } from "lucide-react";
import { CopyChip } from "@/components/copy-chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NameCard({
  s,
  systemName,
  matched,
  saved,
  claimed,
  onSave,
  onClaim,
  onUnclaim,
}: {
  s: Suggestion;
  systemName: string;
  matched: string[];
  saved: boolean;
  claimed: boolean;
  onSave: () => void;
  onClaim: () => void;
  onUnclaim: () => void;
}) {
  return (
    <li className={cn("grid gap-2.5 rounded-lg border p-4 transition-colors", claimed && "bg-surface")}>
      <div className="flex items-start justify-between gap-3">
        <div className="grid min-w-0 gap-1">
          <h3 className={cn("type-title text-balance", claimed && "text-muted-foreground")}>{s.name}</h3>
          <p className="type-meta text-muted-foreground">
            {systemName}
            {s.note && (
              <>
                <span className="text-foreground-subtle"> · </span>
                {s.note}
              </>
            )}
            {matched.length > 0 && (
              <>
                <span className="text-foreground-subtle"> · </span>
                matched: {matched.join(", ")}
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-pressed={saved}
            aria-label={saved ? `Remove ${s.name} from shortlist` : `Add ${s.name} to shortlist`}
            onClick={onSave}
          >
            <Star className={cn("size-4", saved && "fill-claim text-claim")} />
          </Button>
          {claimed ? (
            <Button variant="outline" onClick={onUnclaim}>
              Claimed · Undo
            </Button>
          ) : (
            <Button variant="claim" onClick={onClaim}>
              Claim
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <CopyChip value={s.formats.slug} />
        <CopyChip value={s.formats.pascal} />
        <CopyChip value={s.formats.snake} />
      </div>
    </li>
  );
}
