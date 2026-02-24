---
phase: 06-polish-demo-mode-deployment
plan: 01
subsystem: ui, api, infra
tags: [calm-cli, file-upload, drag-and-drop, vercel, sse, subprocess, next.js]

# Dependency graph
requires:
  - phase: 01-foundation-calm-parser
    provides: parseCalm, extractAnalysisInput, CalmDocument types
  - phase: 02-multi-agent-infrastructure
    provides: analysis-store Zustand setCalmData action
  - phase: 03-api-routes-dashboard-core
    provides: sidebar layout, architecture-selector component, SSE analyze route

provides:
  - "@finos/calm-cli subprocess wrapper (validateWithCalmCli) with temp file lifecycle management"
  - "POST /api/calm/validate route with nodejs runtime and structured error response"
  - "CalmUploadZone component with drag-and-drop, status progression, and inline errors"
  - "maxDuration=300 on analyze route for Vercel Fluid Compute SSE timeout"
  - "serverExternalPackages config to prevent @finos/calm-cli webpack bundling"

affects:
  - 06-02-demo-mode
  - 06-03-deployment

# Tech tracking
tech-stack:
  added:
    - "@finos/calm-cli@1.33.0 (runtime dependency — invoked as subprocess)"
  patterns:
    - "serverExternalPackages for Node.js-only CLI tools used via subprocess"
    - "Temp file + execFileAsync pattern for CLI subprocess validation"
    - "UploadStatus state machine (idle|parsing|validating|ready|error) for multi-step file processing"
    - "fileURLToPath + relative path resolution for node_modules bin in Next.js routes"

key-files:
  created:
    - src/lib/calm/cli-validator.ts
    - src/app/api/calm/validate/route.ts
    - src/components/calm/calm-upload-zone.tsx
  modified:
    - src/components/calm/architecture-selector.tsx
    - src/components/dashboard/sidebar.tsx
    - src/app/api/analyze/route.ts
    - next.config.ts
    - package.json

key-decisions:
  - "Use serverExternalPackages for @finos/calm-cli: prevents webpack from bundling Node.js CLI tool that is called via subprocess"
  - "Use fileURLToPath + relative join for calm-cli path resolution: avoids createRequire static analysis that triggers webpack to bundle the package"
  - "Graceful fallback on network error in CalmUploadZone: if /api/calm/validate fetch fails, treat as valid and use local Zod result only"
  - "maxDuration=300 on analyze route: enables Vercel Fluid Compute 300-second SSE streaming in production"
  - "CalmUploadZone in both architecture-selector and sidebar: landing page for first-time use, sidebar for always-accessible during dashboard navigation"

patterns-established:
  - "Node.js CLI subprocess pattern: write to tmp file, execFileAsync with process.execPath, parse stdout JSON, cleanup in finally"
  - "UploadStatus state machine: typed string union drives UI rendering without conditionals on multiple boolean flags"

requirements-completed: [CALM-04, CALM-05, INFRA-01]

# Metrics
duration: 6min
completed: 2026-02-24
---

# Phase 06 Plan 01: CALM Upload Zone & Vercel Deployment Config Summary

**Drag-and-drop CALM JSON upload with @finos/calm-cli subprocess validation, /api/calm/validate route (nodejs runtime), and maxDuration=300 for Vercel SSE streaming**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-24T09:47:51Z
- **Completed:** 2026-02-24T09:53:51Z
- **Tasks:** 2
- **Files modified:** 7 (2 created new, 5 modified)

## Accomplishments

- Implemented `validateWithCalmCli()` subprocess wrapper that writes CALM JSON to a temp file, invokes `@finos/calm-cli validate --format json` via `execFileAsync`, parses structured errors, and always cleans up in `finally`
- Built `POST /api/calm/validate` with `runtime='nodejs'` (child_process requirement) and graceful 400/500 error handling
- Created `CalmUploadZone` component with full status machine (idle → parsing → validating → ready/error), drag-and-drop, click-to-browse, and inline error display — wired into both architecture-selector and dashboard sidebar
- Added `maxDuration=300` to analyze route for Vercel Fluid Compute 300-second SSE timeout
- Fixed webpack build failure by adding `serverExternalPackages: ['@finos/calm-cli']` to next.config.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: calm-cli validator, /api/calm/validate route, Vercel maxDuration** - `f191095` (feat)
2. **Task 2: CalmUploadZone component + sidebar + architecture-selector wiring** - `660672e` (feat)

## Files Created/Modified

- `src/lib/calm/cli-validator.ts` - validateWithCalmCli subprocess wrapper with CalmValidationResult type
- `src/app/api/calm/validate/route.ts` - POST /api/calm/validate with nodejs runtime
- `src/components/calm/calm-upload-zone.tsx` - drag-and-drop upload component with status machine
- `src/components/calm/architecture-selector.tsx` - replaced "Coming soon" placeholder with CalmUploadZone
- `src/components/dashboard/sidebar.tsx` - added persistent Upload section with CalmUploadZone
- `src/app/api/analyze/route.ts` - added maxDuration=300 export
- `next.config.ts` - added serverExternalPackages for @finos/calm-cli
- `package.json` + `pnpm-lock.yaml` - added @finos/calm-cli@1.33.0 dependency

## Decisions Made

- `serverExternalPackages: ['@finos/calm-cli']` — webpack was attempting to bundle the CLI, which has internal relative requires (`./IPv6`, `./punycode`) that fail in webpack. Marking it as an external package keeps it out of the bundle and available in node_modules at runtime.
- Used `fileURLToPath` + relative `join` to compute the calm-cli path instead of `createRequire(import.meta.url)` — the latter triggered webpack to follow and bundle the import chain statically.
- Graceful network fallback in `CalmUploadZone`: if `/api/calm/validate` request fails (network error), treat as valid and proceed with the local Zod parse result — Vercel deployment shouldn't block on CLI unavailability in edge cases.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed webpack build failure from @finos/calm-cli bundling**
- **Found during:** Task 2 (build verification)
- **Issue:** Next.js webpack tried to bundle `@finos/calm-cli`, which has internal relative CJS requires (`./IPv6`, `./SecondLevelDomains`, `./punycode`) that webpack cannot resolve in ESM context
- **Fix:** Added `serverExternalPackages: ['@finos/calm-cli']` to `next.config.ts`; rewrote `resolveCalmCliPath()` to use `fileURLToPath` + relative join instead of `createRequire` to avoid static analysis
- **Files modified:** `next.config.ts`, `src/lib/calm/cli-validator.ts`
- **Verification:** `pnpm build` succeeds, `/api/calm/validate` appears in build output, all 22 tests pass
- **Committed in:** `660672e` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (blocking — webpack bundling issue)
**Impact on plan:** Required fix for production build. No scope creep. Solution is idiomatic for Node.js-only packages in Next.js.

## Issues Encountered

- `createRequire(import.meta.url)` used for calm-cli path resolution caused webpack to follow the module graph statically. Switched to `fileURLToPath + join` path computation which webpack cannot statically analyze, resolving the bundling issue.

## User Setup Required

None - no external service configuration required. `@finos/calm-cli` is included in `node_modules` as a runtime dependency.

## Next Phase Readiness

- Upload zone fully functional: users can drag-and-drop or browse for CALM JSON files
- Both landing page (architecture-selector) and dashboard (sidebar) have upload access
- `/api/calm/validate` route ready for production use
- analyze route configured for Vercel 300-second SSE timeout
- Ready for Phase 06-02 (demo mode) and 06-03 (deployment)

---
*Phase: 06-polish-demo-mode-deployment*
*Completed: 2026-02-24*
