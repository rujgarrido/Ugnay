# TaskFlow — Database Design

> Status: complete — reflects the schema already migrated via
> `npx prisma migrate dev --name init`. See `server/prisma/schema.prisma`
> for the authoritative source; this doc is the human-readable companion.

## Entities

| Entity | Purpose |
|---|---|
| `User` | A global account — one person, can belong to multiple organizations |
| `RefreshToken` | One row per issued refresh session; rotated on use, enables real logout/revocation |
| `Organization` | A student org — the top-level tenant everything else belongs to |
| `OrganizationMember` | A user's membership in one specific org, with exactly one `Position` |
| `Position` | An org-defined role label (President, Secretary, etc.) — a bundle of permissions, not hardcoded |
| `Permission` | A global, system-defined capability code (e.g. `CREATE_TASK`) — never org-specific |
| `PositionPermission` | Join table: which permissions a given Position grants |
| `Committee` | A sub-team within an org (e.g. Logistics Committee) |
| `CommitteeMember` | Join table: which org members belong to which committees, and who's Head |
| `Project` | A body of work an org is organizing (e.g. "Foundation Day 2026") |
| `Task` | A single unit of work inside a project, tracked on the Kanban board |
| `Proposal` | An event proposal moving through the tracked approval workflow |
| `ProposalSignature` | One required signatory on a proposal, tracked `PENDING`/`COMPLETED` |
| `ActivityLog` | Append-only record of significant actions across an org |

## ERD

Full field-level diagram generated from `schema.prisma` — see the ERD rendered
earlier in this conversation (mermaid `erDiagram`, all 14 tables with fields
and keys). To regenerate it yourself later: paste `schema.prisma`'s models
into a mermaid `erDiagram` block, or run `npx prisma-erd-generator` if added
as a dev dependency.

## Relationships & Cardinality

| Relationship | Cardinality | Notes |
|---|---|---|
| User → RefreshToken | 1 — N | One user can have many active/expired sessions |
| User → OrganizationMember | 1 — N | One user, memberships in many orgs |
| Organization → OrganizationMember | 1 — N | |
| Organization → Position | 1 — N | Positions are org-scoped, not global |
| Position → OrganizationMember | 1 — N | A member has exactly **one** primary Position (MVP constraint) |
| Position ↔ Permission | N — N (via `PositionPermission`) | A position can grant many permissions; a permission can belong to many positions across different orgs |
| Organization → Committee | 1 — N | |
| OrganizationMember ↔ Committee | N — N (via `CommitteeMember`) | A member can belong to multiple committees; a committee has multiple members. `isHead` flag lives on the join row, not a separate table |
| Organization → Project | 1 — N | |
| Project → Task | 1 — N | A task belongs to exactly one project |
| OrganizationMember → Task | 1 — N (nullable) | One member can be assignee on many tasks; a task has at most one assignee — **not** many-to-many (single-assignee constraint, MVP decision) |
| Organization → Proposal | 1 — N | |
| Project → Proposal | 1 — N (optional) | A proposal may or may not belong to a project |
| Proposal → ProposalSignature | 1 — N | |
| Organization → ActivityLog | 1 — N | |

**Deliberately NOT modeled** (decisions made during Phase 3, not oversights):
- No `ProjectMember` join table — project access resolves from org membership + `visibility` field, not explicit membership rows.
- No `CommitteePermission` table — Committee Head is an ownership/scope check in the service layer, not a second permission-granting relationship.
- `Task.assigneeId` is a single nullable FK, not a many-to-many join — multiple assignees per task is out of MVP scope.