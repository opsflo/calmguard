# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** When a user uploads a CALM architecture JSON, CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard showing architecture visualization, compliance scores, risk findings, and generated CI/CD pipeline configs — all streaming live as agents work.

**Current focus:** Phase 5: Testing, DevSecOps, Dogfooding

## Current Position

Phase: 5 of 6 (Testing, DevSecOps, Dogfooding) — IN PROGRESS
Plan: 4 of 5 in current phase — COMPLETE
Status: Phase 5 Plan 04 Complete — Moving to Phase 5 Plan 05
Last activity: 2026-02-24 — Completed plan 05-04: SECURITY.md threat model, Husky pre-commit hooks, CONTRIBUTING.md (4 min, 2 tasks, 5 files)

Progress: [█████████░] 89.7% (26/29 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 21
- Average duration: 5 minutes
- Total execution time: ~1.5 hours

**By Phase:**

| Phase | Plans | Total Time | Avg/Plan |
|-------|-------|------------|----------|
| 01-foundation-calm-parser | 4 | 43 min | 11 min |
| 02-multi-agent-infrastructure | 5 | 17 min | 3 min |
| 03-api-routes-dashboard-core | 7 (of 7) | ~17 min | 2 min |
| 04-pipeline-generation-compliance-display | 4 (so far) | ~23 min | 6 min |

**Recent Completions:**
1. 05-04 SECURITY.md threat model + Husky pre-commit hooks + CONTRIBUTING.md - 4 min (2 tasks, 5 files)
2. 05-03 GitHub Actions CI/CD workflow - (2 tasks)
3. 05-01 Vitest test infrastructure - (2 tasks)
4. 04-03 Findings Table + Pipeline Preview + Dashboard Pages - 4 min (2 tasks, 5 files)

*Updated after each plan completion*
| Phase 03-api-routes-dashboard-core P01 | 6 | 2 tasks | 7 files |
| Phase 03-api-routes-dashboard-core P04 | 2 | 2 tasks | 3 files |
| Phase 03-api-routes-dashboard-core P03 | 2 | 2 tasks | 5 files |
| Phase 03-api-routes-dashboard-core P06 | 3 | 2 tasks | 3 files |
| Phase 04-pipeline-generation-compliance-display P04 | 12 | 2 tasks | 15 files |
| Phase 04-pipeline-generation-compliance-display P01 | 8 | 2 tasks | 2 files |
| Phase 04-pipeline-generation-compliance-display P02 | 3 | 2 tasks | 3 files |
| Phase 04-pipeline-generation-compliance-display P03 | 4 | 2 tasks | 5 files |
| Phase 05 P04 | 4 | 2 tasks | 5 files |
| Phase 05-testing-devsecops-dogfooding P03 | 5 | 2 tasks | 4 files |
| Phase 05-testing-devsecops-dogfooding P01 | 6 | 2 tasks | 5 files |
| Phase 05 P05 | 11 | 2 tasks | 27 files |
| Phase 05 P02 | 4 | 1 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Next.js over Bun+Elysia: PLAN.md architected around App Router, API routes, Vercel deploy, AI SDK integration
- Gemini as default LLM: API keys available now; multi-provider via AI SDK for flexibility
- Multi-provider LLM support: Gemini, Anthropic, OpenAI, Ollama, Grok — increases appeal and flexibility
- All 6 phases in scope: Full spec build, no cuts — hackathon project needs to be complete and impressive
- SSE over WebSockets: Simpler, works with Vercel serverless, sufficient for one-way agent event streaming
- Zustand over Redux: Minimal boilerplate, works well with SSE event updates, fast to implement
- Use Tailwind CSS v4 instead of v3: Project initialized with v4, which has improved performance and new @theme syntax (01-01)
- Use src/ directory structure: Better organization, clear separation of source code from config files (01-01)
- Use Tailwind v4 @theme syntax for CSS variables: v4 deprecated @layer base approach, @theme is the new standard (01-01)
- Flat state structure in Zustand: Zustand works best with flat state - avoids nested object mutation issues (01-03)
- Realistic compliance controls in demos: Demo architectures need realistic controls (PCI-DSS, SEC, FINRA) to test compliance mapping agents (01-03)
- Use relative import path for examples directory: tsconfig only has @/* alias for src/ directory; examples/ is at project root (01-04)
- Store full ParseError structure instead of string: Error display component needs access to issues array for detailed validation feedback (01-04)
- Use skeleton loading pattern for dashboard panels: Provides immediate visual feedback while waiting for Phase 2 agent implementation (01-04)
- Edge Runtime compatibility: Use simple listener pattern instead of Node.js EventEmitter for SSE event streaming in serverless (02-01)
- Fail-fast provider validation: Provider registry throws error at module initialization if no API keys configured, not deferred to first use (02-01)
- AI SDK 6.x generateObject: Continue using generateObject (not generateText+output) for simpler API, documented for future migration (02-01)
- [Phase 02]: Use AOF-inspired YAML schema for agent configurations with consistent metadata/spec structure
- [Phase 02]: Use Markdown format for compliance knowledge files optimized for LLM prompt injection
- [Phase 02]: Include substantive content in SKILL.md files (186-468 lines each) for meaningful compliance analysis
- [Phase 02]: Use module-level Map for caching agent configs and skills to avoid repeated file I/O
- [Phase 02]: Use retry logic with exponential backoff for all agent generateObject calls to handle transient LLM failures
- [Phase 02]: Promise.allSettled for parallel agent execution ensures graceful degradation
- [Phase 02]: Skip Risk Scorer if Architecture or Compliance failed - avoids misleading scores from incomplete data
- [Phase 03-02]: Accept calmData as startStream() parameter not from store — avoids stale closure issues
- [Phase 03-02]: Derived selectors as standalone functions outside Zustand store — keeps store lean, avoids duplicate state
- [Phase 03-02]: AbortError and HTTP errors excluded from fetch SSE retry — only network failures trigger reconnect
- [Phase 03-05]: nodeTypes/edgeTypes defined at module level outside ArchitectureGraph component — prevents React Flow remounting all nodes on every render
- [Phase 03-05]: Auto-layout only (nodesDraggable=false) — dagre positions are authoritative, graph is read-only visualization
- [Phase 03-05]: Trust boundary parent nodes excluded from dagre graph — their bounds computed from children's final positions + padding
- [Phase 03-05]: Risk level maps to compliance border color: low=compliant (emerald), medium=partial (amber), high/critical=non-compliant (red)
- [Phase 03]: Deferred LLM provider validation to runtime - build-time compatible fail-fast
- [Phase 03]: Used z.union instead of z.discriminatedUnion for sseEventSchema - 'error' type shared between agent events and terminal events
- [Phase 03]: globalThis singleton pattern for AgentEventEmitter - survives Next.js hot reloads
- [Phase 03-api-routes-dashboard-core]: Icon map as plain Record<string, LucideIcon> for AgentFeedEvent — avoids dynamic import complexity for the 5 known agent icons
- [Phase 03-api-routes-dashboard-core]: Severity badge only on finding events — consistent with CALM compliance reporting intent
- [Phase 03-api-routes-dashboard-core]: Individual Zustand selectors in Sidebar to prevent unnecessary re-renders
- [Phase 03-06]: AgentFeed placed in DashboardLayout right column (w-80) rather than per-page — always visible during all tab navigation
- [Phase 03-06]: Completion banner uses emerald-500/10 bg + emerald-500/30 border — subtle non-intrusive per locked decision (no modal/overlay)
- [Phase 03-06]: Overview grid reduced to 3 panels — AgentFeed moved to layout right column frees the 4th grid slot
- [Phase 04-04]: Framework enum values use 'CCC' internally (Zod schema) but display as 'FINOS-CCC' — decoupled via FRAMEWORKS const array with value+label fields
- [Phase 04-04]: selectedFrameworks not reset in startAnalysis or reset — user selection persists across analyses
- [Phase 04-04]: mapCompliance and scoreRisk accept _selectedFrameworks as unused parameter — threading infrastructure established, filtering logic deferred to future plan
- [Phase 04-04]: Toast errors fire on all 3 SSE failure paths: HTTP error, null response.body, max retries exhausted
- [Phase 04-04]: Completion banner conditionally amber (partial failure) or emerald (success) with Retry button always visible when rawCalmData available
- [Phase 04-01]: SVG text elements used for score display instead of HTML overlay — avoids z-index complexity inside SVG viewBox
- [Phase 04-01]: getBarColorClass returns Tailwind class string not inline style — consistent with project Tailwind-only styling convention
- [Phase 04-01]: useCountUp cleanup cancels RAF on both unmount and targetScore change — prevents stale animation on re-analysis
- [Phase 04-02]: Cell status is node-level (same across all frameworks) — complianceGaps in nodeRiskMap has no per-framework breakdown; acceptable for hackathon visualization
- [Phase 04-02]: ControlMatrixInner split from ControlMatrix — outer component does null guards and early returns, inner uses hooks freely (avoids conditional hook violations)
- [Phase 04-02]: Row key includes array index (framework-controlId-idx) — handles duplicate controlIds across different frameworks
- [Phase 04-02]: Select filter uses defaultValue='all' (uncontrolled) not value — avoids controlled/uncontrolled React mismatch warning
- [Phase 04-03]: shiki import from 'shiki/bundle/web' not 'shiki' — web bundle avoids loading all 1000+ grammars; only yaml and hcl needed
- [Phase 04-03]: highlightedHtml stored as local useState not Zustand — ephemeral display data, not part of analysis result
- [Phase 04-03]: compact prop pattern for PipelinePreview — same component with different height/feature constraints for overview grid (compact=true) vs pipeline page (compact=false)
- [Phase 04-03]: SEVERITY_ORDER record maps severity strings to integers for deterministic sort — critical(0) first
- [Phase 05-04]: Use FlatCompat to bridge eslint-config-next (legacy extends) to ESLint v9 flat config — project had no eslint config; next lint was deprecated in Next.js 15/16
- [Phase 05-04]: Use eslint --fix --max-warnings=0 in lint-staged (not next lint) — next lint is interactive and deprecated in Next.js 15/16
- [Phase 05-04]: Create CONTRIBUTING.md at project root separate from .github/CONTRIBUTING.md — project-specific guidance vs hackathon template
- [Phase 05-testing-devsecops-dogfooding]: Block on errors only in CI: pnpm audit --audit-level=high and semgrep --error — warnings informational
- [Phase 05-testing-devsecops-dogfooding]: Both CodeQL AND Semgrep in parallel workflows — semantic + pattern SAST dual coverage
- [Phase 05-testing-devsecops-dogfooding]: License audit blocks on GPL-2.0/3.0/AGPL-3.0 via license-checker — copyleft compliance signal for financial services
- [Phase 05-testing-devsecops-dogfooding]: Vitest 4 compatibility: removed poolOptions.forks in favor of default flat config
- [Phase 05-testing-devsecops-dogfooding]: verbose reporter with summary:false: shows all test names for demo visibility without noise
- [Phase 05-testing-devsecops-dogfooding]: Fixture factory functions (makeNode, makeMinimalDoc): typed inline fixtures over large JSON blobs
- [Phase 05]: routeBasePath: / + slug: / on intro.md — Docusaurus docs ARE the site root for clean hackathon URLs
- [Phase 05]: Regex-based Zod schema extraction in generate-api-docs.ts — avoids full TypeScript AST complexity
- [Phase 05]: MDX curly brace escaping in API docs generator — HTML-encode braces to prevent acorn parse errors
- [Phase 05]: vi.importActual for partial agent mocking: orchestrator.ts imports Zod schemas at module level to build analysisResultSchema — mocking with {} breaks .nullable(); vi.importActual spreads real module preserving schemas while replacing only the function under test
- [Phase 05]: TEST-05 (dashboard component tests) deferred to post-hackathon: async server components and Zustand hooks not testable in jsdom without complex setup

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 2 (CALM Parser):** May need deeper research if FINOS TypeScript packages are immature or poorly documented. Confidence: MEDIUM (recent 2026 office hours show active development). Budget extra time for potential workarounds.

**Phase 3 (Multi-Agent):** SSE streaming implementation needs careful attention to avoid buffering pitfalls. Confidence: HIGH (well-documented pattern). Use ReadableStream.start() pattern, not for-await-then-return.

**Phase 5 (Pipeline Generation):** Complex compliance rule mapping may require domain expert consultation. Confidence: MEDIUM (standard patterns exist but compliance nuance is domain-specific).

## Session Continuity

Last session: 2026-02-24 (plan execution)
Stopped at: Completed 05-02-PLAN.md — API route contract tests, SSE streaming tests, orchestrator flow tests (22 tests total, 930ms runtime)
Resume file: None

---

*Phase 1 (Foundation & CALM Parser) Complete - Phase 2 (Multi-Agent Infrastructure) Complete (5/5 plans) - Phase 3 (API Routes & Dashboard Core) Complete (7/7 plans, gap closure done) - Phase 4 Complete (4/4 plans) - Phase 5 Complete (5/5 plans)*
