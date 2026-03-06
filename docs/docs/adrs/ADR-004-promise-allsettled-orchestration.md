<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 FINOS -->

# ADR-004: Promise.allSettled for Phase 1 Agent Orchestration

**Status:** Accepted
**Date:** 2026-02-25
**Deciders:** OpsFlow LLC (DTCC/FINOS Hackathon team)

## Context

CALMGuard runs 4 AI agents in two phases. Phase 1 agents (Architecture Analyzer, Compliance Mapper, Pipeline Generator, Cloud Infra Generator) are independent and can run in parallel. The orchestrator needed a concurrency strategy for Phase 1.

Options considered:
- **A) Sequential execution** — safest, slowest; 4x LLM latency
- **B) Promise.all** — parallel, but one agent failure cancels the entire analysis
- **C) Promise.allSettled** — parallel with graceful degradation; each agent's success/failure is independent

## Decision

Use `Promise.allSettled` for Phase 1 parallel execution in `src/lib/agents/orchestrator.ts`. Each agent result is inspected individually after settlement. Failed agents contribute `null` to the `AnalysisResult` and are tracked in `failedAgents[]`.

## Consequences

**Good:**
- Wall-clock time reduced from ~4x to ~1x LLM latency for Phase 1 (agents run concurrently)
- One agent's LLM timeout does not cancel the other 3 agents
- Dashboard shows partial results when some agents succeed — users get value even on partial failure
- `failedAgents` array in `AnalysisResult` provides transparency into what succeeded

**Neutral:**
- Risk Scorer (Phase 2) requires Architecture + Compliance results. If both fail, Risk Scorer is skipped. This is the correct behavior.

**Bad:**
- Higher peak LLM API cost (4 concurrent requests vs sequential). Acceptable given demo context.
