---
phase: 07-gitops-pr-generation
plan: 02
subsystem: gitops
tags: [github-api, pr-generation, sse-streaming, gitops]
dependency_graph:
  requires: [07-01]
  provides: [github-operations, create-pr-api, gitops-card]
  affects: [dashboard, api-routes, github-lib]
tech_stack:
  added: []
  patterns:
    - GitHub Git Data API (blobs + trees + commits for atomic multi-file commits)
    - SSE streaming from API route with step-by-step progress events
    - Shared globalThis across Next.js API routes via globals.ts import
key_files:
  created:
    - src/lib/github/globals.ts
    - src/lib/github/operations.ts
    - src/app/api/github/create-pr/route.ts
    - src/components/dashboard/gitops-card.tsx
  modified:
    - src/app/api/analyze/route.ts
    - src/app/dashboard/page.tsx
decisions:
  - "Used GitHub Git Data API (blobs/trees/commits) instead of Contents API for atomic multi-file commits in a single commit object"
  - "globals.ts centralizes declare global blocks — both analyze/route.ts and create-pr/route.ts import it for shared type declarations"
  - "Remediation PR section renders with onGenerate=undefined → disabled Coming Soon button; no error state triggered"
  - "Branch name format: calmguard/pipeline-{Date.now()} — timestamp ensures uniqueness across analyses"
metrics:
  duration: "9min"
  completed_date: "2026-02-24"
  tasks_completed: 2
  files_changed: 6
---

# Phase 7 Plan 02: GitOps PR Generation Summary

**One-liner:** Pipeline PR creation using GitHub Git Data API with SSE step streaming — branch, atomic multi-file commit, and PR opened from dashboard in real-time.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | GitHub operations library and create-pr API route | 8a6f59e | globals.ts, operations.ts, create-pr/route.ts, analyze/route.ts |
| 2 | GitOps card component and dashboard integration | c195c9a | gitops-card.tsx, dashboard/page.tsx |

## What Was Built

### src/lib/github/globals.ts
Centralized `declare global` module for cross-route server state. Declares `__lastPipelineResult`, `__lastAnalysisResult`, and `__lastCalmDocument` as globals. Both `analyze/route.ts` and `create-pr/route.ts` import this file — eliminating duplicated type declarations.

### src/lib/github/operations.ts
Four GitHub REST API operations, all using `githubFetch` from `./client.ts`:

- **`getHeadSha`** — `GET /repos/{owner}/{repo}/git/ref/heads/{branch}` — returns commit SHA
- **`createBranch`** — `POST /repos/{owner}/{repo}/git/refs` — creates `refs/heads/{branchName}`
- **`commitMultipleFiles`** — 4-step Git Data API flow: create blobs in parallel → create tree → create commit → PATCH ref. All files committed atomically (single commit, not one per file). Branch name is URL-encoded in PATCH step to handle `/` in `calmguard/pipeline-*` names.
- **`createPR`** — `POST /repos/{owner}/{repo}/pulls` — creates PR with Markdown body

### POST /api/github/create-pr
SSE streaming endpoint that orchestrates the full pipeline PR creation:

1. Validates request body (Zod schema) — type, owner, repo, filePath, fileSha, defaultBranch
2. Returns 503 if `GITHUB_TOKEN` is missing
3. Returns 501 for `type: 'remediation'` (Plan 03 will implement this)
4. For `type: 'pipeline'`: streams 4 step events then a `done` event
5. Step 1: Getting HEAD SHA → Step 2: Creating branch → Step 3: Committing pipeline artifacts → Step 4: Opening pull request
6. Reads `globalThis.__lastPipelineResult` for pipeline config (set by analyze/route.ts)
7. Commits `.github/workflows/calmguard-ci.yml`, `.github/{tool}.yml` per security tool, and `terraform/main.tf` or `cloudformation/template.yaml`
8. PR body is rich Markdown: summary, files added list, security tools, recommendations

### src/components/dashboard/gitops-card.tsx
Client component with two `PRSection` sub-components:

- **Pipeline PR:** functional — button triggers `handleGeneratePipelinePR` which reads SSE stream and updates Zustand state
- **Remediation PR:** disabled — `onGenerate=undefined` renders "Coming Soon" button with `disabled` + `opacity-50`
- Step progress visible via `Loader2` spinner + animated `record.step` text
- Success state: `CheckCircle2`, branch name in monospace, file count badge, clickable PR link with `ExternalLink` icon
- Error state: `AlertCircle`, error message, Retry button

### Dashboard integration
`GitOpsCard` rendered in `src/app/dashboard/page.tsx` conditionally:
```tsx
{isComplete && githubRepo && (
  <div className="mt-4">
    <GitOpsCard />
  </div>
)}
```
Only visible when analysis is complete AND the source was a GitHub repo (not file upload or demo). Positioned after the main grid, before the ExportReportModal.

## Deviations from Plan

None — plan executed exactly as written.

## Success Criteria Verification

- [x] System creates a new branch in the source repo after analysis completes (PR-01) — `createBranch` via `calmguard/pipeline-{timestamp}` branch
- [x] System commits pipeline artifacts in a single atomic commit (PR-02) — `commitMultipleFiles` using Git Data API blobs/tree/commit
- [x] System opens a PR with compliance report summary (PR-03) — `createPR` with Markdown body including summary, file list, tools, recommendations
- [x] Dashboard displays PR link and status after generation (PR-04) — `GitOpsCard` shows success state with link, branch, file count
- [x] All pipeline files committed in a single atomic commit — Git Data API design
- [x] Step progress visible during generation — 4 SSE step events emitted before `done`
- [x] `pnpm typecheck` passes — verified
- [x] `pnpm lint` passes — verified

## Self-Check: PASSED

All artifacts verified on disk. All commits confirmed in git log.

| Check | Result |
|-------|--------|
| src/lib/github/globals.ts | FOUND |
| src/lib/github/operations.ts | FOUND |
| src/app/api/github/create-pr/route.ts | FOUND |
| src/components/dashboard/gitops-card.tsx | FOUND |
| .planning/phases/07-gitops-pr-generation/07-02-SUMMARY.md | FOUND |
| Commit 8a6f59e (Task 1) | FOUND |
| Commit c195c9a (Task 2) | FOUND |
