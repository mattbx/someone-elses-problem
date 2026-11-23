# Someone Else's Problem - design notes

Handoff for building the single-page name chooser. Read this together with:

- `globals.css` - the full theme: shadcn tokens, extra shades, fonts, type utilities
- `layout-snippet.tsx` - fonts via `next/font` and dark set as the default with `next-themes`
- The wireframe. Its numbered boxes are referred to here as (1)-(8). **Note: the layout has changed since the wireframe** - see section 5, which moves (4)-(6) out of the page.

Source: the theme and patterns are taken from registry.directory, read from its live CSS in Nov 2026.

---

## 1. Setup

```bash
npm i next-themes tw-animate-css motion
```

- Replace `app/globals.css` with the supplied `globals.css`.
- Merge `layout-snippet.tsx` into `app/layout.tsx`. It loads Schibsted Grotesk (sans) and IBM Plex Mono (mono), and puts `dark` on `<html>` so the page doesn't flash light on first load.
- Keep the shadcn convention: `:root` = light, `.dark` = dark. Dark is the default only because of `defaultTheme="dark"` and `enableSystem={false}`. Don't swap the selectors around.
- Add a theme toggle button in the header (sun-moon icon, see section 6). Light mode is a secondary option, not the main design.

---

## 2. Colour tokens and how to use them

The dark palette is stock shadcn "neutral". What makes it look like registry.directory is the **extra shades**, so use them on purpose:

| Utility | Dark value | Use it for |
|---|---|---|
| `bg-background` | `oklch(0.145 0 0)` | page background |
| `bg-surface` | `oklch(0.12 0 0)` | recessed areas: the input panel, drop zone, code/install panel. Slightly *darker* than the page |
| `bg-surface-elevated` | `oklch(0.2 0 0)` | hover states, selected rows, the phone bottom bar |
| `text-foreground` | `oklch(0.985 0 0)` | ship names, primary text |
| `text-foreground-secondary` | `oklch(0.82 0 0)` | body copy (they set it at `text-[13px]`) |
| `text-muted-foreground` | `oklch(0.708 0 0)` | labels, counts, meta |
| `text-foreground-subtle` | `oklch(0.45 0 0)` | separators like `·`, low-priority meta |
| `text-foreground-faint` | `oklch(0.35 0 0)` | placeholders, disabled |
| `border-border` | `oklch(1 0 0 / 10%)` | default card and panel borders |
| `border-border-subtle` | `oklch(0.3 0 0)` | inner dividers between rows |

Notes:
- It's fully monochrome. If one accent is needed (Claim button, shortlisted star), use `chart-1` / `sidebar-primary`, indigo `oklch(0.488 0.243 264.376)`. Use it in one or two places only.
- `--radius` is `0.625rem`.
- The wireframe's dashed boxes are sketch notation, not a style. Use solid `border-border` in the build.

---

## 3. Typography

Fonts: **Schibsted Grotesk** for UI and body, **IBM Plex Mono** for labels, metadata, slugs and the wordmark.

Custom utilities, values copied exactly from the site:

| Utility | Spec | Wireframe use |
|---|---|---|
| `type-section` | 24px (30px from `md`), 600, -0.02em, lh 1.15 | app title "Someone Else's Problem" (1) |
| `type-title` | 18px, 600, -0.02em, lh 1.3 | ship name on each name card (3). Can go bigger if the names need more weight |
| `type-card` | 14px, 600, -0.02em, lh 1.35 | rows in Shortlist (4) and Already used (5) |
| `type-label` | mono, 10px, uppercase, 0.08em tracking | section eyebrows: "WHAT ARE YOU NAMING?", "5 UNUSED NAMES", "SHORTLIST", "ALREADY USED (27)", "BRING YOUR OWN LIST", "USE IT WHERE YOU WORK", "WHY THE CULTURE" |
| `type-meta` | mono, 11px, lh 1.45 | "culture-style · matched: audio, plugin", usage tags ("VCV plugin", "github"), slug chips |

Other sizes seen on the site:
- Body / descriptions: `text-[13px] text-foreground-secondary`
- Buttons: 12px, weight 500
- Counts: `text-[11px] text-muted-foreground tabular-nums`
- Wordmark: `font-mono text-lg font-semibold tracking-[-0.02em]`. Worth trying for the header in (1) as a mono wordmark instead of `type-section`.
- Tagline under the wordmark: mono 14px, `text-muted-foreground`

---

## 4. Patterns to borrow

### Install panel -> "Use it where you work" (7)
On the registry pages, the install command sits in a small card:
- `type-label` header ("INSTALL") with a copy icon button on the right
- body on `bg-surface`, mono, a dim `$` before the command, the command wrapped with `\`
- a dim `# comment` line underneath

Use one of these each for CLI and MCP config. Rough shape:

```tsx
<div className="rounded-lg border">
  <div className="flex items-center justify-between border-b px-3 py-2">
    <span className="type-label text-muted-foreground">CLI</span>
    <CopyButton value={cmd} />
  </div>
  <pre className="bg-surface px-3 py-3 font-mono text-[13px] leading-relaxed">
    <span className="text-foreground-subtle">$ </span>{cmd}
    {"\n"}<span className="text-foreground-subtle"># {comment}</span>
  </pre>
</div>
```

