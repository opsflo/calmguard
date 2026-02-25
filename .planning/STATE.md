# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** When a user uploads a CALM architecture JSON (or points to one in a GitHub repo), CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard — and for repo-connected analyses, generate PRs with pipeline artifacts and compliance-remediated architecture files.

**Current focus:** v1.3 — Compliance Intelligence & CI Integration

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-02-25 — Milestone v1.3 started

Progress: [░░░░░░░░░░] 0%

## Accumulated Context

### Decisions

All v1.1 decisions logged in PROJECT.md Key Decisions table. All marked ✓ Good.
All v1.2 decisions logged in STATE.md archives and PROJECT.md. Phase 07 complete.

v1.3 decisions:
- Agentic skills over deterministic rules — faster to build, leverages existing skill loader, grounded compliance output
- calm-ai is complementary, not competitive — we're the compliance enforcement platform, they're the authoring tool
- Multi-version CALM via lenient parser — core schema stable 1.0-1.2, accept field aliases
- 3 PR buttons (DevSecOps CI, Compliance Remediation, Cloud Infra) — different review audiences and risk profiles

### Pending Todos

- [ ] Update README with actual agent names and profiles (scout, ranger, arsenal, sniper) — `.planning/todos/pending/2026-02-25-update-readme-agent-names-profiles.md`
- [ ] Split GitOps into 3 PR buttons (DevSecOps CI, Compliance Remediation, Cloud Infra) — `.planning/todos/pending/2026-02-25-split-gitops-3-pr-buttons.md`

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-25 (v1.3 milestone initialization)
Stopped at: Defining requirements for v1.3

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 07-gitops-pr-generation | 01 | 15min | 3 | 10 |
| 07-gitops-pr-generation | 02 | 9min | 2 | 6 |
| 07-gitops-pr-generation | 03 | 5min | 2 | 5 |

---

*v1.3 Compliance Intelligence & CI Integration — started 2026-02-25*
