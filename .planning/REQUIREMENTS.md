# Requirements: CALMGuard

**Defined:** 2026-02-15
**Core Value:** When a user uploads a CALM architecture JSON, CALMGuard analyzes it with AI agents and produces a real-time compliance dashboard with architecture visualization, compliance scores, risk findings, and generated CI/CD pipeline configs.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### CALM Parsing

- [ ] **CALM-01**: User can load a demo CALM architecture (trading platform or payment gateway) from a dropdown selector
- [ ] **CALM-02**: System parses CALM JSON v1.1 into typed AnalysisInput structure extracting nodes, relationships, controls, and flows
- [ ] **CALM-03**: System validates CALM JSON against schema and displays clear error messages for invalid files
- [ ] **CALM-04**: User can upload a custom CALM JSON file via drag-and-drop with validation feedback
- [ ] **CALM-05**: System integrates with @finos/calm-cli to validate uploaded architectures against official CALM schema

### Agent System

- [ ] **AGNT-01**: Architecture Analyzer agent extracts components, data flows, and trust boundaries from parsed CALM architecture
- [ ] **AGNT-02**: Compliance Mapper agent maps CALM controls to SOX, PCI-DSS, FINOS-CCC, and NIST-CSF frameworks using SKILL.md knowledge
- [ ] **AGNT-03**: Pipeline Generator agent creates GitHub Actions YAML, security scanning configs (Semgrep, CodeQL), and IaC templates (Terraform)
- [ ] **AGNT-04**: Risk Scorer agent aggregates all agent outputs and produces overall compliance score, per-framework scores, and node risk map
- [ ] **AGNT-05**: Orchestrator runs Architecture Analyzer + Compliance Mapper + Pipeline Generator in parallel, then Risk Scorer sequentially
- [ ] **AGNT-06**: All agents use Vercel AI SDK generateObject with Zod schemas for structured output validation
- [ ] **AGNT-07**: Agent definitions are loaded from YAML config files in agents/ directory (AOF-inspired)
- [ ] **AGNT-08**: Compliance knowledge is loaded from SKILL.md files (SOX.md, PCI-DSS.md, FINOS-CCC.md, NIST-CSF.md) and injected into agent prompts

### LLM Provider

- [ ] **LLM-01**: System uses Google Gemini as default LLM provider
- [ ] **LLM-02**: System supports Anthropic Claude as alternative provider
- [ ] **LLM-03**: System supports OpenAI as alternative provider
- [ ] **LLM-04**: System supports Ollama for local LLM execution
- [ ] **LLM-05**: System supports xAI Grok as alternative provider
- [ ] **LLM-06**: User can select which frameworks to analyze against (SOX, PCI-DSS, CCC, NIST) before starting analysis

### Streaming & API

- [ ] **API-01**: POST /api/analyze accepts CALM JSON and returns SSE stream of agent events
- [ ] **API-02**: POST /api/calm/parse accepts CALM JSON and returns typed AnalysisInput
- [ ] **API-03**: GET /api/pipeline returns most recent pipeline generation result
- [ ] **API-04**: SSE events include agent identity (name, icon, color), event type, message, and data payload
- [ ] **API-05**: Client EventSource hook manages connection state (idle, running, complete, error) with auto-reconnect
- [ ] **API-06**: API contracts between frontend and backend are clearly defined with Zod schemas in a shared location

### Dashboard Layout

- [ ] **DASH-01**: Dashboard has dark theme (slate-900 bg, slate-800 cards) with left sidebar navigation
- [ ] **DASH-02**: Sidebar shows navigation items (Overview, Architecture, Compliance, Pipeline, Findings) with agent status indicators
- [ ] **DASH-03**: Top header displays "CALMGuard" with architecture selector
- [ ] **DASH-04**: Main content area uses responsive grid layout optimized for 1920x1080

### Visualization

- [ ] **VIZ-01**: Architecture graph renders CALM nodes as custom React Flow nodes by type (service, database, webclient, actor, system)
- [ ] **VIZ-02**: Graph edges show protocol labels (HTTP, JDBC, WebSocket, mTLS)
- [ ] **VIZ-03**: Node border colors reflect compliance status (green/amber/red) and update in real-time as agents report
- [ ] **VIZ-04**: Trust boundaries render as dashed-border rectangles grouping nodes
- [ ] **VIZ-05**: Graph uses dagre auto-layout (hierarchical left-to-right) with animated edges during analysis

### Compliance Display

