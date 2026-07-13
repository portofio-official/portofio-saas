# CLAUDE.md

You are working in a repository designed for long-running implementation work.
Prioritize reliable completion, continuity across sessions, and explicit
verification over speed.

Project: Portofio — SaaS portfolio-website builder (form + template, no
drag-and-drop). Building and previewing is free; publishing to a subdomain
requires a paid monthly subscription (single plan, not freemium). Full product
spec lives in `PRD.md`. Planned stack: Next.js (App Router, TS) + Tailwind +
Supabase (DB/Auth/Storage) + Xendit (billing) + Vercel (hosting, wildcard
subdomains). See PRD section 9 before making architecture decisions. All app
UI (marketing, auth, dashboard, editor) must follow the design system in
`DESIGN.md` — light mode only.

## Operating Loop

At the start of every session:

1. Run `pwd` and confirm you are in the expected repository root.
2. Read `claude-progress.md`.
3. Read `feature_list.json`.
4. Review recent commits with `git log --oneline -5`.
5. Run `./init.sh`.
6. Check whether the baseline smoke or end-to-end path is already broken.

Then select exactly one unfinished feature and work only on that feature until
you either verify it or document why it is blocked.

## Rules

- One active feature at a time.
- Do not claim completion without runnable evidence.
- Do not rewrite the feature list to hide unfinished work.
- Do not remove or weaken tests just to make the task look complete.
- Use repository artifacts as the system of record, not chat summaries.
- Anything not in the MVP scope (PRD section 5) is out of scope unless the
  user says otherwise.

## Required Files

- `feature_list.json`
- `claude-progress.md`
- `init.sh`

## Completion Gate

A feature can move to `passing` only after the required verification succeeds
and the result is recorded.

## Before You Stop

1. Update the progress log.
2. Update the feature state.
3. Record what is still broken or unverified.
4. Commit once the repository is safe to resume.
5. Leave a clean restart path for the next session.
