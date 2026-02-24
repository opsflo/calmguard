# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-24

### Added

#### CALM Parser & Validation
- Full CALM 1.1 schema support with Zod runtime validation
- Node types: actor, ecosystem, system, service, database, network, ldap, webclient, data-asset
- Relationship types: interacts, connects, deployed-in, composed-of, options
- Flow and interface parsing with control extraction
- Two demo architectures: Payment Gateway and Trading Platform

#### AI Agent System
- Architecture Analyzer agent — evaluates patterns, anti-patterns, severity-scored findings
- Compliance Mapper agent — maps CALM controls to regulatory frameworks with gap analysis
- Pipeline Generator agent — generates CI/CD configs, SAST/DAST, IaC
- Risk Scorer agent — aggregates findings into weighted risk scores with heat map data
- YAML-based agent definitions (AOF-inspired) in `agents/`
- Multi-provider LLM support: Google Gemini (default), Anthropic Claude, OpenAI GPT, xAI Grok
- Vercel AI SDK `generateObject` with Zod schemas for all structured outputs
- Phase 1 parallel orchestration (Analyzer + Mapper + Pipeline Gen) + Phase 2 sequential (Risk Scorer)

#### Compliance Knowledge
- NIST Cybersecurity Framework (CSF) skill file (23.4 KB)
- PCI DSS compliance skill file
- SOX financial reporting compliance skill file
- FINOS Common Cloud Controls (CCC) skill file

#### Real-Time Dashboard
- SSE-based streaming from agents to dashboard via EventSource
- Zustand single-store state management
- React Flow interactive architecture graph with custom node types per CALM node-type
- Dagre auto-layout for architecture visualization
- Touring camera animation with node info overlay during analysis
- Pause/play controls for touring camera
- Compliance score gauges and risk heat maps (Recharts)
- Agent squad status sidebar with running/completed indicators
- Pipeline preview with fullscreen mode and syntax highlighting (Shiki)
- Exportable compliance report modal
- Demo mode — run analysis with sample data, no API keys required

#### Infrastructure & CI/CD
- Next.js 15 App Router with Turbopack dev server
- GitHub Actions CI: lint, typecheck, test, build, dependency audit, license check
- Semgrep SAST scanning workflow
- Husky pre-commit hooks with ESLint auto-fix (zero warnings policy)
- Docusaurus documentation site with Mermaid diagram support

### Security

- Zod schema validation on all external inputs (CALM JSON, LLM outputs)
- Structured LLM output only (`generateObject`) — no raw text injection surface
- TypeScript strict mode with zero `any` types
- GPL/AGPL dependency license blocking via `license-checker`
- Semgrep static analysis in CI
- HTTPS-only transport, same-origin SSE policy
- Zero data persistence — no user data stored server-side
- Comprehensive threat model documented in SECURITY.md

## [0.1.0] - 2026-02-09

### Added

- Initial project scaffold with Next.js 15 and TypeScript strict mode
- shadcn/ui component library setup with dark theme
- Basic project structure and configuration

[1.1.0]: https://github.com/finos-labs/dtcch-2026-opsflow-llc/compare/v0.1.0...v1.1.0
[0.1.0]: https://github.com/finos-labs/dtcch-2026-opsflow-llc/releases/tag/v0.1.0
