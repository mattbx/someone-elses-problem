"use client";

import { SparklesIcon } from "@/components/icons/sparkles";
import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAnimatedIcon } from "@/components/ui/animated-icon";

export interface SourceOption {
  id: string;
  label: string;
}

export function Composer({
  keywords,
  onKeywords,
  sources,
  selected,
  onSelectedChange,
  onSuggest,
  onAddList,
}: {
  keywords: string;
  onKeywords: (v: string) => void;
  sources: SourceOption[];
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
  onSuggest: () => void;
  onAddList: () => void;
}) {
  const sparkle = useAnimatedIcon(SparklesIcon, 14);
  const plus = useAnimatedIcon(PlusIcon, 12, "inline-end");
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
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="type-label mr-1 text-foreground-subtle">From</span>
        <ToggleGroup
          multiple
          value={selected}
          onValueChange={onSelectedChange}
          variant="pill"
          size="chip"
          spacing={1.5}
          aria-label="Name sources"
          className="flex-wrap"
        >
          {sources.map((s) => (
            <ToggleGroupItem key={s.id} value={s.id}>
              {s.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button variant="dashed" size="chip" onClick={onAddList} {...plus.hover}>
          My list {plus.icon}
        </Button>
      </div>
    </section>
  );
}
