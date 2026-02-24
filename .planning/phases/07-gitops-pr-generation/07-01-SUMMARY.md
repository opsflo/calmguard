---
phase: 07-gitops-pr-generation
plan: 01
subsystem: ui, api, github
tags: [github, rest-api, zustand, tabs, shadcn, zod, next-js-api-routes]

# Dependency graph
requires: []
provides:
  - "GitHub REST API client (server-side, auth optional for public repos)"
  - "POST /api/github/fetch-calm — fetches, decodes, validates CALM from any GitHub repo (public or private)"
  - "GET /api/github/status — returns { enabled: boolean, authEnabled: boolean } for GITHUB_TOKEN presence"
  - "GitOps Zustand state slice: githubRepo, pipelinePR, remediationPR, gitHubAuthEnabled"
  - "GitHubInput component with pre-filled demo values"
  - "Tab-based ArchitectureSelector (Upload File | From GitHub) — GitHub tab always visible"
affects: [07-02, 07-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-side GitHub fetch: GITHUB_TOKEN injected in API route, never exposed to client; optional for public repos"
    - "Dual-gate pattern: /api/github/status returns enabled (tab visibility) and authEnabled (PR button visibility) separately"
    - "Zustand PR state slice: pipelinePR + remediationPR typed with PRRecord interface for Plans 02/03"
    - "Auth-optional GitHub client: githubFetch handles both authenticated and unauthenticated calls"

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
  - "GitHub tab is always visible — public repos can be fetched and analyzed without GITHUB_TOKEN; auth only needed for PR generation"
  - "Status endpoint returns two flags: enabled (always true now) and authEnabled (GITHUB_TOKEN present) for PR button gating"
  - "Pre-filled demo values point to finos-labs/dtcch-2026-opsflow-llc for hackathon demo convenience"
  - "PRRecord interface stored in github/types.ts (not store) to avoid circular imports with Plans 02/03"
  - "Compliance framework selector placed above tabs so it applies to both upload and GitHub flows"

patterns-established:
  - "Auth-optional GitHub fetch: try with token if available, fall through to unauthenticated for public repos"
  - "Dual status gate: separate enabled/authEnabled flags — tab visibility vs PR action availability"
  - "GitOps store slice: githubRepo + pipelinePR + remediationPR + gitHubAuthEnabled state for PR generation pipeline"

requirements-completed: [GIT-01, GIT-02, GIT-03, ANLZ-01]

# Metrics
duration: 15min
completed: 2026-02-24
---

# Phase 7 Plan 01: GitHub Input + GitOps Foundation Summary

**Server-side GitHub CALM fetch with tab-based UI always visible (public repos work without auth), GitOps Zustand state, and dual auth-gate pattern for PR generation in Plans 02/03**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-02-24T17:46:33Z
- **Completed:** 2026-02-24T17:55:00Z
- **Tasks:** 3 of 3 (including post-checkpoint design change)
- **Files modified:** 10

## Accomplishments
- GitHub REST API client library with optional auth — public repos work without GITHUB_TOKEN, private repos use token
- POST `/api/github/fetch-calm` — fetches CALM file from any GitHub repo (public or private), decodes base64, validates via parseCalm, returns `{ calm, analysisInput, fileSha, defaultBranch }`
- GET `/api/github/status` — now returns `{ enabled: boolean, authEnabled: boolean }` separating tab visibility from PR auth gating
- Zustand store extended with `githubRepo`, `pipelinePR`, `remediationPR`, `gitHubAuthEnabled` state + typed actions for Plans 02 and 03
- `GitHubInput` component with pre-filled demo fields, validation, error toasts, and navigate-to-dashboard on success
- `ArchitectureSelector` refactored to tab-based UI — "From GitHub" tab **always visible** (post-checkpoint design change); PR generation buttons will gate on `gitHubAuthEnabled`

## Task Commits

Each task committed atomically:

1. **Task 1: GitHub client library, API routes, and GitOps Zustand state** — `6b5d3e4` (feat)
2. **Task 2: GitHub input component and tab-based architecture selector** — `f34da45` (feat)
3. **Post-checkpoint: Allow GitHub tab for public repos without GITHUB_TOKEN** — `f530df1` (feat)

**Plan metadata:** `b65e246` (docs: plan execution summary and state update — earlier partial)

## Files Created/Modified
- `src/lib/github/types.ts` — Zod schemas for GitHub API input/response + PRRecord interface
- `src/lib/github/client.ts` — Server-side GitHub REST API fetch wrapper, auth optional
- `src/app/api/github/fetch-calm/route.ts` — POST endpoint: fetch + decode + validate CALM from GitHub (unauthenticated fallback for public repos)
- `src/app/api/github/status/route.ts` — GET endpoint: returns `{ enabled, authEnabled }` dual flags
- `src/store/analysis-store.ts` — Extended with GitOps state slice (githubRepo, pipelinePR, remediationPR, gitHubAuthEnabled)
- `src/components/calm/github-input.tsx` — "From GitHub" tab form component with pre-filled demo values
- `src/components/calm/architecture-selector.tsx` — Refactored to tab-based UI, GitHub tab always shown
- `src/components/ui/input.tsx` — shadcn/ui Input component (added — was missing from codebase)
- `src/components/ui/label.tsx` — Label wrapper component (added — was missing from codebase)
- `src/app/page.tsx` — Updated description text to mention GitHub repo option

## Decisions Made
- GITHUB_TOKEN stays server-side only — the client only learns `{ enabled, authEnabled }` from the status endpoint
- **Post-checkpoint design change:** GitHub tab is always visible. Public repos can be fetched and analyzed without auth. GITHUB_TOKEN is only required for PR generation (Plans 02 and 03). This is the correct UX — hiding the tab when users haven't set up a token is unnecessarily restrictive.
- Status endpoint now returns two flags: `enabled` (always true) and `authEnabled` (GITHUB_TOKEN present) — Plans 02/03 use `authEnabled` to gate PR generation buttons
- `gitHubAuthEnabled` added to Zustand store so downstream components (PR buttons) can react without re-fetching
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

### Human-Requested Design Changes (Post-Checkpoint)

**1. GitHub tab always visible (public repo support without GITHUB_TOKEN)**
- **Approved at:** Checkpoint:human-verify (Task 3)
- **Change:** Original plan had GitHub tab hidden when GITHUB_TOKEN not set. Post-checkpoint, tab is always visible. Public repos work without auth. Only PR generation (Plans 02/03) requires GITHUB_TOKEN.
- **Impact:** `githubFetch` now accepts optional token, `fetch-calm` route sends unauthenticated requests for public repos, `status` route returns dual flags, store adds `gitHubAuthEnabled`
- **Committed in:** f530df1

---

**Total deviations:** 1 auto-fixed (blocking dependency) + 1 human-requested design change
**Impact on plan:** Auto-fix was essential. Design change improves UX by allowing public repo analysis without token setup. No scope creep — PR generation still correctly gates on auth.

## Issues Encountered
- TypeScript strict mode caught implicit `any` on `onChange` handlers for the new Input component — fixed by adding explicit `React.ChangeEvent<HTMLInputElement>` type annotations

## User Setup Required
None for tab visibility. GITHUB_TOKEN in `.env.local` is required only for PR generation (Plans 02 and 03), not for fetching and analyzing public repos.

## Self-Check: PASSED

Files verified present:
- src/lib/github/client.ts — FOUND
- src/lib/github/types.ts — FOUND
- src/app/api/github/fetch-calm/route.ts — FOUND
- src/app/api/github/status/route.ts — FOUND
- src/components/calm/github-input.tsx — FOUND
- src/store/analysis-store.ts — FOUND (modified)

Commits verified:
- 6b5d3e4 (Task 1) — FOUND
- f34da45 (Task 2) — FOUND
- f530df1 (post-checkpoint design change) — FOUND

## Next Phase Readiness
- GitHub client library ready for Plans 02 and 03 to reuse (`githubFetch` with optional token)
- Zustand PRRecord state ready for PR generation pipeline to populate
- `fileSha` and `defaultBranch` stored in `githubRepo` — required by Plan 03 for branch creation and file update PRs
- `gitHubAuthEnabled` in store — Plans 02/03 use this to show/hide PR generation buttons
- Plan 07-02 can proceed immediately

---
*Phase: 07-gitops-pr-generation*
*Completed: 2026-02-24*
