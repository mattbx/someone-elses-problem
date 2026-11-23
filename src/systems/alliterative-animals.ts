import { pick } from "../rng.js";
import type { NamingSystem } from "../types.js";

// Adjective + animal sharing a first letter, in the spirit of Ubuntu release names.
// Word lists written for this project.
const ADJ: Record<string, string[]> = {
  a: ["Agile", "Amber", "Artful", "Astute", "Audacious"],
  b: ["Bashful", "Bold", "Breezy", "Bright", "Brisk"],
  c: ["Calm", "Canny", "Cheeky", "Clever", "Cosmic"],
  d: ["Daring", "Dapper", "Deft", "Dreamy", "Dusky"],
  e: ["Eager", "Earnest", "Electric", "Elegant", "Epic"],
  f: ["Feisty", "Fluent", "Frosty", "Fuzzy", "Fearless"],
  g: ["Gentle", "Giddy", "Glossy", "Golden", "Groovy"],
  h: ["Handy", "Hardy", "Hazy", "Humble", "Hushed"],
  i: ["Icy", "Idle", "Indigo", "Inky", "Intrepid"],
  j: ["Jaunty", "Jazzy", "Jolly", "Jubilant", "Jumpy"],
  k: ["Keen", "Kind", "Kinetic", "Knotty", "Kooky"],
  l: ["Lanky", "Lively", "Lucid", "Lucky", "Lunar"],
  m: ["Mellow", "Merry", "Mighty", "Misty", "Modest"],
  n: ["Nifty", "Nimble", "Noble", "Nocturnal", "Nomadic"],
  o: ["Odd", "Olive", "Opal", "Orbital", "Outgoing"],
  p: ["Peppy", "Plucky", "Polite", "Precise", "Prickly"],
  q: ["Quaint", "Quick", "Quiet", "Quirky", "Quizzical"],
  r: ["Radiant", "Rapid", "Restless", "Rowdy", "Rustic"],
  s: ["Sleepy", "Snappy", "Sprightly", "Stoic", "Sunny"],
  t: ["Tidy", "Tiny", "Tranquil", "Trusty", "Twilight"],
  u: ["Ultra", "Unruly", "Upbeat", "Urban", "Utopian"],
  v: ["Valiant", "Velvet", "Vivid", "Volatile", "Voyaging"],
  w: ["Wandering", "Wary", "Whimsical", "Wily", "Witty"],
  y: ["Yawning", "Yearning", "Yellow", "Youthful", "Yonder"],
  z: ["Zany", "Zealous", "Zen", "Zesty", "Zippy"],
};
const ANIMAL: Record<string, string[]> = {
  a: ["Albatross", "Alpaca", "Anteater", "Armadillo", "Axolotl"],
  b: ["Badger", "Barracuda", "Bison", "Bittern", "Bobcat"],
  c: ["Capybara", "Caracal", "Chameleon", "Cormorant", "Coyote"],
  d: ["Dingo", "Dolphin", "Dormouse", "Dragonfly", "Dunnart"],
  e: ["Echidna", "Eel", "Egret", "Eland", "Emu"],
  f: ["Falcon", "Ferret", "Finch", "Flamingo", "Fox"],
  g: ["Galah", "Gecko", "Gibbon", "Goshawk", "Grouse"],
  h: ["Hare", "Hedgehog", "Heron", "Hornbill", "Hyena"],
  i: ["Ibex", "Ibis", "Iguana", "Impala", "Indri"],
  j: ["Jabiru", "Jackal", "Jackdaw", "Jaguar", "Jellyfish"],
  k: ["Kakapo", "Kestrel", "Kingfisher", "Koala", "Kookaburra"],
  l: ["Lemur", "Leopard", "Limpet", "Lorikeet", "Lynx"],
  m: ["Magpie", "Manatee", "Marmot", "Meerkat", "Mongoose"],
  n: ["Narwhal", "Newt", "Nighthawk", "Numbat", "Nuthatch"],
  o: ["Ocelot", "Octopus", "Okapi", "Orca", "Otter"],
  p: ["Pangolin", "Pelican", "Platypus", "Possum", "Puffin"],
  q: ["Quail", "Quokka", "Quoll", "Quetzal", "Quahog"],
  r: ["Raccoon", "Raven", "Reindeer", "Robin", "Rosella"],
  s: ["Salamander", "Seahorse", "Sloth", "Starling", "Stoat"],
  t: ["Tamarin", "Tapir", "Tern", "Thylacine", "Toucan"],
  u: ["Uakari", "Umbrellabird", "Urchin", "Urial", "Unicornfish"],
  v: ["Vicuna", "Viper", "Vole", "Vulture", "Vervet"],
  w: ["Walrus", "Wallaby", "Warbler", "Wombat", "Wren"],
  y: ["Yabby", "Yak", "Yellowhammer", "Yellowtail", "Yapok"],
  z: ["Zebra", "Zebu", "Zorilla", "Zander", "Zebrafinch"],
};
const LETTERS = Object.keys(ADJ);

export const alliterativeAnimals: NamingSystem = {
  id: "alliterative-animals",
  name: "Alliterative animals",
  description: "An adjective and an animal that share a first letter, like a Linux release name.",
  license: "MIT",
  example: "Jaunty Jackdaw",
  generate: (rng) => {
    const l = pick(LETTERS, rng);
    return `${pick(ADJ[l], rng)} ${pick(ANIMAL[l], rng)}`;
  },
};
