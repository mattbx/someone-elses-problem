"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { copyText } from "@/lib/files";

function Panel({ label, lines, copy, comment }: { label: string; lines: string[]; copy: string; comment: string }) {
  const [done, setDone] = useState(false);
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader className="border-b">
        <CardTitle>{label}</CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Copy ${label} command`}
            onClick={async () => {
              if (await copyText(copy)) {
                setDone(true);
                setTimeout(() => setDone(false), 1500);
              }
            }}
          >
            {done ? <Check /> : <Copy />}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto font-mono text-sm">
          {lines.map((l, i) => (
            <span key={i}>
              {i === 0 && <span className="text-muted-foreground">$ </span>}
              {l}
              {"\n"}
            </span>
          ))}
          <span className="text-muted-foreground"># {comment}</span>
        </pre>
      </CardContent>
    </Card>
  );
}

export function InstallPanels() {
  return (
    <section id="use" aria-labelledby="use-label" className="grid scroll-mt-24 gap-3">
      <h2 id="use-label" className="text-sm font-medium">
        Use it where you work
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        <Panel
          label="CLI"
          lines={["npx someone-elses-problem \\", "  small audio plugin"]}
          copy="npx someone-elses-problem small audio plugin"
          comment='then: sep claim "<name>" -p <project>'
        />
        <Panel
          label="MCP · Claude Code"
          lines={["claude mcp add someone-elses-problem \\", "  -- npx -y someone-elses-problem mcp"]}
          copy="claude mcp add someone-elses-problem -- npx -y someone-elses-problem mcp"
          comment="then ask Claude to name your project"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        There&apos;s also a Claude skill in the repo&apos;s <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">skill/</code> folder. The CLI, MCP server and this page all
        read the same used-names file, so you can export it here and import it there.
      </p>
    </section>
  );
}
