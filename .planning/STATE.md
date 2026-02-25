# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** When a user uploads a CALM architecture JSON (or points to one in a GitHub repo), CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard — and for repo-connected analyses, generate PRs with pipeline artifacts and compliance-remediated architecture files.

**Current focus:** v1.3 — Compliance Intelligence & CI Integration

## Current Position

Phase: 9 of 11 (Multi-Version CALM) — complete
Plan: 2 of 2 complete (09-01 normalizer+parser done; 09-02 store+UI done)
Status: Phase 9 complete. All multi-version CALM support wired end-to-end.
Last activity: 2026-02-25 — 09-02 executed (store calmVersion, setCalmData call sites, header badge, v1.0 demo)

Progress: [████░░░░░░] 40%

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 07-gitops-pr-generation | 01 | 15min | 3 | 10 |
| 07-gitops-pr-generation | 02 | 9min | 2 | 6 |
| 07-gitops-pr-generation | 03 | 5min | 2 | 5 |
| 08-compliance-intelligence | 01 | 3min | 3 | 4 |
| 08-compliance-intelligence | 02 | 3min | 2 | 5 |
| 09-multi-version-calm | 01 | 8min | 2 | 7 |
| 09-multi-version-calm | 02 | 10min | 2 | 9 |

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
- [Phase 09-multi-version-calm]: Pre-Zod normalization pattern: transform raw JSON before Zod sees it, keeping schema canonical v1.1 with normalizer handling v1.0 quirks
- [Phase 09-multi-version-calm]: Lenient CALM v1.0 mapping: unknown node types to service, unknown rel types to connects — maximizes compatibility with real-world v1.0 documents
- [Phase 09-multi-version-calm]: setCalmData accepts optional version parameter to avoid breaking all call sites; API boundary consumers cast version string to CalmVersion type
- [Phase 09-multi-version-calm]: CALM version badge uses neutral slate styling — no warnings for v1.0, consistent with locked CONTEXT.md decision

### Pending Todos

- [ ] Update README with actual agent names and profiles (scout, ranger, arsenal, sniper) — `.planning/todos/pending/2026-02-25-update-readme-agent-names-profiles.md`
- [ ] Split GitOps into 3 PR buttons (DevSecOps CI, Compliance Remediation, Cloud Infra) — `.planning/todos/pending/2026-02-25-split-gitops-3-pr-buttons.md`

### Roadmap Evolution

- Phase 8.1 inserted after Phase 8: Compliance Learning Engine (URGENT) — already implemented and merged from separate branch (23 files, 2,355 lines, 64 tests). Needs verification only.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-25 (Phase 9, Plan 2 execution)
Stopped at: Completed 09-02-PLAN.md — store calmVersion field, all setCalmData call sites, header badge, v1.0 demo. Phase 9 complete.

---

*v1.3 Compliance Intelligence & CI Integration — roadmap created 2026-02-25*
