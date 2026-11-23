import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { addUsed, globalRegistryPath, loadSystems, loadUsed, record, suggest } from "./node.js";

const text = (data: unknown) => ({ content: [{ type: "text" as const, text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }] });

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "naming-things-is-hard", version: "0.1.0" });

  server.registerTool(
    "list_systems",
    {
      title: "List naming systems",
      description: "List the naming systems available (themed sources of project names), with an example from each.",
      inputSchema: {},
    },
    async () =>
      text(
        loadSystems().map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          example: s.example ?? s.entries?.[0]?.name,
          size: s.entries?.length ?? "generated",
        })),
      ),
  );

  server.registerTool(
    "suggest_names",
    {
      title: "Suggest unused names",
      description:
        "Suggest working-title names that the user has NOT used yet. Returns candidates with notes and slug/PascalCase forms. " +
        "Ask for more than you need (around 15 to 20), then choose the 3 to 5 that best fit the project, say briefly why, and let the user pick. " +
        "After they choose, call claim_name.",
      inputSchema: {
        keywords: z.string().optional().describe("Words about the project, e.g. 'small audio plugin, experimental'. Used to rank tagged names."),
        systems: z.array(z.string()).optional().describe("System ids from list_systems. Omit for all."),
        count: z.number().int().min(1).max(50).optional().describe("How many candidates. Default 15."),
        seed: z.string().optional().describe("Same seed returns the same candidates."),
      },
    },
    async ({ keywords, systems, count, seed }) => {
      const used = loadUsed().map((u) => u.name);
      const out = suggest(loadSystems(), { keywords, systems, count: count ?? 15, seed, used });
      return text(out.map((s) => ({ name: s.name, system: s.system, note: s.note, tags: s.tags, slug: s.formats.slug, pascal: s.formats.pascal })));
    },
  );

  server.registerTool(
    "claim_name",
    {
      title: "Claim a name",
      description: "Record a name as used so it is never suggested again. Call this once the user has picked a name.",
      inputSchema: {
        name: z.string().describe("The name exactly as chosen."),
        project: z.string().optional().describe("What the name is for, e.g. the repo or folder."),
        system: z.string().optional().describe("The system id it came from."),
      },
    },
    async ({ name, project, system }) => {
      const fresh = addUsed(globalRegistryPath(), [record(name, { project, system, source: "claim" })]);
      return text(fresh.length ? `Claimed "${name}"${project ? ` for ${project}` : ""}.` : `"${name}" was already claimed.`);
    },
  );

  server.registerTool(
    "list_used",
    {
      title: "List used names",
      description: "List names the user has already used or claimed, with what they were used for.",
      inputSchema: {},
    },
    async () => text(loadUsed().map((u) => ({ name: u.name, project: u.project, system: u.system, source: u.source }))),
  );

  return server;
}

export async function runMcpServer(): Promise<void> {
  await createMcpServer().connect(new StdioServerTransport());
}
