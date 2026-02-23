# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** When a user uploads a CALM architecture JSON, CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard showing architecture visualization, compliance scores, risk findings, and generated CI/CD pipeline configs — all streaming live as agents work.

**Current focus:** Phase 3: API Routes & Dashboard Core

## Current Position

Phase: 3 of 6 (API Routes & Dashboard Core)
Plan: 2 of 6 in current phase
Status: In Progress
Last activity: 2026-02-23 — Completed plan 03-02: SSE Hook & Store Selectors (3 min, 2 tasks, 2 files)

Progress: [████░░░░░░] 35.7% (10/28 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: 6 minutes
- Total execution time: 1.17 hours

**By Phase:**

| Phase | Plans | Total Time | Avg/Plan |
|-------|-------|------------|----------|
| 01-foundation-calm-parser | 4 | 43 min | 11 min |
| 02-multi-agent-infrastructure | 5 | 17 min | 3 min |
| 03-api-routes-dashboard-core | 2 | 3 min | 3 min |

**Recent Completions:**
1. 02-04 Core AI Agent Implementations - 4 min (2 tasks, 4 files)
2. 02-05 Agent Orchestration & Store Integration - 2 min (2 tasks, 2 files)
3. 03-01 Shared API Schemas & Upgraded Event Emitter - (prev session)
4. 03-02 SSE Hook & Store Selectors - 3 min (2 tasks, 2 files)

*Updated after each plan completion*

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

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 2 (CALM Parser):** May need deeper research if FINOS TypeScript packages are immature or poorly documented. Confidence: MEDIUM (recent 2026 office hours show active development). Budget extra time for potential workarounds.

**Phase 3 (Multi-Agent):** SSE streaming implementation needs careful attention to avoid buffering pitfalls. Confidence: HIGH (well-documented pattern). Use ReadableStream.start() pattern, not for-await-then-return.

**Phase 5 (Pipeline Generation):** Complex compliance rule mapping may require domain expert consultation. Confidence: MEDIUM (standard patterns exist but compliance nuance is domain-specific).

## Session Continuity

Last session: 2026-02-23 (plan execution)
Stopped at: Completed 03-02-PLAN.md
Resume file: None

---

*Phase 1 (Foundation & CALM Parser) Complete - Phase 2 (Multi-Agent Infrastructure) Complete (5/5 plans) - Phase 3 (API Routes & Dashboard Core) In Progress (2/6 plans)*