- [ ] **COMP-01**: Circular SVG compliance gauge shows overall score (0-100) with color gradient (red/amber/green)
- [ ] **COMP-02**: Gauge animates with counting effect as score arrives
- [ ] **COMP-03**: Per-framework breakdown (SOX, PCI-DSS, CCC, NIST) shown as horizontal bars below gauge
- [ ] **COMP-04**: Risk heat map shows grid of nodes x compliance domains with color-coded cells (green/amber/red/gray)
- [ ] **COMP-05**: Control matrix table maps regulatory framework controls to CALM controls with status badges, sortable by severity, filterable by framework
- [ ] **COMP-06**: Findings table is sortable/filterable with columns: Severity, Finding, Node, Framework, Recommendation

### Agent Activity

- [ ] **FEED-01**: Real-time scrolling agent event feed shows agent events as they occur
- [ ] **FEED-02**: Each event shows colored agent icon + name + timestamp + message
- [ ] **FEED-03**: Events appear with slide-in animation, "thinking" events show animated dots
- [ ] **FEED-04**: "Finding" events show severity badge (critical=red, high=orange, medium=yellow, low=blue)
- [ ] **FEED-05**: Feed auto-scrolls to latest event
- [ ] **FEED-06**: Sidebar agent dots light up in sequence (blue pulse) as each agent starts

### Pipeline Preview

- [ ] **PIPE-01**: Tabbed interface shows GitHub Actions, Security Scanning, and Infrastructure tabs
- [ ] **PIPE-02**: Code blocks have syntax highlighting
- [ ] **PIPE-03**: Copy-to-clipboard and download buttons per tab

### Demo & Polish

- [ ] **DEMO-01**: "Run Demo" button on landing page auto-selects trading platform architecture
- [ ] **DEMO-02**: Demo mode runs analysis with slight delays between agent events for dramatic effect
- [ ] **DEMO-03**: Demo highlights key findings as they appear
- [ ] **DEMO-04**: "Export Report" button generates downloadable markdown summary of all findings, scores, and recommendations

### Animations

- [ ] **ANIM-01**: Compliance score counts up digit-by-digit with easing
- [ ] **ANIM-02**: Architecture graph nodes transition from gray to compliance color with smooth CSS transition
- [ ] **ANIM-03**: Agent feed events slide in from right with fade
- [ ] **ANIM-04**: Heat map cells fade from gray to their color as data arrives
- [ ] **ANIM-05**: Pipeline preview code appears with typewriter effect

### Infrastructure

- [ ] **INFRA-01**: Application deploys to Vercel with SSE streaming working in production
- [ ] **INFRA-02**: GitHub Actions CI runs lint (eslint), typecheck (tsc), and build on push to main
- [ ] **INFRA-03**: Skeleton loaders shown for all dashboard components while waiting for data
- [ ] **INFRA-04**: Error handling with toast notifications, agent error display, and retry button
- [ ] **INFRA-05**: Graceful degradation if individual agent fails (show partial results)

### Testing

- [ ] **TEST-01**: All CALM parsing logic has unit tests written before implementation (TDD)
- [ ] **TEST-02**: All agent output Zod schemas have validation tests
- [ ] **TEST-03**: API routes have integration tests verifying request/response contracts
- [ ] **TEST-04**: SSE streaming has end-to-end tests verifying event delivery
- [ ] **TEST-05**: Dashboard components have component tests for key interactions

### DevSecOps (Dogfooding)

- [ ] **DSOP-01**: GitHub Actions CI/CD pipeline with lint, typecheck, build, and test stages
- [ ] **DSOP-02**: SAST scanning integrated in pipeline (CodeQL or Semgrep)
- [ ] **DSOP-03**: Dependency scanning for known vulnerabilities (npm audit / Trivy)
- [ ] **DSOP-04**: SECURITY.md documenting security practices, vulnerability reporting, and threat model
- [ ] **DSOP-05**: Pre-commit hooks for linting and type checking
- [ ] **DSOP-06**: Branch protection and PR-based workflow

### Documentation

- [ ] **DOCS-01**: Docusaurus site with developer section (architecture, API reference, agent system, contributing)
- [ ] **DOCS-02**: Docusaurus site with user section (getting started, uploading architectures, reading reports)
- [ ] **DOCS-03**: API contract documentation auto-generated or maintained alongside Zod schemas
- [ ] **DOCS-04**: Documentation updated at each phase completion (built into workflow)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Persistence & History

- **HIST-01**: Analysis results saved to database for historical tracking
- **HIST-02**: User can compare compliance scores across architecture versions
- **HIST-03**: Audit trail of all analyses performed

### Notifications & Integrations

- **INTG-01**: Webhook notifications for compliance threshold violations
- **INTG-02**: Slack/Teams integration for findings alerts
- **INTG-03**: PR comment integration for CI/CD compliance checks

### Advanced Features

