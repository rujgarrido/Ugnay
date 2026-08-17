# Contributing / Workflow Notes

Solo-developer project — this doc records the lightweight process used, mainly
for portfolio/interview explainability.

## Branching
- `main` is always deployable.
- Work happens on `feature/*`, `fix/*`, `chore/*`, or `docs/*` branches.

## Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add JWT login endpoint
fix: cascade delete tasks on board removal
docs: update api.md for tasks
chore: configure eslint and prettier
```

## Pull Requests
Even solo, every feature branch goes through a PR into `main` before merging,
so CI runs and there's a reviewable history. Squash-merge to keep `main` clean.

## Definition of Done
See `docs/sprint-plan.md` for the full per-feature Definition of Done checklist.
