# Phase 5: Testing & DevSecOps Dogfooding - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Comprehensive test suite with TDD coverage, CI/CD pipeline with SAST and dependency scanning, security documentation, and Docusaurus documentation site. This phase adds quality infrastructure and documentation to the existing codebase — no new features.

</domain>

<decisions>
## Implementation Decisions

### Test coverage scope
- Real LLM integration tests against actual APIs — no mocking, no skipping. This is a real product.
- LLM integration tests run in a **separate CI job** (optional/manual trigger). Fast tests run on every push.
- Total test suite budget: **2-3 minutes** max runtime. This will be run live during hackathon demo to show robustness.
- Smoke tests for UI components — each component mounts without crashing. No deep interaction testing.
- Maximize coverage within the 2-3 minute budget: CALM parsing, Zod schema validation, API route contracts, SSE event flow, agent orchestration, plus UI smoke tests.

### CI/CD pipeline strictness
- Block on **errors only** — warnings are informational, don't fail the pipeline.
- SAST scanning: **both CodeQL AND Semgrep** in parallel CI jobs. Maximum coverage, demonstrates tooling breadth for judges.
- Pre-commit hooks: **lint + typecheck only** (~5s). Tests run in CI, not locally.
- Dependency license audit: **automated in CI** — check for GPL/copyleft contamination. Strong signal for financial services judges.

### Documentation site structure
- Primary audience: **hackathon judges** — impressive architecture overview, technical depth, credibility.
- Hero section: **problem-first** narrative. Lead with compliance gap in financial services, then introduce CALMGuard as solution.
- Architecture diagrams: **Mermaid diagrams** inline in markdown. System design, agent orchestration flow, SSE streaming pipeline.
- Scope: **comprehensive (8-10 pages)** — Overview, Architecture, Agent System, API Reference, Getting Started, CALM Integration, Compliance Frameworks, Pipeline Generation, Contributing, Security Practices.
- API reference: **auto-generated from Zod schemas** via script extraction. Always in sync with code.

### Security posture depth
- SECURITY.md tone: **startup-practical** — clear, professional, pragmatic. Honest about scope. Not pretending to be enterprise-complete.
- Threat model: **CALMGuard-specific** — document actual attack surface: malicious CALM JSON, LLM prompt injection via architecture descriptions, SSE stream tampering.
- Branch protection: **standard** — require PR, require CI pass, no force-push to main.

### Claude's Discretion
- Preview deploy strategy (Vercel integration vs CI deploy step)
- Exact Vitest configuration and test file organization
- Docusaurus theme customization and sidebar structure
- Specific Semgrep rules to enable
- Loading skeleton design for components in smoke tests
- Mermaid diagram layout and styling choices

</decisions>

<specifics>
## Specific Ideas

- Test suite should be **demo-friendly** — when run live during hackathon presentation, it should look impressive with clear pass/fail output (2-3 min runtime acceptable)
- Both CodeQL and Semgrep running together shows tooling breadth to judges who understand DevSecOps
- Problem-first narrative on docs homepage resonates with DTCC/FINOS judges who live the compliance gap problem daily
- License audit is a strong differentiator for financial services context — shows awareness of enterprise concerns

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-testing-devsecops-dogfooding*
*Context gathered: 2026-02-24*
