# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** When a user uploads a CALM architecture JSON (or points to one in a GitHub repo), CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard — and for repo-connected analyses, generate PRs with pipeline artifacts and compliance-remediated architecture files.

**Current focus:** v1.3 — Compliance Intelligence & CI Integration

## Current Position

Phase: 8 of 11 (Compliance Intelligence) — executing
Plan: 1 of 4 complete
Status: Plan 08-01 complete (compliance skill files), Plan 08-02 next
Last activity: 2026-02-25 — compliance intelligence skill files authored (4 skill files, 61 control IDs)

Progress: [█░░░░░░░░░] 10%

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 07-gitops-pr-generation | 01 | 15min | 3 | 10 |
| 07-gitops-pr-generation | 02 | 9min | 2 | 6 |
| 07-gitops-pr-generation | 03 | 5min | 2 | 5 |
| 08-compliance-intelligence | 01 | 3min | 3 | 4 |

## Accumulated Context

### Decisions

All v1.1 decisions logged in PROJECT.md Key Decisions table. All marked Good.
All v1.2 decisions logged in STATE.md archives and PROJECT.md. Phase 07 complete.

v1.3 decisions:
- Agentic skills over deterministic rules — faster to build, leverages existing skill loader, grounded compliance output
- calm-ai is complementary, not competitive — we're the compliance enforcement platform, they're the authoring tool
- Multi-version CALM via lenient parser — core schema stable 1.0-1.2, accept field aliases
- 3 PR buttons (DevSecOps CI, Compliance Remediation, Cloud Infra) — different review audiences and risk profiles
- Phases 8+9 parallelizable (Day 1), Phases 10+11 sequential (Day 2) — maximizes 2-day timeline
- SOC2 CC6/CC7 as highest CALM-signal criteria; CC1-CC5 are organizational (not CALM-observable)
- PROTOCOL-SECURITY.md cross-framework grounding (PCI-DSS + NIST CSF + SOC2) for maximum rationale authority
- Closed Control ID Reference tables with "CITE EXACTLY AS SHOWN" instruction to prevent LLM hallucination

### Pending Todos

- [ ] Update README with actual agent names and profiles (scout, ranger, arsenal, sniper) — `.planning/todos/pending/2026-02-25-update-readme-agent-names-profiles.md`
- [ ] Split GitOps into 3 PR buttons (DevSecOps CI, Compliance Remediation, Cloud Infra) — `.planning/todos/pending/2026-02-25-split-gitops-3-pr-buttons.md`

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-25 (Phase 08 Plan 01 execution)
Stopped at: Completed 08-01-PLAN.md — compliance skill files (SOC2.md, PROTOCOL-SECURITY.md, PCI-DSS appendix, NIST-CSF appendix)

---

*v1.3 Compliance Intelligence & CI Integration — roadmap created 2026-02-25*
