---
phase: 10-gitops-split
plan: 01
subsystem: agents
tags: [aws, terraform, cloud-infra, calm, skill, orchestrator, sse, gemini]

# Dependency graph
requires:
  - phase: 07-gitops-pr-generation
    provides: pipeline-generator.ts pattern, globals.ts, orchestrator Phase 1 pattern
  - phase: 10-gitops-split
    provides: plan structure for cloud infra PR button split
provides:
  - Cloud Infrastructure agent (generateCloudInfra) that maps CALM signals to AWS Terraform
  - CLOUD-INFRASTRUCTURE.md skill file with CALM → AWS resource mapping tables
  - cloudInfraConfigSchema Zod schema for structured Terraform output
  - globalThis.__lastCloudInfraResult for PR route consumption
  - cloudInfra field in AnalysisResult (orchestrator Phase 1 extended to 4 parallel agents)
affects: [10-02, 11-01, api-analyze-route, github-create-pr-route]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Agent follows pipeline-generator.ts pattern: loadAgentConfig → loadSkills → generateObject → retry → emit events
    - Phase 1 parallel execution in orchestrator extended to 4 agents via Promise.allSettled[3]
    - Global result storage pattern for cross-route server state

key-files:
  created:
    - skills/CLOUD-INFRASTRUCTURE.md
    - agents/cloud-infra-generator.yaml
    - src/lib/agents/cloud-infra-generator.ts
  modified:
    - src/lib/github/globals.ts
    - src/lib/agents/orchestrator.ts
    - src/app/api/analyze/route.ts
    - src/__tests__/learning/store.test.ts

key-decisions:
  - "Cloud infra runs in Phase 1 parallel (not Phase 2) — only needs AnalysisInput, not compliance results"
  - "cloudInfraConfigSchema uses modules array (not single-file) for production-realistic multi-file Terraform"
  - "Traceability array enforced per module — every Terraform resource maps to CALM element"

patterns-established:
  - "CALM Signal → AWS Resource: network→VPC, service→ECS/ALB, database→RDS, HTTPS→ACM, mTLS→Private CA"

requirements-completed: [GOPS-03]

# Metrics
duration: 4min
completed: 2026-02-25
---

# Phase 10 Plan 1: Cloud Infrastructure Agent and Skill Summary

**AWS Terraform cloud infra agent (generateCloudInfra) with CALM signal → resource mapping, Phase 1 parallel orchestration, and globalThis storage for PR generation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-25T14:56:20Z
- **Completed:** 2026-02-25T15:00:46Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Created `skills/CLOUD-INFRASTRUCTURE.md` with full CALM Signal → AWS Resource mapping table covering VPC, ECS, RDS, CloudFront, ACM, Private CA, and IAM
- Created `src/lib/agents/cloud-infra-generator.ts` with `generateCloudInfra()` function following `pipeline-generator.ts` pattern exactly (loadAgentConfig, loadSkills, generateObject with 3-attempt retry, SSE events)
- Extended orchestrator Phase 1 `Promise.allSettled` from 3 to 4 agents — cloud infra runs in parallel at zero wall-clock cost
- Extended `globals.ts` with `__lastCloudInfraResult` global and `analyze/route.ts` to store it after analysis

## Task Commits

Each task was committed atomically:

1. **Task 10-01-01: Create CLOUD-INFRASTRUCTURE.md skill and cloud-infra-generator YAML** - `27e5465` (feat)
2. **Task 10-01-02: Create cloud-infra-generator.ts agent function and wire into orchestrator** - `c5e507f` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `skills/CLOUD-INFRASTRUCTURE.md` - CALM Signal → AWS Resource mapping, resource selection rules, Terraform constraints, traceability requirements
- `agents/cloud-infra-generator.yaml` - Agent YAML definition (gemini-2.5-flash, temperature 0.3, loads CLOUD-INFRASTRUCTURE.md skill)
- `src/lib/agents/cloud-infra-generator.ts` - generateCloudInfra() agent function with cloudInfraConfigSchema (provider, terraform.modules[], traceability[], summary)
- `src/lib/github/globals.ts` - Added `__lastCloudInfraResult: CloudInfraConfig | null | undefined` global declaration
- `src/lib/agents/orchestrator.ts` - Added cloud infra to Phase 1, extended analysisResultSchema, updated totalCount to 5/6
- `src/app/api/analyze/route.ts` - Store `result.cloudInfra` to global after analysis
- `src/__tests__/learning/store.test.ts` - Added `cloudInfra: null` to AnalysisResult mock (Rule 1 fix)

## Decisions Made

- Cloud infra runs in Phase 1 parallel alongside Architecture Analyzer, Compliance Mapper, and Pipeline Generator — it only needs `AnalysisInput`, not Phase 2 risk results, so parallelism is free wall-clock time
- `cloudInfraConfigSchema` uses a `modules[]` array (separate files: vpc.tf, ecs.tf, rds.tf) for production-realistic output rather than single-file monolith
- Every Terraform resource requires a `traceability` entry linking it back to a CALM element unique-id

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated store.test.ts AnalysisResult mock to include cloudInfra field**
- **Found during:** Task 2 (TypeScript type check)
- **Issue:** `AnalysisResult` type gained `cloudInfra` field (nullable), but the test `makeResult()` factory didn't include it — TypeScript error TS2719 (type assignability)
- **Fix:** Added `cloudInfra: null` to the mock object in `src/__tests__/learning/store.test.ts`
- **Files modified:** `src/__tests__/learning/store.test.ts`
- **Verification:** `pnpm typecheck` passes clean; `pnpm build` succeeds
- **Committed in:** `c5e507f` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - type bug in test mock)
**Impact on plan:** Necessary for TypeScript strict mode compliance. No scope creep.

## Issues Encountered

- Potential circular import: `globals.ts` imports `AnalysisResult` from `orchestrator.ts`. Adding `import '@/lib/github/globals'` to `orchestrator.ts` would create a cycle. Resolved by setting `globalThis.__lastCloudInfraResult` directly in the orchestrator without the globals import — TypeScript accepts this since `globals.ts` is imported by `analyze/route.ts` which calls the orchestrator.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `globalThis.__lastCloudInfraResult` populated after analysis — ready for Plan 10-02 to add Cloud Infra PR button
- `cloudInfra` field available in `AnalysisResult` for any consumer needing the result
- Agent YAML and skill file match existing registry/loader conventions — no infrastructure changes needed

---
*Phase: 10-gitops-split*
*Completed: 2026-02-25*
