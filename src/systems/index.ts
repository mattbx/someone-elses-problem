import type { NamingSystem } from "../types.js";
import cultureStyle from "./culture-style.json" with { type: "json" };
import cultureCanon from "./culture-canon-sample.json" with { type: "json" };
import { alliterativeAnimals } from "./alliterative-animals.js";
import { adjectiveScientists } from "./adjective-scientists.js";

/** Every built-in system. Add a new one by importing it here. */
export const builtinSystems: NamingSystem[] = [
  cultureStyle as NamingSystem,
  cultureCanon as NamingSystem,
  alliterativeAnimals,
  adjectiveScientists,
];
