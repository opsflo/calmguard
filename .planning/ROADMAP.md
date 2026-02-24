# Roadmap: CALMGuard

## Overview

CALMGuard transforms FINOS CALM architecture definitions into compliance dashboards with real-time AI analysis. Starting with project foundation and CALM parsing, we build multi-agent infrastructure with SSE streaming, then layer on a real-time dashboard with React Flow visualizations. Pipeline generation logic follows, then comprehensive testing and DevSecOps dogfooding, and finally polish, documentation, and deployment for the Feb 23-27, 2026 DTCC/FINOS hackathon.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & CALM Parser** - Project bootstrap with Next.js 14+, shadcn/ui, demo architectures, and working CALM JSON parser *(completed 2026-02-16)*
- [ ] **Phase 2: Multi-Agent Infrastructure** - YAML agent definitions, SKILL.md compliance knowledge, 4 agents with structured output, SSE streaming orchestration
- [ ] **Phase 3: API Routes & Dashboard Core** - HTTP API routes, SSE streaming endpoints, Zustand state management, real-time dashboard with architecture visualization
- [ ] **Phase 4: Pipeline Generation & Compliance Display** - GitLab CI/GitHub Actions template generation, compliance visualizations (heat map, control matrix, findings table)
- [x] **Phase 5: Testing & DevSecOps Dogfooding** - TDD test suite, CI/CD pipeline with SAST/dependency scanning, security documentation, Docusaurus site (completed 2026-02-24)
- [x] **Phase 6: Polish, Demo Mode & Deployment** - Animations, guided demo mode, custom CALM upload, framework selector, export report, Vercel deployment (completed 2026-02-24)

## Phase Details

### Phase 1: Foundation & CALM Parser
**Goal**: Next.js project boots with dark dashboard shell, CALM JSON parses correctly into typed structures, and demo architectures load without errors.

**Depends on**: Nothing (first phase)

**Requirements**: CALM-01, CALM-02, CALM-03, INFRA-03

**Success Criteria** (what must be TRUE):
  1. Developer can run `pnpm dev` and see Next.js app with dark-themed landing page
  2. User can select a demo CALM architecture (trading platform or payment gateway) from a dropdown
  3. System parses selected CALM JSON into typed AnalysisInput structure with nodes, relationships, controls, and flows extracted
  4. Dashboard skeleton shows loading states for all component placeholders
  5. Invalid CALM JSON displays clear error messages with validation feedback

**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Initialize Next.js 14+ project with TypeScript strict, pnpm, shadcn/ui dark theme (Wave 1)
- [x] 01-02-PLAN.md — Build CALM v1.1 Zod schemas, parser with safeParse, and data extractor (Wave 1)
- [x] 01-03-PLAN.md — Create demo CALM architectures (trading platform + payment gateway) and Zustand store (Wave 2)
- [x] 01-04-PLAN.md — Build landing page with architecture selector and dashboard skeleton with sidebar (Wave 3)

### Phase 2: Multi-Agent Infrastructure
**Goal**: Four AI agents (Architecture Analyzer, Compliance Mapper, Pipeline Generator, Risk Scorer) produce valid structured output from CALM input, orchestrated with real-time SSE event streaming.

**Depends on**: Phase 1

**Requirements**: AGNT-01, AGNT-02, AGNT-03, AGNT-04, AGNT-05, AGNT-06, AGNT-07, AGNT-08, LLM-01, LLM-02, LLM-03, LLM-04, LLM-05

