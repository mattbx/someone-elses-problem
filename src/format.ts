import type { NameFormats } from "./types";

/** Split a name into plain lowercase words: "Funny, It's Late..." -> ["funny", "its", "late"]. */
export function words(name: string): string[] {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Collision key: letters and digits only, lowercased.
 * "Not Invented Here", "not-invented-here" and "NotInventedHere" all give "notinventedhere".
 */
export function nameKey(name: string): string {
  return words(name).join("");
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export function formats(name: string): NameFormats {
  const w = words(name);
  return {
    slug: w.join("-"),
    pascal: w.map(cap).join(""),
    camel: w.map((x, i) => (i === 0 ? x : cap(x))).join(""),
    snake: w.join("_"),
    title: name.trim(),
  };
}
