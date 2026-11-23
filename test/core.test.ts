import { describe, expect, it } from "vitest";
import { builtinSystems, formats, nameKey, parseNameList, suggest } from "../src/index";
import type { NamingSystem } from "../src/types";

describe("nameKey and formats", () => {
  it("treats spacing, case and punctuation as the same name", () => {
    expect(nameKey("Not Invented Here")).toBe("notinventedhere");
    expect(nameKey("not-invented-here")).toBe("notinventedhere");
    expect(nameKey("NotInventedHere")).toBe("notinventedhere");
    expect(nameKey("OnlySlightlyBent")).toBe(nameKey("Only Slightly Bent"));
  });
  it("builds the usual code forms", () => {
    expect(formats("Funny, It Worked Last Time...")).toMatchObject({
      slug: "funny-it-worked-last-time",
      pascal: "FunnyItWorkedLastTime",
      camel: "funnyItWorkedLastTime",
      snake: "funny_it_worked_last_time",
    });
    expect(formats("Size Isn't Everything").slug).toBe("size-isnt-everything");
  });
});

const tiny: NamingSystem = {
  id: "tiny",
  name: "Tiny",
  description: "test",
  license: "MIT",
  entries: [
    { name: "Alpha Wave", tags: ["audio"] },
    { name: "Beta Grid", tags: ["design"] },
    { name: "Gamma Ray", tags: ["visual"] },
  ],
};

describe("suggest", () => {
  it("never returns a used name, in any spelling", () => {
    const out = suggest([tiny], { count: 10, used: ["alpha-wave", "BetaGrid"] });
    expect(out.map((s) => s.name)).toEqual(["Gamma Ray"]);
  });
  it("ranks tag matches first", () => {
    const out = suggest([tiny], { keywords: "an audio thing", count: 3 });
    expect(out[0].name).toBe("Alpha Wave");
    expect(out[0].score).toBeGreaterThan(0);
  });
  it("matches simple plurals", () => {
    expect(suggest([tiny], { keywords: "visuals", count: 1 })[0].name).toBe("Gamma Ray");
  });
  it("is repeatable with a seed", () => {
    const a = suggest(builtinSystems, { seed: "audio-apps", count: 8 });
    const b = suggest(builtinSystems, { seed: "audio-apps", count: 8 });
    expect(a).toEqual(b);
  });
  it("mixes systems instead of letting the biggest list win", () => {
    const out = suggest(builtinSystems, { count: 8, seed: 1 });
    expect(new Set(out.map((s) => s.system)).size).toBe(builtinSystems.length);
  });
  it("throws on an unknown system id", () => {
    expect(() => suggest([tiny], { systems: ["nope"] })).toThrow(/Unknown naming system/);
  });
  it("generators produce fresh, unused names", () => {
    const gen = builtinSystems.find((s) => s.id === "alliterative-animals")!;
    const out = suggest([gen], { count: 20, seed: 3 });
    expect(out).toHaveLength(20);
    for (const s of out) {
      const [a, b] = s.name.split(" ");
      expect(a[0]).toBe(b[0]);
    }
  });
});

describe("built-in systems", () => {
  it("each has an id, licence and either entries or a generator", () => {
    for (const s of builtinSystems) {
      expect(s.id).toMatch(/^[a-z0-9-]+$/);
      expect(s.license.length).toBeGreaterThan(0);
      expect(Boolean(s.entries?.length || s.generate)).toBe(true);
    }
  });
  it("has no duplicate names within a list", () => {
    for (const s of builtinSystems.filter((s) => s.entries)) {
      const keys = s.entries!.map((e) => nameKey(e.name));
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
  it("keeps original Culture-style names apart from the canon sample", () => {
    const style = builtinSystems.find((s) => s.id === "culture-style")!.entries!.map((e) => nameKey(e.name));
    const canon = new Set(builtinSystems.find((s) => s.id === "culture-canon-sample")!.entries!.map((e) => nameKey(e.name)));
    expect(style.filter((k) => canon.has(k))).toEqual([]);
  });
});

describe("parseNameList", () => {
  it("reads a markdown table with name, type and comments", () => {
    const md = `---\ntags: [x]\n---\n# Ships\n\n| Civ | Ship Type | Name | Comments |\n|---|---|---|---|\n| Culture | GCU | Arbitrary* | Main setting |\n| Culture | GSV | Eschatologist (temporary name) | |\n`;
    expect(parseNameList(md).entries).toEqual([
      { name: "Arbitrary", tags: ["gcu"], note: "Main setting" },
      { name: "Eschatologist", tags: ["gsv"] },
    ]);
  });
  it("reads bullets with notes and plain lines", () => {
    const txt = "- Kestrel: fast and small\n* Wren\n1. Heron - patient\nPlain Name\n";
    expect(parseNameList(txt).entries).toEqual([
      { name: "Kestrel", note: "fast and small" },
      { name: "Wren" },
      { name: "Heron", note: "patient" },
      { name: "Plain Name" },
    ]);
  });
});
