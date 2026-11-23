import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { addUsed, globalRegistryPath, loadSystems, loadUsed, readRegistry, record, removeUsed, saveCustomSystem } from "../src/node.js";

let home: string;
beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), "ntih-"));
  process.env.NTIH_HOME = home;
});

describe("registry", () => {
  it("adds, dedupes by key and removes", () => {
    const p = globalRegistryPath();
    expect(addUsed(p, [record("Not Invented Here", { project: "tools" })])).toHaveLength(1);
    expect(addUsed(p, [record("not-invented-here")])).toHaveLength(0);
    expect(readRegistry(p).used[0]).toMatchObject({ name: "Not Invented Here", key: "notinventedhere", project: "tools" });
    expect(removeUsed(p, "NotInventedHere")).toBe(true);
    expect(readRegistry(p).used).toEqual([]);
  });
  it("merges a project's .names.json found above the working directory", () => {
    const proj = mkdtempSync(join(tmpdir(), "proj-"));
    writeFileSync(join(proj, ".names.json"), JSON.stringify(["Only Slightly Bent"]));
    addUsed(globalRegistryPath(), [record("Mild Concern Noted")]);
    const names = loadUsed(proj).map((u) => u.name).sort();
    expect(names).toEqual(["Mild Concern Noted", "Only Slightly Bent"]);
  });
  it("loads custom systems next to the built-ins", () => {
    saveCustomSystem({ id: "mine", name: "Mine", description: "", license: "private", entries: [{ name: "Zed" }] });
    expect(loadSystems().map((s) => s.id)).toContain("mine");
  });
});
