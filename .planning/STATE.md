# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-24)

**Core value:** When a user uploads a CALM architecture JSON (or points to one in a GitHub repo), CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard — and for repo-connected analyses, generate PRs with pipeline artifacts and compliance-remediated architecture files.

**Current focus:** v1.2 — GitOps PR Generation (COMPLETE)

## Current Position

Phase: 7 — GitOps PR Generation
Status: COMPLETE — all 3 plans done
Last activity: 2026-02-24 — Plan 07-03 fully complete (2 tasks, CALM remediation agent + remediation PR end-to-end)

Progress: [##########] 100% (3/3 plans complete)

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

v1.2 decisions (resolved during 07-03 execution):
- GitHub Contents API PUT used for remediation (single file) vs blob+tree+commit for pipeline (multi-file)
- readPRStream() helper extracted to DRY up duplicate SSE stream reading logic in GitOps card
- CALM enum constraints included in agent prompt retry messages to prevent validation failures on retry
- remediateCalm() called inside SSE stream (step 1) so progress is visible before GitHub ops

### Pending Todos

None.

### Blockers/Concerns

None — Phase 07 complete. v1.2 GitOps PR Generation milestone fully delivered.

## Session Continuity

Last session: 2026-02-24 (Plan 07-03 completion — CALM remediation PR end-to-end)
Stopped at: Completed 07-03-PLAN.md — Phase 07 complete

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 07-gitops-pr-generation | 01 | 15min | 3 | 10 |
| 07-gitops-pr-generation | 02 | 9min | 2 | 6 |
| 07-gitops-pr-generation | 03 | 5min | 2 | 5 |

---

*v1.2 GitOps PR Generation — milestone completed 2026-02-24*
