"use client";

import { Toggle } from "@base-ui/react/toggle";
import { SparklesIcon } from "@/components/icons/sparkles";
import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAnimatedIcon } from "@/components/ui/animated-icon";
import { cn } from "@/lib/utils";

export interface SourceOption {
  id: string;
  label: string;
}

const chip =
  "inline-flex h-7 cursor-pointer items-center gap-1 rounded-full border px-3 text-[12px] font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function Composer({
  keywords,
  onKeywords,
  sources,
  selected,
  onToggle,
  onSuggest,
  onAddList,
}: {
  keywords: string;
  onKeywords: (v: string) => void;
  sources: SourceOption[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onSuggest: () => void;
  onAddList: () => void;
}) {
  const sparkle = useAnimatedIcon(SparklesIcon, 14);
  const plus = useAnimatedIcon(PlusIcon, 12);
  return (
    <section aria-labelledby="naming-label" className="sticky top-0 z-10 -mx-4 grid gap-3 bg-background/90 px-4 py-4 backdrop-blur-sm">
      <label id="naming-label" htmlFor="keywords" className="type-label text-muted-foreground">
        What are you naming?
      </label>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          sparkle.play();
          onSuggest();
        }}
      >
        <Input
          id="keywords"
          value={keywords}
          onChange={(e) => onKeywords(e.target.value)}
          placeholder="small audio plugin, experimental"
          autoComplete="off"
        />
        <Button type="submit" size="lg" {...sparkle.hover}>
          {sparkle.icon}
          Suggest
        </Button>
      </form>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Name sources">
        <span className="type-label mr-1 text-foreground-subtle">From</span>
        {sources.map((s) => (
          <Toggle
            key={s.id}
            pressed={selected.has(s.id)}
            onPressedChange={() => onToggle(s.id)}
            className={cn(
              chip,
              "text-muted-foreground hover:text-foreground data-pressed:border-transparent data-pressed:bg-secondary data-pressed:text-foreground",
            )}
          >
            {s.label}
          </Toggle>
        ))}
        <button type="button" onClick={onAddList} className={cn(chip, "border-dashed text-muted-foreground hover:text-foreground")} {...plus.hover}>
          My list {plus.icon}
        </button>
      </div>
    </section>
  );
}
