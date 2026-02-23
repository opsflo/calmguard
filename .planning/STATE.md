# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** When a user uploads a CALM architecture JSON, CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard showing architecture visualization, compliance scores, risk findings, and generated CI/CD pipeline configs — all streaming live as agents work.

**Current focus:** Phase 4: Compliance Visualization

## Current Position

Phase: 3 of 6 (API Routes & Dashboard Core) — COMPLETE
Plan: 6 of 6 in current phase — COMPLETE
Status: Phase 3 Complete — Moving to Phase 4
Last activity: 2026-02-23 — Completed plan 03-06: Dashboard Integration — AgentFeed Layout + Architecture Tab + Overview Wiring (3 min, 2 tasks, 3 files)

Progress: [█████░░░░░] 57.1% (16/28 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 16
- Average duration: 4 minutes
- Total execution time: ~1.3 hours

**By Phase:**

| Phase | Plans | Total Time | Avg/Plan |
|-------|-------|------------|----------|
| 01-foundation-calm-parser | 4 | 43 min | 11 min |
| 02-multi-agent-infrastructure | 5 | 17 min | 3 min |
| 03-api-routes-dashboard-core | 6 (of 6) | ~16 min | 3 min |

**Recent Completions:**
1. 03-03 Dashboard Shell Live Sidebar + Analyze Header - 2 min (2 tasks, 5 files)
2. 03-04 Agent Activity Feed - 2 min (2 tasks, 3 files)
3. 03-05 Architecture Graph — React Flow + dagre - 4 min (2 tasks, 11 files)
4. 03-06 Dashboard Integration — AgentFeed Layout + Architecture Tab + Overview Wiring - 3 min (2 tasks, 3 files)
5. Phase 3 COMPLETE — all 6/6 plans done

*Updated after each plan completion*
| Phase 03-api-routes-dashboard-core P01 | 6 | 2 tasks | 7 files |
| Phase 03-api-routes-dashboard-core P04 | 2 | 2 tasks | 3 files |
| Phase 03-api-routes-dashboard-core P03 | 2 | 2 tasks | 5 files |
| Phase 03-api-routes-dashboard-core P06 | 3 | 2 tasks | 3 files |

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

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 2 (CALM Parser):** May need deeper research if FINOS TypeScript packages are immature or poorly documented. Confidence: MEDIUM (recent 2026 office hours show active development). Budget extra time for potential workarounds.

**Phase 3 (Multi-Agent):** SSE streaming implementation needs careful attention to avoid buffering pitfalls. Confidence: HIGH (well-documented pattern). Use ReadableStream.start() pattern, not for-await-then-return.

**Phase 5 (Pipeline Generation):** Complex compliance rule mapping may require domain expert consultation. Confidence: MEDIUM (standard patterns exist but compliance nuance is domain-specific).

## Session Continuity

Last session: 2026-02-23 (plan execution)
Stopped at: Completed 03-06-PLAN.md — Phase 3 Complete
Resume file: None

---

*Phase 1 (Foundation & CALM Parser) Complete - Phase 2 (Multi-Agent Infrastructure) Complete (5/5 plans) - Phase 3 (API Routes & Dashboard Core) Complete (6/6 plans)*
