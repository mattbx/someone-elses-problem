import { formats, nameKey, words } from "./format.js";
import { makeRng } from "./rng.js";
import type { NamingSystem, SuggestOptions, Suggestion } from "./types.js";

const STOPWORDS = new Set(["a", "an", "the", "and", "or", "for", "of", "to", "in", "on", "with", "my", "our", "it", "is", "that", "this"]);

/** Turn "a small audio plugin, experimental" into ["small", "audio", "plugin", "experimental"]. */
export function parseKeywords(input?: string[] | string): string[] {
  if (!input) return [];
  const raw = Array.isArray(input) ? input.join(" ") : input;
  return [...new Set(words(raw).filter((w) => !STOPWORDS.has(w)))];
}

/** Crude stem so "plugins" matches "plugin" and "visuals" matches "visual". */
const stem = (w: string) => (w.length > 4 ? w.replace(/(ies|es|s|ing|ed)$/, "") : w);

function score(name: string, tags: string[] | undefined, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const k = new Set(keywords.map(stem));
  let s = 0;
  for (const t of tags ?? []) if (k.has(stem(t))) s += 2;
  for (const w of words(name)) if (k.has(stem(w))) s += 1;
  return s;
}

/**
 * Suggest names that aren't in `used`.
 * List entries are ranked by tag and word overlap with the keywords, ties shuffled;
 * generators add fresh combinations. Multiple systems mix together.
 */
export function suggest(allSystems: NamingSystem[], opts: SuggestOptions = {}): Suggestion[] {
  const count = Math.max(1, Math.min(opts.count ?? 5, 100));
  const rng = makeRng(opts.seed);
  const keywords = parseKeywords(opts.keywords);
  const systems = opts.systems?.length
    ? opts.systems.map((id) => {
        const s = allSystems.find((x) => x.id === id);
        if (!s) throw new Error(`Unknown naming system "${id}". Known: ${allSystems.map((x) => x.id).join(", ")}`);
        return s;
      })
    : allSystems;

  const taken = new Set<string>();
  for (const u of opts.used ?? []) taken.add(nameKey(u));

  type Cand = Suggestion & { r: number };
  const cands: Cand[] = [];
  const seen = new Set<string>();
  const add = (name: string, system: NamingSystem, note?: string, tags?: string[]) => {
    const key = nameKey(name);
    if (!key || taken.has(key) || seen.has(key)) return;
    seen.add(key);
    cands.push({ name, system: system.id, note, tags, score: score(name, tags, keywords), formats: formats(name), r: rng() });
  };

  for (const system of systems) {
    for (const e of system.entries ?? []) add(e.name, system, e.note, e.tags);
    if (system.generate) {
      // Enough fresh combinations to fill the request on their own.
      const target = count * 3;
      let made = 0;
      for (let tries = 0; made < target && tries < target * 20; tries++) {
        const before = cands.length;
        add(system.generate(rng), system);
        if (cands.length > before) made++;
      }
    }
  }

  // Rank within each system, then deal from the systems in turn so a big list
  // doesn't drown a small one. A higher keyword score always goes first.
  const bySystem = new Map<string, Cand[]>();
  for (const c of cands) bySystem.set(c.system, [...(bySystem.get(c.system) ?? []), c]);
  const queues = [...bySystem.values()].map((q) => q.sort((a, b) => b.score - a.score || a.r - b.r));
  const out: Cand[] = [];
  let turn = Math.floor(rng() * Math.max(queues.length, 1));
  while (out.length < count && queues.some((q) => q.length)) {
    const top = Math.max(...queues.filter((q) => q.length).map((q) => q[0].score));
    for (let i = 0; i < queues.length; i++) {
      const q = queues[(turn + i) % queues.length];
      if (q.length && q[0].score === top) {
        out.push(q.shift()!);
        turn = (turn + i + 1) % queues.length;
        break;
      }
    }
  }
  return out.map(({ r: _r, ...s }) => s);
}
