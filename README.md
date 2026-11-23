# Naming Things Is Hard

Suggests working-title names you haven't used yet, from themed naming systems. It started with the ship names from Iain M. Banks' Culture novels (that's how *Not Invented Here* got its name) and is built so more systems plug in easily.

```
$ ntih small audio plugin
Batteries Sold Separately  culture-style · batteries-sold-separately
  Brings the frame, you bring the power.
Patch Cable Spaghetti  culture-style · patch-cable-spaghetti
  Modular synth plugins.
Jaunty Jackdaw  alliterative-animals · jaunty-jackdaw
...

$ ntih claim "Patch Cable Spaghetti" --project eurorack-sampler
Claimed "Patch Cable Spaghetti" for eurorack-sampler.
```

It does the boring parts: holding the lists, skipping names you've used, ranking by keywords, giving you the slug and PascalCase forms. Picking the name that *feels* right is left to you, or to Claude through the MCP server or skill.

## Install

```sh
npm i -g naming-things-is-hard   # gives you `ntih`
# or run it without installing
npx naming-things-is-hard suggest
```

Node 20 or later.

## Commands

| Command | What it does |
| --- | --- |
| `ntih [keywords...]` | Suggest 5 unused names. `-n 10` for more, `-s culture-style` for one system, `--seed my-project` for repeatable picks, `--json` for scripts. |
| `ntih claim "<name>" -p <project>` | Mark a name as used. `--local` writes to `./.names.json` instead. |
| `ntih unclaim "<name>"` | Free it again. |
| `ntih used` | List used names. |
| `ntih systems` | List naming systems. |
| `ntih sync --github <owner>` | Treat your GitHub repo names as used. Set `GITHUB_TOKEN` to include private repos. |
| `ntih sync --dir ~/Github` | Treat folder names in a directory as used. |
| `ntih import names.md --used` | Add every name in a file to your used list. |
| `ntih import names.md --as my-names` | Save a file of names as your own naming system. |
| `ntih mcp` | Run as an MCP server over stdio. |

## Naming systems

| Id | Kind | Example |
| --- | --- | --- |
| `culture-style` | 193 original names in the Culture ship style | Mild Concern Noted |
| `culture-canon-sample` | 30 real Culture ship names, credited | Just Read The Instructions |
| `alliterative-animals` | Generated | Jaunty Jackdaw |
| `adjective-scientists` | Generated | eloquent_hopper |

### Bring your own list

`ntih import` reads Markdown tables (it uses the Name column, plus Type/Class/Tags as tags and Notes/Comments as notes), bullet lists (`- Name: note`) or plain lines. The result is saved to `~/.config/naming-things/systems/<id>.json` and stays on your machine.

### Add a system to the project

A system is a JSON file in `src/systems/` with an id, name, description, licence and entries. Tags on entries make keyword ranking work.

```json
{
  "id": "clouds",
  "name": "Clouds and weather",
  "description": "Cloud types and named winds.",
  "license": "Public domain (common terms)",
  "entries": [
    { "name": "Altostratus", "tags": ["calm", "big"], "note": "A grey sheet of mid-level cloud." },
    { "name": "Sirocco", "tags": ["fast", "hot"] }
  ]
}
```

Generated systems are a small TypeScript file exporting a `generate(rng)` function; see `src/systems/alliterative-animals.ts`. Register either kind in `src/systems/index.ts`. A `license` is required so nothing ships without one.

## The used-names registry

Names you claim live in `~/.config/naming-things/used.json` (or `$NTIH_HOME/used.json`). A project can keep its own `.names.json` too; `ntih` reads the nearest one above the current folder as well as the global one. Names are compared ignoring case, spaces and punctuation, so `Not Invented Here`, `not-invented-here` and `NotInventedHere` are the same name.

## Use it from Claude

### MCP server

Add to your Claude Code or Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "naming-things": { "command": "npx", "args": ["-y", "naming-things-is-hard", "mcp"] }
  }
}
```

With Claude Code: `claude mcp add naming-things -- npx -y naming-things-is-hard mcp`.

Tools: `suggest_names`, `claim_name`, `list_used`, `list_systems`. Claude asks for around 15 candidates, picks the few that fit the project it already knows about, explains why, and claims the one you choose.

### Skill

Copy `skill/naming-things/` into `~/.claude/skills/` (or your project's `.claude/skills/`). It uses the MCP tools or the CLI when available, and falls back to a short built-in list when neither is.

## About the Culture names

The original Culture-style names in `culture-style` were written for this project and are MIT licensed. The 30 names in `culture-canon-sample` are Iain M. Banks' creative work, listed as a short fan reference. This project is not affiliated with the Banks estate. We don't ship the full canon list; if you have one, `ntih import` it.

## Develop

```sh
npm install
npm test        # vitest
npm run build   # tsup -> dist/
npm run dev -- small audio plugin
```

MIT licence.
