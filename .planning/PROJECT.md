# CALMGuard

## What This Is

CALMGuard is a CALM-native continuous compliance DevSecOps platform that reads FINOS CALM (Common Architecture Language Model) architecture definitions and analyzes them with a 4-agent AI system to produce real-time compliance dashboards with architecture visualization, risk scores, findings, and generated CI/CD pipeline configs — all streaming live. It can also connect to GitHub repos and generate PRs with pipeline artifacts and compliance-remediated CALM files. Built for the DTCC/FINOS Innovate.DTCC AI Hackathon (Feb 23-27, 2026).

## Core Value

When a user uploads a CALM architecture JSON (or points to one in a GitHub repo), CALMGuard must analyze it with AI agents and produce a real-time compliance dashboard showing architecture visualization, compliance scores, risk findings, and generated CI/CD pipeline configs — all streaming live as agents work. For repo-connected analyses, it generates PRs with pipeline artifacts and compliance-remediated architecture files.

## Current State

**Shipped:** v1.1 MVP (2026-02-24)
**Codebase:** 82 TypeScript files, ~46,800 lines, Next.js 15 + Vercel AI SDK
**Status:** Feature-complete for hackathon demo. Deployed to Vercel.
**Current milestone:** v1.3 — Compliance Intelligence & CI Integration

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
- ✓ Accept GitHub repo URL + path to CALM file as input source — v1.2
- ✓ Fetch CALM file from GitHub via API (public repos without auth, PAT for private) — v1.2
- ✓ Generate PR with pipeline artifacts (GitHub Actions, SAST configs, IaC) committed to repo — v1.2
- ✓ Generate compliance-remediated CALM file via AI agent with missing controls and protocol upgrades — v1.2
- ✓ Generate PR with modified CALM file + per-change explanations — v1.2
- ✓ Dashboard UI for repo input alongside file upload (always visible, public repos work without token) — v1.2
- ✓ PR generation status and links displayed in dashboard GitOps card — v1.2

### Active

- [ ] Agentic compliance skills with specific control IDs for PCI-DSS, SOC2, NIST-CSF — v1.3
- [ ] Protocol security skill grounding agent remediation decisions — v1.3
- [ ] Multi-version CALM support (1.0, 1.1, 1.2) with version detection — v1.3
- [ ] CALM v1.2 decorators and timelines as optional schema fields — v1.3
- [ ] Split GitOps into 3 PR buttons: DevSecOps CI, Compliance Remediation, Cloud Infra — v1.3
- [ ] CI-only GitHub Actions workflow (no deployment stages) — v1.3
- [ ] GitHub Action for continuous compliance checking on PRs touching CALM files — v1.3
- [ ] README with agent profiles (Scout, Ranger, Arsenal, Sniper) — v1.3

### Out of Scope

- Mobile-first responsive design — web desktop dashboard optimized for 1920x1080 demo
- Real-time multi-user collaboration — single-user analysis tool
- Persistent database — all analysis is ephemeral per session
- Continuous monitoring / webhook-based triggers — on-demand analysis only
- Production-grade auth/RBAC — hackathon demo, no authentication needed
- GitHub OAuth/App flow — PAT via env var sufficient for hackathon

## Context

- **Hackathon**: DTCC/FINOS Innovate.DTCC AI Hackathon, Feb 23-27, 2026. Track: IT Innovation (multi-agent development, DevSecOps, advanced security).
- **Positioning**: "From Architecture-as-Code to Continuous Compliance — Automatically."
- **v1.2 narrative**: "We don't just tell you what's wrong — we fix it, as a PR, ready for review." GitOps-safe compliance remediation.
- **Prior winner context**: 2025 Grand Prize winner was CIBC's "Automated Regulatory Change Management" — proves regulatory compliance automation wins. CALMGuard differentiates by being architecture-aware via CALM AND now actionable via PRs.
- **CALM ecosystem**: FINOS's flagship Architecture-as-Code initiative. Schema versions 1.0-rc1 through 1.2 (core schema stable across 1.0-1.2; v1.2 adds decorators + timelines).
- **calm-ai positioning**: calm-ai is an IDE authoring tool (prompts for Copilot/Kiro). CALMGuard is the compliance enforcement platform — complementary, not competitive. "calm-ai helps you write CALM. CALMGuard ensures what you wrote is secure."
- **v1.3 narrative**: Grounded compliance intelligence with agentic skills, multi-version CALM support, and CI/CD integration via GitHub Action.
- **AOF inspiration**: Agent definitions use YAML format, SKILL.md files for domain knowledge injection, fleet orchestration pattern.
- **LLM strategy**: Vercel AI SDK for multi-provider support. Gemini as default. Architecture supports Anthropic, OpenAI, Ollama, Grok as alternatives.
- **GitHub integration**: PAT-based auth via GITHUB_TOKEN env var. Uses Octokit REST API for repo content fetching, branch creation, file commits, and PR creation.

## Constraints

- **Two developers**: OpsFlow LLC team
- **Timeline**: 2 days remaining (Feb 26-27, 2026)
- **Tech stack**: Next.js 15 (App Router), TypeScript strict, pnpm, Vercel AI SDK, shadcn/ui, React Flow, Zustand, Zod, Octokit
- **Deployment**: Vercel free tier, zero-config
- **License**: Apache 2.0, must be open-sourceable and contribute to FINOS ecosystem
- **Demo resolution**: Optimized for 1920x1080 presentation
- **GitHub auth**: PAT via env var (GITHUB_TOKEN), no OAuth flow

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
| GitHub PAT over OAuth | Simpler for hackathon, env var based, covers demo needs | — Pending |
| Direct CALM modification over separate file | More impactful demo — PR diff shows actual protocol/control changes | — Pending |
| Single phase for v1.2 | Tight timeline (3 days), focused scope, maximum demo impact | ✓ Good |
| Agentic skills over deterministic rules | Faster to build, leverages existing skill loader infrastructure, easier to iterate | — Pending |
| Multi-version CALM via lenient parser | Core schema stable 1.0-1.2, accept field aliases, version detection | — Pending |

---
*Last updated: 2026-02-25 after v1.3 milestone start*
