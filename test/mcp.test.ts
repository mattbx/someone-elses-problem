import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createMcpServer } from "../src/mcp.js";

describe("MCP server", () => {
  it("suggests, claims, and stops suggesting the claimed name", async () => {
    process.env.SEP_HOME = mkdtempSync(join(tmpdir(), "sep-mcp-"));
    const [a, b] = InMemoryTransport.createLinkedPair();
    await createMcpServer().connect(a);
    const client = new Client({ name: "test", version: "0" });
    await client.connect(b);

    const tools = (await client.listTools()).tools.map((t) => t.name).sort();
    expect(tools).toEqual(["claim_name", "list_systems", "list_used", "suggest_names"]);

    const call = async (name: string, args: Record<string, unknown> = {}) =>
      JSON.parse(((await client.callTool({ name, arguments: args })).content as { text: string }[])[0].text);

    const first = await call("suggest_names", { systems: ["culture-canon-sample"], count: 30 });
    expect(first).toHaveLength(30);
    const picked = first[0].name;
    await client.callTool({ name: "claim_name", arguments: { name: picked, project: "demo" } });
    const after = await call("suggest_names", { systems: ["culture-canon-sample"], count: 30 });
    expect(after.map((s: { name: string }) => s.name)).not.toContain(picked);
    expect(await call("list_used")).toEqual([{ name: picked, project: "demo", source: "claim" }]);
  });
});
