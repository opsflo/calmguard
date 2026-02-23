# CALMGuard - CALM-Native Continuous Compliance DevSecOps Platform

## Context

**Problem**: Financial institutions face a critical gap between architecture design and software delivery compliance. Architects define systems using models/diagrams, but DevOps teams manually translate these into pipelines, security policies, and compliance controls. This is slow, error-prone, and creates compliance drift.

**Solution**: CALMGuard reads FINOS CALM (Common Architecture Language Model) architecture definitions and automatically generates DevSecOps pipelines while continuously validating compliance across the software lifecycle using multi-agent AI.

**Why**: Built for the DTCC/FINOS Innovate.DTCC AI Hackathon (Feb 23-27, 2026). The 2025 Grand Prize winner was CIBC's "Automated Regulatory Change Management" - proving regulatory compliance automation wins. CALMGuard differentiates by being architecture-aware via CALM integration, which is FINOS's flagship Architecture-as-Code initiative.

**Positioning**: "From Architecture-as-Code to Continuous Compliance - Automatically."

**Track**: IT Innovation (Multi-agent development, DevSecOps, advanced security)

**Constraints**:
- Solo developer, 7 days prep + 5 days hackathon
- TypeScript/React only (aligns with CALM's TypeScript ecosystem)
- AOF-inspired agent patterns (YAML definitions, SKILL.md, fleet coordination)
- Must be open-sourceable (Apache 2.0) and contribute to FINOS ecosystem
- Must have impressive real-time web dashboard

---

## Architecture Overview

```
User uploads/selects CALM Architecture JSON
         |
         v
  +------------------+
  |   CALM Parser    |  Extracts nodes, relationships, controls, flows
  +--------+---------+
           |
           v
  +------------------+
  |   Orchestrator   |  Coordinates agent fleet, manages workflow, streams events via SSE
  +--------+---------+
           |
    Phase 1 (parallel)
    +------+------+------------------+
    |             |                  |
    v             v                  v
+----------+ +-----------+  +-----------+
|Arch       | |Compliance |  |Pipeline   |
|Analyzer   | |Mapper     |  |Generator  |
+-----+-----+ +-----+-----+  +-----+-----+
      |              |              |
      +--------------+--------------+
                     |
              Phase 2 (sequential)
                     v
              +------+------+
              | Risk Scorer |  Aggregates all results, produces final scores
              +------+------+
                     |
                     v
         +---------------------+
         |  Next.js Dashboard  |  Real-time SSE updates, React Flow graph,
         |  (Vercel deployed)  |  compliance scores, agent activity feed
         +---------------------+
```

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14+ (App Router) | SSR, API routes, Vercel deploy, SSE streaming |
| LLM SDK | Vercel AI SDK (`ai`) | Multi-provider, streaming, `generateObject`, TypeScript native |
| Default LLM | Claude Sonnet 4 (Anthropic) | Best structured output quality, cost-efficient |
| UI Components | shadcn/ui + Tailwind CSS | Beautiful, accessible, fast to build |
| Architecture Viz | React Flow | Node-edge graphs, dark mode, custom nodes, animations |
| Charts | Recharts | React-native charts for gauges and heat maps |
| State | Zustand | Minimal boilerplate, works with SSE event updates |
| Validation | Zod | Schema validation for agent outputs; pairs with AI SDK |
| CALM Types | @finos/calm-models | Official FINOS TypeScript types |
| CALM Validation | @finos/calm-cli (subprocess) | Official CLI for schema validation |
| Agent Definitions | YAML (yaml package) | AOF-inspired human-readable agent configs |
| Skills Knowledge | Markdown files (SKILL.md) | AOF-inspired domain knowledge injection |
| Deployment | Vercel (free tier) | Zero-config Next.js deployment |
| Package Manager | pnpm | Fast, disk-efficient |

---

## Project Structure

```
calmguard/
  .github/workflows/ci.yml
  public/
    demo/
      trading-platform.calm.json
      payment-gateway.calm.json
  src/
    app/
      layout.tsx                    # Root layout, dark theme, sidebar nav
      page.tsx                      # Landing page - upload/select CALM architecture
      dashboard/
        page.tsx                    # Main compliance dashboard
        layout.tsx                  # Dashboard shell with sidebar
      api/
        analyze/route.ts            # POST: Start analysis, returns SSE stream
        agents/route.ts             # GET: SSE stream of agent events
        calm/
          parse/route.ts            # POST: Parse CALM JSON
          validate/route.ts         # POST: Validate CALM against schema
        pipeline/route.ts           # GET: Generated pipeline configs
    lib/
      calm/
        parser.ts                   # CALM JSON parser -> AnalysisInput
        validator.ts                # Schema validation (ajv or calm-cli subprocess)
        types.ts                    # TypeScript types mirroring CALM schema
        examples.ts                 # Built-in demo architecture loader
      agents/
        types.ts                    # Agent event types, fleet definitions
        orchestrator.ts             # Fleet coordinator (parallel fan-out + sequential merge)
        architecture-analyzer.ts    # Agent: extracts components, data flows, trust boundaries
        compliance-mapper.ts        # Agent: maps controls to regulatory frameworks
        pipeline-generator.ts       # Agent: creates CI/CD, security scan, IaC configs
        risk-scorer.ts              # Agent: evaluates compliance posture, risk heat map
        registry.ts                 # YAML agent definition loader
      skills/
        loader.ts                   # SKILL.md file reader, injects into prompts
      ai/
        provider.ts                 # AI SDK multi-provider setup
        prompts.ts                  # System prompts for each agent
        streaming.ts                # SSE streaming utilities + event emitter
      compliance/
        frameworks.ts               # Regulatory framework control definitions
        control-mapping.ts          # CALM control -> framework mapping engine
        scoring.ts                  # Risk scoring algorithm
      pipeline/
        github-actions.ts           # GitHub Actions YAML generator
        security-scanning.ts        # Security tool config generator (Semgrep, CodeQL, Trivy)
        iac.ts                      # IaC template generator (Terraform snippets)
    components/
      ui/                           # shadcn/ui base components
      dashboard/
        compliance-score.tsx        # Circular gauge (0-100) with animated fill
        agent-activity.tsx          # Real-time scrolling agent event feed
        architecture-graph.tsx      # React Flow node-edge visualization
        risk-heatmap.tsx            # Grid: nodes x compliance domains
        control-matrix.tsx          # Table: controls x regulatory frameworks
        pipeline-preview.tsx        # Tabbed code viewer with syntax highlighting
        findings-table.tsx          # Sortable/filterable findings list
      layout/
        sidebar.tsx                 # Left navigation sidebar
        header.tsx                  # Top header with project name
        theme-provider.tsx          # Dark theme provider
    hooks/
      use-agent-stream.ts           # SSE EventSource hook for agent events
      use-calm-parser.ts            # CALM file upload/parse hook
      use-compliance.ts             # Compliance state management
    store/
      analysis-store.ts             # Zustand store for full analysis state
  agents/                           # YAML agent definitions (AOF-inspired)
    orchestrator.yaml
    architecture-analyzer.yaml
    compliance-mapper.yaml
    pipeline-generator.yaml
    risk-scorer.yaml
  skills/                           # SKILL.md compliance knowledge files
    SOX.md
    PCI-DSS.md
    FINOS-CCC.md
    NIST-CSF.md
  examples/                         # Demo CALM architectures
    trading-platform.calm.json
    payment-gateway.calm.json
  package.json
  tsconfig.json
  tailwind.config.ts
  next.config.ts
```

---

## Phase Breakdown

### Phase 1: Project Bootstrap + CALM Parser (Days 1-2)

**Goal**: Next.js project boots with dark dashboard shell, CALM JSON parses correctly into typed structures.

**Tasks**:
1. Initialize Next.js 14+ project with App Router, pnpm, TypeScript strict
2. Install core deps: `@finos/calm-models`, `ai` (Vercel AI SDK), `zod`, `yaml`, `zustand`, `react-flow`, `recharts`
3. Set up shadcn/ui with dark theme (slate/navy palette), install components: card, button, badge, table, tabs, dialog, scroll-area, separator, sheet, skeleton
4. Set up Tailwind config with custom colors: emerald (compliant), amber (partial), red (non-compliant), blue (info)
5. Build root layout (`src/app/layout.tsx`) with dark theme, sidebar nav skeleton
6. Build `src/lib/calm/types.ts` - TypeScript interfaces for CALM schema:
   - `CalmArchitecture` (top-level: nodes, relationships, metadata)
   - `CalmNode` (unique-id, node-type, name, description, interfaces, controls, data-classification)
   - `CalmRelationship` (unique-id, relationship-type, source, destination, protocol, controls)
   - `CalmControl` (control requirements, configurations)
   - `CalmFlow` (transitions, business purpose)
   - `AnalysisInput` (normalized structure consumed by agents)
7. Build `src/lib/calm/parser.ts` - Parse raw CALM JSON into `AnalysisInput`:
   - Extract all nodes with their types, interfaces, and embedded controls
   - Extract all relationships with protocols and embedded controls
   - Derive trust boundaries from node groupings and deployed-in relationships
   - Normalize controls from both nodes and relationships into flat list
   - Extract flows with transition sequences
8. Create demo CALM architectures:
   - `trading-platform.calm.json`: 8-10 nodes (Trader actor, Trading UI webclient, Order Service, Risk Engine, Market Data service, Trade DB, Audit Log DB, API Gateway, Identity Provider), 10-12 relationships (OAuth2, HTTPS, JDBC, WebSocket), 5+ controls (access restriction, audit logging, data classification, encryption)
   - `payment-gateway.calm.json`: 6-8 nodes (Merchant actor, Payment API, Fraud Detection, Card Network, Settlement Engine, Transaction DB, HSM), 8-10 relationships (mTLS, HTTPS, encrypted-at-rest), PCI-DSS relevant controls
9. Build `src/lib/calm/examples.ts` - loader for demo architectures
10. Build landing page (`src/app/page.tsx`) with architecture selector (dropdown of demos) and file upload area

**Key files**:
- `src/lib/calm/types.ts`
- `src/lib/calm/parser.ts`
- `src/lib/calm/examples.ts`
- `examples/trading-platform.calm.json`
- `examples/payment-gateway.calm.json`
- `src/app/layout.tsx`
- `src/app/page.tsx`

**Verification**: Run `pnpm dev`, select a demo architecture, verify it parses without errors and log the `AnalysisInput` to console.

---

### Phase 2: Agent Framework + SKILL.md System (Days 3-4)

**Goal**: YAML-defined agents load, SKILL.md knowledge injects into prompts, all 4 agents produce structured output from CALM input.

**Tasks**:
1. Build agent event type system (`src/lib/agents/types.ts`):
   - `AgentEvent` union type: started, thinking, tool-use, finding, completed, error
   - `AgentConfig` type matching YAML schema (name, displayName, icon, color, model, skills, inputs, outputs)
   - `AgentResult` generic type for structured agent outputs
   - `FleetStatus` type tracking all agents' states
2. Build YAML agent definition loader (`src/lib/agents/registry.ts`):
   - Read YAML files from `agents/` directory
   - Parse into typed `AgentConfig` objects
   - Provide `getAgent(name)` and `listAgents()` functions
3. Write agent YAML definitions (5 files in `agents/`):
   - `orchestrator.yaml`: coordinator role, no LLM (logic-only)
   - `architecture-analyzer.yaml`: model claude-sonnet, skills [], icon "scan", color "#3b82f6"
   - `compliance-mapper.yaml`: model claude-sonnet, skills [SOX.md, PCI-DSS.md, FINOS-CCC.md, NIST-CSF.md], icon "shield-check", color "#22c55e"
   - `pipeline-generator.yaml`: model claude-sonnet, skills [], icon "git-branch", color "#a855f7"
   - `risk-scorer.yaml`: model claude-sonnet, skills [], icon "alert-triangle", color "#ef4444"
4. Write SKILL.md compliance knowledge files (4 files in `skills/`):
   - `SOX.md`: Sections 302/404, audit trail requirements, access control, data integrity controls, CALM control mapping table, risk indicators
   - `PCI-DSS.md`: Requirements 1-12 summary, cardholder data controls, encryption requirements, access logging, CALM mapping table
   - `FINOS-CCC.md`: Common Cloud Controls categories, cloud security requirements, CALM control mapping
   - `NIST-CSF.md`: Identify/Protect/Detect/Respond/Recover functions, key controls, CALM mapping
5. Build skill loader (`src/lib/skills/loader.ts`):
   - Read markdown files from `skills/` directory
   - Parse frontmatter (if any) and body
   - Return concatenated knowledge string for prompt injection
6. Set up Vercel AI SDK (`src/lib/ai/provider.ts`):
   - Configure Anthropic provider (Claude Sonnet 4 default)
   - Add OpenAI as fallback provider
   - Environment variable based provider selection
7. Build SSE event emitter (`src/lib/ai/streaming.ts`):
   - Global EventEmitter for agent events
   - `emitAgentEvent(event: AgentEvent)` function
   - Event types: started, thinking, finding, completed, error
8. Build Architecture Analyzer agent (`src/lib/agents/architecture-analyzer.ts`):
   - Input: `AnalysisInput`
   - Uses `generateObject` with Zod schema
   - Output schema: `{ components: [{id, type, name, interfaces, dataFlows, trustBoundary}], dataFlows: [{source, destination, protocol, dataClassification, controls}], trustBoundaries: [{name, nodes[], securityLevel}], summary: string }`
   - Emits events: started -> thinking -> finding (per component) -> completed
9. Build Compliance Mapper agent (`src/lib/agents/compliance-mapper.ts`):
   - Input: `AnalysisInput` + loaded SKILL.md content
   - Output schema: `{ frameworkMappings: [{framework, controlId, calmControlId, status: compliant|partial|non-compliant|not-applicable, evidence, recommendation, severity: critical|high|medium|low|info}], overallScore: number, summary: string }`
   - Emits finding events for each non-compliant mapping
10. Build Pipeline Generator agent (`src/lib/agents/pipeline-generator.ts`):
    - Input: `AnalysisInput` + compliance findings
    - Output schema: `{ githubActions: string (YAML), securityScanning: {semgrep: string, codeql: string}, iac: {terraform: string}, summary: string }`
    - Generates GitHub Actions workflow with CALM validation, SAST scanning, dependency scanning, compliance report steps
11. Build Risk Scorer agent (`src/lib/agents/risk-scorer.ts`):
    - Input: All Phase 1 agent outputs
    - Output schema: `{ overallScore: number, frameworkScores: [{framework, score, findings}], nodeRiskMap: [{nodeId, riskLevel, reasons}], criticalFindings: [{finding, severity, recommendation}], summary: string }`
12. Build Orchestrator (`src/lib/agents/orchestrator.ts`):
    - Load agent configs from registry
    - Phase 1: Run Architecture Analyzer + Compliance Mapper + Pipeline Generator via `Promise.all()`
    - Phase 2: Run Risk Scorer with aggregated Phase 1 results
    - Emit workflow-level events (workflow-started, phase-1-started, phase-1-complete, phase-2-started, workflow-complete)
    - Return combined `AnalysisResult` object

**Key files**:
- `src/lib/agents/types.ts`
- `src/lib/agents/registry.ts`
- `src/lib/agents/orchestrator.ts`
- `src/lib/agents/architecture-analyzer.ts`
- `src/lib/agents/compliance-mapper.ts`
- `src/lib/agents/pipeline-generator.ts`
- `src/lib/agents/risk-scorer.ts`
- `src/lib/skills/loader.ts`
- `src/lib/ai/provider.ts`
- `src/lib/ai/streaming.ts`
- `agents/*.yaml`
- `skills/*.md`

**Verification**: Run orchestrator programmatically against trading-platform.calm.json, verify all 4 agents produce valid structured output, events stream correctly.

---

### Phase 3: API Routes + SSE Streaming (Day 5)

**Goal**: HTTP API routes accept CALM JSON, run agent pipeline, stream events to client via SSE.

**Tasks**:
1. Build POST `/api/calm/parse` route (`src/app/api/calm/parse/route.ts`):
   - Accepts CALM JSON body
   - Runs parser, returns typed `AnalysisInput`
   - Returns 400 with errors if parsing fails
2. Build POST `/api/analyze` route (`src/app/api/analyze/route.ts`):
   - Accepts CALM JSON body
   - Parses CALM into `AnalysisInput`
   - Starts orchestrator in background
   - Returns SSE stream (ReadableStream with `text/event-stream` content type)
   - Each agent event emitted as SSE `data:` line
   - Final event is `workflow-complete` with full `AnalysisResult`
3. Build GET `/api/agents` route (`src/app/api/agents/route.ts`):
   - Returns SSE stream subscribing to global agent event emitter
   - Client connects via EventSource
   - Events include: agent identity (name, icon, color), event type, message, data payload
4. Build GET `/api/pipeline` route (`src/app/api/pipeline/route.ts`):
   - Returns the most recent pipeline generation result
   - Includes generated GitHub Actions YAML, security configs, IaC templates
5. Build `src/hooks/use-agent-stream.ts`:
   - React hook wrapping EventSource connection to `/api/analyze`
   - Manages state: `events: AgentEvent[]`, `status: idle|running|complete|error`
   - Auto-reconnects on connection loss
   - Returns `{ events, status, startAnalysis(calmJson), reset }`
6. Build Zustand store (`src/store/analysis-store.ts`):
   - State: `calmInput`, `analysisResult`, `agentEvents`, `status`, `selectedArchitecture`
   - Actions: `setArchitecture`, `startAnalysis`, `addEvent`, `setResult`, `reset`
   - Derived selectors: `complianceScore`, `criticalFindings`, `agentStatuses`

**Key files**:
- `src/app/api/analyze/route.ts`
- `src/app/api/agents/route.ts`
- `src/app/api/calm/parse/route.ts`
- `src/app/api/pipeline/route.ts`
- `src/hooks/use-agent-stream.ts`
- `src/store/analysis-store.ts`

**Verification**: Use curl or Postman to POST a CALM JSON to `/api/analyze`, verify SSE events stream back with correct agent events and final result.

---

### Phase 4: Dashboard - Core Components (Days 6-7)

**Goal**: Complete dashboard with all visualization components, connected to SSE stream, showing real-time agent activity.

**Tasks**:
1. Build dashboard layout (`src/app/dashboard/layout.tsx`):
   - Left sidebar with navigation: Overview, Architecture, Compliance, Pipeline, Findings
   - Top header with project name "CALMGuard" + architecture selector
   - Main content area with responsive grid
   - Dark theme: slate-900 background, slate-800 cards, subtle borders
2. Build sidebar component (`src/components/layout/sidebar.tsx`):
   - Navigation items with icons (from lucide-react)
   - Agent status indicators in sidebar (colored dots: gray=idle, blue=running, green=done, red=error)
   - Animated dot pulse when agent is running
3. Build Agent Activity Feed (`src/components/dashboard/agent-activity.tsx`):
   - Scrolling list of agent events consumed from Zustand store
   - Each event: colored agent icon + name + timestamp + message
   - Events appear with slide-in animation
   - "Thinking" events show animated dots
   - "Finding" events show severity badge (critical=red, high=orange, medium=yellow, low=blue)
   - Auto-scroll to latest event
   - This is the most important visual component for the demo
4. Build Architecture Graph (`src/components/dashboard/architecture-graph.tsx`):
   - React Flow with dark theme (background: slate-950)
   - Custom node components by `node-type`:
     - service: rounded rectangle with gear icon
     - database: cylinder shape
     - webclient: browser icon
     - actor: person icon
     - system: box icon
   - Edge labels showing protocol (HTTP, JDBC, WebSocket, mTLS)
   - Node border color reflects compliance status (green/amber/red) - updates in real-time as agents report
   - Trust boundary groups rendered as dashed-border rectangles
   - Auto-layout using dagre (hierarchical left-to-right)
   - Animated edges during analysis (pulsing flow)
5. Build Compliance Score Gauge (`src/components/dashboard/compliance-score.tsx`):
   - Large circular SVG gauge (0-100)
   - Color gradient: 0-40 red, 40-70 amber, 70-100 green
   - Animated counting effect (counts up from 0 as score arrives)
   - Framework breakdown below gauge: individual scores for SOX, PCI-DSS, CCC, NIST
   - Each framework shown as small horizontal bar
6. Build Risk Heat Map (`src/components/dashboard/risk-heatmap.tsx`):
   - CSS grid: rows = CALM nodes, columns = compliance domains (Access, Audit, Encryption, Data Classification, Network)
   - Cell color: green (compliant), amber (partial), red (non-compliant), gray (not-applicable)
   - Hover tooltip shows details
   - Smooth color transition animation as data arrives
7. Build Control Matrix (`src/components/dashboard/control-matrix.tsx`):
   - shadcn/ui Table component
   - Rows: regulatory framework controls (SOX-302.1, PCI-DSS-1.1, etc.)
   - Columns: Status, CALM Control, Evidence, Recommendation
   - Status column with colored badges
   - Sortable by severity
   - Filterable by framework
8. Build Pipeline Preview (`src/components/dashboard/pipeline-preview.tsx`):
   - Tabbed interface: "GitHub Actions" | "Security Scanning" | "Infrastructure"
   - Code block with syntax highlighting (use shiki or highlight.js)
   - Copy-to-clipboard button per tab
   - Download button (downloads YAML file)
9. Build Findings Table (`src/components/dashboard/findings-table.tsx`):
   - sortable data table with columns: Severity, Finding, Node, Framework, Recommendation
   - Color-coded severity badges
   - Expandable rows for full details
10. Build main dashboard page (`src/app/dashboard/page.tsx`):
    - Grid layout: top row = Compliance Score + Agent Activity (side by side)
    - Middle row = Architecture Graph (full width)
    - Bottom row = Risk Heat Map + Findings (tabs or side by side)
    - Pipeline Preview accessible via tab or separate route
11. Wire all components to Zustand store:
    - Components read from store selectors
    - SSE hook updates store on each event
    - Components re-render reactively as data streams in
12. Build the full user flow:
    - Landing page: select demo architecture or upload CALM JSON
    - Click "Analyze" button
    - Redirect to dashboard
    - Dashboard shows agents activating in real-time
    - Components populate progressively as agents complete
    - Final state: full compliance report with all visualizations

**Key files**:
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/layout.tsx`
- `src/components/dashboard/agent-activity.tsx`
- `src/components/dashboard/architecture-graph.tsx`
- `src/components/dashboard/compliance-score.tsx`
- `src/components/dashboard/risk-heatmap.tsx`
- `src/components/dashboard/control-matrix.tsx`
- `src/components/dashboard/pipeline-preview.tsx`
- `src/components/dashboard/findings-table.tsx`
- `src/components/layout/sidebar.tsx`

**Verification**: Start dev server, select trading platform architecture, click Analyze, verify all dashboard components render with real agent data streaming in real-time.

---

### Phase 5: Polish, Animations + Deploy (Days 8-9)

**Goal**: Dashboard is visually stunning, animations are smooth, deployed to Vercel, ready for hackathon.

**Tasks**:
1. Animation polish:
   - Agent activation cascade: sidebar agent dots light up in sequence (blue pulse) as each agent starts
   - Score counting: compliance score counts up digit-by-digit with easing
   - Architecture graph: nodes transition from gray to compliance color with smooth CSS transition
   - Agent feed: events slide in from right with fade
   - Heat map cells: fade from gray to their color as data arrives
   - Pipeline preview: code appears with typewriter effect
2. Loading states:
   - Skeleton loaders for all dashboard components while waiting for data
   - Pulsing placeholder for compliance score
   - Empty state messages when no analysis has been run
3. Error handling:
   - Toast notifications for API errors
   - Agent error display in activity feed
   - Retry button if analysis fails
   - Graceful degradation if individual agent fails (show partial results)
4. Responsive design:
   - Dashboard works on 1920x1080 (primary demo resolution)
   - Reasonable layout on 1366x768 (laptop)
   - Mobile not required for hackathon
5. Performance optimization:
   - `React.memo` on heavy components (Architecture Graph, Heat Map)
   - Memoize Zustand selectors
   - Lazy load Pipeline Preview and Findings Table
6. Deploy to Vercel:
   - Connect GitHub repo to Vercel
   - Set environment variables (ANTHROPIC_API_KEY, OPENAI_API_KEY)
   - Test production build
   - Verify SSE streaming works in production
7. README.md:
   - Project overview with screenshot
   - Architecture diagram (text-based)
   - Quick start instructions
   - CALM integration explanation
   - Agent system description
   - FINOS contribution roadmap
8. CI setup:
   - GitHub Actions: lint (eslint), typecheck (tsc), build
   - Runs on push to main

**Key files**:
- All component files (animation additions)
- `README.md`
- `.github/workflows/ci.yml`
- `vercel.json` (if needed)

**Verification**: Full end-to-end test on deployed Vercel URL: select architecture -> analyze -> watch agents work in real-time -> verify all dashboard components render correctly -> verify generated pipeline configs are valid YAML.

---

### Phase 6: Hackathon Features + Demo Mode (Days 10-12)

**Goal**: Hackathon-specific features, guided demo mode, presentation preparation.

**Tasks**:
1. Guided demo mode:
   - Add "Run Demo" button on landing page
   - Auto-selects trading platform architecture
   - Runs analysis with slight delays between agent events for dramatic effect
   - Highlights key findings as they appear
2. Custom CALM upload:
   - File upload with drag-and-drop zone
   - JSON validation before submission
   - Error display for invalid CALM files
3. Framework selector:
   - Checkboxes on landing page to select which frameworks to check (SOX, PCI-DSS, CCC, NIST)
   - Filters agent analysis to selected frameworks only
4. Export report:
   - "Export Report" button on dashboard
   - Generates markdown summary of all findings
   - Includes compliance scores, critical findings, recommendations
   - Downloadable as .md file
5. CALM CLI validation integration:
   - Run `npx @finos/calm-cli validate` as subprocess on uploaded architecture
   - Show validation results in dashboard (valid/invalid with details)
   - Demonstrates integration with existing CALM tooling
6. Presentation preparation:
   - Record demo video as backup
   - Build 6-slide deck (see pitch package in context)
   - Rehearse 3-minute pitch
   - Prepare Q&A answers

**Key files**:
- `src/app/page.tsx` (demo mode additions)
- `src/components/dashboard/export-report.tsx`
- `src/lib/calm/validator.ts` (CLI integration)

**Verification**: Run guided demo end-to-end, verify it tells a compelling story. Export report and verify content is complete and professional.

---

## Priority Tiers (Cut from bottom if behind)

**Tier 1 - Must Have (Demo works)**:
- CALM parser with 2 demo architectures
- 4 agents producing structured output (Architecture Analyzer, Compliance Mapper, Pipeline Generator, Risk Scorer)
- Orchestrator with SSE streaming
- Dashboard: Architecture Graph + Compliance Score + Agent Activity Feed
- Deployed on Vercel

**Tier 2 - Should Have (Demo impresses)**:
- All animations (score counting, agent cascade, graph coloring)
- Risk Heat Map + Control Matrix + Pipeline Preview
- SKILL.md knowledge base (SOX, PCI-DSS, CCC, NIST)
- YAML agent definitions
- Findings Table

**Tier 3 - Nice to Have (Demo wins)**:
- Guided demo mode
- Custom CALM file upload
- Export report
- CALM CLI validation integration
- Framework selector
- CI/CD pipeline

---

## CALM Integration Details

**CALM Schema Version**: 1.1 (latest release)
**Schema Source**: `https://raw.githubusercontent.com/finos/architecture-as-code/main/calm/release/1.1/`

**Core CALM concepts to parse**:
- `nodes[]` - each has `unique-id`, `node-type` (service|database|webclient|actor|system|network), `name`, `description`, `interfaces[]`, `controls{}`, `data-classification`
- `relationships[]` - each has `unique-id`, `relationship-type` (interacts|connects|deployed-in|composed-of), `parties.source`/`parties.destination`, `protocol`, `controls{}`
- `controls` - embedded on nodes and relationships, contain security/compliance policies
- `metadata` - arbitrary key-value pairs for compliance tags

**Key @finos/calm-models types to reference**:
- `CalmNodeSchema`, `CalmNodeTypeSchema`
- `CalmArchitectureSchema`
- Import from `@finos/calm-models/types`

---

## Agent System Details (AOF-Inspired Patterns)

**YAML Agent Definition Format**:
```yaml
apiVersion: calmguard/v1
kind: Agent
metadata:
  name: compliance-mapper
  displayName: "Compliance Mapper"
  icon: "shield-check"
  color: "#22c55e"
spec:
  role: "Map CALM architecture controls to regulatory compliance frameworks"
  model:
    provider: anthropic
    model: claude-sonnet-4-20250514
    temperature: 0.2
  skills:
    - skills/SOX.md
    - skills/PCI-DSS.md
    - skills/FINOS-CCC.md
  inputs:
    - type: parsed-architecture
  outputs:
    - type: compliance-mapping
  maxTokens: 4096
```

**Agent Implementation Pattern**: Each agent uses Vercel AI SDK's `generateObject` with a Zod schema to enforce structured output. Skills content is injected into the system prompt. Events are emitted via the global event emitter for SSE streaming.

**Orchestration**: Orchestrator-Workers pattern. Phase 1 runs 3 agents in parallel via `Promise.all()`. Phase 2 runs Risk Scorer sequentially on aggregated results. All events stream to dashboard in real-time.

---

## Open-Source Contribution Strategy (For Presentation)

1. Propose `calm guard` CLI command to finos/architecture-as-code
2. Contribute compliance SKILL.md files to calm-ai module
3. Bridge CALM controls with FINOS Common Cloud Controls identifiers
4. Publish CALMGuard as standalone FINOS Labs project (Apache 2.0)

---

## Demo Architectures

**Trading Platform** (resonates with DTCC judges):
- Trader (actor) -> Trading UI (webclient) -> API Gateway (system) -> Order Service (service) -> Trade DB (database)
- Risk Engine (service) polls Market Data (service)
- Audit Log DB (database) receives from all services
- Identity Provider (system) handles OAuth2
- Controls: access-restriction, audit-logging, data-classification (PII), encryption-at-rest, encryption-in-transit

**Payment Gateway** (demonstrates PCI-DSS):
- Merchant (actor) -> Payment API (service) -> Fraud Detection (service) -> Card Network (system)
- Settlement Engine (service) -> Transaction DB (database)
- HSM (system) for key management
- Controls: cardholder-data-protection, encryption, access-logging, network-segmentation