**Success Criteria** (what must be TRUE):
  1. Architecture Analyzer agent extracts components, data flows, and trust boundaries from parsed CALM with structured Zod-validated output
  2. Compliance Mapper agent maps CALM controls to SOX/PCI-DSS/CCC/NIST frameworks using injected SKILL.md knowledge
  3. Pipeline Generator agent creates GitHub Actions YAML, security scanning configs, and IaC templates
  4. Risk Scorer agent aggregates all agent outputs into overall compliance score, per-framework scores, and node risk map
  5. Orchestrator runs Architecture Analyzer + Compliance Mapper + Pipeline Generator in parallel, then Risk Scorer sequentially
  6. All agents emit SSE events (started, thinking, finding, completed, error) that stream to event emitter
  7. Agent definitions load from YAML files in agents/ directory with AOF-inspired schema
  8. Compliance knowledge loads from SKILL.md files (SOX.md, PCI-DSS.md, FINOS-CCC.md, NIST-CSF.md) and injects into agent prompts
  9. Multi-provider LLM support works (Gemini default, Anthropic, OpenAI, Ollama, Grok switchable via environment variables)

**Plans**: 5 plans

Plans:
- [ ] 02-01-PLAN.md — Agent type system, multi-provider LLM registry, and SSE event emitter (Wave 1)
- [ ] 02-02-PLAN.md — Agent YAML definitions and SKILL.md compliance knowledge files (Wave 1)
- [ ] 02-03-PLAN.md — Agent registry (YAML config loader) and SKILL.md loader (Wave 2)
- [ ] 02-04-PLAN.md — 4 agents: Architecture Analyzer, Compliance Mapper, Pipeline Generator, Risk Scorer (Wave 3)
- [ ] 02-05-PLAN.md — Orchestrator with parallel/sequential execution and Zustand store update (Wave 4)

### Phase 3: API Routes & Dashboard Core
**Goal**: HTTP API routes accept CALM JSON and stream agent events via SSE, dashboard displays real-time agent activity feed and interactive architecture graph with compliance coloring.

**Depends on**: Phase 2

**Requirements**: API-01, API-02, API-03, API-04, API-05, API-06, DASH-01, DASH-02, DASH-03, DASH-04, VIZ-01, VIZ-02, VIZ-03, VIZ-04, VIZ-05, FEED-01, FEED-02, FEED-03, FEED-04, FEED-05, FEED-06

**Success Criteria** (what must be TRUE):
  1. POST /api/analyze accepts CALM JSON and returns SSE stream of agent events in real-time
  2. POST /api/calm/parse accepts CALM JSON and returns typed AnalysisInput structure
  3. GET /api/pipeline returns most recent pipeline generation result with GitHub Actions YAML
  4. SSE events include agent identity (name, icon, color), event type, message, and data payload
  5. Client EventSource hook manages connection state (idle, running, complete, error) with auto-reconnect
  6. Dashboard has dark theme (slate-900 bg, slate-800 cards) with left sidebar navigation showing Overview/Architecture/Compliance/Pipeline/Findings
  7. Sidebar shows agent status indicators (colored dots: gray=idle, blue=running, green=done, red=error) that light up in sequence
  8. Real-time scrolling agent event feed shows colored agent icons + timestamps + messages with slide-in animations
  9. Architecture graph renders CALM nodes as custom React Flow nodes by type (service, database, webclient, actor, system) with protocol-labeled edges
  10. Node border colors reflect compliance status (green/amber/red) and update in real-time as agents report
  11. Trust boundaries render as dashed-border rectangles grouping nodes
  12. Graph uses dagre auto-layout (hierarchical left-to-right) with animated edges during analysis
  13. API contracts between frontend and backend are clearly defined with Zod schemas in shared location

**Plans**: 7 plans

Plans:
- [x] 03-01-PLAN.md — API routes (SSE /api/analyze, /api/calm/parse, /api/pipeline) + shared Zod schemas + globalThis event emitter (Wave 1)
- [x] 03-02-PLAN.md — useAgentStream fetch-based SSE hook + derived agent status selectors in Zustand store (Wave 1)
- [x] 03-03-PLAN.md — Dashboard shell: sidebar with live agent dots, header with architecture selector + Analyze button, layout with feed column (Wave 2)
- [x] 03-04-PLAN.md — Agent activity feed: event rows with animations, severity badges, auto-scroll, thinking dots (Wave 2)
- [x] 03-05-PLAN.md — React Flow architecture graph: custom nodes by CALM type, protocol edges, dagre layout, trust boundaries, compliance coloring (Wave 1)
- [x] 03-06-PLAN.md — Integration: wire AgentFeed into layout, create Architecture tab, update Overview page, completion banner (Wave 3)
- [x] 03-07-PLAN.md — UAT gap closure: fix overview graph height, architecture graph spacing, agent feed full-height (Wave 1, gap closure)

