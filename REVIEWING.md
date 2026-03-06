<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 FINOS -->

# CALMGuard — Reviewer's Guide

This guide is written for FINOS technical reviewers. It explains what CALMGuard does, what to focus your review on, and how to navigate ~17K lines of code without getting lost.

## What Is CALMGuard?

CALMGuard is a CALM-native continuous compliance platform. It reads FINOS CALM (Common Architecture Language Model) architecture definitions and analyzes them with multi-agent AI to produce:

- A compliance report citing specific control IDs (PCI-DSS 4.0, NIST CSF 2.0, SOC2, SOX)
- A risk heat map scored by framework and severity
- Generated GitHub Actions CI pipeline workflows
- Compliance-remediated CALM files (protocols upgraded, controls added)
- Terraform/CloudFormation infrastructure configurations

All results stream in real-time to a dashboard using SSE.

## Code Size Context

| Category | Lines | Files |
|----------|-------|-------|
| Reviewable core (agents, parsing, compliance logic) | ~4,100 | 22 |
| React UI components | ~5,200 | 35 |
| shadcn/ui boilerplate (generated, not reviewed) | ~4,800 | 28 |
| Tests | ~2,100 | 16 |
| Configuration and tooling | ~800 | 12 |
| **Total** | **~17,000** | **113** |

**Focus your review on the ~4,100 lines of core logic.** The shadcn/ui components are generated and unmodified from the shadcn registry.

## Ordered Reading Path

Follow this path to understand the system from config to types to orchestration to agents to data:

### 1. Agent Configuration Format (~10 min)
Start here to understand the extensibility model.

- [`agents/orchestrator.yaml`](agents/orchestrator.yaml) — the orchestrator's own config (meta-level)
- [`agents/compliance-mapper.yaml`](agents/compliance-mapper.yaml) — a representative agent config with skills

### 2. Core Type System (~15 min)
Read these files to understand the contracts everything else implements against.

- [`src/lib/agents/types.ts`](src/lib/agents/types.ts) — 127 lines: `AgentEvent`, `AgentIdentity`, `AgentResult<T>` types
- [`src/lib/calm/types.ts`](src/lib/calm/types.ts) — CALM document types (Node, Relationship, Control, Flow)

### 3. Orchestration Flow (~20 min)
The heart of the system.

- [`src/lib/agents/orchestrator.ts`](src/lib/agents/orchestrator.ts) — 382 lines: Phase 1 parallel (`Promise.allSettled`) to Phase 2 sequential (Risk Scorer)
- [`src/lib/agents/registry.ts`](src/lib/agents/registry.ts) — agent config loader with Zod validation

### 4. Full Agent Walkthrough (~20 min)
Trace one agent end-to-end: config to code to skill.

- [`agents/compliance-mapper.yaml`](agents/compliance-mapper.yaml) — agent config with skill references
- [`src/lib/agents/compliance-mapper.ts`](src/lib/agents/compliance-mapper.ts) — `generateObject` with Zod schema, event emission
- [`skills/SOC2.md`](skills/SOC2.md) — grounded control ID matrix injected into agent prompt

### 5. CALM Parsing (~15 min)
- [`src/lib/calm/parser.ts`](src/lib/calm/parser.ts) — Zod-based parser with multi-version normalization
- [`src/lib/calm/normalizer.ts`](src/lib/calm/normalizer.ts) — CALM v1.0/1.1/1.2 normalization (lenient parser)

### 6. Compliance Learning Engine (~15 min)
- [`src/lib/learning/store.ts`](src/lib/learning/store.ts) — localStorage-backed pattern store (see ADR-003 for migration path)
- [`src/lib/learning/extractor.ts`](src/lib/learning/extractor.ts) — pattern extraction from `AnalysisResult`

### 7. Run the Tests
```bash
pnpm install
pnpm test:run
# Expected: 16 test suites pass (13 backend + 3 React component snapshots)
```

### 8. Architecture Decision Records
See [`docs/docs/adrs/`](docs/docs/adrs/) for documented decisions on: YAML agent config, Zod validation, localStorage learning store, Promise.allSettled orchestration, multi-provider LLM, and Markdown skill files.

- [`docs/docs/adrs/ADR-001-yaml-agent-config.md`](docs/docs/adrs/ADR-001-yaml-agent-config.md)
- [`docs/docs/adrs/ADR-002-zod-validation.md`](docs/docs/adrs/ADR-002-zod-validation.md)
- [`docs/docs/adrs/ADR-003-localstorage-learning-store.md`](docs/docs/adrs/ADR-003-localstorage-learning-store.md)
- [`docs/docs/adrs/ADR-004-promise-allsettled-orchestration.md`](docs/docs/adrs/ADR-004-promise-allsettled-orchestration.md)
- [`docs/docs/adrs/ADR-005-multi-provider-llm-registry.md`](docs/docs/adrs/ADR-005-multi-provider-llm-registry.md)
- [`docs/docs/adrs/ADR-006-skill-files-as-markdown.md`](docs/docs/adrs/ADR-006-skill-files-as-markdown.md)

## What to Look For

- **License headers:** All `.ts`, `.tsx`, `.yaml`, and skill `.md` files carry SPDX Apache-2.0 headers
- **No globalThis cross-request state:** Analysis results are stored in [`src/lib/session-store.ts`](src/lib/session-store.ts) (UUID-keyed Map)
- **No `any` types:** TypeScript strict mode enforced; check `pnpm typecheck`
- **Supply chain:** See [`DEPENDENCIES.md`](DEPENDENCIES.md) for all 32 production dependencies with rationale

## Running Locally

```bash
git clone https://github.com/finos/calmguard  # or your fork
cd calmguard
pnpm install
cp .env.example .env
# Add: GOOGLE_GENERATIVE_AI_API_KEY=your-key
pnpm dev
# Visit http://localhost:3000
# Upload a CALM file from examples/ and click Analyze
```
