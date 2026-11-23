"use client";

import type { Suggestion } from "@sep/core";
import { Star } from "lucide-react";
import { CopyChip } from "@/components/copy-chip";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemTitle } from "@/components/ui/item";
import type { NameFormat } from "@/lib/name-format";
import { cn } from "@/lib/utils";

export function NameCard({
  s,
  format,
  systemName,
  matched,
  saved,
  claimed,
  onSave,
  onClaim,
  onUnclaim,
}: {
  s: Suggestion;
  format: NameFormat;
  systemName: string;
  matched: string[];
  saved: boolean;
  claimed: boolean;
  onSave: () => void;
  onClaim: () => void;
  onUnclaim: () => void;
}) {
  return (
    <Item role="listitem" variant={claimed ? "muted" : "outline"}>
      <ItemContent className="min-w-0">
        <ItemTitle className={cn(claimed && "text-muted-foreground")}>{s.name}</ItemTitle>
        <ItemDescription>
          {systemName}
          {s.note && <> · {s.note}</>}
          {matched.length > 0 && <> · matched: {matched.join(", ")}</>}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="icon"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${s.name} from shortlist` : `Add ${s.name} to shortlist`}
          onClick={onSave}
        >
          <Star className={cn(saved && "fill-current")} />
        </Button>
        {claimed ? (
          <Button variant="outline" onClick={onUnclaim}>
            Claimed · Undo
          </Button>
        ) : (
          <Button onClick={onClaim}>
            Claim
          </Button>
        )}
      </ItemActions>
      <ItemFooter className="justify-start">
        <CopyChip value={s.formats[format]} />
      </ItemFooter>
    </Item>
  );
}