### Phase 4: Pipeline Generation & Compliance Display
**Goal**: Compliance score gauge, risk heat map, control matrix, findings table, and pipeline preview all display with real-time updates as agents complete.

**Depends on**: Phase 3

**Requirements**: LLM-06, COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, PIPE-01, PIPE-02, PIPE-03, INFRA-04, INFRA-05

**Success Criteria** (what must be TRUE):
  1. User can select which frameworks to analyze against (SOX, PCI-DSS, CCC, NIST) before starting analysis
  2. Circular SVG compliance gauge shows overall score (0-100) with color gradient (red/amber/green)
  3. Gauge animates with counting effect as score arrives from Risk Scorer agent
  4. Per-framework breakdown (SOX, PCI-DSS, CCC, NIST) shown as horizontal bars below gauge
  5. Risk heat map shows grid of nodes x compliance domains with color-coded cells (green/amber/red/gray)
  6. Heat map cells fade from gray to their color as data arrives from agents
  7. Control matrix table maps regulatory framework controls to CALM controls with status badges, sortable by severity, filterable by framework
  8. Findings table is sortable/filterable with columns: Severity, Finding, Node, Framework, Recommendation
  9. Tabbed pipeline preview interface shows GitHub Actions, Security Scanning, and Infrastructure tabs with syntax highlighting
  10. Pipeline preview has copy-to-clipboard and download buttons per tab
  11. Error handling with toast notifications for API errors, agent error display in feed, and retry button
  12. Graceful degradation if individual agent fails (show partial results with warning)

**Plans**: 4 plans

Plans:
- [ ] 04-04-PLAN.md — Install shared packages (sonner, tabs, checkbox, tooltip, shiki), framework selector data flow, toast notifications, error handling, retry button (Wave 1)
- [ ] 04-01-PLAN.md — Compliance score SVG gauge with count-up animation and per-framework breakdown bars (Wave 2)
- [ ] 04-02-PLAN.md — Risk heat map (nodes x frameworks grid) and control matrix table with sorting/filtering (Wave 2)
- [ ] 04-03-PLAN.md — Findings table with expandable rows and pipeline preview with syntax highlighting, copy, download (Wave 3)

### Phase 5: Testing & DevSecOps Dogfooding
**Goal**: Comprehensive test suite with TDD coverage, CI/CD pipeline with SAST and dependency scanning, security documentation, and Docusaurus documentation site built and updated.

**Depends on**: Phase 4

**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, DSOP-01, DSOP-02, DSOP-03, DSOP-04, DSOP-05, DSOP-06, DOCS-01, DOCS-02, DOCS-03, DOCS-04

**Success Criteria** (what must be TRUE):
  1. All CALM parsing logic has unit tests written before implementation covering valid/invalid inputs
  2. All agent output Zod schemas have validation tests verifying structure and edge cases
  3. API routes have integration tests verifying request/response contracts match Zod schemas
  4. SSE streaming has end-to-end tests verifying event delivery and reconnection
  5. Dashboard components have component tests for key interactions (graph rendering, gauge animation, table sorting)
  6. GitHub Actions CI/CD pipeline runs lint, typecheck, build, and test stages on push to main
  7. SAST scanning integrated in pipeline (CodeQL or Semgrep) with quality gate
  8. Dependency scanning for known vulnerabilities (npm audit or Trivy) with threshold enforcement
  9. SECURITY.md documents security practices, vulnerability reporting process, and threat model
  10. Pre-commit hooks enforce linting and type checking before commit
  11. Branch protection requires PR approval and passing CI checks before merge
  12. Docusaurus site has developer section (architecture diagrams, API reference, agent system explanation, contributing guide)
  13. Docusaurus site has user section (getting started, uploading architectures, reading compliance reports)
  14. API contract documentation is auto-generated or maintained alongside Zod schemas
  15. Documentation updated at each phase completion as part of workflow

