---
phase: 02-multi-agent-infrastructure
plan: 04
subsystem: multi-agent-ai
tags: [ai-agents, vercel-ai-sdk, zod, sse-streaming, compliance, risk-assessment]

dependency_graph:
  requires:
    - 02-01: AI SDK provider setup and SSE streaming infrastructure
    - 02-02: Agent YAML configs and compliance SKILL.md knowledge files
    - 02-03: Agent registry and skill loader for config/knowledge loading
  provides:
    - architecture-analyzer: Component extraction, data flow analysis, trust boundaries
    - compliance-mapper: Framework control mapping with SOX/PCI-DSS/CCC/NIST-CSF
    - pipeline-generator: GitHub Actions, security scanning, IaC generation
    - risk-scorer: Aggregated risk scoring with node risk map and executive summary
  affects:
    - 02-05: Orchestrator will use these 4 agents for multi-agent analysis workflow

tech_stack:
  added:
    - Vercel AI SDK generateObject for structured LLM output
    - Zod schemas for all agent outputs (validation + type inference)
    - Retry logic with exponential backoff (1s, 2s, 4s)
  patterns:
    - Consistent agent pattern: load config → get model → emit events → generateObject → retry → return AgentResult
    - SSE event emission at all lifecycle points (started, thinking, finding, completed, error)
    - AgentIdentity construction from config.metadata for all events
    - Type-safe agent results with AgentResult<T> wrapper

key_files:
  created:
    - src/lib/agents/architecture-analyzer.ts: Extracts components, data flows, trust boundaries, security zones
    - src/lib/agents/compliance-mapper.ts: Maps controls to 4 compliance frameworks with scores and gaps
    - src/lib/agents/pipeline-generator.ts: Generates CI/CD pipeline, security scanning, IaC configs
    - src/lib/agents/risk-scorer.ts: Aggregates all results into overall/framework scores and node risk map
  modified: []

decisions:
  - decision: Use retry logic with exponential backoff for all agents
    rationale: LLM calls can fail due to transient errors or rate limits; 3 attempts with 1s/2s/4s delays balances reliability vs latency
    alternatives: [No retry (fragile), Linear backoff (slower), Circuit breaker (overkill for 4 agents)]
  - decision: Risk Scorer takes RiskScorerInput with originalInput field
    rationale: Risk scorer needs full CALM context to map findings back to nodes; orchestrator responsible for passing it
    alternatives: [Re-parse CALM in agent (wasteful), Pass only node IDs (insufficient context)]
  - decision: Compliance Mapper injects full SKILL.md content into prompt
    rationale: LLMs need detailed framework knowledge to perform accurate control mapping; skills are 186-468 lines each
    alternatives: [Summarize skills (loses detail), RAG with embeddings (adds complexity), Fine-tune model (infeasible for hackathon)]

metrics:
  duration_minutes: 4
  tasks_completed: 2
  files_created: 4
  commits: 2
  lines_of_code: 954
  completed_date: 2026-02-16
---

# Phase 02 Plan 04: Core AI Agent Implementations Summary

**One-liner:** Implemented 4 production-ready AI agents (Architecture Analyzer, Compliance Mapper, Pipeline Generator, Risk Scorer) using Vercel AI SDK generateObject with Zod schemas, SSE streaming, and exponential backoff retry logic.

## What Was Built

### Architecture Analyzer
- Extracts **components** (all CALM nodes with security controls and data classification)
- Analyzes **data flows** (source/destination, protocol, encryption status, data types)
- Identifies **trust boundaries** (network, security-zone, deployment, organizational groupings)
- Maps **security zones** (high/medium/low/untrusted trust levels based on node types and controls)
- Generates **findings** with severity, affected nodes, and recommendations
- Emits SSE events for all findings during analysis

### Compliance Mapper
- Maps CALM controls to **4 frameworks**: SOX, PCI-DSS, CCC, NIST-CSF
- Injects **SKILL.md knowledge** (186-468 lines per framework) into prompt for accurate mapping
- Produces **per-framework scores** (0-100 scale) with compliant/partial/non-compliant breakdowns
- Identifies **compliance gaps** where framework requires controls not present in CALM
- Status values: compliant, partial, non-compliant, not-applicable
- Emits SSE events for non-compliant and partial mappings

### Pipeline Generator
- Generates **GitHub Actions workflow** YAML with lint/typecheck/build/test/deploy stages
- Configures **4 security scanning tools**: Semgrep, CodeQL, Trivy, npm-audit
- Creates **Infrastructure as Code** templates (Terraform or CloudFormation)
- Provides **actionable recommendations** across ci-cd, security, infrastructure, monitoring categories
- Prioritizes recommendations by high/medium/low priority
- Emits SSE events for high-priority recommendations

### Risk Scorer
- Aggregates results from **3 previous agents** plus original CALM input
- Calculates **overall risk score** (0-100) using weighted formula: compliance 40%, architecture 30%, pipeline 20%, trust boundaries 10%
- Maps score to **rating**: 80-100=low, 60-79=medium, 40-59=high, 0-39=critical
- Produces **per-framework scores** with same rating scale
- Generates **node risk map** with risk level, factors, and compliance gaps per node
- Extracts **top 10 findings** prioritized by severity (critical > high > medium > low)
- Provides **executive summary** (business impact focus, non-technical) and technical summary
- Emits SSE events for critical and high severity findings

