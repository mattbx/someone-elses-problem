---
name: naming-things
description: Suggest working-title names for a new project, repo, tool or feature from themed naming systems (Culture-style ship names and others), skipping names the user has already used. Use when the user asks for a name, a working title, or is creating a new project or repo that has no name yet.
---

# Naming things

Help the user pick a working title that fits the project and that they haven't used before.

## 1. Get candidates

Use the first of these that works:

1. **MCP tools** (`suggest_names`, `claim_name`, `list_used`, `list_systems`) if the naming-things-is-hard MCP server is connected.
2. **CLI**: `npx -y naming-things-is-hard suggest <keywords> -n 20 --json` (add `-s <system-id>` to pick a system; `ntih systems` lists them).
3. **No tools available**: use the fallback list at the end of this file, and check `~/.config/naming-things/used.json` and the project's `.names.json` (if you can read files) for names already used.

Pass keywords that describe the project: what it does, its size, its mood ("small audio plugin, experimental"). Ask for about 20 candidates.

## 2. Choose and present

From the candidates, choose 3 to 5 that genuinely fit. Favour names whose meaning or tone suits the project, not just tag matches. For each, give:

- the name, and the slug it would use (`mild-concern-noted`)
- one short line on why it fits

If the user named a system ("give me a Culture ship name"), stay inside it. Otherwise a mix is fine. Never present a name that appears in the used list.

## 3. Claim the pick

When the user picks one, record it so it isn't suggested again: call `claim_name` with the name and what it's for, or run `npx -y naming-things-is-hard claim "<name>" --project <what>`. If neither is available, tell the user to add it to their used list.

## Fallback list (Culture-style, original)

Mild Concern Noted · Strictly Speaking, Optional · Working Title, Provisionally · Reasonable Under The Circumstances · Quietly Confident · Some Assembly Required · Batteries Sold Separately · Measure Twice · Built In A Weekend · Second Opinion · Considered Response · Fine, I'll Do It Myself · Sounded Good At The Time · Signal Over Noise · Unexpected Harmonics · Polite Feedback Loop · Ease In, Ease Out · Pleasing Gradient · Teardown Before Breakfast · Show Your Working · Tidied Up Nicely · Works On My Machine · Caching Intensifies · Eventually Consistent · Gentle Reminder · Says What It Does · Surprisingly Load Bearing · Tiny But Essential · Robot With Manners · Playground Of Variables · Cabinet Of Curiosities
