![badge-labs](https://user-images.githubusercontent.com/327285/230928932-7c75f8ed-e57b-41db-9fb7-a292a13a1e58.svg)

<p align="center">
  <img src="public/calmguard-logo.png" alt="CALMGuard Logo" width="280" />
</p>

<h1 align="center">CALMGuard</h1>

<p align="center">
  <strong>From Architecture-as-Code to Continuous Compliance — Automatically.</strong>
</p>

<p align="center">
  <a href="https://github.com/finos-labs/dtcch-2026-opsflow-llc/actions/workflows/ci.yml"><img src="https://github.com/finos-labs/dtcch-2026-opsflow-llc/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/finos-labs/dtcch-2026-opsflow-llc/actions/workflows/semgrep.yml"><img src="https://github.com/finos-labs/dtcch-2026-opsflow-llc/actions/workflows/semgrep.yml/badge.svg" alt="SAST" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License" /></a>
  <img src="https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/FINOS-CALM_1.1-00A3E0?logo=linux-foundation&logoColor=white" alt="FINOS CALM" />
  <img src="https://img.shields.io/badge/Node-22+-339933?logo=node.js&logoColor=white" alt="Node 22+" />
  <img src="https://img.shields.io/badge/pnpm-9+-F69220?logo=pnpm&logoColor=white" alt="pnpm" />
</p>

---

CALMGuard is a **CALM-native continuous compliance DevSecOps platform**. Describe your architecture using the [FINOS CALM](https://github.com/finos/architecture-as-code) standard, and CALMGuard deploys a squad of AI agents to analyze compliance gaps, score risk, and generate production-ready CI/CD pipelines — all streamed in real-time to an interactive dashboard.

Built for the **DTCC/FINOS Innovate.DTCC AI Hackathon** (Feb 23–27, 2026).

## Key Features

| AI Agent Squad | Compliance Skills | Learning Intelligence | GitOps Integration |
|:--------------:|:-----------------:|:---------------------:|:------------------:|
| 6 agents: Scout, Ranger, Arsenal, Sniper, Oracle, HQ | 6 skill files with 100+ KB of regulatory knowledge | Self-learning engine with pattern fingerprinting | Fetch CALM from GitHub, generate PRs |
| Multi-provider LLM: Gemini, Claude, GPT, Grok | SOX, PCI-DSS, NIST-CSF, FINOS-CCC, SOC2, Protocol Security | Auto-promotes patterns to deterministic rules after 3 observations | DevSecOps CI pipeline and compliance remediation PRs |
| Parallel Phase 1 + sequential Phase 2 orchestration | Closed Control ID Reference tables prevent LLM hallucination | Phase 0 Oracle fires instant findings before LLM agents start | Full repo-connected workflow with SHA tracking |

| CALM Parser | Real-Time Dashboard | Pipeline Generator |
|:-----------:|:-------------------:|:------------------:|
| Full CALM 1.1 schema support with Zod validation | React Flow architecture graphs with touring camera animation | GitHub Actions, security scanning, IaC configs |
| Nodes, relationships, flows, interfaces, controls | Live SSE streaming with agent status indicators | SAST, dependency audit, license compliance |
| Demo architectures included | Compliance gauges, risk heat maps, exportable reports | Automated from your architecture definition |

## How It Works

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  1. Connect  │────▶│  2. Pre-Check     │────▶│  3. Analyze       │────▶│  4. Act          │
│  CALM JSON / │     │  Oracle fires     │     │  AI Agent Squad   │     │  PRs, Pipelines, │
│  GitHub Repo │     │  learned rules    │     │  scores & maps    │     │  Reports, Learn  │
└─────────────┘     └──────────────────┘     └──────────────────┘     └─────────────────┘
```

1. **Connect** — Upload a CALM architecture JSON, fetch from GitHub, or use built-in demos
2. **Pre-Check** — Oracle fires deterministic rules from previously learned patterns (zero-latency, no LLM)
3. **Analyze** — 4 LLM agents run in parallel to assess compliance, map controls, score risks
4. **Act** — Generate CI/CD pipelines, remediation PRs, compliance reports — and learn patterns for next time

## Quick Start

### Prerequisites

- **Node.js 22+** and **pnpm 9+**
- At least one LLM provider API key (Gemini is the default)

### Setup

```bash
git clone https://github.com/finos-labs/dtcch-2026-opsflow-llc.git
cd dtcch-2026-opsflow-llc
pnpm install
```

Create a `.env.local` file:

```bash
# Required: at least one provider
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key

# Optional: additional LLM providers
ANTHROPIC_API_KEY=your-claude-key
OPENAI_API_KEY=your-openai-key
XAI_API_KEY=your-grok-key

# Optional: GitHub integration (enables PR generation)
GITHUB_TOKEN=your-github-token
```

### Run

```bash
pnpm dev          # Start dev server at http://localhost:3000
```

Visit the dashboard — click **"Demo Mode"** to see CALMGuard analyze a sample architecture without any API keys.

## Architecture

```mermaid
graph TB
    subgraph Client["Dashboard (React + React Flow)"]
        UI[Interactive UI]
        SSE[SSE EventSource]
        Store[Zustand Store]
        LS[Learning Store<br/>localStorage]
    end

    subgraph API["Next.js API Routes"]
        Parse[CALM Parser]
        Stream[SSE Stream]
        GH[GitHub API]
    end

    subgraph Phase0["Phase 0 — Deterministic"]
        Oracle["Oracle<br/>Learned Rules"]
    end

    subgraph Phase1["Phase 1 — Parallel LLM"]
        AA[Scout<br/>Architecture Analyzer]
        CM[Ranger<br/>Compliance Mapper]
        PG[Arsenal<br/>Pipeline Generator]
    end

    subgraph Phase2["Phase 2 — Sequential LLM"]
        RS[Sniper<br/>Risk Scorer]
    end

    subgraph Skills["Compliance Skills"]
        SOX[SOX.md]
        PCI[PCI-DSS.md]
        NIST[NIST-CSF.md]
        CCC[FINOS-CCC.md]
        SOC2[SOC2.md]
        PROTO[PROTOCOL-SECURITY.md]
    end

    subgraph Providers["LLM Providers"]
        Gemini[Google Gemini]
        Claude[Anthropic Claude]
        GPT[OpenAI GPT]
        Grok[xAI Grok]
    end

    UI --> SSE --> Stream
    Stream --> Store --> UI
    GH --> Parse
    LS --> Oracle
    Parse --> Oracle --> AA & CM & PG
    AA & CM & PG --> RS
    Skills -.-> CM
    PROTO -.-> PG
    AA & CM & PG & RS -.-> Providers
    AA & CM & PG & RS --> Stream
    RS --> LS
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | Full-stack React with API routes |
| **Language** | TypeScript (strict) | Type-safe codebase, zero `any` |
| **AI** | Vercel AI SDK | Structured output via `generateObject` + Zod |
| **LLM Providers** | Gemini, Claude, GPT, Grok | Multi-provider with configurable default |
| **CALM** | @finos/calm-cli v1.33 | FINOS Architecture-as-Code integration |
| **Visualization** | React Flow + Recharts | Interactive architecture graphs + compliance charts |
| **State** | Zustand | Single store, SSE-driven updates |
| **UI** | shadcn/ui + Tailwind CSS | Dark theme, accessible components |
| **Validation** | Zod | Runtime schema validation for all data boundaries |
| **Streaming** | Server-Sent Events | Real-time agent event delivery |

## Agent System

CALMGuard runs a coordinated squad of 6 AI agents with tactical callsigns. LLM agents are defined as YAML configurations (`calmguard/v1` API) in [`agents/`](agents/):

| Callsign | Agent | Phase | Role | Model |
|----------|-------|-------|------|-------|
| **HQ** | Orchestrator | All | Coordinate multi-agent lifecycle — Phase 0 pre-checks, parallel Phase 1, sequential Phase 2, event streaming, result aggregation, graceful degradation | Controller (no LLM) |
| **Oracle** | Learning Engine | 0 | Fire deterministic rules from previously learned patterns — zero-latency, no LLM calls. Instant compliance findings before any AI agent starts | Deterministic (no LLM) |
| **Scout** | Architecture Analyzer | 1 | Extract structural insights — components, data flows, trust boundaries, security zones, protocol usage, deployment topology | Gemini 2.5-flash |
| **Ranger** | Compliance Mapper | 1 | Map CALM controls to SOX, PCI-DSS, FINOS CCC, NIST-CSF, SOC2. Assess compliance status, identify gaps, generate per-framework scores with auditor evidence | Gemini 2.5-flash |
| **Arsenal** | Pipeline Generator | 1 | Generate production-ready GitHub Actions CI/CD, SAST/DAST scanning configs (Semgrep, CodeQL), Terraform IaC matching CALM deployment topology | Gemini 2.5-flash |
| **Sniper** | Risk Scorer | 2 | Aggregate all Phase 1 results into weighted risk assessment — overall score (0-100), per-framework scores, node-level risk heat map, executive summary | Gemini 2.5-flash |

**Three-phase orchestration:**

- **Phase 0 (Oracle):** Deterministic pre-checks — fires learned rules instantly, no LLM latency
- **Phase 1 (Parallel):** Scout + Ranger + Arsenal run concurrently via `Promise.allSettled`
- **Phase 2 (Sequential):** Sniper aggregates Phase 0 + Phase 1 results into final risk assessment

All agents emit typed SSE events (`started`, `thinking`, `finding`, `completed`) streamed to the dashboard in real-time.

## Compliance Skills

CALMGuard's compliance intelligence is powered by **skill files** — markdown documents in [`skills/`](skills/) that inject deep regulatory knowledge into agent prompts. Each skill file contains framework-specific control mappings, CALM field correlations, and **Closed Control ID Reference** tables with `CITE EXACTLY AS SHOWN` instructions to prevent LLM hallucination of control IDs.

| Skill File | Framework | Content | Agent |
|-----------|-----------|---------|-------|
| [`SOX.md`](skills/SOX.md) | Sarbanes-Oxley | SOX 404 ITGC controls, COSO framework mappings | Ranger |
| [`PCI-DSS.md`](skills/PCI-DSS.md) | PCI DSS 4.0 | 19 CALM-relevant requirements (Req 2.2.1–12.6.2), closed ID reference | Ranger |
| [`NIST-CSF.md`](skills/NIST-CSF.md) | NIST CSF 2.0 | 21 subcategory IDs across all 6 functions (GV, ID, PR, DE, RS, RC) | Ranger |
| [`FINOS-CCC.md`](skills/FINOS-CCC.md) | FINOS Common Cloud Controls | Cloud-native security controls | Ranger |
| [`SOC2.md`](skills/SOC2.md) | SOC2 TSC | 21 AICPA Trust Service Criteria (CC6.x, CC7.x, CC8.x, CC9.x) | Ranger |
| [`PROTOCOL-SECURITY.md`](skills/PROTOCOL-SECURITY.md) | Cross-framework | Protocol upgrade mappings (HTTP→HTTPS, FTP→SFTP, etc.) with PCI-DSS + NIST + SOC2 grounding | Arsenal |

Skills are loaded at runtime via `loadSkillsForAgent()` and injected as knowledge blocks in agent prompts. This gives agents grounded, auditable regulatory knowledge rather than relying on parametric LLM memory.

## Learning Intelligence

CALMGuard includes a **self-learning compliance engine** that gets smarter with every analysis:

1. **Pattern Extraction** — After each analysis, the engine fingerprints recurring compliance patterns from structural triggers (protocols, node types, relationships, missing controls)
2. **Confidence Tracking** — Each pattern tracks observation count and confidence score across runs
3. **Auto-Promotion** — When a pattern is observed 3+ times with 75%+ confidence, it's automatically promoted to a **deterministic rule**
4. **Phase 0 Pre-Checks** — On the next analysis, Oracle fires these deterministic rules instantly (no LLM) before any AI agent starts
5. **Persistence** — All patterns, rules, and run history persist in `localStorage` across sessions

The Learning Intelligence dashboard panel shows:
- **Intelligence Score** (0-100) — weighted from pattern coverage, confidence, rule maturity, and run history
- **Pattern Library** — all discovered compliance patterns sorted by confidence
- **Learning Curve** — Recharts visualization of intelligence growth over time

> *"Run it once, it learns. Run it three times, it auto-generates deterministic compliance rules. By run 4, Oracle fires instant findings before the LLM even starts."*

## GitOps Integration

CALMGuard connects directly to GitHub repositories for a complete compliance-as-code workflow:

- **Fetch CALM from GitHub** — enter `owner/repo` and file path, CALMGuard fetches and parses the architecture
- **DevSecOps CI Pipeline PRs** — generate and push GitHub Actions workflows with security scanning
- **Compliance Remediation PRs** — generate CALM architecture changes that close compliance gaps
- **SHA Tracking** — all PRs track the source file SHA for auditability

Requires a `GITHUB_TOKEN` in `.env.local` for PR generation.

## Demo Architectures

Two production-realistic CALM architectures are included in [`examples/`](examples/):

| Architecture | Description |
|-------------|-------------|
| **Payment Gateway** | Multi-service payment processing with encryption, tokenization, PCI controls |
| **Trading Platform** | Real-time trading system with market data feeds, order management, risk engine |

## Documentation

Full documentation is available in [`docs/`](docs/). Run locally with `pnpm docs:dev`, or browse directly on GitHub:

### Getting Started

| Guide | Description |
|-------|-------------|
| [Introduction](docs/docs/intro.md) | What CALMGuard is, the problem it solves, and key capabilities |
| [Getting Started](docs/docs/getting-started.md) | Setup, environment variables, running your first analysis |
| [Uploading Architectures](docs/docs/uploading-architectures.md) | CALM file format, validation, using demo architectures |
| [Reading Reports](docs/docs/reading-reports.md) | Dashboard walkthrough — interpreting compliance scores, heat maps, findings |

### Architecture & Internals

| Guide | Description |
|-------|-------------|
| [System Overview](docs/docs/architecture/system-overview.md) | Architecture diagram, data flow, SSE streaming, Zustand store |
| [Agent System](docs/docs/architecture/agent-system.md) | Agent definitions, orchestration phases, YAML configs, skill injection |
| [API Reference](docs/docs/api/reference.md) | HTTP endpoints — `POST /api/analyze`, `POST /api/calm/parse`, `GET /api/pipeline` |
| [Compliance Frameworks](docs/docs/compliance/frameworks.md) | NIST CSF, PCI DSS, SOX, FINOS CCC — how they map to CALM controls |

### Project

| Guide | Description |
|-------|-------------|
| [Contributing](docs/docs/contributing.md) | Development setup, branch naming, commit conventions, CI requirements |
| [Security](docs/docs/security.md) | Threat model, input validation, LLM output safety, responsible AI |
| [SECURITY.md](SECURITY.md) | Full security policy with AI-specific threat analysis |
| [CHANGELOG.md](CHANGELOG.md) | Release history and version details |

## Contributing

We welcome contributions! See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for:

- Development setup and workflow
- Branch naming and commit conventions (Conventional Commits)
- CI pipeline requirements
- Code standards (TypeScript strict, Zod schemas, dark theme)

All commits must include a **DCO sign-off** (`git commit -s`).

## Team

**OpsFlow LLC** — Built for DTCC/FINOS Innovate.DTCC AI Hackathon 2026

| Name | Role | Background |
|------|------|------------|
| [**Gourav J. Shah**](https://www.linkedin.com/in/gouravshah/) | Lead Engineer | DevOps domain expert with 19+ years hands-on expertise in cloud infrastructure, DevSecOps, container orchestration, and platform engineering. Creator of Agentic Ops Framework and KubeAgentiX. |
| [**Anoop Mehendale**](https://www.linkedin.com/in/anoopmehendale/) | Engineer | Serial entrepreneur with a track record of building and scaling enterprise technology companies. |

## Hackathon Context

This project was built for the [Innovate.DTCC AI Hackathon](https://innovate.dtcc.com/) (Feb 23–27, 2026), organized by **DTCC** and powered by **FINOS**. The challenge: leverage AI to improve DevSecOps workflows in financial services using the FINOS CALM (Common Architecture Language Model) standard.

CALMGuard demonstrates how **Architecture-as-Code** can be the foundation for automated, continuous compliance — turning static architecture documentation into living, actionable security intelligence.

## License

Copyright 2026 FINOS

Distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

SPDX-License-Identifier: [Apache-2.0](https://spdx.org/licenses/Apache-2.0)

## Acknowledgements

- [**FINOS**](https://www.finos.org/) — Financial Open Source Foundation
- [**CALM**](https://github.com/finos/architecture-as-code) — Common Architecture Language Model
- [**DTCC**](https://www.dtcc.com/) — Depository Trust & Clearing Corporation
- [**Vercel AI SDK**](https://sdk.vercel.ai/) — Structured AI output framework
- [**shadcn/ui**](https://ui.shadcn.com/) — Beautiful accessible components
- [**React Flow**](https://reactflow.dev/) — Interactive graph visualization
