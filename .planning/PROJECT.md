# CALMGuard

## What This Is

CALMGuard is a CALM-native continuous compliance DevSecOps platform that reads FINOS CALM (Common Architecture Language Model) architecture definitions and analyzes them with a 4-agent AI system to produce real-time compliance dashboards with architecture visualization, risk scores, findings, and generated CI/CD pipeline configs — all streaming live. Built for the DTCC/FINOS Innovate.DTCC AI Hackathon (Feb 23-27, 2026).

## Core Value

When a user uploads a CALM architecture JSON, CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard showing architecture visualization, compliance scores, risk findings, and generated CI/CD pipeline configs — all streaming live as agents work.

## Current State

**Shipped:** v1.1 MVP (2026-02-24)
**Codebase:** 82 TypeScript files, ~46,800 lines, Next.js 15 + Vercel AI SDK
**Status:** Feature-complete for hackathon demo. Deployed to Vercel.

## Requirements

### Validated

- ✓ Parse CALM JSON architectures into typed analysis structures — v1.1
- ✓ Run 4 AI agents (Architecture Analyzer, Compliance Mapper, Pipeline Generator, Risk Scorer) — v1.1
- ✓ Orchestrate agents in parallel/sequential phases with SSE event streaming — v1.1
- ✓ Display real-time agent activity feed showing agent progress as it happens — v1.1
- ✓ Render architecture as interactive node-edge graph with compliance-colored nodes — v1.1
- ✓ Show compliance score gauge (0-100) with per-framework breakdown (SOX, PCI-DSS, CCC, NIST) — v1.1
- ✓ Generate risk heat map (nodes x compliance domains) — v1.1
- ✓ Generate CI/CD pipeline configs (GitHub Actions, security scanning, IaC) — v1.1
- ✓ Display control matrix mapping CALM controls to regulatory frameworks — v1.1
- ✓ Support sortable/filterable findings table — v1.1
- ✓ Provide demo CALM architectures (trading platform, payment gateway) — v1.1
- ✓ Support multi-provider LLM (Gemini default, plus Anthropic, OpenAI, Ollama, Grok) — v1.1
- ✓ YAML-defined agent configurations (AOF-inspired) — v1.1
- ✓ SKILL.md knowledge base for compliance domain injection (SOX, PCI-DSS, FINOS-CCC, NIST-CSF) — v1.1
- ✓ Guided demo mode with dramatic pacing for hackathon presentation — v1.1
- ✓ Custom CALM file upload with drag-and-drop and validation — v1.1
- ✓ Export compliance report as downloadable markdown — v1.1
- ✓ CALM CLI validation integration (@finos/calm-cli) — v1.1
- ✓ Framework selector to scope compliance checks — v1.1
- ✓ Deploy to Vercel with SSE streaming support — v1.1

### Active

(None — all v1 requirements shipped)

### Out of Scope

- Mobile-first responsive design — web desktop dashboard optimized for 1920x1080 demo
- Real-time multi-user collaboration — single-user analysis tool
- Persistent database — all analysis is ephemeral per session
- Continuous monitoring / webhook-based triggers — on-demand analysis only
- Production-grade auth/RBAC — hackathon demo, no authentication needed

## Context

- **Hackathon**: DTCC/FINOS Innovate.DTCC AI Hackathon, Feb 23-27, 2026. Track: IT Innovation (multi-agent development, DevSecOps, advanced security).
- **Positioning**: "From Architecture-as-Code to Continuous Compliance — Automatically."
- **Prior winner context**: 2025 Grand Prize winner was CIBC's "Automated Regulatory Change Management" — proves regulatory compliance automation wins. CALMGuard differentiates by being architecture-aware via CALM.
- **CALM ecosystem**: FINOS's flagship Architecture-as-Code initiative. Schema version 1.1.
- **AOF inspiration**: Agent definitions use YAML format, SKILL.md files for domain knowledge injection, fleet orchestration pattern.
- **LLM strategy**: Vercel AI SDK for multi-provider support. Gemini as default. Architecture supports Anthropic, OpenAI, Ollama, Grok as alternatives.

## Constraints

- **Solo developer**: One person building entire platform
- **Timeline**: 7 days prep + 5 days hackathon execution
- **Tech stack**: Next.js 15 (App Router), TypeScript strict, pnpm, Vercel AI SDK, shadcn/ui, React Flow, Zustand, Zod
- **Deployment**: Vercel free tier, zero-config
- **License**: Apache 2.0, must be open-sourceable and contribute to FINOS ecosystem
- **Demo resolution**: Optimized for 1920x1080 presentation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over Bun+Elysia | App Router, API routes, Vercel deploy, AI SDK integration | ✓ Good |
| Gemini as default LLM | API keys available; multi-provider via AI SDK for flexibility | ✓ Good |
| Multi-provider LLM support | Gemini, Anthropic, OpenAI, Ollama, Grok — increases appeal | ✓ Good |
| All 6 phases in scope | Full spec build, no cuts — hackathon needs complete product | ✓ Good |
| SSE over WebSockets | Simpler, works with Vercel serverless, sufficient for one-way streaming | ✓ Good |
| Zustand over Redux | Minimal boilerplate, works well with SSE event updates | ✓ Good |
| Edge-compatible SSE emitter | Simple listener pattern instead of Node.js EventEmitter for serverless | ✓ Good |
| React Flow for architecture graph | Custom nodes per CALM type, dagre auto-layout, compliance coloring | ✓ Good |
| @finos/calm-cli via subprocess | CLI has no programmatic API, subprocess with temp files works reliably | ✓ Good |
| Vercel Fluid Compute 300s | maxDuration=300 enables long-running SSE streaming in production | ✓ Good |

---
*Last updated: 2026-02-24 after v1.1 milestone*
