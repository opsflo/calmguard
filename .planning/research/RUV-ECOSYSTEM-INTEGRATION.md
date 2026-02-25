# Research: Ruv Ecosystem Integration for CALMGuard

**Date**: 2026-02-23
**Status**: Future Enhancement (Post-Hackathon)
**Priority**: Phase 7+ (after hackathon ship)

## Summary

Analysis of three projects from the ruv ecosystem to identify capabilities that would enhance CALMGuard's compliance analysis platform. The core product should ship first (Phases 2-6) — these are genuine value-adds but none are blockers for a working hackathon demo.

**Projects Analyzed**:
- [RuVector](file:///Users/gshah/work/apps/experiments/ruvector) — Self-learning vector database (Rust)
- [Agentic-Flow](file:///Users/gshah/work/apps/experiments/agentic-flow) — 66-agent orchestration platform (TypeScript)
- [RuvLLM](file:///Users/gshah/work/apps/experiments/ruvector/examples/ruvLLM) — LLM orchestration with RAG + SONA learning
- [Ruv Ecosystem Reference](https://gist.github.com/gouravjshah/1d7593d597c8a3f1ad0b4dc17948159f)

---

## Current Gaps in CALMGuard

| Gap | Current State | Impact |
|-----|---------------|--------|
| No RAG | 4 SKILL.md files (~70KB) dumped wholesale into every agent prompt | Wasted tokens, unfocused findings |
| No learning | Each analysis starts from zero — no feedback, no pattern recognition | No improvement over time |
| No routing | All agents use same model regardless of task complexity | Overspending on simple checks |
| No inter-agent communication | Fixed Phase 1 parallel → Phase 2 sequential, no message passing | Agents can't focus each other |
| No persistence | Zustand store only — results lost on refresh | No trend analysis, no regression detection |
| No control mapping engine | Control-to-framework mappings implicit in LLM reasoning | Inconsistent, non-deterministic mappings |

---

## Integration Opportunities

### Enhancement A: RAG-Powered Compliance Skills

**Source**: RuVector HNSW + RuvLLM RAG module
**Gap Addressed**: Token waste from dumping all SKILL.md content into prompts
**Value**: 60-80% token reduction, more focused agent findings

**How it works today**:
```
Agent prompt = system prompt + ALL of SOX.md + PCI-DSS.md + NIST-CSF.md + FINOS-CCC.md + CALM input
```

**How it would work with RAG**:
```
CALM node (e.g., database with encryption control)
  → Embed node description + control text
  → Vector search against pre-embedded SKILL.md sections
  → Retrieve top 5-10 relevant control sections only
  → Agent prompt = system prompt + relevant controls only + CALM input
```

**Implementation approach**:
- Pre-embed SKILL.md sections at build time (chunk by control/requirement)
- Use `ruvector-wasm` for in-browser vector search (no backend needed) OR `ruvector-node` NAPI bindings in API routes
- Alternative: use Vercel AI SDK embeddings + simple cosine similarity (lighter weight)
- Modify each agent to call retrieval before `generateObject`

**Estimated effort**: 3-5 days
**Dependencies**: Embedding model selection, chunking strategy for SKILL.md files

---

### Enhancement B: Self-Learning with ReasoningBank

**Source**: Agentic-Flow ReasoningBank (TypeScript), RuvLLM SONA temporal loops
**Gap Addressed**: No learning between analyses — agent #100 is no smarter than agent #1
**Value**: +10-55% quality improvement over time, pattern recognition across architectures

**Concept — 4-step MATTS loop (from Agentic-Flow)**:
1. **RETRIEVE**: Before analysis, search for similar past architectures/findings
2. **JUDGE**: After analysis, evaluate finding quality (user thumbs up/down)
3. **DISTILL**: Extract successful patterns ("services without mTLS always fail PCI-DSS 4.1")
4. **CONSOLIDATE**: Deduplicate, prune outdated patterns

**What the system would learn**:
- "Microservice architectures with >5 services almost always miss network segmentation controls"
- "Database nodes without encryption-at-rest fail PCI-DSS 3.4.1 100% of the time"
- "Trading platforms typically score 45-60% on first compliance check"
- "This finding type has 95% user approval rate → high confidence"

**Implementation approach — Simplified version**:
1. Add feedback UI: thumbs up/down on each finding in the dashboard
2. Store (finding, architecture_context, user_rating) tuples in RuVector
3. Before each analysis, retrieve top-k similar patterns and inject into agent prompt
4. Track finding accuracy over time

**Implementation approach — Full SONA version** (post-hackathon):
1. Port ReasoningBank from agentic-flow (already TypeScript)
2. Integrate SONA's 3 temporal loops:
   - Loop A (per-request): Record agent trajectory, lightweight LoRA-style adaptation
   - Loop B (hourly): Cluster patterns, extract strategies
   - Loop C (weekly): Consolidate memory, prevent catastrophic forgetting (EWC++)
3. Cross-agent knowledge sharing (Architecture Analyzer learns from Compliance Mapper patterns)

**Estimated effort**: 2-3 days (simplified), 2-3 weeks (full SONA)
**Dependencies**: User feedback UI, persistence layer (database)

---

### Enhancement C: Intelligent Multi-Model Routing

**Source**: RuvLLM FastGRNN router, Agentic-Flow multi-model router
**Gap Addressed**: All agents use same model regardless of task complexity
**Value**: ~60% cost reduction with comparable quality

**Routing tiers**:
| Tier | Model | Latency | Cost | Use Case |
|------|-------|---------|------|----------|
| 1 | Gemini Flash / Haiku | ~200ms | $0.0001 | Simple control presence checks |
| 2 | Gemini Pro / Sonnet | ~1s | $0.003 | Framework mapping, gap analysis |
| 3 | Opus / GPT-4o | ~3s | $0.015 | Complex risk synthesis, executive summary |

**Implementation approach**:
- Simple version: Route by agent type (Pipeline Generator → Tier 1, Risk Scorer → Tier 3)
- Smart version: Route by input complexity (small CALM with few nodes → Tier 1, large CALM with 50+ nodes → Tier 3)
- Full version: Port FastGRNN router concept — learns optimal routing from cost/quality tradeoffs

**Estimated effort**: 1-2 days (simple), 1-2 weeks (FastGRNN)
**Dependencies**: Multi-provider already supported (Phase 2 done)

---

### Enhancement D: Inter-Agent Communication

**Source**: Agentic-Flow AttentionCoordinator, attention-based consensus
**Gap Addressed**: Agents work in isolation, can't focus each other
**Value**: More targeted findings, fewer contradictions, better risk scoring

**Current flow**:
```
Arch Analyzer ──┐
Compliance Mapper ──┤── All results dumped into Risk Scorer
Pipeline Generator ──┘
```

**Enhanced flow**:
```
Arch Analyzer finds "5 services without encryption"
  → Message to Compliance Mapper: "Focus on encryption controls for these 5 nodes"
  → Compliance Mapper narrows scope, produces targeted findings

Compliance Mapper finds "PCI-DSS 3.4 violation on Trade DB"
  → Message to Pipeline Generator: "Add encryption scanning step for database nodes"
  → Pipeline Generator produces targeted security config

All findings → AttentionCoordinator → Weighted consensus → Risk Scorer
```

**Implementation approach**:
- Add `src/lib/agents/message-bus.ts` — simple pub/sub between agents
- Each agent can `publish(topic, data)` and `subscribe(topic, callback)`
- Orchestrator wires subscriptions before starting Phase 1
- Attention-based consensus (from agentic-flow) for Risk Scorer aggregation

**Estimated effort**: 3-5 days
**Dependencies**: Orchestrator refactor, agent interface changes

---

### Enhancement E: Historical Analysis & Trend Detection

**Source**: RuVector as persistent vector store, AgentDB pattern storage
**Gap Addressed**: No persistence, no way to compare analyses over time
**Value**: Compliance regression detection, portfolio-wide gap analysis

**Capabilities**:
1. **Compliance trending**: "2 weeks ago this architecture scored 65%, now it's 72%"
2. **Regression detection**: "encryption-at-rest control was present last week, now missing"
3. **Portfolio heatmap**: Cross-architecture view showing most common gaps
4. **Similar architecture lookup**: "This architecture is 85% similar to [previous one] which scored 72%"

**Implementation approach**:
- Store each analysis result with timestamp + input CALM hash in database
- Embed analysis summaries in RuVector for similarity search
- Add "History" page to dashboard with trend charts
- Add regression detection logic to Risk Scorer

**Estimated effort**: 1-2 weeks
**Dependencies**: Database (Supabase/Postgres), RuVector setup

---

### Enhancement F: Control Mapping Engine (Deterministic)

**Source**: Inspired by ruv ecosystem's structured knowledge graphs
**Gap Addressed**: Control-to-framework mappings are non-deterministic (LLM-inferred each time)
**Value**: Consistent, auditable control mappings; reduced LLM dependence for known mappings

**Structured mapping table**:
```json
{
  "encryption-at-rest": {
    "SOX": ["302.4b"],
    "PCI-DSS": ["3.4.1", "3.5.1"],
    "NIST-CSF": ["PR.DS-1"],
    "FINOS-CCC": ["A.9.4.3"],
    "priority": "HIGH",
    "risk_if_missing": "Data breach, regulatory penalties"
  }
}
```

**Hybrid approach**: Use deterministic mappings for known controls, LLM for novel/ambiguous controls.

**Implementation approach**:
- Create `src/lib/compliance/control-map.json` with comprehensive mappings
- Compliance Mapper checks deterministic map first, falls back to LLM
- Coverage calculator: "implementing these 5 controls covers 73% of PCI-DSS"
- Gap prioritization by cross-framework impact

**Estimated effort**: 3-5 days
**Dependencies**: Domain expertise for accurate control mappings

---

## What NOT to Incorporate

| Capability | Source | Why Skip |
|------------|--------|----------|
| P2P Swarm / Distributed consensus | Agentic-Flow | CALMGuard is single-user; no need for multi-node coordination |
| FPGA Transformer | RuVector | Hardware-specific, not relevant to web app |
| Quantum modules (ruQu) | RuVector | Research-grade, not production-applicable |
| ESP32/Edge deployment | RuvLLM | Not the use case — CALMGuard is cloud-deployed |
| 66 specialized agents | Agentic-Flow | 4 agents is the right number for this problem domain |
| Spiking Neural Networks | RuVector | Research feature, no compliance application |
| Agent Booster (WASM code editing) | Agentic-Flow | Code transformation not relevant to compliance analysis |
| Cryptographic witness chains | RuVector | Interesting for audit trails but adds complexity without hackathon value |

---

## Recommended Roadmap Integration

### Phase 7: RAG & Intelligent Routing (Post-Hackathon, Week 1)
1. Chunk and embed SKILL.md files into vector store
2. Add RAG retrieval to Compliance Mapper agent
3. Implement simple model routing by agent type
4. Measure token reduction and quality impact

### Phase 8: Persistence & History (Post-Hackathon, Week 2)
1. Add database (Supabase or Postgres)
2. Store analysis results with timestamps
3. Build History dashboard page with trend charts
4. Add regression detection alerts

### Phase 9: Feedback & Self-Learning (Post-Hackathon, Weeks 3-4)
1. Add finding feedback UI (thumbs up/down)
2. Store feedback patterns in RuVector
3. Inject learned patterns into agent prompts
4. Track finding accuracy metrics over time

### Phase 10: Advanced Agent Coordination (Post-Hackathon, Month 2)
1. Add inter-agent message bus
2. Implement attention-based consensus for Risk Scorer
3. Add conditional agent activation (specialized agents for specific gaps)
4. Build deterministic control mapping engine

### Phase 11: Full SONA Integration (Post-Hackathon, Month 3+)
1. Port ReasoningBank from agentic-flow
2. Implement 3-temporal-loop learning
3. Cross-agent knowledge sharing
4. Export learned patterns (HuggingFace-compatible)

---

## Key Technical Decisions Needed (When We Get There)

1. **Vector store choice**: RuVector WASM (in-browser, zero-backend) vs RuVector Node (server-side, more powerful) vs Supabase pgvector (managed, simpler)?
2. **Embedding model**: Vercel AI SDK embeddings vs dedicated model (e.g., text-embedding-3-small)?
3. **Persistence**: Supabase (managed Postgres + pgvector) vs self-hosted Postgres + RuVector?
4. **Learning complexity**: Simple feedback loop vs full SONA temporal loops?
5. **Deterministic vs LLM**: How much control mapping should be deterministic vs LLM-inferred?

---

## References

- RuVector source: `/Users/gshah/work/apps/experiments/ruvector`
- Agentic-Flow source: `/Users/gshah/work/apps/experiments/agentic-flow`
- RuvLLM source: `/Users/gshah/work/apps/experiments/ruvector/examples/ruvLLM`
- Ruv Ecosystem overview: https://gist.github.com/gouravjshah/1d7593d597c8a3f1ad0b4dc17948159f
- ReasoningBank paper: arXiv:2509.25140 (Google DeepMind)
- SONA architecture: See ruvector-sona crate and agentic-flow packages/agent-booster
