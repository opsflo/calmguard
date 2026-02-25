# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** When a user uploads a CALM architecture JSON (or points to one in a GitHub repo), CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard — and for repo-connected analyses, generate PRs with pipeline artifacts and compliance-remediated architecture files.

**Current focus:** v1.3 — Compliance Intelligence & CI Integration

## Current Position

Phase: 9 of 11 (Multi-Version CALM) — context gathered, ready for planning
Plan: 0 of ? (not yet planned)
Status: Phase 8.1 UAT complete (4/6 passed, 2 skipped). Phase 9 CONTEXT.md written with all decisions.
Last activity: 2026-02-25 — Phase 9 discuss-phase complete, context captured for multi-version CALM parser

Progress: [██░░░░░░░░] 20%

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 07-gitops-pr-generation | 01 | 15min | 3 | 10 |
| 07-gitops-pr-generation | 02 | 9min | 2 | 6 |
| 07-gitops-pr-generation | 03 | 5min | 2 | 5 |
| 08-compliance-intelligence | 01 | 3min | 3 | 4 |
| 08-compliance-intelligence | 02 | 3min | 2 | 5 |

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
- SOC2 added to both frameworkMappings and frameworkScores enums simultaneously to maintain schema consistency
- PROTOCOL SECURITY KNOWLEDGE block placed before ORIGINAL CALM DOCUMENT in remediator prompt (mirrors compliance-mapper pattern)
- control-matrix.tsx local interface updated inline with Zod enum rather than importing from agent

### Pending Todos

- [ ] Update README with actual agent names and profiles (scout, ranger, arsenal, sniper) — `.planning/todos/pending/2026-02-25-update-readme-agent-names-profiles.md`
- [ ] Split GitOps into 3 PR buttons (DevSecOps CI, Compliance Remediation, Cloud Infra) — `.planning/todos/pending/2026-02-25-split-gitops-3-pr-buttons.md`

### Roadmap Evolution

- Phase 8.1 inserted after Phase 8: Compliance Learning Engine (URGENT) — already implemented and merged from separate branch (23 files, 2,355 lines, 64 tests). Needs verification only.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-25 (Phase 9 context gathering)
Stopped at: Phase 9 discuss-phase complete — CONTEXT.md written with version detection, schema differences, display, and backward compatibility decisions. Next: /gsd:plan-phase 9

---

*v1.3 Compliance Intelligence & CI Integration — roadmap created 2026-02-25*
