"use client";

import { nameKey, parseNameList } from "@sep/core";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DownloadIcon } from "@/components/icons/download";
import { GithubIcon } from "@/components/icons/github";
import { SearchIcon } from "@/components/icons/search";
import { UploadIcon } from "@/components/icons/upload";
import { XIcon } from "@/components/icons/x";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const footerBtn = "h-8 flex-1 rounded-[10px] text-[14px]";

function Row({ name, meta, onRemove, removeLabel }: { name: string; meta?: string; onRemove: () => void; removeLabel: string }) {
  return (
    <li className="group flex items-center justify-between gap-3 border-b border-border-subtle py-2.5 last:border-b-0">
      <div className="grid min-w-0 gap-0.5">
        <span className="type-card truncate">{name}</span>
        {meta && <span className="type-meta truncate text-muted-foreground">{meta}</span>}
      </div>
      <Button variant="ghost" size="icon-sm" aria-label={removeLabel} onClick={onRemove} className="opacity-60 group-hover:opacity-100">
        <XIcon {...iconSize(14)} />
      </Button>
    </li>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-[13px] text-muted-foreground">{children}</p>;
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
      toast(`Read ${names.length} repos from ${owner.trim()}, ${added} new.`);
      setSyncing(false);
    } catch (err) {
      toast.error((err as Error).message);
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
    toast(`Imported ${file.name}: ${added} new names.`);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} showCloseButton={false}>
        <Tabs value={tab} onValueChange={(v) => onTab(v as SheetTab)} className="min-h-0 flex-1 gap-0">
          <SheetHeader className="h-12 shrink-0 flex-row items-center justify-between border-b px-3 py-0">
            <SheetTitle className="sr-only">Saved names</SheetTitle>
            <TabsList className="bg-transparent">
              <TabsTrigger value="shortlist" className="px-2.5">
                Shortlist <span className="text-[11px] text-muted-foreground tabular-nums">{state.shortlist.length}</span>
              </TabsTrigger>
              <TabsTrigger value="used" className="px-2.5">
                Used <span className="text-[11px] text-muted-foreground tabular-nums">{state.used.length}</span>
              </TabsTrigger>
            </TabsList>
            <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}>
              <XIcon {...iconSize(16)} />
            </SheetClose>
          </SheetHeader>

          <TabsContent value="shortlist" className="flex min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
              {state.shortlist.length === 0 ? (
                <Empty>Star a name to keep it here while you decide.</Empty>
              ) : (
                <ul>
                  {state.shortlist.map((s) => (
                    <Row
                      key={s.name}
                      name={s.name}
                      meta={systemName(s.system)}
                      removeLabel={`Remove ${s.name} from shortlist`}
                      onRemove={() => toggleShortlist(s)}
                    />
                  ))}
                </ul>
              )}
            </div>
            <SheetFooter className="shrink-0 flex-row gap-2 border-t bg-muted/50 px-5 py-4">
              <Button
                variant="outline"
                className={footerBtn}
                disabled={!state.shortlist.length}
                onClick={async () => {
                  if (await copyText(state.shortlist.map((s) => s.name).join("\n"))) toast("Copied the shortlist.");
                }}
              >
                Copy all
              </Button>
              <Button
                className={footerBtn}
                disabled={!state.shortlist.length}
                onClick={() => downloadText("shortlist.json", JSON.stringify(state.shortlist, null, 2) + "\n")}
                {...down.hover}
              >
                {down.icon} Export
              </Button>
            </SheetFooter>
          </TabsContent>

          <TabsContent value="used" className="flex min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-foreground-faint">
                  <SearchIcon {...iconSize(14)} />
                </span>
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search used names" className="pl-8" aria-label="Search used names" />
              </div>
              {state.used.length === 0 ? (
                <Empty>
                  Nothing here yet. Claim a name, sync your GitHub repos, or import the file from the <code className="font-mono">sep</code> CLI.
                </Empty>
              ) : used.length === 0 ? (
                <Empty>No used names match that.</Empty>
              ) : (
                <ul className="mt-2">
                  {used.map((u) => (
                    <Row
                      key={u.key}
                      name={u.name}
                      meta={[u.project && u.project !== u.name ? u.project : "", u.source && u.source !== "claim" ? u.source : ""].filter(Boolean).join(" · ") || undefined}
                      removeLabel={`Free ${u.name} again`}
                      onRemove={() => removeUsed(u.name)}
                    />
                  ))}
                </ul>
              )}
            </div>
            <SheetFooter className="shrink-0 border-t bg-muted/50 px-5 py-4">
              {syncing ? (
                <form onSubmit={sync} className="flex gap-2">
                  <Input autoFocus value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="GitHub username" aria-label="GitHub username" className="h-8" />
                  <Button type="submit" className={footerBtn + " flex-none px-4"} disabled={busy}>
                    {busy ? "Reading…" : "Sync"}
                  </Button>
                  <Button variant="ghost" className="h-8 rounded-[10px]" onClick={() => setSyncing(false)}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" className={footerBtn} onClick={() => setSyncing(true)} {...gh.hover}>
                    {gh.icon} Sync GitHub
                  </Button>
                  <Button variant="outline" className={footerBtn} onClick={() => fileRef.current?.click()} {...up.hover}>
                    {up.icon} Import
                  </Button>
                  <Button
                    className={footerBtn}
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

