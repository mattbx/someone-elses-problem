import type { NamingSystem } from "../types";
import cultureStyle from "./culture-style.json" with { type: "json" };
import cultureCanon from "./culture-canon-sample.json" with { type: "json" };
import { alliterativeAnimals } from "./alliterative-animals";
import { adjectiveScientists } from "./adjective-scientists";

/** Every built-in system. Add a new one by importing it here. */
export const builtinSystems: NamingSystem[] = [
  cultureStyle as NamingSystem,
  cultureCanon as NamingSystem,
  alliterativeAnimals,
  adjectiveScientists,
];
