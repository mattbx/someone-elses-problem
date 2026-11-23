"use client";

import { parseNameList, words, type NamingSystem } from "@sep/core";
import { useState } from "react";
import { toast } from "sonner";
import { FileTextIcon } from "@/components/icons/file-text";
import { XIcon } from "@/components/icons/x";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { iconSize } from "@/components/ui/animated-icon";
import { removeMyList, saveMyList } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MyListDialog({
  open,
  onOpenChange,
  lists,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lists: NamingSystem[];
  onAdded: (id: string) => void;
}) {
  const [over, setOver] = useState(false);

  async function take(file: File) {
    const { entries } = parseNameList(await file.text());
    if (!entries.length) {
      toast.error(`Couldn't find any names in ${file.name}. Use one name per line, a bullet list, or a table with a Name column.`);
      return;
    }
    const title = file.name.replace(/\.[^.]+$/, "");
    const id = `my-${words(title).join("-") || "list"}`;
    saveMyList({ id, name: title, description: `Your list, from ${file.name}.`, license: "Your own list", entries });
    toast(`Added ${entries.length} names from ${file.name}.`);
    onAdded(id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bring your own list</DialogTitle>
          <DialogDescription>Names stay in this browser. Markdown tables, bullet lists and plain lines all work.</DialogDescription>
        </DialogHeader>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            const f = e.dataTransfer.files[0];
            if (f) take(f);
          }}
          className={cn(
            "grid cursor-pointer place-items-center gap-2 rounded-lg border border-dashed bg-surface px-4 py-8 text-center transition-colors hover:border-ring",
            over && "border-ring bg-surface-elevated",
          )}
        >
          <FileTextIcon size={20} className="text-muted-foreground" />
          <span className="text-[13px] text-foreground-secondary">Drop a .md, .txt or .csv file, or click to choose one</span>
          <input
            type="file"
            accept=".md,.txt,.csv"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) take(f);
              e.target.value = "";
            }}
          />
        </label>
        {lists.length > 0 && (
          <div className="grid gap-1">
            <span className="type-label text-muted-foreground">Your lists</span>
            <ul>
              {lists.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 border-b border-border-subtle py-2 last:border-b-0">
                  <span className="type-card truncate">{l.name}</span>
                  <span className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-foreground tabular-nums">{l.entries?.length ?? 0} names</span>
                    <Button variant="ghost" size="icon-sm" aria-label={`Remove ${l.name}`} onClick={() => removeMyList(l.id)}>
                      <XIcon {...iconSize(14)} />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
