/** One name in a list-based naming system. */
export interface NameEntry {
  name: string;
  /** Lowercase keywords used to match a project's description, e.g. ["audio", "small"]. */
  tags?: string[];
  /** A line on where the name comes from or why it suits something. */
  note?: string;
}

/**
 * A naming system: a themed source of names.
 * Give it `entries` (a fixed list), `generate` (a combinatorial generator), or both.
 */
export interface NamingSystem {
  /** Stable kebab-case id, e.g. "culture-style". */
  id: string;
  name: string;
  description: string;
  /** SPDX id or a short licence statement for the data. Required so nothing ships without one. */
  license: string;
  attribution?: string;
  source?: string;
  /** Example output, shown in listings. */
  example?: string;
  entries?: NameEntry[];
  /** Produce one name from a random number source returning values in [0, 1). */
  generate?: (rng: () => number) => string;
}

export interface UsedName {
  name: string;
  /** Collision key, see `nameKey`. */
  key: string;
  project?: string;
  system?: string;
  /** Where the record came from: "claim", "github", "dir", "import". */
  source?: string;
  claimedAt: string;
}

export interface Registry {
  version: 1;
  used: UsedName[];
}

export interface Suggestion {
  name: string;
  system: string;
  note?: string;
  tags?: string[];
  /** Tag or word overlap with the keywords given; 0 when none were given. */
  score: number;
  formats: NameFormats;
}

export interface NameFormats {
  slug: string;
  pascal: string;
  camel: string;
  snake: string;
  title: string;
}

export interface SuggestOptions {
  /** System ids to draw from. Defaults to every system passed in. */
  systems?: string[];
  /** Words describing the project: "audio plugin, small, experimental". */
  keywords?: string[] | string;
  count?: number;
  /** Names (or keys) to treat as taken, on top of none. */
  used?: Iterable<string>;
  /** Same seed, same suggestions. */
  seed?: string | number;
}
