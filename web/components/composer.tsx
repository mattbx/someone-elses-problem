"use client";

import { useEffect, useRef, useState } from "react";
import { SparklesIcon } from "@/components/icons/sparkles";
import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAnimatedIcon } from "@/components/ui/animated-icon";

/**
 * True once a `sticky top-0` element is pinned to the top of the viewport. The observer's
 * top edge sits 1px inside the viewport, so a pinned element is never fully inside it.
 */
function useStuck<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(e.intersectionRatio < 1 && e.boundingClientRect.top <= 1), {
      rootMargin: "-1px 0px 0px 0px",
      threshold: [1],
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, stuck };
}

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
  const sparkle = useAnimatedIcon(SparklesIcon);
  // See-through over the starfield; the background only fades in once the bar is pinned.
  const { ref, stuck } = useStuck<HTMLElement>();
  const plus = useAnimatedIcon(PlusIcon, "inline-end");
  return (
    <section
      ref={ref}
      data-stuck={stuck || undefined}
      aria-labelledby="naming-label"
      className="sticky top-0 z-10 -mx-4 px-4 py-4 transition-[background-color,backdrop-filter] duration-200 data-stuck:bg-background/90 data-stuck:backdrop-blur-sm"
    >
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel id="naming-label" htmlFor="keywords">
            What are you naming?
          </FieldLabel>
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
            <Button type="submit" {...sparkle.hover}>
              {sparkle.icon}
              Suggest
            </Button>
          </form>
        </Field>
        <FieldSet className="gap-0">
          <FieldLegend variant="label">From</FieldLegend>
          <div className="flex flex-wrap items-center gap-1.5">
            <ToggleGroup multiple value={selected} onValueChange={onSelectedChange} variant="outline" size="sm" className="flex-wrap">
              {sources.map((s) => (
                <ToggleGroupItem key={s.id} value={s.id}>
                  {s.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Button variant="outline" size="sm" onClick={onAddList} {...plus.hover}>
              My list {plus.icon}
            </Button>
          </div>
        </FieldSet>
      </FieldGroup>
    </section>
  );
}
