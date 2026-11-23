#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { parseArgs } from "node:util";
import {
  addUsed,
  fetchGithubRepos,
  findLocalRegistry,
  globalRegistryPath,
  listProjectDirs,
  loadSystems,
  loadUsed,
  parseNameList,
  record,
  removeUsed,
  saveCustomSystem,
  suggest,
  words,
} from "./node.js";

const VERSION = "0.1.0";
const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const dim = (s: string) => (tty ? `\x1b[2m${s}\x1b[0m` : s);
const bold = (s: string) => (tty ? `\x1b[1m${s}\x1b[0m` : s);

const HELP = `sep ${VERSION}: Someone Else's Problem, naming things so you don't have to

Usage
  sep [suggest] [keywords...]      Suggest names you haven't used yet
      -s, --system <id>             Only these systems (repeat, or comma-separate)
      -n, --count <n>               How many (default 5)
          --seed <text>             Same seed, same names
          --json                    Machine-readable output
  sep claim <name>                 Mark a name as used
      -p, --project <what>          What it's used for
          --local                   Write to ./.names.json instead of your global registry
  sep unclaim <name> [--local]     Free a name again
  sep used [--json]                List used names
  sep systems [--json]             List naming systems
  sep sync --github <owner>        Treat a GitHub user's repo names as used ($GITHUB_TOKEN optional)
  sep sync --dir <path>            Treat folder names in <path> as used, e.g. ~/Github
  sep import <file> --used         Add every name in a file to your used registry
  sep import <file> --as <id>      Save a file of names as your own naming system
          --name <title>            Display name for that system
  sep mcp                          Run as an MCP server over stdio
  sep help | --version

Registry: ${globalRegistryPath()}
`;

async function main(argv: string[]) {
  const { values: o, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      system: { type: "string", short: "s", multiple: true },
      count: { type: "string", short: "n" },
      seed: { type: "string" },
      json: { type: "boolean" },
      project: { type: "string", short: "p" },
      local: { type: "boolean" },
      github: { type: "string" },
      dir: { type: "string" },
      used: { type: "boolean" },
      as: { type: "string" },
      name: { type: "string" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });
  if (o.version) return console.log(VERSION);
  const commands = ["suggest", "claim", "unclaim", "used", "systems", "sync", "import", "mcp", "help"];
  const cmd = commands.includes(positionals[0]) ? positionals.shift()! : "suggest";
  if (o.help || cmd === "help") return console.log(HELP);

  const regPath = o.local ? resolve(".names.json") : globalRegistryPath();

  switch (cmd) {
    case "suggest": {
      const systems = (o.system ?? []).flatMap((s) => s.split(",")).filter(Boolean);
      const used = loadUsed();
      const out = suggest(loadSystems(), {
        systems,
        keywords: positionals,
        count: o.count ? Number(o.count) : 5,
        seed: o.seed,
        used: used.map((u) => u.name),
      });
      if (o.json) return console.log(JSON.stringify(out, null, 2));
      if (!out.length) return console.log("No unused names left in those systems. Try another system, or import a list.");
      for (const s of out) {
        console.log(`${bold(s.name)}  ${dim(`${s.system} · ${s.formats.slug}`)}`);
        if (s.note) console.log(`  ${dim(s.note)}`);
      }
      console.log(dim(`\nClaim one with: sep claim "${out[0].name}" --project <what>`));
      return;
    }
    case "claim": {
      const name = positionals.join(" ").trim();
      if (!name) throw new Error('Give a name: sep claim "Mild Concern Noted"');
      const system = loadSystems().find((s) => s.entries?.some((e) => e.name.toLowerCase() === name.toLowerCase()))?.id;
      const fresh = addUsed(regPath, [record(name, { project: o.project, system, source: "claim" })]);
      console.log(fresh.length ? `Claimed "${name}"${o.project ? ` for ${o.project}` : ""}.` : `"${name}" was already claimed.`);
      return;
    }
    case "unclaim": {
      const name = positionals.join(" ").trim();
      console.log(removeUsed(regPath, name) ? `Freed "${name}".` : `"${name}" wasn't in ${regPath}.`);
      return;
    }
    case "used": {
      const used = loadUsed();
      if (o.json) return console.log(JSON.stringify(used, null, 2));
      if (!used.length) return console.log("Nothing claimed yet.");
      for (const u of used) console.log(`${u.name}${u.project ? dim(`  ${u.project}`) : ""}${u.source && u.source !== "claim" ? dim(`  (${u.source})`) : ""}`);
      const local = findLocalRegistry();
      console.log(dim(`\n${used.length} names · ${globalRegistryPath()}${local ? ` + ${local}` : ""}`));
      return;
    }
    case "systems": {
      const systems = loadSystems();
      if (o.json) return console.log(JSON.stringify(systems.map(({ generate: _g, entries, ...s }) => ({ ...s, size: entries?.length ?? "generated" })), null, 2));
      for (const s of systems) {
        const size = s.entries ? `${s.entries.length} names` : "generated";
        console.log(`${bold(s.id)}  ${dim(`${size} · e.g. ${s.example ?? s.entries?.[0]?.name ?? ""}`)}\n  ${s.description}`);
      }
      return;
    }
    case "sync": {
      let names: string[];
      let source: string;
      if (o.github) {
        names = await fetchGithubRepos(o.github);
        source = "github";
      } else if (o.dir) {
        names = listProjectDirs(resolve(o.dir.replace(/^~/, process.env.HOME ?? "~")));
        source = "dir";
      } else throw new Error("Use --github <owner> or --dir <path>.");
      const fresh = addUsed(regPath, names.map((n) => record(n, { source, project: n })));
      console.log(`Read ${names.length} names, ${fresh.length} new.`);
      return;
    }
    case "import": {
      const file = positionals[0];
      if (!file) throw new Error("Give a file: sep import names.md --used");
      const { entries } = parseNameList(readFileSync(file, "utf8"));
      if (!entries.length) throw new Error(`Found no names in ${file}.`);
      if (o.used) {
        const fresh = addUsed(regPath, entries.map((e) => record(e.name, { source: "import" })));
        return console.log(`Read ${entries.length} names, ${fresh.length} new in your used registry.`);
      }
      const id = o.as ?? (words(basename(file).replace(/\.[^.]+$/, "")).join("-") || "my-names");
      const path = saveCustomSystem({
        id,
        name: o.name ?? basename(file).replace(/\.[^.]+$/, ""),
        description: `Imported from ${basename(file)}.`,
        license: "Private list, not redistributed",
        entries,
      });
      console.log(`Saved ${entries.length} names as system "${id}" (${path}).\nTry: sep -s ${id}`);
      return;
    }
    case "mcp": {
      const { runMcpServer } = await import("./mcp.js");
      await runMcpServer();
      return;
    }
  }
}

main(process.argv.slice(2)).catch((e: Error) => {
  console.error(`sep: ${e.message}`);
  process.exit(1);
});