For syntax highlighting of longer snippets (MCP JSON), the site uses **Shiki** with the `github-dark` theme.

### Copy chips -> case variants on name cards (3)
Block pages show the item ID in a bordered mono chip with a copy icon. Use the same for `patch-cable-spaghetti` / `PatchCableSpaghetti` / `patch_cable_spaghetti`: `type-meta`, `border`, `rounded-md`, click copies, the icon swaps copy -> check for ~1.5s.

### Sticky input (2)
The site's search bar stays pinned and has a height token, `--sticky-search-h: 4.875rem` (already in `globals.css`). Use the same idea if "What are you naming?" stays pinned while the name cards scroll. Sticky offsets can use `top-[var(--sticky-search-h)]`.

### Filter tabs vs chips (2)
For sort/filter, registry.directory uses plain text tabs (Popular / Stars / Recently active) next to a single "All types" dropdown. The wireframe uses chips for sources (Culture-style, Culture canon, Animals, Scientists, My list +). Chips are fine at this count. If the source list grows, switch to the tabs + dropdown pattern so it stays calm.

### Bottom status bar -> phone bar
Block pages end in a slim full-width bar: item count on the left, a row of small "open in" links, all 11-12px muted. It's a good model for the phone bar, which is now just "Shortlist (2) · Used (27)" and opens the sheet (section 5): `bg-surface-elevated`, `border-t`, small text, counts in `tabular-nums`.

### Cards
Card titles use `type-card`, descriptions are 13px `text-foreground-secondary` with `line-clamp-2`, meta rows are 11px muted with `·` separators in `text-foreground-subtle`. Buttons inside cards are small (12px/500) and full width at the bottom.

---

## 5. Layout change: Shortlist and Used live in a floating sheet

The wireframe shows sections 4-6 as a permanent right column. **Don't build it that way.** It makes the page feel busy. Instead:

- **Main page = header (1) + input (2) + name cards (3) + "Use it where you work" (7) + "Why the Culture" (8).** That's all that's visible by default.
- **Shortlist (4) and Already used (5)** move into **one sheet with two tabs**.
- **Bring your own list (6)** moves behind the **"My list +" chip** in the source row (2). Clicking it opens a small dialog (or popover) with the drop zone and the user's saved lists. The upload then sits right next to where the list gets used.

### Opening the sheet
- Desktop: two quiet buttons in the header, "Shortlist 2" and "Used 27" (counts in `tabular-nums`). Each one opens the same sheet with its own tab selected.
- Phone: the bottom bar ("Shortlist (2) · Used (27)") opens it the same way.

### Feedback while the sheet is closed
Starring a name happens on the main page while the shortlist is hidden, so it needs visible feedback:
- the Shortlist count in the header / bottom bar updates, with a small scale "bump" (skip the bump when reduced motion is on)
- optional: a `sonner` toast, "Added to shortlist", with an Undo action

### Visual spec: floating sheet on desktop
Based on the visuals of ReUI's sheet-8 (a Pro block, so only its look is used here, not its code). Build it by restyling the stock shadcn `Sheet`:

