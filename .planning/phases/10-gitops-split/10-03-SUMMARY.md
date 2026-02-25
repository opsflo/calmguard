---
phase: 10-gitops-split
plan: 03
subsystem: api
tags: [github-api, sse, labels, terraform, gitops, pr-creation]

# Dependency graph
requires:
  - phase: 10-01
    provides: CloudInfraConfig type and __lastCloudInfraResult global
  - phase: 10-02
    provides: type 'infra' in PRRecord union and client-side infra PR handler

provides:
  - ensureLabel() helper (creates GitHub label, 422-safe)
  - addLabelToPR() helper (adds labels to PR via issues API, non-blocking)
  - create-pr route accepts type 'infra' in addition to 'pipeline' and 'remediation'
  - Renamed branch prefixes for all three PR types (locked decisions)
  - IaC removed from DevSecOps CI PR (terraform/main.tf now in Cloud Infra PR only)
  - buildInfraFiles() producing Terraform module files from CloudInfraConfig
  - buildInfraPRBody() with CALM traceability section
  - Auto-labeling for all three PR types (ci/cd, compliance, infrastructure)

affects:
  - 11-final-polish
  - create-pr API route consumers

# Tech tracking
tech-stack:
  added: []
  patterns:
    - LABEL_MAP constant for PR type to label config mapping
    - ensureLabel/addLabelToPR as non-blocking cosmetic helpers (log warn, no throw)
    - CloudInfraConfig.terraform.modules.map() for Terraform file generation
    - CALM traceability section in infra PR body (calmElement -> generatedResource -> rationale)

key-files:
  created: []
  modified:
    - src/lib/github/operations.ts
    - src/app/api/github/create-pr/route.ts

key-decisions:
  - "Label failures non-blocking: ensureLabel() ignores 422 (already exists), addLabelToPR() logs warn but never throws — PR creation always succeeds even if label API fails"
  - "IaC exclusively in Cloud Infra PR: buildPipelineFiles() now contains only GitHub Actions workflow and security scanning configs — no terraform/main.tf, no cloudformation/template.yaml"
  - "Branch names follow locked decisions: calmguard/devsecops-ci-{ts}, calmguard/compliance-remediation-{ts}, calmguard/cloud-infra-{ts}"
  - "Infra PR reads __lastCloudInfraResult global, throws descriptive error if null (must run analysis first)"

patterns-established:
  - "Non-blocking GitHub label pattern: try to create/apply labels, warn on failure, never block PR creation"
  - "LABEL_MAP constant maps PR type to { name, color, description } — single source of truth for all three types"

requirements-completed: [GOPS-01, GOPS-02, GOPS-03, GOPS-04]

# Metrics
duration: 4min
completed: 2026-02-25
---

# Phase 10 Plan 03: API Route Extension — Infra Branch, Branch Renames, Labels, IaC Removal Summary

**Three-PR GitOps split complete: create-pr route handles pipeline/remediation/infra with distinct branch names, auto-labels, and content separation (IaC exclusively in Cloud Infra PR)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-25T15:03:59Z
- **Completed:** 2026-02-25T15:07:10Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `ensureLabel()` and `addLabelToPR()` helpers to `operations.ts` — non-blocking label management with 422 tolerance
- Extended `create-pr/route.ts` schema to accept `type: 'infra'` and handle full Cloud Infra PR flow
- Renamed pipeline branch from `calmguard/pipeline-{ts}` to `calmguard/devsecops-ci-{ts}` and remediation from `calmguard/remediation-{ts}` to `calmguard/compliance-remediation-{ts}`
- Removed IaC (`terraform/main.tf`, `cloudformation/template.yaml`) from `buildPipelineFiles()` — now exclusively in Cloud Infra PR
- Added `buildInfraFiles()` mapping `CloudInfraConfig.terraform.modules` to file objects, and `buildInfraPRBody()` with module list and CALM traceability section

## Task Commits

Each task was committed atomically:

1. **Task 10-03-01: Add label helpers to operations.ts** - `c31f3d9` (feat)
2. **Task 10-03-02: Extend create-pr route with infra branch, branch renames, labels, and IaC removal** - `a20af5e` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/lib/github/operations.ts` — Added `ensureLabel()` (POST /labels, ignores 422) and `addLabelToPR()` (POST /issues/{n}/labels, logs warn on failure)
- `src/app/api/github/create-pr/route.ts` — Schema extended to `['pipeline', 'remediation', 'infra']`; LABEL_MAP constant; branch renames; IaC removed from pipeline; `buildInfraFiles()` and `buildInfraPRBody()` added; full infra PR creation flow; auto-labeling for all three types

## Decisions Made

- Label failures are non-blocking: `ensureLabel()` ignores 422 (already exists) and logs on other errors; `addLabelToPR()` logs on failure but never throws. PR creation always completes successfully.
- IaC is exclusively in Cloud Infra PR — `buildPipelineFiles()` now only contains GitHub Actions CI workflow and security scanning tool configs (GOPS-02 compliance)
- Branch names follow CONTEXT.md locked decisions exactly: `calmguard/devsecops-ci-{ts}`, `calmguard/compliance-remediation-{ts}`, `calmguard/cloud-infra-{ts}`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `else` block covering infra type incorrectly**
- **Found during:** Task 10-03-02 (route extension)
- **Issue:** The `else` block was structured to handle both `remediation` and `infra` types, causing `type === 'infra'` to also enter the remediation code path
- **Fix:** Changed `} else {` to `} else if (type === 'remediation') {` to make all three branches explicit and mutually exclusive
- **Files modified:** `src/app/api/github/create-pr/route.ts`
- **Verification:** TypeScript typecheck and `pnpm build` both pass cleanly
- **Committed in:** `a20af5e` (part of task 10-03-02 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Essential correctness fix — without it, infra requests would execute remediation flow. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviation above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three PR types fully operational: DevSecOps CI, Compliance Remediation, Cloud Infrastructure
- Phase 10 (GitOps Split) complete — all 3 plans executed
- Phase 11 (Final Polish) ready: three distinct PRs target different review audiences, branch naming is locked, labels applied automatically

## Self-Check: PASSED

- FOUND: src/lib/github/operations.ts
- FOUND: src/app/api/github/create-pr/route.ts
- FOUND: .planning/phases/10-gitops-split/10-03-SUMMARY.md
- FOUND commit: c31f3d9 (ensureLabel/addLabelToPR helpers)
- FOUND commit: a20af5e (extended create-pr route)

---
*Phase: 10-gitops-split*
*Completed: 2026-02-25*
