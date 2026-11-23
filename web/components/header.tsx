"use client";

import { Button } from "@/components/ui/button";
import { Count } from "@/components/count";
import { ThemeToggle } from "@/components/theme-toggle";

const REPO = "https://github.com/mattbx/someone-elses-problem";

export function Header({
  shortlist,
  used,
  onOpen,
}: {
  shortlist: number;
  used: number;
  onOpen: (tab: "shortlist" | "used") => void;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="grid min-w-0 gap-1">
        <h1 className="font-mono text-lg font-semibold tracking-[-0.02em]">someone.else&apos;s.problem</h1>
        <p className="font-mono text-[14px] text-muted-foreground">Names for your projects, so naming isn&apos;t your problem.</p>
        <nav className="mt-1.5 flex gap-1.5" aria-label="Other ways to use it">
          {[
            ["CLI", "#use"],
            ["MCP", "#use"],
            ["GitHub", REPO],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="type-meta rounded-md border px-2 py-0.5 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <div className="hidden items-center gap-1 sm:flex">
          <Button variant="ghost" onClick={() => onOpen("shortlist")}>
            Shortlist <Count value={shortlist} />
          </Button>
          <Button variant="ghost" onClick={() => onOpen("used")}>
            Used <Count value={used} />
          </Button>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
