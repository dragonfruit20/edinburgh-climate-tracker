# Edinburgh climate tracker

A site that shows what the heat, the air and the rain are doing right now in Edinburgh, and matches verified local climate actions to those conditions.

Built with Claude Code, using Terra Studio's Build 2 reference (github.com/Terra-do/terra-studio-template-build-2) as a pattern — not copied wholesale.

## Stack
- Next.js (App Router) with TypeScript. Tailwind v4 via `@tailwindcss/postcss`. No UI library, no database.
- Hosted on Vercel later. Every push to `main` will redeploy.
- Live feeds are fetched on the server in `lib/feeds.ts` and cached with `next: { revalidate }`. Nothing is fetched from the browser.

## Files (filled in as we build)
- `data/city.json`: the city (name, lat/long, timezone) — Edinburgh.
- `data/verified.json`: actions that passed all three checks. The only actions the site shows.
- `data/flagged.json`: actions that failed a check, with a `flag_reason`. Shown on /how-its-checked, never as advice.
- `lib/types.ts`: the data schema. Don't change it without checking in first.
- `lib/feeds.ts`: one function per live feed (weather incl. rain, air, flood). Each returns `null` on failure. No keys by default.
- `lib/conditions.ts`: turns readings into levels (good/moderate/high/extreme) and conditions (`heat-high`, `air-high`, `flood-risk`...). Thresholds documented there.
- `app/page.tsx`: today's readings, matched actions, all actions, checks summary.
- `app/how-its-checked/page.tsx`: the three checks, feed sources, flagged entries.
- `components/`: header, condition panel, action card, client-side action browser.

## Rules
- The default feeds need no keys. If we add a feed that needs one, it lives in `.env.local` (git-ignored) and in Vercel's environment variables. Never in code, never in `NEXT_PUBLIC_*`.
- Feeds are server-side only. A feed that fails must degrade to an "unavailable" panel, never crash the page.
- Don't add a public AI/chat feature. This site has no runtime AI on purpose.
- Style with Tailwind classes only. Colour tokens are in `app/globals.css`; add new ones there rather than hardcoding hex values.
- Keep the schema. If a feature needs a new field, say so and stop.
- Run `npm run build` before pushing. Vercel runs the same build.

## Local
`npm install`, then `npm run dev` and open http://localhost:3000.

## Learning mode (for Claude, for the whole build)
The learner is building their own tracker from scratch, using Terra Studio's reference repo for patterns only.
- Before each step, say in two or three lines what you're about to do and why, then wait for the learner to say go.
- After each step, name the files you created or changed, and ask one short question that checks they understood the step (for example "Which file would you change to move the tracker to another city?"). Don't quiz more than once per step.
- If the learner asks you to just do it, do it, and still name what changed.
- Use the reference repo for the data schema, the feed pattern and the rules. Don't clone it or copy files wholesale; write the learner's code fresh and let their design differ.
- Use npm (the learner's choice). Tell them the command to start the dev server and let them run it in their own terminal.
