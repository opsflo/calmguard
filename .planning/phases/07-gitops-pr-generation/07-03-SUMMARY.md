---
phase: 07-gitops-pr-generation
plan: "03"
subsystem: gitops-pr-generation
tags: [calm-remediation, ai-agent, github-pr, compliance, gitops]
dependency_graph:
  requires: [07-01, 07-02]
  provides: [calm-remediator-agent, remediation-pr-api, working-remediation-button]
  affects: [dashboard-gitops-card, create-pr-route, analyze-route]
tech_stack:
  added:
    - calm-remediator agent (Gemini 2.0 Flash, maxTokens=16384, temp=0.2)
    - GitHub Contents API PUT (single-file commit for remediation)
  patterns:
    - shared readPRStream() helper extracted from duplicate SSE logic
    - globalThis globals for cross-route server state (__lastAnalysisResult, __lastCalmDocument)
key_files:
  created:
    - agents/calm-remediator.yaml
    - src/lib/agents/calm-remediator.ts
  modified:
    - src/app/api/analyze/route.ts
    - src/app/api/github/create-pr/route.ts
    - src/components/dashboard/gitops-card.tsx
decisions:
  - "GitHub Contents API PUT used for remediation (single file) vs blob+tree+commit for pipeline (multi-file)"
  - "readPRStream() helper extracted to DRY up duplicate SSE stream reading logic"
  - "CALM enum constraints included in agent prompt retry messages to prevent validation failures on retry"
  - "remediateCalm() called inside SSE stream (step 1) so progress is visible before GitHub ops"
metrics:
  duration: "~5min"
  completed: "2026-02-24"
  tasks: 2
  files: 5
---

# Phase 7 Plan 03: CALM Remediation PR Generation Summary

Closes the full GitOps loop — from compliance analysis findings to automated remediation PR. After running analysis on a GitHub-sourced CALM file, users can now click "Generate Remediation PR" to get an AI-generated remediated CALM JSON committed to a new branch with a PR describing every change made and why.

## What Was Built

**CALM Remediator Agent** (`src/lib/agents/calm-remediator.ts`):
- `remediateCalm(originalCalm, compliance, risk)` — takes analysis findings and produces modified CALM
- Output schema: `remediatedCalm` (full CALM document), `changes[]` (per-change audit trail), `summary`
- Each change: `nodeOrRelationshipId`, `changeType` (protocol-upgrade | control-added), `description`, `rationale`, `before`, `after`
- 3-attempt retry loop with exponential backoff (1s/2s/4s) — retry prompts re-emphasize CALM enum constraints
- Emits SSE finding events per change during execution (visible in agent feed)
- Uses Gemini 2.0 Flash with maxTokens=16384 and temperature=0.2 for deterministic output

**Agent YAML** (`agents/calm-remediator.yaml`):
- Follows existing pattern: `calmguard/v1` apiVersion
- Explicit protocol and node-type enum constraints in the role description to prevent LLM hallucination

**Analyze Route Update** (`src/app/api/analyze/route.ts`):
- Now stores `globalThis.__lastAnalysisResult` and `globalThis.__lastCalmDocument` after analysis
- Required for remediation PR route to access compliance/risk findings without re-running analysis

**Remediation PR Route** (`src/app/api/github/create-pr/route.ts`):
- Replaced the 501 stub with full implementation
- SSE stream: Run agent → Get HEAD SHA → Create branch → Commit file → Open PR
- Commits single remediated CALM file via GitHub Contents API PUT (not blob+tree+commit)
- PR body includes: summary, per-change breakdown (type/element/before/after/rationale), statistics
- PR title: `fix: apply CALMGuard compliance remediation`
- Branch name: `calmguard/remediation-{timestamp}` for uniqueness

**GitOps Card** (`src/components/dashboard/gitops-card.tsx`):
- Replaced disabled "Coming Soon" button with working `handleGenerateRemediationPR`
- Extracted shared `readPRStream(res, setPR)` helper — DRYs up identical SSE logic from both handlers
- Uses `SetPRFn = (pr: Partial<PRRecord>) => void` type alias for type-safe setter passing
- Both Pipeline PR and Remediation PR work independently

## Deviations from Plan

**[Rule 1 - Bug] Fixed type error in readPRStream helper signature**
- **Found during:** Task 2 typecheck
- **Issue:** The initial `readPRStream` signature used `string` for status instead of the PRRecord union literal type, causing TypeScript error TS2345
- **Fix:** Added `type SetPRFn = (pr: Partial<PRRecord>) => void` alias and used it as the setPR parameter type
- **Files modified:** `src/components/dashboard/gitops-card.tsx`
- **Commit:** 39d9eda (included in Task 2 commit)

## Self-Check

**Files created/exist:**
- [x] `agents/calm-remediator.yaml` — FOUND
- [x] `src/lib/agents/calm-remediator.ts` — FOUND

**Commits:**
- [x] 56097d4 — Task 1: CALM remediator agent and analysis globals
- [x] 39d9eda — Task 2: remediation PR API route and working GitOps card button

**Verification:**
- [x] `pnpm typecheck` — PASSED (no errors)
- [x] `pnpm lint` — PASSED (no issues)

## Self-Check: PASSED
