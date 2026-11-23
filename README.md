# Someone Else's Problem

Suggests working-title names you haven't used yet, from themed naming systems. It started with the ship names from Iain M. Banks' Culture novels (that's how *Not Invented Here* got its name) and is built so more systems plug in easily.

The name is a Culture ship too, from *Look to Windward*. Naming your project is now someone else's problem.

```
$ sep small audio plugin
Batteries Sold Separately  culture-style · batteries-sold-separately
  Brings the frame, you bring the power.
Patch Cable Spaghetti  culture-style · patch-cable-spaghetti
  Modular synth plugins.
Jaunty Jackdaw  alliterative-animals · jaunty-jackdaw
...

$ sep claim "Patch Cable Spaghetti" --project eurorack-sampler
Claimed "Patch Cable Spaghetti" for eurorack-sampler.
```

It does the boring parts: holding the lists, skipping names you've used, ranking by keywords, giving you the slug and PascalCase forms. Picking the name that *feels* right is left to you, or to Claude through the MCP server or skill.

## Install

```sh
npm i -g someone-elses-problem   # gives you `sep`
# or run it without installing
npx someone-elses-problem suggest
```

Node 20 or later.

## Commands

| Command | What it does |
| --- | --- |
| `sep [keywords...]` | Suggest 5 unused names. `-n 10` for more, `-s culture-style` for one system, `--seed my-project` for repeatable picks, `--json` for scripts. |
| `sep claim "<name>" -p <project>` | Mark a name as used. `--local` writes to `./.names.json` instead. |
| `sep unclaim "<name>"` | Free it again. |
| `sep used` | List used names. |
| `sep systems` | List naming systems. |
| `sep sync --github <owner>` | Treat your GitHub repo names as used. Set `GITHUB_TOKEN` to include private repos. |
| `sep sync --dir ~/Github` | Treat folder names in a directory as used. |
| `sep import names.md --used` | Add every name in a file to your used list. |
| `sep import names.md --as my-names` | Save a file of names as your own naming system. |
| `sep mcp` | Run as an MCP server over stdio. |

## Naming systems

| Id | Kind | Example |
| --- | --- | --- |
| `culture-style` | 193 original names in the Culture ship style | Mild Concern Noted |
| `culture-canon-sample` | 30 real Culture ship names, credited | Just Read The Instructions |
| `alliterative-animals` | Generated | Jaunty Jackdaw |
| `adjective-scientists` | Generated | eloquent_hopper |

### Bring your own list

`sep import` reads Markdown tables (it uses the Name column, plus Type/Class/Tags as tags and Notes/Comments as notes), bullet lists (`- Name: note`) or plain lines. The result is saved to `~/.config/someone-elses-problem/systems/<id>.json` and stays on your machine.

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

Names you claim live in `~/.config/someone-elses-problem/used.json` (or `$SEP_HOME/used.json`). A project can keep its own `.names.json` too; `sep` reads the nearest one above the current folder as well as the global one. Names are compared ignoring case, spaces and punctuation, so `Not Invented Here`, `not-invented-here` and `NotInventedHere` are the same name.

## Use it from Claude

### MCP server

Add to your Claude Code or Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "someone-elses-problem": { "command": "npx", "args": ["-y", "someone-elses-problem", "mcp"] }
  }
}
```

With Claude Code: `claude mcp add someone-elses-problem -- npx -y someone-elses-problem mcp`.

Tools: `suggest_names`, `claim_name`, `list_used`, `list_systems`. Claude asks for around 15 candidates, picks the few that fit the project it already knows about, explains why, and claims the one you choose.

### Skill

Copy `skill/naming-things/` into `~/.claude/skills/` (or your project's `.claude/skills/`). It uses the MCP tools or the CLI when available, and falls back to a short built-in list when neither is.

## Why the Culture

<!-- Draft: Matt, rewrite this in your own words. -->

I've loved Iain M. Banks' Culture novels for years. The books are funny, humane and huge in scope. The ships are the best characters in them: vast, wise, slightly smug Minds that pick their own names, like *So Much For Subtlety*, *Of Course I Still Love You* and *Just Read The Instructions*. Those names have quietly named a lot of my projects, and this tool is a small thank-you.

If you haven't read them, please do. *The Player of Games* is an easy way in, and *Use of Weapons* and *Excession* are where it gets properly brilliant. There are nine Culture novels and a story collection, starting with *Consider Phlebas* (1987) and ending with *The Hydrogen Sonata* (2012). Banks died in 2013, and the books are the best way to keep his ideas travelling.

## About the Culture names

The original Culture-style names in `culture-style` were written for this project and are MIT licensed. The 30 names in `culture-canon-sample` are Iain M. Banks' creative work, listed as a short fan reference. This project is not affiliated with the Banks estate. We don't ship the full canon list; if you have one, `sep import` it.

## Web page

`web/` holds the single-page name chooser (Next.js, static export). See [web/README.md](web/README.md).

## Develop

```sh
npm install
npm test        # vitest
npm run build   # tsup -> dist/
npm run dev -- small audio plugin
```

MIT licence.
