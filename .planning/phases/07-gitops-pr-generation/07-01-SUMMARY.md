---
phase: 07-gitops-pr-generation
plan: 01
subsystem: ui, api, github
tags: [github, rest-api, zustand, tabs, shadcn, zod, next-js-api-routes]

# Dependency graph
requires: []
provides:
  - "GitHub REST API client (server-side only) with auth header injection"
  - "POST /api/github/fetch-calm — fetches, decodes, validates CALM from any GitHub repo"
  - "GET /api/github/status — returns { enabled: boolean } based on GITHUB_TOKEN presence"
  - "GitOps Zustand state slice: githubRepo, pipelinePR, remediationPR"
  - "GitHubInput component with pre-filled demo values"
  - "Tab-based ArchitectureSelector (Upload File | From GitHub)"
affects: [07-02, 07-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-side GitHub fetch: GITHUB_TOKEN injected in API route, never exposed to client"
    - "Status gate pattern: /api/github/status checked on mount to conditionally render UI features"
    - "Zustand PR state slice: pipelinePR + remediationPR typed with PRRecord interface for Plans 02/03"

key-files:
  created:
    - src/lib/github/types.ts
    - src/lib/github/client.ts
    - src/app/api/github/fetch-calm/route.ts
    - src/app/api/github/status/route.ts
    - src/components/calm/github-input.tsx
    - src/components/ui/input.tsx
    - src/components/ui/label.tsx
  modified:
    - src/store/analysis-store.ts
    - src/components/calm/architecture-selector.tsx
    - src/app/page.tsx

key-decisions:
  - "GITHUB_TOKEN stays server-side only — client components never see it; status gate pattern used instead"
  - "Pre-filled demo values point to finos-labs/dtcch-2026-opsflow-llc for hackathon demo convenience"
  - "PRRecord interface stored in github/types.ts (not store) to avoid circular imports with Plans 02/03"
  - "Compliance framework selector placed above tabs so it applies to both upload and GitHub flows"

patterns-established:
  - "GitHub status gate: fetch /api/github/status on mount → conditionally render tab"
  - "GitOps store slice: githubRepo + pipelinePR + remediationPR state for PR generation pipeline"

requirements-completed: [GIT-01, GIT-02, GIT-03, ANLZ-01]

# Metrics
duration: 5min
completed: 2026-02-24
---

# Phase 7 Plan 01: GitHub Input + GitOps Foundation Summary

**Server-side GitHub CALM fetch with tab-based UI, GitOps Zustand state, and GITHUB_TOKEN gating — foundation for PR generation in Plans 02/03**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-24T17:46:33Z
- **Completed:** 2026-02-24T17:50:43Z
- **Tasks:** 2 of 3 (paused at checkpoint:human-verify)
- **Files modified:** 10

## Accomplishments
- GitHub REST API client library with server-side auth header injection (GITHUB_TOKEN never reaches client)
- POST `/api/github/fetch-calm` — fetches CALM file from any GitHub repo, decodes base64, validates via parseCalm, returns `{ calm, analysisInput, fileSha, defaultBranch }`
- GET `/api/github/status` — lightweight gate endpoint that returns `{ enabled: true/false }` based on GITHUB_TOKEN presence
- Zustand store extended with `githubRepo`, `pipelinePR`, `remediationPR` state + typed actions for Plans 02 and 03
- `GitHubInput` component with pre-filled demo fields, validation, error toasts, and navigate-to-dashboard on success
- `ArchitectureSelector` refactored to tab-based UI — "From GitHub" tab hidden when GITHUB_TOKEN not configured

## Task Commits

Each task committed atomically:

1. **Task 1: GitHub client library, API routes, and GitOps Zustand state** — `6b5d3e4` (feat)
2. **Task 2: GitHub input component and tab-based architecture selector** — `f34da45` (feat)

## Files Created/Modified
- `src/lib/github/types.ts` — Zod schemas for GitHub API input/response + PRRecord interface
- `src/lib/github/client.ts` — Server-side GitHub REST API fetch wrapper
- `src/app/api/github/fetch-calm/route.ts` — POST endpoint: fetch + decode + validate CALM from GitHub
- `src/app/api/github/status/route.ts` — GET endpoint: GITHUB_TOKEN presence check
- `src/store/analysis-store.ts` — Extended with GitOps state slice (githubRepo, pipelinePR, remediationPR)
- `src/components/calm/github-input.tsx` — "From GitHub" tab form component with pre-filled demo values
- `src/components/calm/architecture-selector.tsx` — Refactored to tab-based UI with GitHub status gate
- `src/components/ui/input.tsx` — shadcn/ui Input component (added — was missing from codebase)
- `src/components/ui/label.tsx` — Label wrapper component (added — was missing from codebase)
- `src/app/page.tsx` — Updated description text to mention GitHub repo option

## Decisions Made
- GITHUB_TOKEN stays server-side only — the client only learns `{ enabled: boolean }` from the status endpoint
- Pre-filled demo values: `finos-labs/dtcch-2026-opsflow-llc` / `examples/payment-gateway.calm.json` for hackathon judges
- PRRecord interface lives in `github/types.ts` to be shared cleanly across Plans 02 and 03 without circular imports
- Compliance framework selector placed above tabs — it applies equally to upload and GitHub flows

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing Input and Label shadcn/ui components**
- **Found during:** Task 2 (GitHubInput component creation)
- **Issue:** `github-input.tsx` imports `@/components/ui/input` and `@/components/ui/label` — neither existed in the codebase
- **Fix:** Created `src/components/ui/input.tsx` (standard shadcn/ui Input) and `src/components/ui/label.tsx` (native HTML label wrapper — avoided installing `@radix-ui/react-label` since it wasn't in package.json)
- **Files modified:** src/components/ui/input.tsx, src/components/ui/label.tsx
- **Verification:** `pnpm typecheck` passes, `pnpm lint` passes
- **Committed in:** f34da45 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking dependency)
**Impact on plan:** Essential — GitHubInput component required Input/Label to function. No scope creep.

## Issues Encountered
- TypeScript strict mode caught implicit `any` on `onChange` handlers for the new Input component — fixed by adding explicit `React.ChangeEvent<HTMLInputElement>` type annotations

## User Setup Required
None — plan requires GITHUB_TOKEN set in `.env.local` but this is documented in the checkpoint verification steps, not a new setup requirement.

## Next Phase Readiness
- GitHub client library ready for Plans 02 and 03 to reuse
- Zustand PRRecord state ready for PR generation pipeline to populate
- `fileSha` and `defaultBranch` stored in `githubRepo` — required by Plan 03 for branch creation and file update PRs
- Awaiting human verification checkpoint before continuing to Plan 02

---
*Phase: 07-gitops-pr-generation*
*Completed: 2026-02-24*
