# Stack Research

**Domain:** AI-Powered Compliance Analysis Dashboard with Multi-Agent Architecture
**Researched:** 2026-02-25 (v1.3 milestone addendum)
**Confidence:** HIGH

---

## v1.3 Milestone: Stack Additions Only

The existing STACK.md (below the separator) covers the full project stack validated through v1.2. This section documents ONLY what is new or changed for v1.3:

1. Agentic compliance skills with specific control IDs (PCI-DSS, SOC2, NIST-CSF)
2. Multi-version CALM schema support (1.0, 1.1, 1.2) with version detection
3. GitHub Action wrapper for CI compliance checks on CALM files

**Do not re-research or re-introduce:** Next.js, Vercel AI SDK, Zustand, Zod, React Flow, shadcn/ui, Shiki, Octokit — all validated and in production.

---

## (1) Agentic Compliance Skills — Specific Control IDs

### Problem

The current `skills/*.md` files (SOX.md, PCI-DSS.md, NIST-CSF.md, FINOS-CCC.md) contain narrative framework descriptions. They reference requirement *names* (e.g., "Requirement 6: Develop and maintain secure systems") but not *machine-readable control IDs* (e.g., `PCI-DSS-6.2.4`, `CC6.1`, `ID.AM-1`). This means `compliance-mapper.ts` emits `controlId` fields that are LLM-hallucinated rather than grounded in official identifiers.

### Solution: Structured Control ID Appendices in Existing SKILL.md Files

No new libraries needed. The fix is content-only: add a structured appendix to each `skills/*.md` file with an authoritative control ID table that agents can pattern-match against.

**Implementation pattern:**
```markdown
## Machine-Readable Control Reference

| Control ID | Short Name | CALM Mapping Hint |
|------------|------------|-------------------|
| PCI-DSS-6.2.4 | Prevent common attacks | protocol != HTTP on public relationships |
| CC6.1 | Logical access controls | missing encryption controls on database nodes |
| ID.AM-1 | Asset inventory | nodes without description field |
```

Agents using `loadSkillsForAgent()` will receive this table as part of their injected prompt context. The `complianceMappingSchema.controlId` field then gets grounded values.

### Control ID Sources (Verified, HIGH confidence)

**PCI-DSS v4.0** — Control IDs follow `Req-N.N.N` pattern (e.g., `1.3.1`, `6.2.4`, `10.2.1`). 12 top-level requirements, ~250 sub-requirements. Source: PCI Security Standards Council (official PDF at pcisecuritystandards.org).

**SOC 2 Trust Services Criteria** — Control IDs follow `CCN.N` pattern (e.g., `CC6.1`, `CC7.2`, `CC8.1`). 17 Common Criteria (CC1-CC9) plus optional criteria (A, C, P, PI categories). Source: AICPA Trust Services Criteria 2017 (applicable for 2025 audits). Key controls for architecture analysis:
- `CC6.1` — Logical access controls and encryption
- `CC6.6` — Network segmentation and boundary protection
- `CC7.1` — Change detection and system monitoring
- `CC9.1` — Vendor/third-party risk management

**NIST CSF 2.0** — Subcategory IDs follow `XX.YY-N` pattern (e.g., `ID.AM-1`, `PR.DS-1`, `DE.CM-1`). 6 functions (GV, ID, PR, DE, RS, RC), 22 categories, 106 subcategories. Compared to CSF 1.1 which had 5 functions and 108 subcategories — GV (Govern) is new in 2.0. Source: NIST CSWP 29, published February 2024 (HIGH confidence — official NIST publication).

**FINOS CCC (Cloud Controls Checklist)** — Uses `CCC.CTRL-NNN` pattern (varies by instance). These are internal FINOS identifiers; reference the existing FINOS-CCC.md skill for specific control IDs.

### What NOT to Add

Do not add a separate JSON/YAML control registry loaded at runtime — this adds complexity for zero benefit when the skills files already feed directly into prompts. Do not add `compliance-mapping-registry.ts` or a database of controls — the skill files are the correct abstraction level for a hackathon timeline.

---

## (2) Multi-Version CALM Schema Support (1.0 through 1.2)

### Current State

