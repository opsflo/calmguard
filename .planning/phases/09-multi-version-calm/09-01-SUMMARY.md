---
phase: 09-multi-version-calm
plan: 01
subsystem: api
tags: [calm, parser, normalizer, zod, typescript, tdd, vitest]

# Dependency graph
requires:
  - phase: 07-gitops-pr-generation
    provides: CALM parser foundation (parseCalm, types.ts, extractor)
provides:
  - detectCalmVersion() — version detection with priority (v1.0 calmSchemaVersion/legacy types, v1.2 adrs/decorators/timelines, v1.1 default)
  - normalizeCalmDocument() — pre-Zod normalization layer (v1.0->v1.1 transform, v1.2 pass-through)
  - ParseSuccess.version field — carries detected version through parse result
  - v1.0 test fixture (examples/api-gateway.calm.v10.json)
affects: [09-02-store-ui, all agents that call parseCalm or access ParseSuccess]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pre-Zod normalization: detectCalmVersion + normalizeCalmDocument before safeParse
    - Lenient mapping: unknown node types default to 'service'; unknown rel types default to 'connects'
    - Reference pass-through: v1.1/v1.2 return same object reference (no copy overhead)

key-files:
  created:
    - src/lib/calm/normalizer.ts
    - src/__tests__/calm/normalizer.test.ts
    - examples/api-gateway.calm.v10.json
  modified:
    - src/lib/calm/types.ts
    - src/lib/calm/parser.ts
    - src/lib/calm/index.ts
    - src/__tests__/calm/parser.test.ts

key-decisions:
  - "Pre-Zod normalization pattern: transform raw JSON before Zod sees it — clean separation of version handling from schema validation"
  - "Lenient mode: unknown v1.0 node types fallback to 'service'; unknown relationship types fallback to 'connects'"
  - "v1.1/v1.2 pass-through: returns same object reference unchanged — zero overhead for modern documents"
  - "v1.2 fields (adrs, decorators, timelines) typed as unknown/optional in Zod schema — preserved without strict typing"
  - "CalmVersion type re-exported from types.ts for downstream consumers who import from calm/index"

patterns-established:
  - "Version detection before Zod: always call detectCalmVersion(json) -> normalizeCalmDocument(json, version) before safeParse"
  - "Cascade detection priority: v1.0 (explicit marker OR legacy types) > v1.2 (extra fields) > v1.1 (default)"

requirements-completed: [CALM-01, CALM-02, CALM-03, CALM-04]

# Metrics
duration: 8min
completed: 2026-02-25
---

# Phase 9 Plan 1: CALM Version Normalizer and Parser Extension Summary

**Pre-Zod normalizer with version detection for CALM v1.0/v1.1/v1.2: NODE_TYPE_MAP transforms legacy apigateway/microservice types to service, flat {from,to} relationships to connects structures, and ParseSuccess carries detected CalmVersion**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-25T19:00:00Z
- **Completed:** 2026-02-25T19:08:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- `detectCalmVersion()` with cascading priority: v1.0 (calmSchemaVersion OR legacy node types) → v1.2 (adrs/decorators/timelines) → v1.1 default
- `normalizeCalmDocument()` transforms v1.0 docs to v1.1-compatible shape: maps legacy node types, converts {from,to,type} relationships to connects structure, fills unique-id from name, extracts description from metadata.description
- `ParseSuccess.version` carries detected CalmVersion through parse result; existing ParseSuccess consumers unaffected (TypeScript compatible — additive field only)
- 30 total tests passing: 15 normalizer + 13 parser (6 existing + 7 new) + 2 extractor (no regression)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create version detector and v1.0 normalizer** - `27bf36b` (feat)
2. **Task 2: Extend types.ts and parser.ts for multi-version support** - `28d784f` (feat)

## Files Created/Modified

- `src/lib/calm/normalizer.ts` - CalmVersion type, detectCalmVersion(), normalizeCalmDocument(), normalizeV10() pipeline
- `src/__tests__/calm/normalizer.test.ts` - 15 unit tests covering all detection paths and transformation rules
- `src/lib/calm/types.ts` - Added v1.2 optional fields (adrs, decorators, timelines) and v1.0 legacy top-level fields (calmSchemaVersion, name); re-exported CalmVersion
- `src/lib/calm/parser.ts` - Integrated normalizer pre-Zod; added version to ParseSuccess interface
- `src/lib/calm/index.ts` - Added re-export of normalizer module
- `src/__tests__/calm/parser.test.ts` - Added 7 new multi-version tests (v1.0 parse, v1.2 adrs, version field, parseCalmFromString version, regression)
- `examples/api-gateway.calm.v10.json` - v1.0 test fixture (apigateway + microservice nodes, uses relationship)

## Decisions Made

- **Pre-Zod normalization**: transform raw JSON before Zod sees it — clean separation ensures Zod schema stays v1.1 canonical, v1.0 quirks handled in normalizer layer
- **Lenient mapping**: unknown v1.0 node types fallback to 'service', unknown relationship types fallback to 'connects' — maximizes compatibility with real-world v1.0 documents
- **Pass-through for v1.1/v1.2**: returns same object reference unchanged — zero overhead for modern documents
- **v1.2 fields typed as `z.unknown().optional()`**: preserved without strict Zod typing — future v1.2-aware agents can cast as needed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused fixture variable causing TypeScript strict-mode error**
- **Found during:** Task 1 (after writing tests)
- **Issue:** `minimalV10DocWithLegacyTypes` declared but never used — TypeScript strict mode (TS6133) fails typecheck
- **Fix:** Removed the unused fixture constant from `normalizer.test.ts`
- **Files modified:** `src/__tests__/calm/normalizer.test.ts`
- **Verification:** `pnpm typecheck` passes clean
- **Committed in:** `27bf36b` (part of Task 1 commit after ESLint auto-fix)

---

**Total deviations:** 1 auto-fixed (Rule 1 - unused variable)
**Impact on plan:** Trivial fix. No scope creep.

## Issues Encountered

- GitHub fixture URL (`vishnurevi/calm-usecases/api-gateway-customer-service.json`) returned a schema template (TypeScript-like pseudocode) rather than actual JSON instance. Created equivalent fixture manually based on the schema structure shown.

## Next Phase Readiness

- Parser layer complete: `parseCalm()` accepts v1.0, v1.1, v1.2 documents and returns `version` field
- Ready for Phase 9 Plan 2: Zustand store update to carry `version` field and UI version badge display
- No blockers

## Self-Check: PASSED

- FOUND: `src/lib/calm/normalizer.ts`
- FOUND: `src/__tests__/calm/normalizer.test.ts`
- FOUND: `examples/api-gateway.calm.v10.json`
- FOUND: `.planning/phases/09-multi-version-calm/09-01-SUMMARY.md`
- FOUND: commit `27bf36b` (feat: normalizer)
- FOUND: commit `28d784f` (feat: types+parser multi-version)
- Tests: 30 passed, 0 failed

---
*Phase: 09-multi-version-calm*
*Completed: 2026-02-25*
