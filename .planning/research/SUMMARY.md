# Project Research Summary

**Project:** CALMGuard v1.3 — Compliance Intelligence & CI Integration
**Domain:** CALM-native multi-agent AI compliance analysis with CI/CD integration
**Researched:** 2026-02-25 (supersedes 2026-02-15 greenfield summary)
**Confidence:** HIGH

## Executive Summary

CALMGuard v1.3 is an incremental milestone on an already-functional v1.2 system. The base stack — Next.js 14+, Vercel AI SDK, Zustand, Zod, React Flow, shadcn/ui — is production-validated and requires zero changes for v1.3. The four new capabilities are: (1) grounded compliance skill files with specific auditable control IDs, (2) multi-version CALM schema support (1.0–1.2), (3) a 3-button GitOps split separating DevSecOps CI / Compliance Remediation / Cloud Infra PRs, and (4) a GitHub Action for continuous compliance checking in customer repos. The critical architectural insight is that features 1 and 2 require no structural code changes — only content edits to `skills/*.md` files and schema-level extension in `types.ts`. Features 3 and 4 require coordinated changes across types, store, route, and component layers but are well-scoped.

The recommended build order is skills first (zero dependencies, immediate demo quality improvement), multi-version CALM second (parser-only change, transparent to agents), 3-button GitOps third (widest blast radius, schema-first order mandatory), and GitHub Action last (depends on headless API route stability). Skills and multi-version CALM can be parallelized against the GitOps split to maximize the 2-day remaining timeline. Zero new npm packages are required — all features are implemented through content changes, Zod schema extensions, one new Next.js API route, and one composite GitHub Action file.

The top risks are: LLMs hallucinating control IDs that do not exist in official frameworks (mitigated by closed control ID lists in skill files and post-generation regex validation), breaking the existing v1.1 parser when adding multi-version support (mitigated by `.passthrough()` and `.optional()` on all new fields), and state corruption when two PR buttons are clicked concurrently (mitigated by disabling all buttons during any active generation). With 2 days remaining on the hackathon timeline, the must-ship items are the 8 P1 features in FEATURES.md. Everything else goes on the deferred list.

## Key Findings

### Recommended Stack

The core stack is fully validated through v1.2 and requires no new packages for v1.3. All four new capabilities are implemented through content and schema changes, not new library dependencies. The only new file type addition is a composite GitHub Action (`action.yml`) which uses shell + the already-installed `@finos/calm-cli@1.33.0`.

**Core technologies:**
- **Next.js 14+ (App Router):** Full-stack framework with built-in SSE via ReadableStream. Node.js runtime (not Edge) required — already configured. No changes for v1.3.
- **Vercel AI SDK (`ai`):** `generateObject` with Zod schemas drives all 4 agents. Multi-provider support. The skill content improvements in v1.3 flow directly into agent prompt context — no SDK changes.
- **Zod 3.24+:** Runtime validation for CALM parsing and agent outputs. v1.3 change: add `.passthrough()` and `.optional()` fields to `calmDocumentSchema` — both available in current Zod 3.x.
- **Zustand 5.x:** Single store in `analysis-store.ts`. v1.3 adds `infraPR` state field and `setInfraPR` action — a one-field extension.
- **React Flow 12.10+:** Architecture visualization. No changes for v1.3.
- **`@finos/calm-cli` 1.33.0:** Already installed. The `--timeline` flag confirms v1.2 document support; CI validation via `calm validate` works out of the box.
- **Node.js 22 (LTS):** Correct target for GitHub Actions workflows. Node 20 is deprecated (EOL April 2026, GitHub Actions default switching to Node 24 on March 4, 2026).

**Zero new npm packages required for v1.3.** All changes are: skill file content, Zod schema extensions, one new Next.js API route (`/api/analyze/headless`), and one composite GitHub Action.

See [STACK.md](./STACK.md) for full stack documentation including pre-v1.3 technology choices and alternatives considered.

### Expected Features

Research identifies a clear P1/P2/P3 hierarchy for the 2-day remaining timeline.