- **ADV-01**: Custom agent creation via web UI
- **ADV-02**: Architecture diff view between versions
- **ADV-03**: Policy-as-code engine for custom compliance rules
- **ADV-04**: SBOM integration for supply chain analysis

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile-first responsive design | Desktop dashboard optimized for 1920x1080 demo |
| Multi-user collaboration | Single-user analysis tool for hackathon |
| Persistent database | All analysis is ephemeral per session in v1 |
| Continuous monitoring / webhooks | On-demand analysis only in v1 |
| Authentication / RBAC | Hackathon demo, no auth needed |
| Real-time chat with agents | Adds complexity, one-way streaming is sufficient |
| Custom compliance framework builder | Pre-built 4 frameworks via SKILL.md sufficient for v1 |
| GitLab CI support | GitHub Actions only for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CALM-01 | Phase 1 | Pending |
| CALM-02 | Phase 1 | Pending |
| CALM-03 | Phase 1 | Pending |
| CALM-04 | Phase 6 | Pending |
| CALM-05 | Phase 6 | Pending |
| AGNT-01 | Phase 2 | Pending |
| AGNT-02 | Phase 2 | Pending |
| AGNT-03 | Phase 2 | Pending |
| AGNT-04 | Phase 2 | Pending |
| AGNT-05 | Phase 2 | Pending |
| AGNT-06 | Phase 2 | Pending |
| AGNT-07 | Phase 2 | Pending |
| AGNT-08 | Phase 2 | Pending |
| LLM-01 | Phase 2 | Pending |
| LLM-02 | Phase 2 | Pending |
| LLM-03 | Phase 2 | Pending |
| LLM-04 | Phase 2 | Pending |
| LLM-05 | Phase 2 | Pending |
| LLM-06 | Phase 4 | Pending |
| API-01 | Phase 3 | Pending |
| API-02 | Phase 3 | Pending |
| API-03 | Phase 3 | Pending |
| API-04 | Phase 3 | Pending |
| API-05 | Phase 3 | Pending |
| API-06 | Phase 3 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| VIZ-01 | Phase 3 | Pending |
| VIZ-02 | Phase 3 | Pending |
| VIZ-03 | Phase 3 | Pending |
| VIZ-04 | Phase 3 | Pending |
| VIZ-05 | Phase 3 | Pending |
| COMP-01 | Phase 4 | Pending |
| COMP-02 | Phase 4 | Pending |
| COMP-03 | Phase 4 | Pending |
| COMP-04 | Phase 4 | Pending |
| COMP-05 | Phase 4 | Pending |
| COMP-06 | Phase 4 | Pending |
| FEED-01 | Phase 3 | Pending |
| FEED-02 | Phase 3 | Pending |
| FEED-03 | Phase 3 | Pending |
| FEED-04 | Phase 3 | Pending |
| FEED-05 | Phase 3 | Pending |
| FEED-06 | Phase 3 | Pending |
| PIPE-01 | Phase 4 | Pending |
| PIPE-02 | Phase 4 | Pending |
| PIPE-03 | Phase 4 | Pending |
| DEMO-01 | Phase 6 | Pending |
| DEMO-02 | Phase 6 | Pending |
| DEMO-03 | Phase 6 | Pending |
| DEMO-04 | Phase 6 | Pending |
| ANIM-01 | Phase 6 | Pending |
| ANIM-02 | Phase 6 | Pending |
| ANIM-03 | Phase 6 | Pending |
| ANIM-04 | Phase 6 | Pending |
| ANIM-05 | Phase 6 | Pending |
| INFRA-01 | Phase 6 | Pending |
| INFRA-02 | Phase 5 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 4 | Pending |
| INFRA-05 | Phase 4 | Pending |
| TEST-01 | Phase 5 | Pending |
| TEST-02 | Phase 5 | Pending |
| TEST-03 | Phase 5 | Pending |
| TEST-04 | Phase 5 | Pending |
| TEST-05 | Phase 5 | Pending |
| DSOP-01 | Phase 5 | Pending |
| DSOP-02 | Phase 5 | Pending |
| DSOP-03 | Phase 5 | Pending |
| DSOP-04 | Phase 5 | Pending |
| DSOP-05 | Phase 5 | Pending |
| DSOP-06 | Phase 5 | Pending |
| DOCS-01 | Phase 5 | Pending |
| DOCS-02 | Phase 5 | Pending |
| DOCS-03 | Phase 5 | Pending |
| DOCS-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 67 total
- Mapped to phases: 67
- Unmapped: 0

**Coverage validation:** All 67 v1 requirements mapped to exactly one phase. No orphans, no duplicates.

---
*Requirements defined: 2026-02-15*
*Last updated: 2026-02-15 after roadmap creation*
