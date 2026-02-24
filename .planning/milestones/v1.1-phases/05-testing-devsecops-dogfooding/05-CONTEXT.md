# Phase 5: Testing & DevSecOps Dogfooding - Context

**Gathered:** 2026-02-24 (revised)
**Status:** Ready for planning

<domain>
## Phase Boundary

Quality infrastructure for the CALMGuard repo itself — test suite, CI/CD pipeline, security docs, Docusaurus site. This is "dogfooding" — CALMGuard generates DevSecOps pipelines for users, and Phase 5 applies the same discipline to our own project. No new product features.

</domain>

<decisions>
## Implementation Decisions

### Test coverage scope
- **Mock all LLM calls** — fast, deterministic fixture responses. Tests verify orchestration, Zod parsing, event emission. Not testing LLM quality.
- Target runtime: **under 30 seconds** total. Snappy enough to run live during demo — "watch our entire test suite pass."
- Focus on **core logic only**: CALM parsing, Zod schema validation, agent orchestration flow. Highest value, lowest effort (~15 tests).
- Verbose test output with **test names visible** — judges see exactly what's being tested as each test passes. More dramatic for demo.
- Anything not covered now gets added to roadmap for iteration post-hackathon.

### CI/CD pipeline strictness
- Block on **errors only** — warnings are informational, don't fail the pipeline.
- SAST scanning: **both CodeQL AND Semgrep** in parallel CI jobs. Maximum coverage, demonstrates tooling breadth.
- Dependency license audit: **automated in CI** — check for GPL/copyleft. Strong signal for financial services judges.
- Pre-commit hooks: **Claude's discretion** — pick what's practical for hackathon pace.

### Documentation site structure
- Primary audience: **hackathon judges** — impressive architecture overview, technical depth, credibility.
- Hero section: **problem-first** narrative. Lead with compliance gap in financial services, then CALMGuard as solution.
- Architecture diagrams: **Mermaid inline** in markdown. System design, agent orchestration flow, SSE streaming pipeline.
- Scope: **comprehensive (8-10 pages)** — Overview, Architecture, Agent System, API Reference, Getting Started, CALM Integration, Compliance Frameworks, Pipeline Generation, Contributing, Security Practices.
- API reference: **auto-generated from Zod schemas** via script extraction. Always in sync with code.

### Security posture depth
- SECURITY.md tone: **startup-practical** — clear, honest about scope. Professional but authentic.
- Threat model: **CALMGuard-specific** — document actual attack surface: malicious CALM JSON, LLM prompt injection via architecture descriptions, SSE stream tampering.
- Branch protection: **Claude's discretion** — pick practical approach (likely document rules, may or may not enforce in GitHub given solo hackathon context).

### Claude's Discretion
- Pre-commit hook strategy (lint+typecheck vs none)
- Branch protection enforcement (configure in GitHub vs document only)
- Preview deploy strategy (Vercel integration vs CI deploy step)
- Exact Vitest configuration and test file organization
- Docusaurus theme customization and sidebar structure
- Specific Semgrep rules to enable
- Mermaid diagram layout and styling choices

</decisions>

<specifics>
## Specific Ideas

- Test suite is a **demo moment** — under 30s, verbose output, judges watch tests fly by with clear names. "Our entire test suite passes in 20 seconds."
- "Dogfooding" narrative: CALMGuard generates DevSecOps pipelines for users, and we practice what we preach with our own repo.
- Both CodeQL and Semgrep shows tooling breadth for judges who understand DevSecOps.
- Problem-first docs narrative resonates with DTCC/FINOS judges who live the compliance gap problem daily.
- License audit is a strong differentiator for financial services context.
- **Practicality constraint:** Everything must be buildable TODAY and demo-ready. Anything that can't be completed goes to roadmap for post-hackathon iteration.

</specifics>

<deferred>
## Deferred Ideas

- Real LLM integration tests (non-mocked, against actual APIs) — post-hackathon iteration
- UI component interaction tests (gauge animation, table sorting, graph rendering) — post-hackathon
- Full test coverage (80%+) across all layers — post-hackathon

</deferred>

---

*Phase: 05-testing-devsecops-dogfooding*
*Context gathered: 2026-02-24*
