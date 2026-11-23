"use client";

import { parseNameList, words, type NamingSystem } from "@sep/core";
import { Fragment, useRef, useState } from "react";
import { FileTextIcon } from "@/components/icons/file-text";
import { XIcon } from "@/components/icons/x";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { iconSize } from "@/components/ui/animated-icon";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { removeMyList, saveMyList } from "@/lib/store";

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
  const fileRef = useRef<HTMLInputElement>(null);

  async function take(file: File) {
    const { entries } = parseNameList(await file.text());
    if (!entries.length) {
      toast.add({
        type: "error",
        title: `Couldn't find any names in ${file.name}.`,
        description: "Use one name per line, a bullet list, or a table with a Name column.",
      });
      return;
    }
    const title = file.name.replace(/\.[^.]+$/, "");
    const id = `my-${words(title).join("-") || "list"}`;
    saveMyList({ id, name: title, description: `Your list, from ${file.name}.`, license: "Your own list", entries });
    toast.add({ title: `Added ${entries.length} names from ${file.name}.` });
    onAdded(id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bring your own list</DialogTitle>
          <DialogDescription>Names stay in this browser. Markdown tables, bullet lists and plain lines all work.</DialogDescription>
        </DialogHeader>
        <Empty
          data-dragging={over || undefined}
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
          className="border data-dragging:border-ring data-dragging:bg-muted/50"
        >
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon {...iconSize(16)} />
            </EmptyMedia>
            <EmptyTitle>Drop a file here</EmptyTitle>
            <EmptyDescription>Or choose a .md, .txt or .csv file.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              Choose a file
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".md,.txt,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) take(f);
                e.target.value = "";
              }}
            />
          </EmptyContent>
        </Empty>
        {lists.length > 0 && (
          <div className="grid gap-1">
            <h3 className="text-sm font-medium">Your lists</h3>
            <ItemGroup className="gap-0">
              {lists.map((l, i) => (
                <Fragment key={l.id}>
                  {i > 0 && <ItemSeparator className="my-0" />}
                  <Item role="listitem" size="sm" className="px-0">
                    <ItemContent className="min-w-0">
                      <ItemTitle>{l.name}</ItemTitle>
                      <ItemDescription>{l.entries?.length ?? 0} names</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Button variant="ghost" size="icon-sm" aria-label={`Remove ${l.name}`} onClick={() => removeMyList(l.id)}>
                        <XIcon {...iconSize(14)} />
                      </Button>
                    </ItemActions>
                  </Item>
                </Fragment>
              ))}
            </ItemGroup>
          </div>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
