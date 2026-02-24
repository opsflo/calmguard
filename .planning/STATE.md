# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-24)

**Core value:** When a user uploads a CALM architecture JSON (or points to one in a GitHub repo), CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard — and for repo-connected analyses, generate PRs with pipeline artifacts and compliance-remediated architecture files.

**Current focus:** v1.2 — GitOps PR Generation

## Current Position

Phase: 7 — GitOps PR Generation
Status: In progress — 07-01 complete, ready for 07-02
Last activity: 2026-02-24 — Plan 07-01 fully complete (Tasks 1-2 + post-checkpoint design change)

Progress: [###░░░░░░░] 33% (1/3 plans complete)

## Accumulated Context

### Decisions

All v1.1 decisions logged in PROJECT.md Key Decisions table. All marked ✓ Good.

v1.2 decisions (resolved during 07-01 execution):
- GITHUB_TOKEN server-side only — client uses dual status gate endpoint (enabled + authEnabled flags)
- GitHub tab is always visible — public repos work without auth; GITHUB_TOKEN only needed for PR generation (Plans 02/03)
- PRRecord interface in github/types.ts (not store) to prevent circular imports with Plans 02/03
- Pre-filled demo: finos-labs/dtcch-2026-opsflow-llc / examples/payment-gateway.calm.json
- gitHubAuthEnabled added to Zustand store for downstream PR button gating without re-fetching

### Pending Todos

None.

### Blockers/Concerns

None — Plan 07-01 complete, ready for Plan 07-02.

## Session Continuity

Last session: 2026-02-24 (Plan 07-01 completion with post-checkpoint design change)
Stopped at: Completed 07-01-PLAN.md — ready to start 07-02
Resume file: .planning/phases/07-gitops-pr-generation/07-02-PLAN.md

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 07-gitops-pr-generation | 01 | 15min | 3 | 10 |

---

*v1.2 GitOps PR Generation — milestone started 2026-02-24*
