"use client";

import { builtinSystems, parseKeywords, suggest, words, type Suggestion } from "@sep/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Count } from "@/components/count";
import { Composer, type SourceOption } from "@/components/composer";
import { Header } from "@/components/header";
import { RefreshCWIcon } from "@/components/icons/refresh-cw";
import { InstallPanels } from "@/components/install-panel";
import { MyListDialog } from "@/components/my-list-dialog";
import { NameCard } from "@/components/name-card";
import { SavedSheet, type SheetTab } from "@/components/saved-sheet";
import { WhyCulture } from "@/components/why-culture";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ItemGroup } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimatedIcon } from "@/components/ui/animated-icon";
import { addUsed, removeUsed, toggleShortlist, useAppState } from "@/lib/store";
import { useMedia } from "@/lib/use-media";

const LABELS: Record<string, string> = {
  "culture-style": "Culture-style",
  "culture-canon-sample": "Culture canon",
  "alliterative-animals": "Animals",
  "adjective-scientists": "Scientists",
};
const DEFAULT_SOURCES = ["culture-style", "culture-canon-sample"];
const COUNT = 5;

export function NameChooser() {
  const state = useAppState();
  const desktop = useMedia("(min-width: 640px)");
  const [keywords, setKeywords] = useState("");
  const [selected, setSelected] = useState(() => new Set(DEFAULT_SOURCES));
  const [results, setResults] = useState<Suggestion[] | null>(null);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tab, setTab] = useState<SheetTab>("shortlist");
  const [listOpen, setListOpen] = useState(false);
  const reroll = useAnimatedIcon(RefreshCWIcon);

  const systems = useMemo(() => [...builtinSystems, ...state.myLists], [state.myLists]);
  const sources: SourceOption[] = systems.map((s) => ({ id: s.id, label: LABELS[s.id] ?? s.name }));
  const systemName = useCallback((id: string) => LABELS[id] ?? systems.find((s) => s.id === id)?.name ?? id, [systems]);

  const run = useCallback(() => {
    const ids = [...selected].filter((id) => systems.some((s) => s.id === id));
    setResults(
      suggest(systems, {
        systems: ids.length ? ids : DEFAULT_SOURCES,
        keywords,
        count: COUNT,
        used: state.used.map((u) => u.name),
      }),
    );
    setClaimed(new Set());
  }, [selected, systems, keywords, state.used]);

  // First suggestions once the browser has loaded the user's used names.
  useEffect(() => {
    if (results === null) run();
  }, [results, run]);

  const kw = useMemo(() => new Set(parseKeywords(keywords)), [keywords]);
  const matchedFor = (s: Suggestion) => (kw.size ? (s.tags ?? []).filter((t) => kw.has(t)).concat(words(s.name).filter((w) => kw.has(w))) : []);

  function open(t: SheetTab) {
    setTab(t);
    setSheetOpen(true);
  }

  function save(s: Suggestion) {
    const item = { name: s.name, system: s.system, note: s.note };
    const added = toggleShortlist(item);
    const id = toast.add({
      title: added ? `Added ${s.name} to your shortlist.` : `Removed ${s.name} from your shortlist.`,
      actionProps: {
        children: "Undo",
        onClick: () => {
          toggleShortlist(item);
          toast.close(id);
        },
      },
    });
  }

  function claim(s: Suggestion) {
    addUsed([{ name: s.name, system: s.system, source: "claim" }]);
    setClaimed((c) => new Set(c).add(s.name));
    const id = toast.add({
      title: `Claimed ${s.name}. It won't be suggested again.`,
      actionProps: {
        children: "Undo",
        onClick: () => {
          unclaim(s);
          toast.close(id);
        },
      },
    });
  }

  function unclaim(s: Suggestion) {
    removeUsed(s.name);
    setClaimed((c) => {
      const n = new Set(c);
      n.delete(s.name);
      return n;
    });
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-10 px-4 pt-8 pb-24 sm:pb-16">
      <Header shortlist={state.shortlist.length} used={state.used.length} onOpen={open} />

      <main className="grid gap-10">
        <div className="grid gap-2">
          <Composer
            keywords={keywords}
            onKeywords={setKeywords}
            sources={sources}
            selected={[...selected]}
            onSelectedChange={(ids) => setSelected(new Set(ids))}
            onSuggest={run}
            onAddList={() => setListOpen(true)}
          />

          <section aria-labelledby="results-label" className="grid gap-3">
            <div className="flex items-center justify-between">
              <h2 id="results-label" className="text-sm font-medium">
                {results ? `${results.length} unused names` : "Unused names"}
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  reroll.play();
                  run();
                }}
                {...reroll.hover}
              >
                {reroll.icon} Reroll
              </Button>
            </div>
            {results && results.length === 0 ? (
              <Empty className="border py-8">
                <EmptyHeader>
                  <EmptyTitle>No unused names left</EmptyTitle>
                  <EmptyDescription>You&apos;ve used every name in these sources. Pick another source above, or add your own list.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ItemGroup aria-live="polite">
                {(results ?? []).map((s) => (
                  <NameCard
                    key={s.name}
                    s={s}
                    systemName={systemName(s.system)}
                    matched={[...new Set(matchedFor(s))]}
                    saved={state.shortlist.some((x) => x.name === s.name)}
                    claimed={claimed.has(s.name)}
                    onSave={() => save(s)}
                    onClaim={() => claim(s)}
                    onUnclaim={() => unclaim(s)}
                  />
                ))}
                {results === null &&
                  Array.from({ length: COUNT }, (_, i) => (
                    <Skeleton key={i} className="h-[106px] rounded-lg" aria-hidden />
                  ))}
              </ItemGroup>
            )}
          </section>
        </div>

        <InstallPanels />
        <WhyCulture />
      </main>

      <footer className="grid gap-4">
        <Separator />
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>MIT licence</span>
          <span>Culture ship names are the work of Iain M. Banks, used here as a fan tribute</span>
          <a href="https://github.com/mattbx/someone-elses-problem#add-a-system-to-the-project" className="underline-offset-2 hover:text-foreground hover:underline">
            Add a naming system
          </a>
        </div>
      </footer>

      {!desktop && (
        <button
          type="button"
          onClick={() => open("shortlist")}
          className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t bg-popover px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm text-muted-foreground"
        >
          <span>
            Shortlist <Count value={state.shortlist.length} /> <span>·</span> Used <Count value={state.used.length} />
          </span>
          <span aria-hidden>▴</span>
        </button>
      )}

      <SavedSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        tab={tab}
        onTab={setTab}
        side={desktop ? "right" : "bottom"}
        state={state}
        systemName={systemName}
      />
      <MyListDialog
        open={listOpen}
        onOpenChange={setListOpen}
        lists={state.myLists}
        onAdded={(id) => setSelected((cur) => new Set(cur).add(id))}
      />
    </div>
  );
}
