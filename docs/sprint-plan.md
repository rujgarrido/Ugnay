# Ugnay — Sprint Plan

See Ugnay-Backlog.md for the full epic/story breakdown with acceptance criteria.
This file is the living/working version — update goals, tasks, and Definition
of Done here as sprints progress.

## Sprint 1 — Foundation (Days 1–5)
- **Goal:** A deployed skeleton where a real user can register, log in, create an organization, and land in a correctly-permissioned RBAC context — nothing fake, nothing stubbed.
- **Deliverable:** Epic 1 (Walking Skeleton & Auth) + Epic 2 (Organization & RBAC Core) fully done, deployed to Vercel/Render/Neon, plus the start of Epic 3 (Project CRUD backend) if time allows on Day 5.
- **Definition of Done:**
  - [ ] `server/` and `webapp/` both live on Render/Vercel, talking to RDS AWS
  - [ ] Register → login → refresh → logout works end-to-end against the deployed URLs (cross-domain cookie verified for real, not just localhost)
  - [ ] `POST /organizations` runs the full seeding transaction — Positions, permissions, creator membership, activity log entry, all atomic
  - [ ] `resolveOrgContext` + `requirePermission` enforced on every `:orgId` route
  - [ ] Last-admin guard tested — demoting the sole `MANAGE_MEMBERS` holder is blocked
  - [ ] No-org empty state and org switcher exist in the frontend, however rough

## Sprint 2 — Core Domain (Days 6–10)
- **Goal:** The actual usable product — project/task management fully working end-to-end, plus the proposal-tracking differentiator if the Day 6 checkpoint says you're on schedule.
- **Deliverable:** Epic 3 finished (Projects, Tasks, Kanban), Epic 4 (Activity Log + Dashboard), and Epic 5 (Proposal Tracking) — Epic 5 only if the Day 6 checkpoint passes; otherwise this sprint becomes hardening time for Epics 3–4 instead.
- **Definition of Done:**
  - [ ] **Day 6 checkpoint evaluated first, explicitly** — login → create org → create project → drag a task across the board, deployed and clickable. Pass or cut Proposals/Committees per the backlog's cut list — don't silently slip.
  - [ ] Project CRUD + visibility filtering works without a `ProjectMember` table
  - [ ] Kanban board: create, assign, drag across all 5 statuses, reassignment gated by `ASSIGN_TASK` separately from general edit
  - [ ] Every task/project mutation writes an `ActivityLog` row in the same service call
  - [ ] Dashboard returns real counts (active projects, open/overdue/completed tasks, pending proposals)
  - [ ] If shipped: proposal status transitions enforced via `assertValidTransition()`, illegal jumps rejected with 409

## Sprint 3 — Polish, Deploy (Days 11–14)
- **Goal:** A tested, documented, demo-ready product — not more features, just proof the existing ones are solid.
- **Deliverable:** Epic 6 (Testing) and Epic 7 (Polish & Deployment Hardening) complete. README, architecture diagram, and a rehearsed 2-minute demo script exist.
- **Definition of Done:**
  - [ ] ~15–20 tests green: auth happy path, RBAC allow/deny across two positions, demoted-member's-old-JWT rejected, last-admin guard, cross-org 404 isolation, proposal transition table
  - [ ] Every endpoint's error responses match the taxonomy — same JSON envelope everywhere
  - [ ] Rate limiting on `/auth/login` and `/auth/register`; `npm audit` clean (or documented as accepted risk, per the dev-only exceptions already noted)
  - [ ] README works from a clean clone — someone who wasn't there can set this up and run it
  - [ ] "What I cut and why" section written — this is your interview answer, pre-written, not improvised
  - [ ] Demo script rehearsed at least once, out loud, against the actual deployed app