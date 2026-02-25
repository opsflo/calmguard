# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** When a user uploads a CALM architecture JSON (or points to one in a GitHub repo), CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard — and for repo-connected analyses, generate PRs with pipeline artifacts and compliance-remediated architecture files.

**Current focus:** v1.3 — Compliance Intelligence & CI Integration

## Current Position

Phase: 10 of 11 (GitOps Split) — in progress
Plan: 2 of 3 complete (10-01 cloud-infra skill+generator done; 10-02 three-button UI + infraPR store done)
Status: Plan 10-02 complete. GitOpsCard has 3 buttons with concurrency lock. Plan 10-03 extends create-pr API for infra type.
Last activity: 2026-02-25 — 10-02 executed (PRRecord infra type, infraPR store, GitOpsCard 3-button layout, concurrency lock)

Progress: [████░░░░░░] 45%

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
| 10-gitops-split | 01 | 4min | 2 | 7 |
| 10-gitops-split | 02 | 2min | 2 | 3 |

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
- [Phase 10-01-gitops-split]: Cloud infra runs in Phase 1 parallel — only needs AnalysisInput, not Phase 2 results, so parallelism is free wall-clock time
- [Phase 10-01-gitops-split]: cloudInfraConfigSchema uses modules[] array (separate files: vpc.tf, ecs.tf, rds.tf) for production-realistic multi-file Terraform
- [Phase 10-01-gitops-split]: Every Terraform resource requires traceability entry — calmElement → generatedResource → rationale
- [Phase 10-gitops-split]: Explicit disabled prop on PRSection instead of overloading onGenerate === undefined — avoids conflating "coming soon" with "temporarily disabled during generation"
- [Phase 10-gitops-split]: isAnyGenerating derived at GitOpsCard level, passed down as disabled — single source of truth for concurrency lock
- [Phase 10-gitops-split]: Generating branch in PRSection renders unconditionally, ignoring disabled — active spinner never gets locked

### Pending Todos

- [ ] Update README with actual agent names and profiles (scout, ranger, arsenal, sniper) — `.planning/todos/pending/2026-02-25-update-readme-agent-names-profiles.md`
- [x] Split GitOps into 3 PR buttons (DevSecOps CI, Compliance Remediation, Cloud Infra) — completed in 10-02

### Roadmap Evolution

- Phase 8.1 inserted after Phase 8: Compliance Learning Engine (URGENT) — already implemented and merged from separate branch (23 files, 2,355 lines, 64 tests). Needs verification only.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-25 (Phase 10, Plan 1 formal execution)
Stopped at: Completed 10-01-PLAN.md — CLOUD-INFRASTRUCTURE.md skill, cloud-infra-generator agent, globalThis.__lastCloudInfraResult, orchestrator Phase 1 extended to 4 agents.

---

*v1.3 Compliance Intelligence & CI Integration — roadmap created 2026-02-25*
