import { CodeBlock } from "@/components/ui/code-block";

export function InstallPanels() {
  return (
    <section id="use" aria-labelledby="use-label" className="grid scroll-mt-24 gap-3">
      <h2 id="use-label" className="text-sm font-medium">
        Use it where you work
      </h2>
      <CodeBlock
        files={[
          { filename: "CLI", language: "bash", code: "npx someone-elses-problem small audio plugin" },
          { filename: "MCP · Claude Code", language: "bash", code: "claude mcp add someone-elses-problem -- npx -y someone-elses-problem mcp" },
        ]}
      />
      <p className="text-sm text-muted-foreground">
        Claim a name from the CLI with <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">npx someone-elses-problem claim &quot;&lt;name&gt;&quot; -p &lt;project&gt;</code>, or ask
        Claude to name your project once the MCP server is added. There&apos;s also a Claude skill in the repo&apos;s <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">skill/</code> folder. The CLI, MCP server and this page all
        read the same used-names file, so you can export it here and import it there.
      </p>
    </section>
  );
}
