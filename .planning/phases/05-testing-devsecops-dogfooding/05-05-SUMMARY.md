---
phase: 05-testing-devsecops-dogfooding
plan: 05
subsystem: docs
tags: [docusaurus, mermaid, documentation, api-reference, compliance, calm]

# Dependency graph
requires:
  - phase: 04-pipeline-generation-compliance-display
    provides: "Complete dashboard with compliance analysis, pipeline generation, findings table"
  - phase: 01-foundation-calm-parser
    provides: "CALM types.ts and parser for API reference extraction"
  - phase: 02-multi-agent-infrastructure
    provides: "Agent types.ts for schema-based API docs generation"
provides:
  - "Docusaurus 3 docs site with 10 pages covering user and developer audiences"
  - "scripts/generate-api-docs.ts for automated API reference from Zod schemas"
  - "Problem-first hero page at / for hackathon judges"
  - "Architecture diagrams with Mermaid in system-overview and agent-system"
  - "API reference for POST /api/analyze (SSE), POST /api/calm/parse, GET /api/pipeline"
affects: ["future-phases", "deployment", "submission"]

# Tech tracking
tech-stack:
  added:
    - "@docusaurus/core 3.9.2"
    - "@docusaurus/preset-classic 3.9.2"
    - "@docusaurus/theme-mermaid 3.9.2"
    - "tsx (already in devDeps, used for docs:api script)"
  patterns:
    - "Docs as code: all documentation in markdown, version-controlled with source"
    - "API docs auto-generated from Zod schema source files via regex extraction"
    - "routeBasePath: '/' with slug: / on intro.md makes docs the site root"
    - "MDX-safe table cells: curly braces escaped as HTML entities to prevent acorn parse errors"

key-files:
  created:
    - "docs/docusaurus.config.ts — Docusaurus 3 config with Mermaid, dark theme, CALMGuard branding"
    - "docs/sidebars.ts — sidebar with For Users (3 pages) and For Developers (6 pages)"
    - "docs/docs/intro.md — problem-first hero page with Mermaid flow diagram"
    - "docs/docs/getting-started.md — prerequisites, installation, quick start"
    - "docs/docs/uploading-architectures.md — CALM doc structure, custom upload guide"
    - "docs/docs/reading-reports.md — all dashboard panels explained"
    - "docs/docs/architecture/system-overview.md — tech stack, architecture diagram, SSE sequence diagram"
    - "docs/docs/architecture/agent-system.md — 4 agents, orchestration flow, skills injection"
    - "docs/docs/api/reference.md — auto-generated from Zod schemas, 254 lines"
    - "docs/docs/compliance/frameworks.md — SOX, PCI-DSS, NIST-CSF, FINOS-CCC documentation"
    - "docs/docs/contributing.md — dev setup, code style, PR workflow, DCO"
    - "docs/docs/security.md — threat model with Mermaid diagram, security practices"
    - "scripts/generate-api-docs.ts — Zod schema extractor + API reference markdown generator"
  modified:
    - "package.json — added docs:dev, docs:build, docs:api scripts"

key-decisions:
  - "routeBasePath: '/' + slug: / on intro.md — makes docs the site root, not /docs. Cleaner URLs for hackathon judges."
  - "Remove src/pages/index.tsx — conflicts with routeBasePath: / causing duplicate route warnings in Docusaurus"
  - "MDX curly brace escaping in table cells — MDX parses {} as JSX; escaped to &#123;/&#125; in generator"
  - "Regex-based Zod schema extraction in generate-api-docs.ts — simple and sufficient, avoids full TypeScript AST complexity"
  - "Docs as standalone package in docs/ — not pnpm workspace member, avoids peer dep resolution issues per research pitfall"

patterns-established:
  - "pnpm docs:api regenerates API reference from source — run after schema changes"
  - "Mermaid diagrams embedded in .md files using mermaid code fences — rendered by @docusaurus/theme-mermaid"
  - "All MDX table cell content using curly braces must be HTML-entity-escaped for acorn compatibility"

requirements-completed: [DOCS-01, DOCS-02, DOCS-03, DOCS-04]

# Metrics
duration: 11min
completed: 2026-02-24
---

# Phase 05 Plan 05: Docusaurus 3 Documentation Site Summary

**10-page Docusaurus 3 site with Mermaid architecture diagrams, problem-first hero page, and auto-generated API reference extracted from Zod schemas via scripts/generate-api-docs.ts**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-24T08:27:29Z
- **Completed:** 2026-02-24T08:38:45Z
- **Tasks:** 2 (executed as one atomic commit)
- **Files created:** 27

## Accomplishments

- Complete Docusaurus 3 site builds successfully (`pnpm docs:build` exits 0) with 10 documentation pages
- Problem-first hero page at `/` leads with financial compliance pain narrative and Mermaid flowchart
- Developer section includes system architecture diagrams (Tech Stack, SSE Sequence Diagram, Agent Orchestration)
- API reference auto-generated from `src/lib/agents/types.ts` and `src/lib/calm/types.ts` via Zod schema extraction
- `pnpm docs:api` script regenerates API reference from source code on demand — demonstrates engineering rigor

## Task Commits

Both plan tasks executed atomically in a single commit (all content required for build to succeed):

1. **Task 1 + Task 2: Docusaurus init, sidebar, all 10 pages, API generator** - `96f4d3d` (feat)

**Plan metadata:** (created after self-check)

## Files Created/Modified

