import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { nameKey } from "./format.js";
import { builtinSystems } from "./systems/index.js";
import type { NamingSystem, Registry, UsedName } from "./types.js";

export * from "./index.js";

/** ~/.config/someone-elses-problem, or $SEP_HOME. */
export function configDir(): string {
  return process.env.SEP_HOME ?? join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "someone-elses-problem");
}

export function globalRegistryPath(): string {
  return join(configDir(), "used.json");
}

/** The nearest `.names.json` from `cwd` upwards, if a project keeps its own registry. */
export function findLocalRegistry(cwd = process.cwd()): string | undefined {
  let dir = resolve(cwd);
  for (;;) {
    const p = join(dir, ".names.json");
    if (existsSync(p)) return p;
    const up = dirname(dir);
    if (up === dir) return undefined;
    dir = up;
  }
}

export function readRegistry(path: string): Registry {
  if (!existsSync(path)) return { version: 1, used: [] };
  const data = JSON.parse(readFileSync(path, "utf8"));
  // Accept a bare array of strings too, for hand-written files.
  if (Array.isArray(data)) return { version: 1, used: data.map((n: string) => record(n, { source: "import" })) };
  return { version: 1, used: Array.isArray(data.used) ? data.used : [] };
}

export function writeRegistry(path: string, reg: Registry): void {
  mkdirSync(dirname(path), { recursive: true });
  const used = [...reg.used].sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync(path, JSON.stringify({ version: 1, used }, null, 2) + "\n");
}

export function record(name: string, extra: Partial<UsedName> = {}): UsedName {
  return { name: name.trim(), key: nameKey(name), claimedAt: new Date().toISOString(), ...extra };
}

/** Every used name from the global registry and the nearest project registry. */
export function loadUsed(cwd = process.cwd()): UsedName[] {
  const paths = [globalRegistryPath(), findLocalRegistry(cwd)].filter(Boolean) as string[];
  return paths.flatMap((p) => readRegistry(p).used);
}

/** Add names to a registry, skipping ones already there. Returns the names that were new. */
export function addUsed(path: string, items: UsedName[]): UsedName[] {
  const reg = readRegistry(path);
  const have = new Set(reg.used.map((u) => u.key));
  const fresh = items.filter((u) => u.key && !have.has(u.key) && (have.add(u.key), true));
  if (fresh.length) writeRegistry(path, { version: 1, used: [...reg.used, ...fresh] });
  return fresh;
}

export function removeUsed(path: string, name: string): boolean {
  const reg = readRegistry(path);
  const key = nameKey(name);
  const used = reg.used.filter((u) => u.key !== key);
  if (used.length === reg.used.length) return false;
  writeRegistry(path, { version: 1, used });
  return true;
}

export function customSystemsDir(): string {
  return join(configDir(), "systems");
}

/** Built-in systems plus any JSON systems in ~/.config/someone-elses-problem/systems/. */
export function loadSystems(): NamingSystem[] {
  const dir = customSystemsDir();
  const custom: NamingSystem[] = [];
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      try {
        const s = JSON.parse(readFileSync(join(dir, f), "utf8")) as NamingSystem;
        if (s.id && Array.isArray(s.entries)) custom.push(s);
      } catch {
        process.stderr.write(`sep: skipped ${f}, not valid JSON\n`);
      }
    }
  }
  const ids = new Set(custom.map((s) => s.id));
  return [...builtinSystems.filter((s) => !ids.has(s.id)), ...custom];
}

export function saveCustomSystem(system: NamingSystem): string {
  const p = join(customSystemsDir(), `${system.id}.json`);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(system, null, 2) + "\n");
  return p;
}

/** Public repo names for a GitHub user or org. Uses $GITHUB_TOKEN if set (needed for private repos). */
export async function fetchGithubRepos(owner: string): Promise<string[]> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "someone-elses-problem" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const names: string[] = [];
  for (let page = 1; page < 50; page++) {
    const url = `https://api.github.com/users/${encodeURIComponent(owner)}/repos?per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub said ${res.status} for ${owner}: ${(await res.text()).slice(0, 200)}`);
    const batch = (await res.json()) as { name: string }[];
    names.push(...batch.map((r) => r.name));
    if (batch.length < 100) break;
  }
  return names;
}

/** Folder names directly inside `dir`, e.g. your ~/Github checkouts. */
export function listProjectDirs(dir: string): string[] {
  return readdirSync(dir).filter((f) => !f.startsWith(".") && statSync(join(dir, f)).isDirectory());
}
