# Milestones

## v1.2 GitOps PR Generation (Shipped: 2026-02-25)

**Phases completed:** 1 phase (Phase 7), 3 plans
**Timeline:** Feb 24-25, 2026 (2 days)

**Key accomplishments:**
1. GitHub repo input with URL parsing (owner/repo, full GitHub URLs, .git suffix)
2. CALM file fetching from GitHub (public repos without auth, PAT for private)
3. Pipeline PR generation via SSE with step-by-step progress (branch → commit → PR)
4. CALM remediation agent (AI-powered protocol upgrades + control additions)
5. Remediation PR with per-change explanations (before/after + rationale)
6. GitOps dashboard card with dual PR sections and real-time status

**Last phase number:** 7

---

## v1.1 CALMGuard MVP (Shipped: 2026-02-24)

**Phases completed:** 6 phases, 28 plans
**TypeScript:** 82 source files, ~46,800 lines
**Timeline:** Feb 9-24, 2026 (16 days)
**Git:** 10 commits, 192 files changed

**Key accomplishments:**
1. CALM v1.1 parser with Zod schema validation and demo architectures (trading platform + payment gateway)
2. 4-agent AI system (Architecture Analyzer, Compliance Mapper, Pipeline Generator, Risk Scorer) with real-time SSE streaming orchestration
3. Interactive dashboard with React Flow architecture graph, compliance gauges, risk heat map, control matrix, findings table, and pipeline preview with syntax highlighting
4. Multi-provider LLM support (Gemini, Anthropic, OpenAI, Ollama, Grok) via Vercel AI SDK
5. CI/CD pipeline with CodeQL + Semgrep SAST, dependency scanning, pre-commit hooks, and Docusaurus docs site
6. Guided demo mode with touring camera animation, dramatic pacing, export report, and custom CALM file upload with @finos/calm-cli validation

**Tech stack:** Next.js 15, TypeScript strict, Vercel AI SDK, React Flow, shadcn/ui, Zustand, Zod, Shiki, Docusaurus 3

---