**Must have (table stakes):**
- Specific control IDs in compliance output (PCI-DSS 4.0 Req N.N.N, NIST CSF 2.0 XX.YY-N, SOC2 CCN.N) — judges will probe specifics; vague framework references or hallucinated IDs destroy credibility
- SOC2 Type II skill file (`skills/SOC2.md`) — the most-requested enterprise compliance framework; its absence is a gap that a compliance-literate judge will flag
- Protocol security skill file (`skills/PROTOCOL-SECURITY.md`) — grounds the remediator's HTTP→HTTPS decisions with regulatory citations (PCI-DSS 4.0 Req 4.2.1, NIST CSF PR.DS-02)
- CALM v1.2 parser acceptance — v1.2 files exist in the wild; failing to parse them is a demo-blocking bug
- CALM version detection and display — "Analyzing CALM v1.2 architecture" badge shows technical depth at low implementation cost
- 3-button GitOps split (CI / Remediation / Infra) — cleaner demo narrative; judges can understand what each PR contains
- CI-only pipeline workflow — distinguishes CI gating from cloud deployment, important for security-conscious audiences
- GitHub Action compliance check template — answers "how do I use this in my own repo?" which is the first judge question after a positive demo

**Should have (differentiators):**
- Control-ID-specific appendix tables in existing PCI-DSS.md and NIST-CSF.md skill files (improves agent citation quality from framework names to auditable IDs)
- Updated SOX.md with PCAOB/COBIT5 ITGC control references
- Dashboard CALM version badge surfacing detected version to the user

