"use client";

import { nameKey, parseNameList } from "@sep/core";
import { Fragment, useMemo, useRef, useState } from "react";
import { DownloadIcon } from "@/components/icons/download";
import { GithubIcon } from "@/components/icons/github";
import { SearchIcon } from "@/components/icons/search";
import { UploadIcon } from "@/components/icons/upload";
import { XIcon } from "@/components/icons/x";
import { Count } from "@/components/count";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { iconSize, useAnimatedIcon } from "@/components/ui/animated-icon";
import { copyText, downloadText } from "@/lib/files";
import {
  addUsed,
  exportRegistry,
  fetchGithubRepos,
  importRegistry,
  removeUsed,
  toggleShortlist,
  type AppState,
} from "@/lib/store";

export type SheetTab = "shortlist" | "used";

function Row({ name, meta, onRemove, removeLabel }: { name: string; meta?: string; onRemove: () => void; removeLabel: string }) {
  return (
    <Item role="listitem" size="sm" className="px-0">
      <ItemContent className="min-w-0">
        <ItemTitle>{name}</ItemTitle>
        {meta && <ItemDescription className="line-clamp-1">{meta}</ItemDescription>}
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon-sm" aria-label={removeLabel} onClick={onRemove}>
          <XIcon {...iconSize(14)} />
        </Button>
      </ItemActions>
    </Item>
  );
}

/** Rows with a separator between each. */
function RowList({ children }: { children: React.ReactNode[] }) {
  return (
    <ItemGroup className="gap-0">
      {children.map((row, i) => (
        <Fragment key={i}>
          {i > 0 && <ItemSeparator className="my-0" />}
          {row}
        </Fragment>
      ))}
    </ItemGroup>
  );
}

function EmptyList({ children }: { children: React.ReactNode }) {
  return (
    <Empty className="py-10">
      <EmptyHeader>
        <EmptyDescription>{children}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function SavedSheet({
  open,
  onOpenChange,
  tab,
  onTab,
  side,
  state,
  systemName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab: SheetTab;
  onTab: (t: SheetTab) => void;
  side: "floating" | "bottom";
  state: AppState;
  systemName: (id: string) => string;
}) {
  const [query, setQuery] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [owner, setOwner] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const gh = useAnimatedIcon(GithubIcon, 14);
  const up = useAnimatedIcon(UploadIcon, 14);
  const down = useAnimatedIcon(DownloadIcon, 14);

  const used = useMemo(() => {
    const q = nameKey(query);
    return [...state.used]
      .filter((u) => !q || u.key.includes(q) || nameKey(u.project ?? "").includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [state.used, query]);

  async function sync(e: React.FormEvent) {
    e.preventDefault();
    if (!owner.trim()) return;
    setBusy(true);
    try {
      const names = await fetchGithubRepos(owner.trim());
      const added = addUsed(names.map((n) => ({ name: n, project: n, source: "github" })));
      toast.add({ title: `Read ${names.length} repos from ${owner.trim()}, ${added} new.` });
      setSyncing(false);
    } catch (err) {
      toast.add({ type: "error", title: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file: File) {
    const text = await file.text();
    let added = 0;
    try {
      added = importRegistry(JSON.parse(text));
    } catch {
      // Not JSON: read it as a list of names (Markdown table, bullets or lines).
      added = addUsed(parseNameList(text).entries.map((e) => ({ name: e.name, source: "import" })));
    }
    toast.add({ title: `Imported ${file.name}: ${added} new names.` });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} showCloseButton={false}>
        <Tabs value={tab} onValueChange={(v) => onTab(v as SheetTab)} className="min-h-0 flex-1 gap-0">
          <SheetHeader className="shrink-0 flex-row items-center justify-between border-b px-4 py-2">
            <SheetTitle className="sr-only">Saved names</SheetTitle>
            <TabsList variant="line">
              <TabsTrigger value="shortlist">
                Shortlist <Count value={state.shortlist.length} />
              </TabsTrigger>
              <TabsTrigger value="used">
                Used <Count value={state.used.length} />
              </TabsTrigger>
            </TabsList>
            <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}>
              <XIcon {...iconSize(16)} />
            </SheetClose>
          </SheetHeader>

          <TabsContent value="shortlist" className="flex min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
              {state.shortlist.length === 0 ? (
                <EmptyList>Star a name to keep it here while you decide.</EmptyList>
              ) : (
                <RowList>
                  {state.shortlist.map((s) => (
                    <Row
                      key={s.name}
                      name={s.name}
                      meta={systemName(s.system)}
                      removeLabel={`Remove ${s.name} from shortlist`}
                      onRemove={() => toggleShortlist(s)}
                    />
                  ))}
                </RowList>
              )}
            </div>
            <Separator />
            <SheetFooter className="shrink-0 flex-row gap-2 bg-muted/50 px-4 py-4">
              <Button
                variant="outline"
                className="flex-1"
                disabled={!state.shortlist.length}
                onClick={async () => {
                  if (await copyText(state.shortlist.map((s) => s.name).join("\n"))) toast.add({ title: "Copied the shortlist." });
                }}
              >
                Copy all
              </Button>
              <Button
                className="flex-1"
                disabled={!state.shortlist.length}
                onClick={() => downloadText("shortlist.json", JSON.stringify(state.shortlist, null, 2) + "\n")}
                {...down.hover}
              >
                {down.icon} Export
              </Button>
            </SheetFooter>
          </TabsContent>

          <TabsContent value="used" className="flex min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon {...iconSize(14)} />
                </InputGroupAddon>
                <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search used names" aria-label="Search used names" />
              </InputGroup>
              {state.used.length === 0 ? (
                <EmptyList>
                  Nothing here yet. Claim a name, sync your GitHub repos, or import the file from the <code className="font-mono">sep</code> CLI.
                </EmptyList>
              ) : used.length === 0 ? (
                <EmptyList>No used names match that.</EmptyList>
              ) : (
                <RowList>
                  {used.map((u) => (
                    <Row
                      key={u.key}
                      name={u.name}
                      meta={[u.project && u.project !== u.name ? u.project : "", u.source && u.source !== "claim" ? u.source : ""].filter(Boolean).join(" · ") || undefined}
                      removeLabel={`Free ${u.name} again`}
                      onRemove={() => removeUsed(u.name)}
                    />
                  ))}
                </RowList>
              )}
            </div>
            <Separator />
            <SheetFooter className="shrink-0 bg-muted/50 px-4 py-4">
              {syncing ? (
                <form onSubmit={sync} className="flex gap-2">
                  <Input autoFocus value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="GitHub username" aria-label="GitHub username" />
                  <Button type="submit" className="px-4" disabled={busy}>
                    {busy && <Spinner data-icon="inline-start" />}
                    Sync
                  </Button>
                  <Button variant="ghost" onClick={() => setSyncing(false)}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSyncing(true)} {...gh.hover}>
                    {gh.icon} Sync GitHub
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => fileRef.current?.click()} {...up.hover}>
                    {up.icon} Import
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!state.used.length}
                    onClick={() => downloadText("used.json", JSON.stringify(exportRegistry(), null, 2) + "\n")}
                    {...down.hover}
                  >
                    {down.icon} Export
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".json,.md,.txt,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onFile(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}
            </SheetFooter>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