| Property | Value |
|---|---|
| Position | right side, **inset 16px** from top, right and bottom (`inset-y-4 right-4 left-auto`) |
| Size | `h-[calc(100svh-2rem)]`, `w-[min(32rem,calc(100vw-2rem))]` (512px max), clear the stock `max-w-sm` |
| Shape | `rounded-xl` (about 14px), `overflow-hidden`, `p-0 gap-0`, `flex flex-col` |
| Surface | one step lighter than the page: `bg-surface-elevated` (0.2 vs the page's 0.145) |
| Edge | 1px `border` (white at 10%) all round, since it's floating now, not attached to the edge |
| Shadow | soft and small, like Tailwind `shadow-lg`. The surface contrast does most of the work |
| Overlay | very light: `bg-black/10` plus `backdrop-blur-[4px]`. The page stays readable behind it |
| Motion | fade + short slide, about **2.5rem from the right**, not a full-width slide. With tw-animate-css: `data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-10` and the matching `fade-out-0 slide-out-to-right-10` on close |

Inside the sheet:
- **Header**, about 48px tall: the tabs (Shortlist / Used) on the left, a close `x` on the right, `border-b` underneath. 14px, weight 500.
- **Body**: scrolls on its own (`ScrollArea` or `flex-1 overflow-y-auto`). The list rows use `type-card`, meta uses `type-meta`, dividers use `border-border-subtle`. Section headings inside, if any, are 16px/500 (sheet-8 uses that for "Delivery" / "Routing"). `type-label` also works if you want them to match the main page.
- **Footer**, sticky: `border-t`, padding `16px 20px`, a slightly lighter band (`bg-muted/50`). Two buttons side by side, 32px tall, `rounded-[10px]`, 14px:
  - Shortlist tab: "Copy all" (outline) + "Export" (primary)
  - Used tab: "Sync GitHub" (outline) + "Import" / "Export" (a menu or two buttons)
  - The search field for Used goes at the top of the body, not the footer.

**Implementation tip:** rather than fighting the stock classes from outside with `className`, add a `floating` variant inside the project's `components/ui/sheet.tsx`. The stock right-side classes (`inset-y-0 right-0 h-full border-l sm:max-w-sm`, plus the full-width slide) don't all get overridden cleanly by `tailwind-merge`, especially the `data-[side=...]` ones in newer shadcn versions.

### Phone
Same component and tabs, but `side="bottom"`: full width, `rounded-t-xl`, `max-h-[85svh]`, no side inset, opened from the bottom bar. The same header / scrolling body / sticky footer structure applies.

---

## 6. Animated icons (pqoqubbw/icons)

MIT licensed, Lucide-based, animated with `motion`. 468 icons. Install one at a time through the shadcn CLI:

```bash
npx shadcn@latest add https://icons.pqoqubbw.dev/r/<icon-name>.json
```

Suggested picks (all confirmed to exist in the repo):

| Action | Icon |
|---|---|
| Reroll | `refresh-cw` |
| Copy slug / command | `copy`, then `check` |
| Suggest | `sparkles` |
| Sync GitHub | `github` (or `refresh-ccw` for the sync action itself) |
| Import / Export | `upload` / `download` |
| Search used names | `search` |
| Remove from shortlist | `x` |
| Theme toggle | `sun-moon` (or `sun` / `moon`) |
| CLI section | `terminal` |
| Add list | `plus` |
| Bring your own list | `file-text` |
| Optional flavour | `ship`, `rocket`, `telescope` |

**Watch out:**
- **There is no `star` icon.** For the shortlist star, either use the static `Star` from `lucide-react` (filled when shortlisted), or use `bookmark` / `bookmark-check` from this set and call it "save".
- Default `size` is **28**. Pass `size={16}` (or 14) for buttons.
- By default the icon animates when its *own wrapper div* is hovered. To animate when the whole button is hovered, give the icon a `ref` and call it from the button:

  ```tsx
  const iconRef = useRef<RefreshCWIconHandle>(null)
  <Button
    onMouseEnter={() => iconRef.current?.startAnimation()}
    onMouseLeave={() => iconRef.current?.stopAnimation()}
  >
    <RefreshCWIcon ref={iconRef} size={16} /> Reroll
  </Button>
  ```

  (The handle type is exported from each icon file. The names vary a bit between files, so check the exported interface in the file you installed.)
- They don't check `prefers-reduced-motion`. Wrap the app in `<MotionConfig reducedMotion="user">` from `motion/react`.
- Each icon needs `@/lib/utils` (`cn`), which shadcn already gives you.

---

## 7. Alternate themes (reference only)

Don't install these on top of the main theme. They're here in case the plain look feels too stock later.

- **Cuelark theme** - adds success/warning/signal colours, density-based control sizes, shadows, crop marks, dashed rules, labels and `kbd` styles. The dashed rules echo the wireframe boxes.
  `npx shadcn@latest add @cuelark/theme` (needs the `@cuelark` registry set up in `components.json`, see ui.cuelark.com)
- **SMUI SpaceMolt theme** - Nord-style terminal look: all monospace, zero border radius, frost-blue accent on dark blue-grey. The most "spaceship console" option.
  `npx shadcn@latest add https://smui.statico.io/r/spacemolt-theme.json`

---

## 8. Wireframe quick map

| # | Section | Key styling |
|---|---|---|
| 1 | Header | mono wordmark or `type-section`, mono tagline muted, CLI/MCP/GitHub as small outline badges. On the right: "Shortlist 2" and "Used 27" buttons that open the sheet, then the theme toggle |
| 2 | Input | `type-label` eyebrow, input + primary Suggest button, source chips (selected = `bg-secondary`, unselected = outline). "My list +" opens the bring-your-own-list dialog |
| 3 | Name cards | `type-label` "5 UNUSED NAMES" + Reroll (`refresh-cw`), each card: `type-title` name, star/save + Claim, `type-meta` source line, copy chips for case variants |
| 4 | Shortlist | **in the sheet**, tab 1. `type-card` rows, small muted actions (share, `x`), `border-border-subtle` between rows, footer: Copy all / Export |
| 5 | Already used | **in the sheet**, tab 2. Search at the top of the body, rows with `type-card` name and `type-meta` usage tag on the right, footer: Sync GitHub / Import / Export |
| 6 | Bring your own list | **behind the "My list +" chip**, in a small dialog. Drop zone on `bg-surface`, dashed border is OK here because a drop zone is a real affordance |
| 7 | Use it where you work | install panel pattern (section 4) for CLI and MCP |
| 8 | Why the Culture | short body copy, 13px `text-foreground-secondary` |
| - | Phone bar | "Shortlist (2) · Used (27)", status bar pattern, `bg-surface-elevated`, `border-t`, counts `tabular-nums`. Opens the sheet from the bottom |