**Defer to post-hackathon:**
- Full CALM v1.2 decorator schema parsing (`.passthrough()` is sufficient; decorators don't affect compliance analysis)
- CALM 1.0/1.0-rc1 backward compat with migration warnings (no real-world usage in hackathon demos)
- SOC2 added to UI framework selector (agent output covers SOC2 regardless of UI changes)
- Agent persona names (Scout, Ranger, Arsenal, Sniper) in README — zero functional impact

**Anti-features (explicitly avoid for v1.3):**
- Full CALM 1.2 re-implementation (core schema is stable 1.0→1.2; 4+ hours for zero benefit)
- GitHub OAuth App flow (PAT already works; OAuth adds 4+ hours of setup)
- PR auto-merge on compliance pass (regulatory liability; humans must approve architecture changes)
- Custom framework builder UI (scope explosion; the SKILL.md pattern already handles this with a file)

See [FEATURES.md](./FEATURES.md) for full feature research including dependency graph, competitor comparison, and prioritization matrix.

### Architecture Approach

The v1.3 architecture is a pure extension of the existing 5-layer system: Presentation (React Dashboard + React Flow + Zustand), API (Next.js Route Handlers with SSE), Orchestration (parallel Phase 1 + sequential Phase 2 agents), Agent (4 agents using Vercel AI SDK `generateObject`), and CALM Parsing (types, parser, extractor). No layer is replaced or restructured.

**Major components and v1.3 responsibilities:**

1. **`skills/*.md` files** — Primary change surface for compliance intelligence. Add control ID appendix tables to existing files; create `SOC2.md` and `PROTOCOL-SECURITY.md`. The skill loader (`src/lib/skills/loader.ts`) requires zero changes — it already injects full file content into agent prompts via YAML config.
2. **`src/lib/calm/` (types, parser, version-detector)** — Add `.passthrough()` to `calmDocumentSchema`, make `decorators`/`timelines`/`$schema` fields optional, add new `version-detector.ts` with `detectCalmVersion()`. Extend `ParseSuccess` interface to include `version: CalmVersion` for dashboard display.
3. **3-button GitOps split (4 files)** — `src/lib/github/types.ts` adds `'cloud-infra'` to the type union; `src/store/analysis-store.ts` adds `infraPR` + `setInfraPR`; `src/app/api/github/create-pr/route.ts` adds enum value, handler branch, and `buildInfraFiles()`; `src/components/dashboard/gitops-card.tsx` adds 3rd PRSection and 3-column grid.
4. **GitHub Action (3 new files)** — `src/app/api/analyze/headless/route.ts` (JSON-returning analysis endpoint, no SSE, awaits `runAnalysis()` completion); `.github/actions/calmguard-check/action.yml` (composite action definition with inputs for `calm-file`, `frameworks`, `fail-threshold`, `calmguard-url`); `.github/actions/calmguard-check/scripts/check-calm.sh` (shell runner calling headless API with `jq` result parsing).
5. **Agent YAML config files** — `agents/compliance-mapper.yaml` and `agents/calm-remediator.yaml` get new skill file references. Zero TypeScript agent code changes.

**Key architectural constraint:** `globalThis.__lastPipelineResult` (used by create-pr route) already holds a full `PipelineConfig` containing both CI and IaC sections. `buildCIFiles()` and `buildInfraFiles()` are simply different lenses on the same existing data — no new server globals required.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full integration architecture including as-built system diagram, component boundary map, build order, and anti-patterns to avoid.

### Critical Pitfalls

1. **Hallucinated compliance control IDs (Pitfall 9)** — LLMs invent plausible-sounding IDs like `PCI-DSS-8.3.7` or `NIST-CSF-PR.AC-9` that do not exist. They pass Zod validation (`controlId: z.string()`) and appear in the findings table. Prevention: add a closed list of valid IDs to each skill file; add post-generation regex pattern validation; never use LLM-generated free-form IDs as `requirement-url` in committed CALM files.

2. **v1.1 parser regression from multi-version changes (Pitfall 10)** — Wrong approach to multi-version support (separate per-version schemas, accidental `.strict()`) breaks existing demo files. Prevention: single lenient schema with `.optional()` on all new fields plus `.passthrough()` on root; run regression test against all `examples/` files after every schema change.

3. **GitHub Action silent CI failures from Next.js dependencies (Pitfall 11)** — The action cannot import Next.js route code: `@/` path aliases don't resolve outside Next.js build context, `process.cwd()` points to wrong directory in CI, and `globalThis` server globals are unpopulated. Prevention: build Action as completely isolated Node.js script; use `/api/analyze/headless` as the clean API boundary; pass `AGENTS_DIR`/`SKILLS_DIR` via env vars; test locally with `act`.

4. **3-button GitOps concurrent PR corruption (Pitfall 12)** — Rapid button clicks create duplicate branch names (GitHub 422) and TypeScript errors cascade if `PRRecord` type union is not extended atomically. Prevention: schema-first approach (types → store → route → component); disable all 3 buttons while any one is generating; add random suffix to branch names.

5. **Skill file context window overflow (Pitfall 13)** — Adding control ID tables to all 4 skill files pushes the compliance mapper prompt past effective context limits, causing the LLM to summarize instead of cite. Prevention: scope skill injection to user-selected frameworks only (wire the unused `_selectedFrameworks` parameter in `mapCompliance()`); target under 3,000 tokens per selected framework.

6. **Multi-agent error cascades (Pitfall 1)** — One agent failure corrupts downstream agents. Prevention: Zod validation after each agent, circuit breakers in orchestrator, validation status in SSE stream. This is already partially mitigated in v1.2; v1.3 has no new orchestration risk.

7. **SSE timeout on Vercel serverless (Pitfall 2)** — Agent execution can exceed Pro tier 60-second limit. Prevention: `maxDuration=300` on SSE routes (already set via Vercel Fluid Compute); keepalive pings every 5–10 seconds. The new headless route also needs `maxDuration=300` — analysis takes 60–120 seconds.

See [PITFALLS.md](./PITFALLS.md) for complete pitfall catalog (13 pitfalls), technical debt patterns, integration gotchas, performance traps, and security mistakes.

## Implications for Roadmap

Based on research, v1.3 breaks into 4 phases with clear dependency ordering and a 2-day execution window.

### Phase 1: Compliance Intelligence — Skills and Control ID Grounding
**Rationale:** Zero TypeScript dependencies. Pure Markdown content edits to skill files plus a one-line enum addition in `compliance-mapper.ts`. Immediately improves all existing agent output quality without touching any running code. Safe to develop in parallel with Phase 2. The fastest path to visibly better demo output.
**Delivers:** PCI-DSS.md, NIST-CSF.md, SOX.md updated with closed control ID lists. New `skills/SOC2.md` (SOC2 Type II Trust Service Criteria CC1–CC9). New `skills/PROTOCOL-SECURITY.md` (HTTP→HTTPS, FTP→SFTP, LDAP→LDAPS rationale with regulatory citations). Agent YAML configs updated with new skill references. Agents now cite "PCI-DSS 4.0 Req 4.2.1" instead of vague framework references.
**Addresses:** Control ID grounding, SOC2 framework support, protocol security rationale, context window control via framework-scoped injection
**Avoids:** Pitfall 9 (hallucinated control IDs), Pitfall 13 (context window overflow)
**Files:** `skills/PCI-DSS.md`, `skills/NIST-CSF.md`, `skills/SOX.md`, `skills/SOC2.md` (new), `skills/PROTOCOL-SECURITY.md` (new), `agents/compliance-mapper.yaml`, `agents/calm-remediator.yaml`, `src/lib/agents/compliance-mapper.ts`

### Phase 2: Multi-Version CALM Parser
**Rationale:** Parser-layer change only. Transparent to all agents (they receive `AnalysisInput`, not the raw `CalmDocument`). Must complete before demo — any v1.2 CALM file input fails without this fix. Can be developed in parallel with Phase 1 by a second developer.
**Delivers:** CALM 1.0, 1.1, and 1.2 documents all parse without failure. `ParseSuccess` exposes `version: CalmVersion` field. Dashboard shows detected version badge ("CALM v1.2 detected"). Future CALM versions accepted via `.passthrough()`.
**Uses:** Zod `.passthrough()` and `.optional()` — both in current Zod 3.24.1. No new packages.
**Implements:** New `src/lib/calm/version-detector.ts`, schema extension in `types.ts`, version surfacing in `parser.ts`, minor `extractor.ts` update.
**Avoids:** Pitfall 10 (parser regression breaking existing v1.1 demo files)
**Files:** `src/lib/calm/version-detector.ts` (new), `src/lib/calm/types.ts`, `src/lib/calm/parser.ts`, `src/lib/calm/extractor.ts` (minor)

### Phase 3: 3-Button GitOps Split
**Rationale:** Requires coordinated changes across 4 files. Widest blast radius in v1.3 — TypeScript type errors cascade if the schema change is not done atomically across all layers. The `buildCIFiles`/`buildInfraFiles` extraction works on existing `PipelineConfig` data (single `__lastPipelineResult` global reused, not duplicated).
**Delivers:** Three distinct PR buttons visible on the GitOps card: DevSecOps CI (CI-only YAML + SAST configs), Compliance Remediation (modified CALM file with added controls), Cloud Infra (Terraform or CloudFormation only). 3-column grid layout. CI-only workflow no longer bundles deployment stages.
**Uses:** Existing Octokit-style GitHub API calls, existing `__lastPipelineResult` global.
**Implements:** Extended `PRRecord` type union, new `infraPR` Zustand state + `setInfraPR` action, `cloud-infra` route branch, `buildCIFiles()`/`buildInfraFiles()` split, 3-PRSection GitOps card with concurrent-generation guard.
**Avoids:** Pitfall 12 (concurrent PR button corruption)
**Files:** `src/lib/github/types.ts`, `src/store/analysis-store.ts`, `src/app/api/github/create-pr/route.ts`, `src/components/dashboard/gitops-card.tsx`

### Phase 4: GitHub Action for Continuous Compliance
**Rationale:** Sequenced last because it requires the headless API route, which becomes stable after Phase 3 finalizes the `PipelineConfig` type. The GitHub Action is demonstrable by showing the generated YAML template in a DevSecOps CI PR — live CI execution is not required for demo purposes. This is the most novel piece and carries the highest failure risk from implicit Next.js dependencies.
**Delivers:** `/api/analyze/headless` JSON endpoint for programmatic analysis (returns `{ result: AnalysisResult, version: string }`, HTTP 422 on compliance failure). Composite GitHub Action at `.github/actions/calmguard-check/` with configurable `fail-threshold`, `frameworks`, and `calmguard-url` inputs. Generated `calmguard-check.yml` caller workflow committed to user repos via the DevSecOps CI PR button.
**Uses:** Composite action pattern (no compiled artifact, no `@vercel/ncc`); `@finos/calm-cli validate` for schema check; Node.js 22 LTS.
**Implements:** Isolated headless Next.js route; shell-parseable JSON response; composite action with `outputs.compliance-score` and `outputs.report-url`; caller workflow generator in `src/lib/pipeline/`.
**Avoids:** Pitfall 11 (headless CI failures from Next.js implicit dependencies — isolated script, env var path overrides, no `@/` aliases in action code)
**Files:** `src/app/api/analyze/headless/route.ts` (new), `.github/actions/calmguard-check/action.yml` (new), `.github/actions/calmguard-check/scripts/check-calm.sh` (new), `src/lib/pipeline/` (extend to emit `calmguard-check.yml` caller template)

### Phase Ordering Rationale

- Phases 1 and 2 have no shared files and no merge conflicts. Ideal for two-developer parallel work: Dev A owns Phase 1 (skills + YAML config); Dev B owns Phase 2 (CALM parsing).
- Phase 3 should start after Phase 2 is merged because `create-pr/route.ts` (modified in Phase 3) calls `parseCalm()` (modified in Phase 2). Merging Phase 2 first ensures the route has correct types before adding the third branch.
- Phase 4 is strictly sequential after Phase 3 because the headless route needs the stable `PipelineConfig` type that Phase 3 finalizes, and the CI workflow generator (emitting `calmguard-check.yml`) extends the Phase 3 pipeline generator.
- Time allocation: Phase 1 + 2 on Day 1 (each 4–6 hours, parallelized). Phase 3 on Day 2 morning (3–4 hours). Phase 4 on Day 2 afternoon (3–4 hours). Final 4 hours reserved for demo mode polish and edge case testing.
- Pitfall 8 (scope creep) is the meta-risk: with 2 days remaining, any feature not in the P1 list goes to the deferred log. No exceptions.

### Research Flags

Phases needing careful attention during execution (higher implementation risk):

- **Phase 4 (GitHub Action):** Headless API integration is novel — no existing reference in the codebase. The composite action's working directory behavior, lack of `@/` path aliases in CI, and unpopulated `globalThis` server globals are known failure modes (Pitfall 11). Test locally with `act` before committing.
- **Phase 1 (Control ID validation):** Post-generation validation of control IDs is new infrastructure. Decide during Phase 1 execution whether to implement as Zod enum validation (strict, requires maintaining list) or post-process filter (flexible, adds a processing step). Both approaches have tradeoffs not resolvable without measuring actual LLM output quality.
- **Phase 3 (3-button state atomicity):** The `reset()` function in `analysis-store.ts` must be updated to include `infraPR` reset. Easy to miss; causes stale state after CALM file re-upload. Add to definition-of-done checklist for Phase 3.

Phases with well-documented patterns (standard execution, no additional research needed):

- **Phase 2 (Multi-version CALM):** `.passthrough()` + `.optional()` is standard Zod. Version detection from `$schema` URL substring is straightforward string matching. CALM core schema stability across 1.0–1.2 is verified from official FINOS release notes (HIGH confidence).
- **Phase 1 (Skill files):** Content authoring with known authoritative sources (NIST CSWP 29 Feb 2024, AICPA TSC 2017, PCI SSC v4.0). No novel code patterns. The skill loader infrastructure already handles injection correctly.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All v1.3 changes use existing libraries; zero new packages. Verified against local `node_modules`, direct codebase inspection, FINOS repo, and GitHub Actions changelog. |
| Features | HIGH | Existing codebase reviewed directly; CALM schema versions confirmed via official FINOS release notes; GitHub Actions patterns verified against 2025–2026 official docs. Feature dependency graph derived from actual source file inspection. |
| Architecture | HIGH | Based on direct inspection of 82 TypeScript files and 46,800 lines. Integration paths traced through actual source files, not assumptions. Component boundary map reflects as-built code. |
| Pitfalls | HIGH | v1.3-specific pitfalls derived from codebase analysis (specific file paths, specific failure modes). Original pitfalls sourced from multi-agent systems literature and Vercel official documentation. |

**Overall confidence:** HIGH

### Gaps to Address

- **Control ID closed-list validation approach:** Research recommends adding validation but leaves the implementation choice open between Zod enum (strict, requires maintaining list) and post-process filter (flexible). Decide during Phase 1 execution based on how many control IDs are in scope and whether the LLM output quality warrants the extra layer.
- **Headless route timeout configuration:** The analysis pipeline takes 60–120 seconds. `maxDuration=300` must be explicitly set on the new `/api/analyze/headless` route (same as the existing SSE route). Verify during Phase 4 development that Vercel Fluid Compute applies to the new route without additional configuration.
- **Framework-scoped skill injection:** The `_selectedFrameworks` parameter in `mapCompliance()` has an underscore prefix (intentionally unused in v1.2). Wiring it to `loadSkillsForAgent()` requires a small refactor during Phase 1. This prevents context window overflow when all 5 skill files are loaded simultaneously (Pitfall 13).
- **CALM v1.2 decorator passthrough verification:** Research confirms decorators should be ignored for compliance analysis since agents receive `AnalysisInput` (not raw `CalmDocument`). Confirm during Phase 2 that `extractor.ts` does not inadvertently surface decorator content to agents through the `metadata` field.

## Sources

### Primary (HIGH confidence)
- FINOS architecture-as-code repo — `calm/release/1.1/RELEASE_NOTES.md`, `calm/release/1.2/RELEASE_NOTES.md` — CALM version differences and core schema stability confirmed
- NIST CSWP 29 (February 2024) — NIST CSF 2.0 subcategory structure (GV.OC-01 through RC.RP-1, 6 functions, 22 categories, 106 subcategories)
- AICPA Trust Services Criteria (2017, applicable for 2025/2026 SOC 2 audits) — CC-series control IDs (CC1–CC9, A1, C1, P1)
- PCI Security Standards Council — PCI-DSS v4.0.1 requirement numbering (51 new requirements mandatory March 31, 2025)
- GitHub Changelog — Node 20 deprecation on GitHub Actions runners (September 2025 announcement)
- GitHub Actions Documentation — Native `paths:` filter, composite actions pattern
- Direct codebase inspection — 82 TypeScript files, 46,800 lines (2026-02-25)
- `node_modules/@finos/calm-cli` v1.33.0 — `calm validate --help` confirming `--timeline` flag (v1.2 support)

### Secondary (MEDIUM confidence)
- FINOS Office Hours Issue #2114 — PR #2131 merged ~Feb 14, 2026 with decorator schema changes (issue discussion thread, not direct PR merge confirmation)
- GitHub Actions reusable workflows 2025 documentation — nested workflow limits increased (10 nested, 50 total)
- GitHub Actions PR security guide — `pull_request` vs `pull_request_target` security model for fork PRs

### Tertiary (LOW confidence)
- Multi-agent system failure rate statistics (41–86.7%) — orq.ai, galileo.ai blog posts (methodology unclear; used for directional guidance on validation discipline, not as hard numbers)
- Scope creep cost multiplier (4x initial cost) — general project management literature; used to motivate scope discipline recommendation, not as a precise estimate

---
*Research completed: 2026-02-25*
*Supersedes: 2026-02-15 greenfield summary*
*Ready for roadmap: yes*
