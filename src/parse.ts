import type { NameEntry } from "./types";

export interface ParsedList {
  entries: NameEntry[];
}

const TAG_COLUMNS = /^(tags?|type|ship type|class|category|kind)$/i;
const NOTE_COLUMNS = /^(notes?|comments?|description|why)$/i;
const NAME_COLUMNS = /^(name|title)$/i;

/** Tidy one name: drop footnote marks, trailing parentheticals and markdown emphasis. */
function clean(raw: string): string {
  return raw
    .replace(/[*_`]+/g, "")
    .replace(/[†‡]/g, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/^["“]|["”]$/g, "")
    .trim();
}

/**
 * Read a list of names from Markdown, CSV-ish text or plain lines.
 * - Markdown tables: uses the Name column, plus Tags/Type/Class as tags and Notes/Comments as notes.
 * - Bullets and numbered lists: one name per item ("- Name: note" or "- Name - note").
 * - Plain text: one name per line. Headings, front matter and blank lines are skipped.
 */
export function parseNameList(text: string): ParsedList {
  const lines = text.replace(/^---\n[\s\S]*?\n---\n/, "").split(/\r?\n/);
  const entries: NameEntry[] = [];
  let header: string[] | null = null;

  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith(">")) {
      header = null;
      continue;
    }
    if (t.startsWith("|")) {
      const cells = t.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
      if (!header) {
        header = cells;
        continue;
      }
      const at = (re: RegExp) => header!.findIndex((h) => re.test(h));
      const nameIdx = at(NAME_COLUMNS) >= 0 ? at(NAME_COLUMNS) : 0;
      const name = clean(cells[nameIdx] ?? "");
      if (!name) continue;
      const tags = header
        .map((h, i) => (TAG_COLUMNS.test(h) ? cells[i] : ""))
        .flatMap((v) => (v ?? "").split(/[,/]/))
        .map((v) => v.trim().toLowerCase().replace(/[()]/g, ""))
        .filter(Boolean);
      const noteIdx = at(NOTE_COLUMNS);
      const note = noteIdx >= 0 && cells[noteIdx] ? cells[noteIdx] : undefined;
      entries.push({ name, ...(tags.length ? { tags } : {}), ...(note ? { note } : {}) });
      continue;
    }
    header = null;
    const item = t.replace(/^([-*+]|\d+[.)])\s+(\[.\]\s+)?/, "");
    const m = item.match(/^(.+?)(?:\s+[-–—]|:)\s+(.+)$/);
    const name = clean(m ? m[1] : item);
    if (name && name.length <= 80) entries.push(m ? { name, note: m[2].trim() } : { name });
  }

  const seen = new Set<string>();
  return {
    entries: entries.filter((e) => {
      const k = e.name.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }),
  };
}
