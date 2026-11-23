import { pick } from "../rng";
import type { NamingSystem } from "../types";

// Adjective + the surname of a notable scientist or engineer, the pattern made
// famous by Docker's container names. Lists written for this project.
const ADJ = [
  "admiring", "brave", "busy", "careful", "cheerful", "clever", "curious", "dazzling", "determined", "eager",
  "elegant", "eloquent", "fervent", "focused", "friendly", "gallant", "gifted", "graceful", "hopeful", "inspiring",
  "intrepid", "jolly", "keen", "kind", "laughing", "lucid", "modest", "nostalgic", "optimistic", "patient",
  "pensive", "quirky", "relaxed", "resolute", "serene", "sharp", "stoic", "tender", "thoughtful", "upbeat",
  "vibrant", "wizardly", "wonderful", "youthful", "zealous",
];
const PEOPLE = [
  "babbage", "banneker", "bell", "blackburn", "bohr", "boole", "carson", "cori", "curie", "darwin",
  "dijkstra", "einstein", "euler", "faraday", "fermi", "feynman", "franklin", "galileo", "gauss", "goodall",
  "hamilton", "hawking", "hodgkin", "hopper", "hypatia", "johnson", "kepler", "knuth", "lamarr", "lovelace",
  "maxwell", "mcclintock", "meitner", "mendel", "mirzakhani", "newton", "noether", "pascal", "raman", "ramanujan",
  "ride", "shannon", "somerville", "tesla", "turing", "wiles", "wu", "yalow",
];

export const adjectiveScientists: NamingSystem = {
  id: "adjective-scientists",
  name: "Adjective + scientist",
  description: "A cheerful adjective and the surname of a notable scientist or engineer, in snake_case.",
  license: "MIT",
  example: "eloquent_hopper",
  generate: (rng) => `${pick(ADJ, rng)}_${pick(PEOPLE, rng)}`,
};