## Shared Agent Pattern

All 4 agents follow consistent implementation pattern:

1. **Load Config**: `loadAgentConfig(name)` from YAML
2. **Construct Identity**: `AgentIdentity` from `config.metadata` (name, displayName, icon, color)
3. **Get Model**: `getModelForAgent(config)` with fallback to `getDefaultModel()`
4. **Emit Started**: SSE event with agent identity
5. **Build Prompt**: Include role from config, serialize input as JSON, add task instructions (Compliance Mapper also injects skills)
6. **Emit Thinking**: Progress message to dashboard
7. **Generate Object**: `generateObject({ model, schema, prompt })` with retry logic (3 attempts, exponential backoff 1s/2s/4s)
8. **Emit Findings**: SSE events for important findings based on severity/status
9. **Emit Completed**: Success message with summary stats
10. **Return Result**: `AgentResult<T>` with `{ agentName, success, data, duration }`

Error handling: try/catch wrapper, emit error event, return `{ success: false, error: message, duration }`

## Type Safety & Validation

All agents use **Zod schemas** for output validation:
- `architectureAnalysisSchema`: Components, data flows, trust boundaries, security zones, findings
- `complianceMappingSchema`: Framework mappings, scores, gaps
- `pipelineConfigSchema`: GitHub Actions, security scanning, IaC, recommendations
- `riskAssessmentSchema`: Overall/framework scores, node risk map, top findings, summaries

Type inference: `type T = z.infer<typeof schema>` provides full TypeScript types from Zod schemas

## Deviations from Plan

None - plan executed exactly as written.

All 4 agents implemented with:
- Zod schemas for structured output ✓
- SSE event emission (started, thinking, finding, completed, error) ✓
- Retry logic with exponential backoff ✓
- AgentIdentity from config.metadata ✓
- AgentResult<T> wrapper ✓

## Integration Points

**Inputs:**
- Architecture Analyzer, Compliance Mapper, Pipeline Generator: Accept `AnalysisInput` from CALM extractor
- Risk Scorer: Accepts `RiskScorerInput` with aggregated results from 3 agents + `originalInput: AnalysisInput`

**Outputs:**
- All agents return `AgentResult<T>` with typed data, success flag, duration
- All agents emit SSE events via global `agentEventEmitter`

**Dependencies:**
- `@/lib/agents/registry`: `loadAgentConfig(name)` for YAML configs
- `@/lib/skills/loader`: `loadSkillsForAgent(config)` for SKILL.md injection (Compliance Mapper only)
- `@/lib/ai/provider`: `getModelForAgent(config)`, `getDefaultModel()` for LLM access
- `@/lib/ai/streaming`: `emitAgentEvent(event)` for SSE streaming
- `@/lib/calm/extractor`: `AnalysisInput` type for input structure
- `ai` package: `generateObject` for structured LLM output

## Next Steps (Plan 02-05)

Orchestrator implementation will:
1. Call Architecture Analyzer, Compliance Mapper, Pipeline Generator in **parallel** (`Promise.all`)
2. Pass results to Risk Scorer **sequentially** (depends on Phase 1 results)
3. Stream all events to dashboard via SSE API route
4. Return complete `OrchestrationResult` with all agent outputs

## Self-Check: PASSED

**Created files:**
```bash
$ [ -f "src/lib/agents/architecture-analyzer.ts" ] && echo "FOUND: src/lib/agents/architecture-analyzer.ts" || echo "MISSING: src/lib/agents/architecture-analyzer.ts"
FOUND: src/lib/agents/architecture-analyzer.ts

$ [ -f "src/lib/agents/compliance-mapper.ts" ] && echo "FOUND: src/lib/agents/compliance-mapper.ts" || echo "MISSING: src/lib/agents/compliance-mapper.ts"
FOUND: src/lib/agents/compliance-mapper.ts

$ [ -f "src/lib/agents/pipeline-generator.ts" ] && echo "FOUND: src/lib/agents/pipeline-generator.ts" || echo "MISSING: src/lib/agents/pipeline-generator.ts"
FOUND: src/lib/agents/pipeline-generator.ts

$ [ -f "src/lib/agents/risk-scorer.ts" ] && echo "FOUND: src/lib/agents/risk-scorer.ts" || echo "MISSING: src/lib/agents/risk-scorer.ts"
FOUND: src/lib/agents/risk-scorer.ts
```

**Commits:**
```bash
$ git log --oneline --all | grep -q "857f750" && echo "FOUND: 857f750" || echo "MISSING: 857f750"
FOUND: 857f750

$ git log --oneline --all | grep -q "d7a9aec" && echo "FOUND: d7a9aec" || echo "MISSING: d7a9aec"
FOUND: d7a9aec
```

**TypeScript validation:**
```bash
$ pnpm typecheck
> tsc --noEmit
(no errors)
```

**Build verification:**
```bash
$ pnpm build
✓ Compiled successfully
✓ Generating static pages (5/5)
```

All checks passed.
