# Sculptor

A personal muscle-map training app for iPhone, served as one static HTML file.

## Build step

`index.html` is **generated** — never edit it by hand, or the next build silently
discards the change. Edit the files in `src/`, then:

```sh
python3 build.py
```

`build.py` inlines every source file into a single `index.html`: the CSS into one
`<style>`, the JavaScript into two `<script>` blocks, and `src/icon.svg` into the
head as a `data:` URI favicon. There is no bundler, no package.json and no install
step. The only runtime dependency fetched over the network is three.js from
jsDelivr, used by the 3D form viewer.

Commit `index.html` along with the `src/` change that produced it — GitHub Pages
serves the built file directly.

## File layout

| File | What it holds |
| --- | --- |
| `src/config.js` | Supabase project URL and anon key |
| `src/supabase.js` | `SB` — a small GoTrue + PostgREST client over `fetch` |
| `src/core.js` | Body map geometry, muscles, exercise library, strength standards, `Store`, scoring |
| `src/ui.js` | Body and Progress tabs, sheets, logging, settings, account UI, theme |
| `src/mind.js` | Mind tab, skills and drills, breathing session |
| `src/form3d.js` | 3D form viewer (three.js) |
| `src/app.css`, `src/form3d.css` | Styles |
| `src/icon.svg` | App icon, inlined as the tab favicon |
| `icon-180.png` | iOS home-screen icon, generated from `src/icon.svg` |
| `supabase.sql` | Schema, row-level security and the signup trigger |

Script order in the built page matters: `config.js` → `supabase.js` → `core.js` →
`ui.js` → `mind.js`. `core.js` calls `refresh()` and `toast()`, which `ui.js`
defines later in the same script block — that works only because of function
hoisting, so keep them in one block.

## Store modes

`Store.mode` decides where a write goes. All four write paths — `addSets`,
`addMind`, `delSet`, `saveProfile` — branch on it:

- `local` — `localStorage`, one JSON blob under `muscle-atlas.v1`. The default.
- `supabase` — the signed-in account, via REST. Set by `Store.signedIn()`.
- `cloud` — the Claude artifact runtime (`window.claude.use('db')`), used when the
  page runs inside Claude rather than on GitHub Pages.

A signed-in Supabase session takes precedence over the other two at boot.

Signing in does **not** clear the local blob, and `supabase` mode never writes to
it. That is deliberate: signing out restores whatever this browser already had,
and it is what makes the first-sign-in upload offer meaningful.

## Data shapes

The table columns mirror the in-app objects, so the mapping is near one-to-one.
Two mismatches are handled explicitly in `core.js`, in the `*FromRow` / `*ToRow`
helpers:

- Empty numeric fields are `undefined` in the app but `null` in Postgres.
- `t` is `Date.now()` epoch milliseconds, stored as `bigint`.

`profiles` is keyed on `id` (the auth user id) with no `user_id` column;
`sets` and `mind` both carry `user_id`. Every `id` is a `uuid`.

## Supabase notes

The anon key in `src/config.js` is a public client key and belongs in the page.
Every table has row-level security pinning rows to `auth.uid()`, so the key alone
reaches no data. Never put the `service_role` key in `src/`.

Email confirmation is on for this project (`mailer_autoconfirm: false`), so
`signUp` returns a user but **no session** — the UI has to route to the "confirm
your email" sheet rather than straight into the app.