`src/lib/calm/types.ts` hardcodes `CALM_SCHEMA_VERSION = '1.1'` and uses strict Zod schemas that require exact field names. `parser.ts` uses `calmDocumentSchema.safeParse()` — any 1.0 or 1.2 document with non-standard fields fails.

### CALM Version Differences (Verified with FINOS repo)

**CALM 1.0 (stable release):**
- Core: nodes, relationships, controls, flows — identical structure to 1.1
- Difference: Flow transitions did NOT require `description` field (it was optional in 1.0, required in 1.1)
- The 1.0 vs 1.1 diff is small — 1.1 is described as "a minor revision of 1.0, fixing the definition of flows"

**CALM 1.1 (current in codebase):**
- Flow transitions REQUIRE: `relationship-unique-id`, `sequence-number`, `description`
- `additionalProperties: false` on flows
- Currently fully supported

**CALM 1.2 (latest):**
- Adds: **Decorators** — attach supplementary information to nodes/relationships without modifying core architecture
- Adds: **Timelines (Moments)** — time-based architecture snapshots for viewing architecture changes over time
- Decorator structure (from PR #2131, merged ~Feb 14 2026): type is plain string (enum removed for flexibility), requires explicit `target` field scoping decorators to specific CALM documents
- Core schema (nodes, relationships, controls, flows) is **UNCHANGED** from 1.1
- Decorators and timelines are ADDITIVE new top-level fields — they do not break existing 1.0/1.1 documents

### Solution: Lenient Parser with Version Detection

**No new npm packages needed.** The solution is schema-level changes in `src/lib/calm/`:

**Version detection via `$schema` URL pattern:**
```typescript
// Detect version from $schema field or nodes/relationships structure
function detectCalmVersion(json: unknown): '1.0' | '1.1' | '1.2' | 'unknown' {
  if (typeof json !== 'object' || json === null) return 'unknown';
  const schema = (json as Record<string, unknown>)['$schema'];
  if (typeof schema === 'string') {
    if (schema.includes('/1.2/')) return '1.2';
    if (schema.includes('/1.1/')) return '1.1';
    if (schema.includes('/1.0/')) return '1.0';
  }
  return '1.1'; // Default assumption — most common
}
```

**Lenient base schema:** Change `calmDocumentSchema` to use `.passthrough()` at the top level so unknown fields (decorators, timelines, adrs) don't fail validation:
```typescript
export const calmDocumentSchema = z.object({
  nodes: z.array(calmNodeSchema).min(1),
  relationships: z.array(calmRelationshipSchema),
  controls: z.record(z.string(), controlDefinitionSchema).optional(),
  flows: z.array(calmFlowSchema).optional(),
  // v1.2 additions — accept but don't require
  decorators: z.array(z.unknown()).optional(),
  timelines: z.array(z.unknown()).optional(),
  adrs: z.array(z.string()).optional(),
}).passthrough(); // Allow any additional fields from future versions
```

**Flow transition leniency for 1.0:** Make `description` optional in `flowTransitionSchema` (it was required only as of 1.1):
```typescript
export const flowTransitionSchema = z.object({
  'relationship-unique-id': z.string().min(1),
  'sequence-number': z.number().int().positive(),
  description: z.string().optional(), // Optional to accept 1.0 files
  direction: z.enum(['source-to-destination', 'destination-to-source']).optional(),
});
```

**Version metadata on ParseSuccess:** Extend `ParseSuccess` to include detected version:
```typescript
export interface ParseSuccess {
  success: true;
  data: CalmDocument;
  version: '1.0' | '1.1' | '1.2' | 'unknown'; // NEW
}
```

### What NOT to Add

Do not add separate Zod schemas per version (v1.0Schema, v1.1Schema, v1.2Schema) — this creates three codepaths to maintain. The lenient single-schema approach covers all three versions because the core schema is stable; only edge fields differ. Do not parse or use decorator/timeline content in agents — these are optional fields and the current agent pipeline does not need them for compliance analysis.

---

## (3) GitHub Action for CI Compliance Checks

### Problem

v1.3 requires a GitHub Action that other repos can use in their CI pipelines to validate CALM files on every PR. This is the "GitHub Action wrapper for CI compliance checks" feature.

### Solution: Composite GitHub Action in `.github/actions/calm-compliance/`

**Use composite action, not JavaScript action.** Rationale: composite actions run shell commands and call other actions without requiring a build step or compiled artifact. A JavaScript/TypeScript action requires `@vercel/ncc` compilation, `dist/` committed to the repo, and Node version management — unnecessary complexity for a hackathon.

**Action structure:**
```
.github/actions/calm-compliance/
  action.yml          # Composite action definition
```

**`action.yml` pattern:**
```yaml
name: 'CALMGuard Compliance Check'
description: 'Validate CALM architecture files for compliance on PRs'
inputs:
  calm-file:
    description: 'Path to the CALM JSON file to validate'
    required: true
  framework:
    description: 'Compliance framework to check (PCI-DSS, SOC2, NIST-CSF, all)'
    required: false
    default: 'all'
  fail-on-violation:
    description: 'Fail the workflow if violations are found'
    required: false
    default: 'true'
runs:
  using: composite
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22'
    - name: Install calm-cli
      shell: bash
      run: npm install -g @finos/calm-cli@1.33.0
    - name: Validate CALM schema
      shell: bash
      run: |
        calm validate --architecture "${{ inputs.calm-file }}" --format json
```

**Caller workflow (generated and committed to user's repo via GitOps PR):**
```yaml
# .github/workflows/calm-compliance.yml
name: CALM Compliance Check
on:
  pull_request:
    paths:
      - '**/*.calm.json'
      - '**/calm/**/*.json'
      - 'architecture.json'
jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/calm-compliance
        with:
          calm-file: architecture.json
          fail-on-violation: true
```

### Node.js Version for the Caller Workflow

Use `node-version: '22'` (LTS). Do NOT use node20 — GitHub announced deprecation of Node 20 on Actions runners, with Node 24 becoming default March 4, 2026, and Node 20 reaching EOL in April 2026. Node 22 is the current LTS and will be supported through 2027. (HIGH confidence — verified via GitHub Changelog announcement from September 2025.)

### Path Filtering for CALM Files

Use native GitHub Actions `paths:` filter (not `dorny/paths-filter` — the dorny action itself has a Node 20 deprecation warning open as of Feb 2026):
```yaml
on:
  pull_request:
    paths:
      - '**/*.calm.json'
      - '**/architecture*.json'
      - 'calm/**'
```

This is built into GitHub Actions — no additional action needed (MEDIUM confidence — well-documented GitHub feature, no library dependency risk).

### What NOT to Add

Do not build a JavaScript/TypeScript custom action with `@actions/core`, `@actions/github`, `@vercel/ncc` compilation pipeline — adds build complexity, requires committing `dist/`, and the composite approach achieves the same result in fewer lines. Do not use `dorny/paths-filter` — it has an open Node 20 deprecation issue and the native `paths:` filter is sufficient. Do not publish the action to GitHub Marketplace — not needed for hackathon, and composite actions in the same repo are referenced locally.

---

## Summary: New Packages for v1.3

**Zero new npm packages required.** All three features are implemented through:
- Content changes to `skills/*.md` files (control ID appendices)
- Schema changes in `src/lib/calm/types.ts` (`.passthrough()`, optional fields, version detection function)
- New file `src/lib/calm/parser.ts` extension (version-aware parse result)
- New file `.github/actions/calm-compliance/action.yml` (composite action, no npm packages)
- New file `src/lib/pipeline/calm-ci-workflow.ts` (generates the caller workflow YAML string for GitOps PR)

---

## Version Compatibility (v1.3 specific)

| Component | Current | Required Change | Notes |
|-----------|---------|-----------------|-------|
| `@finos/calm-cli` | 1.33.0 | None | Already installed. 1.33.0 supports `--timeline` flag confirming 1.2 support |
| `zod` | 3.24.1 | None | `.passthrough()` has been available since Zod 3.x |
| `yaml` | 2.8.2 | None | Already installed for YAML agent config loading |
| `actions/setup-node` | v4 | None | Already used in ci.yml |
| `actions/checkout` | v4 | None | Already used in ci.yml |
| Node.js in workflows | 22 | No change needed | Already using node 22 in ci.yml |

---

## Integration Points

### Compliance Skills Integration
- `skills/PCI-DSS.md` — Add control ID appendix table (PCI-DSS v4.0 requirement IDs)
- `skills/FINOS-CCC.md` — Add control ID appendix (FINOS CCC control IDs)
- `src/lib/skills/loader.ts` — No changes needed; already injects full file content
- `src/lib/agents/compliance-mapper.ts` — No code changes; prompt context improves from richer skill files
- `complianceMappingSchema.controlId: z.string()` — Already accepts string IDs; grounding comes from skill files

### Multi-Version CALM Integration
- `src/lib/calm/types.ts` — Add `.passthrough()`, optional decorator/timeline/adrs fields, make flow.description optional
- `src/lib/calm/parser.ts` — Add `detectCalmVersion()`, extend `ParseSuccess` with `version` field
- `src/lib/calm/index.ts` — Re-export version-detection utilities
- Dashboard upload handler — Surface detected version in UI ("CALM v1.2 detected")
- `@finos/calm-cli` validate — Already understands 1.2 (`--timeline` flag exists in 1.33.0)

### GitHub Action Integration
- `.github/actions/calm-compliance/action.yml` — New composite action definition
- `src/lib/pipeline/` — Extend pipeline generator to emit calm-compliance.yml workflow string
- GitOps PR button "DevSecOps CI" — Include calm-compliance.yml in PR artifacts

---

## Sources

- FINOS architecture-as-code repo — `calm/release/1.2/RELEASE_NOTES.md` — Confirms decorators + timelines as new 1.2 features, core schema unchanged (HIGH confidence, official source)
- FINOS architecture-as-code repo — `calm/release/1.1/RELEASE_NOTES.md` — Confirms 1.1 only changed flow transition `description` to required (HIGH confidence, official source)
- `node_modules/@finos/calm-cli` v1.33.0 — `calm validate --help` output — Confirms `--timeline` flag exists, supporting 1.2 documents (HIGH confidence, local verification)
- GitHub Changelog — "Deprecation of Node 20 on GitHub Actions runners" (September 2025) — Node 24 default March 4, 2026; Node 20 EOL April 2026 (HIGH confidence, official GitHub announcement)
- FINOS Office Hours 2026-02-12 (Issue #2114) — PR #2131 merged ~Feb 14 2026 with decorator schema changes (MEDIUM confidence — issue discussion, not merged PR confirmation)
- NIST CSWP 29 (February 2024) — NIST CSF 2.0 subcategory structure (HIGH confidence — official NIST publication)
- AICPA Trust Services Criteria (2017, used for 2025 SOC 2 audits) — CC-series control IDs (HIGH confidence — official AICPA standard)
- PCI Security Standards Council — PCI-DSS v4.0 requirement numbering (HIGH confidence — official PCI SSC documentation)
- GitHub Actions Docs — Native `paths:` filter (HIGH confidence — official GitHub documentation)

---

## Pre-v1.3 STACK.md (Original — Full Project Stack)

*The content below is the original STACK.md written for v1.1 greenfield research (2026-02-15). It remains accurate for the base stack.*

---

**Domain:** AI-Powered Compliance Analysis Dashboard with Multi-Agent Architecture
**Researched:** 2026-02-15
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 15.x (latest stable) | Full-stack React framework with App Router | Industry standard for production React apps in 2026. Built-in SSE support via Route Handlers, React 19 compatibility, Turbopack for 76.7% faster dev server startup, native Vercel deployment. App Router enables Server Components and streaming. |
| **React** | 19.x | UI library with concurrent features | React 19 provides Actions for async transitions, improved Suspense for streaming UI, and better SSR performance. 40% improvement in Core Web Vitals when combined with Next.js 15. Essential for real-time dashboards. |
| **TypeScript** | 5.7+ (preparing for 7.0) | Type-safe development | TypeScript 5.7 supports ES2024, improved type system with never-initialized variable detection, and --rewriteRelativeImportExtensions. TypeScript 7.0 (in development) promises 10x speedup. Critical for multi-agent systems. |
| **Vercel AI SDK** | 6.x | Multi-provider LLM orchestration | 2.8M weekly downloads vs 795K for nearest competitor. Supports 25+ providers (Gemini, Anthropic, OpenAI, Grok, Ollama). Single-line model switching, SSE streaming primitives, ToolLoopAgent for agentic workflows. Built specifically for Next.js and edge runtimes. |
| **Tailwind CSS** | 4.x | Utility-first CSS framework | Tailwind v4 eliminates config files via @theme directive, integrates with shadcn/ui. Industry standard for rapid UI development with minimal CSS bundle size. |
| **pnpm** | 9.x | Package manager for monorepo | 10-20x faster than Jest, strongest workspace support with --filter flag, disk space savings via hard-linking. Now the default choice for modern TypeScript monorepos in 2026. |

### Frontend Stack

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **shadcn/ui** | Latest (Tailwind v4 compatible) | Accessible component library | Pre-built React 19 components (Button, Dialog, Form, etc.). Uses Radix UI primitives, oklch colors, tw-animate-css. Copy-paste components instead of npm package = zero lock-in. |
| **React Flow** | 12.10+ | Architecture visualization | MIT-licensed node-based UI library. Built-in dragging, zooming, panning, selection. Custom nodes as React components. Used by Stripe, Zapier, Retool. Perfect for CALM architecture diagrams. |
| **Zustand** | 5.x | Global state management | 1.2KB bundle, fastest render performance, centralized store pattern. Choose over Jotai when state is interconnected (multi-agent coordination, dashboard global state). |
| **Zod** | 3.24+ | Runtime schema validation | TypeScript-first validation with automatic type inference. Tested against TypeScript 5.5+. Critical for validating LLM outputs, CALM schemas, and API responses. Integrates with Vercel AI SDK for structured outputs. |
| **Lucide React** | Latest | Icon library | Default for shadcn/ui. Tree-shakable, consistent design system. |

### AI & Multi-Agent Layer

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Gemini 2.0 Flash** | Latest (via Vercel AI SDK) | Default LLM provider | Multimodal Live API with bidirectional streaming, function calling, code execution, search grounding. Real-time audio/video support. Free tier generous for hackathon. React starter app available. |
| **Anthropic Claude** | 4.5 (Opus/Sonnet) | Premium compliance analysis | Claude Opus 4.5 delivers flagship performance at 67% lower cost. Advanced tool use with programmatic calling, structured outputs with strict mode. Prompt caching reduces costs by 90%. Ideal for complex compliance reasoning. |
| **OpenAI** | GPT-4o/4-turbo | Fallback/comparison provider | Industry standard, broad ecosystem. Compatible via Vercel AI SDK. |
| **xAI Grok** | Latest (OpenAI SDK compatible) | Optional provider | OpenAI SDK compatible (just change base URL). Voice Agent API for real-time conversations. |
| **Ollama** | 0.11.0+ | Local LLM hosting | Privacy & offline capability. Built on llama.cpp, supports quantization (1.5-bit to 8-bit GGUF). Models like LLaMA 3.1 8B run at 95.51 tok/s on RTX 4090. Zero API costs. |

### Backend & Data

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **PostgreSQL** | 16.x | Primary database | ACID compliance essential for compliance audit trails. Row-level security, SSL encryption, granular roles. Better for complex joins and long-term reporting than MongoDB. DevSecOps tools like Bytebase support it. |
| **Drizzle ORM** | Latest | Type-safe database layer | Code-first TypeScript schema, tiny bundle (edge/serverless friendly), SQL-level control. Instant type updates vs Prisma's generate step. Choose over Prisma for Next.js 15 edge runtime compatibility. |
| **Next.js Route Handlers** | Built-in | API routes with SSE | Native SSE support via ReadableStream API. Use Node.js runtime (not edge) for full Node.js API access. Next.js 15.2+ has stable Node.js middleware support. |

### Architecture & Code Organization

| Tool | Purpose | Notes |
|------|---------|-------|
| **Turborepo** | Monorepo build orchestration | High-performance caching, parallel builds, ^build dependency notation. Recommended structure: apps/ (Next.js app) + packages/ (contracts, agents, shared types). |
| **TypeScript Project References** | Type-safe package linking | Each package gets tsconfig.json for granular caching. Combine with Zod for compile-time + runtime safety. |
| **pnpm workspaces** | Dependency management | workspace:* protocol for local packages. Fast linking, predictable resolution, git-based change detection with --filter. |

### Developer Experience

| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| **ESLint** | 9.x | Linting | Flat config (eslint.config.mjs) with typescript-eslint. ESLint v10.0.0 made TypeScript configs stable. Use defineConfig() for type safety. |
| **Prettier** | 3.x | Code formatting | Opinionated formatter, runs on-save. Integrates with ESLint via eslint-config-prettier. |
| **Vitest** | 2.x | Testing framework | 10-20x faster than Jest, native ESM, Vite integration, Jest-compatible API. Perfect for testing AI agent outputs and LLM evals. |

### Deployment & DevOps

| Technology | Purpose | Notes |
|------------|---------|-------|
| **Vercel** | Hosting platform | Native Next.js 15 support, edge functions, automatic HTTPS, Git integration. Vercel AI SDK optimized for Vercel infrastructure. |
| **GitHub Actions** | CI/CD | 180M developers, tight GitHub ecosystem integration. For DevSecOps: Trivy for scanning, workflow automation. |
| **GitLab CI** | Alternative CI/CD (if needed) | Built-in DevSecOps (9 stages), security scanners, Component Catalog. Choose when integrated compliance scanning is top priority. |

### CALM Architecture Parsing

| Technology | Purpose | Notes |
|------------|---------|-------|
| **FINOS AasC TypeScript Packages** | CALM schema parsing | Official TypeScript CLI moved away from Java. JSON Meta Schema foundation. Template Bundles with transformers. Active development (office hours 2026). |
| **JSON Schema Validation** | Schema validation | Built into CALM spec. Use with Zod for runtime validation. |

### YAML Agent Definitions

| Technology | Purpose | Notes |
|------------|---------|-------|
| **YAML Frontmatter** | Agent metadata | Standard pattern: name, description, version, tags in frontmatter. Body contains prompts/instructions (SKILL.md pattern). |
| **gray-matter** | YAML parsing | npm package for parsing frontmatter. 3M+ weekly downloads. |

## Installation

```bash
# Core framework
pnpm add next@latest react@latest react-dom@latest

# TypeScript
pnpm add -D typescript @types/node @types/react @types/react-dom

# UI & Styling
pnpm add class-variance-authority clsx tailwind-merge lucide-react tw-animate-css
pnpm add -D tailwindcss postcss autoprefixer

# State & Validation
pnpm add zustand zod

# AI SDK
pnpm add ai @ai-sdk/google @ai-sdk/anthropic @ai-sdk/openai

# Database
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit

# Visualization
pnpm add reactflow

# YAML parsing
pnpm add gray-matter js-yaml
pnpm add -D @types/js-yaml

# Monorepo tooling
pnpm add -D turbo

# Dev tools
pnpm add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -D prettier eslint-config-prettier
pnpm add -D vitest @vitest/ui
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Next.js 15** | Remix, SvelteKit | Choose Remix if you prefer nested routes and require absolute control over data loading. SvelteKit if team prefers Svelte over React. |
| **Vercel AI SDK** | LangChain.js | Choose LangChain if you need mature Python ecosystem compatibility or complex RAG pipelines. But 2.8M vs 795K weekly downloads shows market preference. |
| **Zustand** | Jotai, Redux Toolkit | Choose Jotai for atomic state with fine-grained reactivity. Redux Toolkit for large apps with time-travel debugging needs. |
| **Drizzle ORM** | Prisma | Choose Prisma if you want batteries-included DX, automated migrations, and Prisma Studio GUI. Drizzle better for edge runtime and bundle size. |
| **PostgreSQL** | MongoDB | Choose MongoDB if your data model is truly schemaless and write-heavy. But PostgreSQL's ACID compliance is critical for compliance audit trails. |
| **Turborepo** | Nx, Lerna | Choose Nx for more opinionated structure with plugins. Lerna is legacy (use Turborepo or Nx). |
| **pnpm** | npm, Yarn, Bun | npm is slower but universal. Yarn 4 has improved but pnpm has best monorepo support. Bun is fast but immature for production (2026). |
| **Vitest** | Jest | Jest works but Vitest is 10-20x faster and native ESM. Only use Jest if locked into React Native or other Jest-specific tooling. |
| **GitHub Actions** | GitLab CI | GitLab CI if you need 9-stage integrated DevSecOps lifecycle. GitHub Actions if ecosystem/community is priority. |
| **Gemini 2.0** | Claude, GPT-4o | Claude for best reasoning on compliance. GPT-4o for broadest ecosystem. Gemini for multimodal + free tier. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Next.js Edge Runtime** | Vercel recommends migrating to Node.js runtime for improved performance/reliability. Limited Node.js API access breaks many libraries. | Node.js runtime for Route Handlers and Middleware (stable in Next.js 15.2+) |
| **Jest** | 10-20x slower than Vitest on large codebases. No native ESM. Legacy architecture. | Vitest (Jest-compatible API, faster, ESM-native) |
| **Pages Router** | App Router is the future. Server Components, streaming, better caching control. | App Router with React 19 and Server Components |
| **npm** | Slower installs, weaker monorepo support vs pnpm. | pnpm (workspace support, disk efficiency, speed) |
| **Create React App** | Deprecated, unmaintained. Next.js is the official recommendation from React team. | Next.js 15 with create-next-app |
| **Squoosh** | Removed from next/image in Next.js 15. | sharp (now auto-installed with next start) |
| **MongoDB (for compliance)** | While MongoDB now has ACID compliance (v4.0+), PostgreSQL offers stronger audit trail guarantees and more mature compliance tooling. | PostgreSQL with Drizzle ORM |
| **ESLint 8** | End-of-life October 5, 2024. | ESLint 9 with flat config |
| **Prisma (for edge)** | Larger bundle, requires binary dependencies. Not ideal for Vercel Edge Functions. | Drizzle ORM (tiny bundle, zero deps) |
| **Python LLM Frameworks** | Adds language complexity, deployment overhead. TypeScript ecosystem is mature in 2026. | Vercel AI SDK, Mastra, or VoltAgent |

## Stack Patterns by Variant

### If Building for Hackathon (Feb 23-27, 2026)
- **Use:** Gemini 2.0 Flash default (free tier), Vercel deployment (free tier), shadcn/ui (rapid prototyping)
- **Skip:** Complex monorepo (single Next.js app), database (use file-based storage), comprehensive testing
- **Because:** Speed to demo > production architecture. Gemini's free tier + Vercel's free hosting = $0 infrastructure.

### If Building for Enterprise Production
- **Use:** Multi-provider LLM (Gemini + Claude + OpenAI), PostgreSQL with Drizzle, Turborepo monorepo, comprehensive Vitest coverage, GitLab CI for DevSecOps
- **Add:** Observability (Sentry via instrumentation.js), prompt caching, rate limiting, audit logging
- **Because:** Compliance requires audit trails, disaster recovery, vendor lock-in avoidance.

### If Building for Offline/Air-Gapped
- **Use:** Ollama for local LLMs, file-based storage or self-hosted PostgreSQL
- **Skip:** Vercel (use self-hosted Next.js with standalone output), cloud LLM providers
- **Because:** Privacy/security requirements prohibit external API calls.

### If Building for Maximum Performance
- **Use:** Vercel Edge Functions (where possible), Drizzle ORM, Zustand, Turbopack dev, pnpm
- **Add:** React Compiler (experimental), PPR (Partial Prerendering), unstable_after for deferred work
- **Because:** Sub-second response times for real-time compliance analysis.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15.x | React 19 (App Router), React 18 (Pages Router) | Backwards compatibility maintained |
| Vercel AI SDK 6.x | Next.js 15+, React 19+ | Optimized for edge runtime |
| shadcn/ui (2026) | Tailwind v4, React 19 | All components updated, forwardRef removed |
| Drizzle ORM | PostgreSQL 12+, Next.js 15 edge | Zero binary dependencies |
| TypeScript 5.7+ | ESLint 9+, Vitest 2.x | --rewriteRelativeImportExtensions support |
| Turborepo 2.x | pnpm 9+, TypeScript 5.7+ | Project references recommended |
| React Flow 12.10+ | React 19 | Concurrent features compatible |

---

*Stack research for: CALMGuard - AI-Powered Compliance Analysis Dashboard*
*v1.3 addendum researched: 2026-02-25*
*Original research: 2026-02-15*
*Confidence: HIGH (v1.3 additions verified against local codebase, FINOS repo, GitHub Actions changelog)*
