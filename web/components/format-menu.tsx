"use client";

import { CaseSensitive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAME_FORMATS, formatLabel, type NameFormat } from "@/lib/name-format";

/** Picks the case every card's copy chip uses. Shows the current choice on the trigger. */
export function FormatMenu({ value, onChange }: { value: NameFormat; onChange: (f: NameFormat) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" aria-label={`Name format: ${formatLabel(value)}`} />}>
        <CaseSensitive data-icon="inline-start" />
        {formatLabel(value)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Copy names as</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as NameFormat)}>
            {NAME_FORMATS.map((f) => (
              <DropdownMenuRadioItem key={f.id} value={f.id}>
                {f.label}
                <span className="ml-auto font-mono text-xs text-muted-foreground">{f.example}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