**Plans**: 5 plans

Plans:
- [ ] 05-01-PLAN.md — Vitest setup + CALM parser tests + Zod schema validation tests (~10 tests) (Wave 1)
- [ ] 05-02-PLAN.md — API route contract tests + orchestrator flow test + SSE streaming tests (~5 tests) (Wave 2)
- [ ] 05-03-PLAN.md — GitHub Actions CI/CD pipeline + CodeQL + Semgrep SAST + dependency audit (Wave 1)
- [ ] 05-04-PLAN.md — SECURITY.md threat model + Husky pre-commit hooks + CONTRIBUTING.md branch protection (Wave 1)
- [ ] 05-05-PLAN.md — Docusaurus 3 site with 10 pages (dev + user sections) + API docs generator script (Wave 1)

### Phase 6: Polish, Demo Mode & Deployment
**Goal**: Production-ready application deployed to Vercel with guided demo mode, custom CALM upload, export report, animations polished, and ready for Feb 23-27 hackathon presentation.

**Depends on**: Phase 5

**Requirements**: CALM-04, CALM-05, DEMO-01, DEMO-02, DEMO-03, DEMO-04, ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, INFRA-01

**Success Criteria** (what must be TRUE):
  1. User can upload custom CALM JSON file via drag-and-drop with real-time validation feedback
  2. System integrates with @finos/calm-cli to validate uploaded architectures against official CALM schema
  3. "Run Demo" button on landing page auto-selects trading platform architecture and runs analysis with dramatic pacing
  4. Demo mode highlights key findings as they appear in agent feed
  5. "Export Report" button generates downloadable markdown summary of all findings, scores, and recommendations
  6. Compliance score counts up digit-by-digit with easing animation
  7. Architecture graph nodes transition from gray to compliance color with smooth CSS transition
  8. Agent feed events slide in from right with fade animation
  9. Heat map cells fade from gray to their color as data arrives
  10. Pipeline preview code appears with typewriter effect
  11. Sidebar agent dots light up in sequence with blue pulse as each agent starts
  12. Application deploys to Vercel with SSE streaming working in production environment
  13. All components have React.memo optimization for heavy renders (graph, heat map)
  14. Deployed URL shows reasonable layout on 1920x1080 (primary) and 1366x768 (laptop)

**Plans**: 3 plans

Plans:
- [x] 06-01-PLAN.md — Custom CALM upload with drag-and-drop, calm-cli validation, Vercel maxDuration config (Wave 1)
- [x] 06-02-PLAN.md — Guided demo mode with auto-start, dramatic pacing, KEY FINDING highlights, export report modal (Wave 2)
- [x] 06-03-PLAN.md — Animation polish: odometer score, graph node transitions, heat map stagger, pipeline typewriter (Wave 2)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & CALM Parser | 4/4 | Complete | 2026-02-16 |
| 2. Multi-Agent Infrastructure | 0/5 | Not started | - |
| 3. API Routes & Dashboard Core | 7/7 | Complete | 2026-02-24 |
| 4. Pipeline Generation & Compliance Display | 0/4 | Not started | - |
| 5. Testing & DevSecOps Dogfooding | 0/5 | Complete    | 2026-02-24 |
| 6. Polish, Demo Mode & Deployment | 3/3 | Complete   | 2026-02-24 |

---

*Roadmap created: 2026-02-15*
*Total phases: 6 | Total plans: 28 (4+5+7+4+5+3)*
*Ready for: `/gsd:plan-phase 1`*
