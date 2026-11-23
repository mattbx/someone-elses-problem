"use client";

import { nameKey, type NamingSystem, type Registry, type UsedName } from "@sep/core";
import { useSyncExternalStore } from "react";

export interface ShortlistItem {
  name: string;
  system: string;
  note?: string;
}

export interface AppState {
  used: UsedName[];
  shortlist: ShortlistItem[];
  /** Lists the user dropped in. Stay in this browser. */
  myLists: NamingSystem[];
}

const KEY = "sep:v1";
const EMPTY: AppState = { used: [], shortlist: [], myLists: [] };

let state: AppState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    // Private window or blocked storage: run with an empty state.
  }
}

function set(next: Partial<AppState>) {
  state = { ...state, ...next };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Not fatal; the state still lives for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    subscribe,
    () => (load(), state),
    () => EMPTY,
  );
}

const record = (name: string, extra: Partial<UsedName> = {}): UsedName => ({
  name: name.trim(),
  key: nameKey(name),
  claimedAt: new Date().toISOString(),
  ...extra,
});

/** Add names to the used list, skipping any already there. Returns how many were new. */
export function addUsed(items: { name: string; project?: string; system?: string; source?: string }[]): number {
  const have = new Set(state.used.map((u) => u.key));
  const fresh = items
    .map((i) => record(i.name, { project: i.project, system: i.system, source: i.source }))
    .filter((u) => u.key && !have.has(u.key) && (have.add(u.key), true));
  if (fresh.length) set({ used: [...state.used, ...fresh] });
  return fresh.length;
}

export function removeUsed(name: string) {
  const key = nameKey(name);
  set({ used: state.used.filter((u) => u.key !== key) });
}

export function isShortlisted(name: string) {
  return state.shortlist.some((s) => s.name === name);
}

export function toggleShortlist(item: ShortlistItem): boolean {
  const on = isShortlisted(item.name);
  set({ shortlist: on ? state.shortlist.filter((s) => s.name !== item.name) : [...state.shortlist, item] });
  return !on;
}

export function clearShortlist() {
  set({ shortlist: [] });
}

export function saveMyList(system: NamingSystem) {
  set({ myLists: [...state.myLists.filter((s) => s.id !== system.id), system] });
}

export function removeMyList(id: string) {
  set({ myLists: state.myLists.filter((s) => s.id !== id) });
}

/** The same JSON shape the CLI keeps in ~/.config/someone-elses-problem/used.json. */
export function exportRegistry(): Registry {
  return { version: 1, used: state.used };
}

/** Accepts a registry file from the CLI, or a plain JSON array of names. */
export function importRegistry(json: unknown): number {
  const list: unknown[] = Array.isArray(json) ? json : (json as Registry)?.used ?? [];
  const items = list
    .map((u) => (typeof u === "string" ? { name: u, source: "import" } : (u as UsedName)))
    .filter((u): u is UsedName => Boolean(u && typeof u.name === "string"));
  return addUsed(items.map((u) => ({ name: u.name, project: u.project, system: u.system, source: u.source ?? "import" })));
}

export async function fetchGithubRepos(owner: string): Promise<string[]> {
  const names: string[] = [];
  for (let page = 1; page < 20; page++) {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(owner)}/repos?per_page=100&page=${page}`);
    if (res.status === 404) throw new Error(`No GitHub user called "${owner}".`);
    if (!res.ok) throw new Error(`GitHub didn't answer (${res.status}). Try again in a minute.`);
    const batch = (await res.json()) as { name: string }[];
    names.push(...batch.map((r) => r.name));
    if (batch.length < 100) break;
  }
  return names;
}
