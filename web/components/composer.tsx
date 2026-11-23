"use client";

import { SparklesIcon } from "@/components/icons/sparkles";
import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { useAnimatedIcon } from "@/components/ui/animated-icon";
import { cn } from "@/lib/utils";

export interface SourceOption {
  id: string;
  label: string;
}

/** Source chips are pills: same height and type as a small button. */
const chip = "rounded-full border-border px-3 text-[12px]";

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
          className="h-9"
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
            variant="outline"
            size="sm"
            pressed={selected.has(s.id)}
            onPressedChange={() => onToggle(s.id)}
            className={cn(chip, "cursor-pointer text-muted-foreground aria-pressed:border-transparent aria-pressed:bg-secondary aria-pressed:text-foreground")}
          >
            {s.label}
          </Toggle>
        ))}
        <Button variant="outline" size="sm" onClick={onAddList} className={cn(chip, "border-dashed text-muted-foreground")} {...plus.hover}>
          My list {plus.icon}
        </Button>
      </div>
    </section>
  );
}
