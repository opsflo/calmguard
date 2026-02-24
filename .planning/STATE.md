# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-24)

**Core value:** When a user uploads a CALM architecture JSON (or points to one in a GitHub repo), CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard — and for repo-connected analyses, generate PRs with pipeline artifacts and compliance-remediated architecture files.

**Current focus:** v1.2 — GitOps PR Generation

## Current Position

Phase: 7 — GitOps PR Generation
Status: In progress — 07-02 complete, ready for 07-03
Last activity: 2026-02-24 — Plan 07-02 fully complete (2 tasks, pipeline PR generation end-to-end)

Progress: [######░░░░] 66% (2/3 plans complete)

## Accumulated Context

### Decisions

All v1.1 decisions logged in PROJECT.md Key Decisions table. All marked ✓ Good.

v1.2 decisions (resolved during 07-01 execution):
- GITHUB_TOKEN server-side only — client uses dual status gate endpoint (enabled + authEnabled flags)
- GitHub tab is always visible — public repos work without auth; GITHUB_TOKEN only needed for PR generation (Plans 02/03)
- PRRecord interface in github/types.ts (not store) to prevent circular imports with Plans 02/03
- Pre-filled demo: finos-labs/dtcch-2026-opsflow-llc / examples/payment-gateway.calm.json
- gitHubAuthEnabled added to Zustand store for downstream PR button gating without re-fetching

v1.2 decisions (resolved during 07-02 execution):
- GitHub Git Data API (blobs/trees/commits) used for atomic multi-file commits — not Contents API (which is one file at a time)
- globals.ts centralizes declare global blocks — imported by both analyze/route.ts and create-pr/route.ts for shared type declarations
- Branch name format: `calmguard/pipeline-{Date.now()}` — timestamp ensures uniqueness
- Remediation PR section renders with onGenerate=undefined (not a function) — disables button cleanly without triggering error state

### Pending Todos

None.

### Blockers/Concerns

None — Plan 07-02 complete, ready for Plan 07-03.

## Session Continuity

Last session: 2026-02-24 (Plan 07-02 completion — pipeline PR end-to-end)
Stopped at: Completed 07-02-PLAN.md — ready to start 07-03
Resume file: .planning/phases/07-gitops-pr-generation/07-03-PLAN.md

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 07-gitops-pr-generation | 01 | 15min | 3 | 10 |
| 07-gitops-pr-generation | 02 | 9min | 2 | 6 |

---

*v1.2 GitOps PR Generation — milestone started 2026-02-24*
