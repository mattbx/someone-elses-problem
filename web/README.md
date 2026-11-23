# Web page

The single-page name chooser. Next.js (static export), Tailwind v4, shadcn-style components on Base UI. It imports the naming core straight from `../src`, so the page and the CLI always suggest from the same systems.

```sh
cd web
npm install
npm run dev     # http://localhost:3000
npm run build   # static site in web/out
```

Design notes, theme and the layout snippet it was built from are in `../design/`.

Everything the visitor does (used names, shortlist, their own lists) stays in their browser's localStorage. The used-names export is the same JSON as the CLI's `~/.config/someone-elses-problem/used.json`.