- `docs/docusaurus.config.ts` — CALMGuard branding, Mermaid enabled, dark theme, routeBasePath: /
- `docs/sidebars.ts` — For Users (3 pages) and For Developers (6 pages) categories
- `docs/docs/intro.md` — Problem-first hero with CALM flowchart, slug: / for clean root URL
- `docs/docs/getting-started.md` — Prerequisites, install, env config, quick start
- `docs/docs/uploading-architectures.md` — CALM document structure, node/relationship types, custom upload
- `docs/docs/reading-reports.md` — All dashboard panels: gauge, graph, heat map, findings, pipeline
- `docs/docs/architecture/system-overview.md` — Tech stack table, architecture graph, SSE sequence diagram, directory tree
- `docs/docs/architecture/agent-system.md` — 4 agents, orchestration Mermaid, skills injection, TDD patterns
- `docs/docs/api/reference.md` — Auto-generated: 3 endpoints, Zod field tables, examples
- `docs/docs/compliance/frameworks.md` — SOX, PCI-DSS, NIST-CSF, FINOS CCC with scoring algorithm
- `docs/docs/contributing.md` — Dev setup, conventions, PR workflow, DCO sign-off
- `docs/docs/security.md` — Threat model Mermaid diagram, 4 threat scenarios, security practices
- `scripts/generate-api-docs.ts` — Zod schema extractor, field table renderer, MDX-safe output
- `package.json` — Added docs:dev, docs:build, docs:api scripts

## Decisions Made

- **routeBasePath: '/' with slug: /** — Docusaurus docs ARE the site root. Cleaner URLs for hackathon judges; no `/docs/` prefix
- **Remove src/pages/index.tsx** — Default Docusaurus landing page conflicts with routeBasePath: / causing duplicate route warnings. Removing it lets intro.md's `slug: /` be the true homepage
- **MDX curly brace escaping** — MDX's acorn parser treats `{ }` in table cells as JSX expressions. Fixed by HTML-encoding in the generator (`&#123;`, `&#125;`)
- **Regex-based schema extraction** — Simple regex matching of Zod `.object({` blocks is sufficient to extract field names and types. Full TypeScript AST parsing would be over-engineered for this use case
- **Docs as standalone package** — `docs/` has its own `package.json` and is NOT a pnpm workspace member, avoiding peer dependency resolution issues per research findings

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed MDX compilation failure from curly braces in table cells**
- **Found during:** Task 1 (first build attempt)
- **Issue:** Generated `reference.md` table cells contained `{ success: true, data: AnalysisInput }` which MDX's acorn parser interpreted as JSX expressions, causing build failure
- **Fix:** Added `escapeMdx()` function in generator to HTML-encode `{` and `}` in all table cell content. Also rewrote status code descriptions to avoid curly braces entirely
- **Files modified:** `scripts/generate-api-docs.ts`, `docs/docs/api/reference.md` (regenerated)
- **Verification:** `pnpm docs:build` succeeds with `[SUCCESS]`
- **Committed in:** `96f4d3d` (Task 1/2 combined commit)

**2. [Rule 1 - Bug] Fixed duplicate route warning by removing default Docusaurus index.tsx**
- **Found during:** Task 1 (build output)
- **Issue:** Docusaurus `src/pages/index.tsx` created a duplicate `/` route when `routeBasePath: '/'` + `slug: /` on intro.md were both active
- **Fix:** Deleted `src/pages/index.tsx`, `index.module.css`, `markdown-page.md`, `src/components/HomepageFeatures/` and `blog/` directory
- **Files modified:** Deleted files
- **Verification:** Build runs without "Duplicate routes found!" warning
- **Committed in:** `96f4d3d`

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both fixes necessary for correct build output. No scope creep.

## Issues Encountered

- `homePageId` option in Docusaurus 3.9.2 is no longer supported — docs say to use `slug: /` in frontmatter instead. Corrected immediately.
- `onBrokenMarkdownLinks` config option is deprecated in Docusaurus v4 preparation — warning only, not an error. Left as-is (minor deprecation warning acceptable).

## User Setup Required

None — no external service configuration required for the docs site.

## Self-Check

- [x] `docs/docusaurus.config.ts` — FOUND
- [x] `docs/sidebars.ts` — FOUND, contains "For Users" and "For Developers"
- [x] `docs/docs/intro.md` — FOUND, 40+ lines, Mermaid block present
- [x] `docs/docs/architecture/system-overview.md` — FOUND, Mermaid blocks present
- [x] `docs/docs/api/reference.md` — FOUND, 254 lines (min_lines: 40 met)
- [x] `scripts/generate-api-docs.ts` — FOUND, 270+ lines (min_lines: 30 met)
- [x] Commit `96f4d3d` — FOUND
- [x] `pnpm docs:build` — SUCCESS (verified above)
- [x] `pnpm docs:api` — SUCCESS (generates 255 lines)
- [x] 10 markdown files in `docs/docs/` — CONFIRMED

## Self-Check: PASSED

All files created, build succeeds, API generator works, page count matches requirements.

## Next Phase Readiness

- Documentation site is ready to deploy to Vercel alongside the main app
- Phase 5 Plan 05 is the final plan in Phase 5 (testing/devsecops/dogfooding)
- Full project is complete: Phases 1-4 feature complete + Phase 5 hardening/docs done
- Ready for hackathon submission

---
*Phase: 05-testing-devsecops-dogfooding*
*Completed: 2026-02-24*
