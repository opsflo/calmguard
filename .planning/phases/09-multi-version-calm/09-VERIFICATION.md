---
phase: 09-multi-version-calm
verified: 2026-02-25T20:00:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
---

# Phase 9: Multi-Version CALM Support — Verification Report

**Phase Goal:** Users can analyze CALM architecture files from any stable version (1.0, 1.1, 1.2) without parser failures
**Verified:** 2026-02-25T20:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | v1.0 documents parse successfully — `parseCalm()` on a v1.0 doc with `apigateway`/`microservice`/`uses` types returns `{ success: true, version: '1.0' }` | VERIFIED | `parser.test.ts` lines 136-143 tests this exact case; test passes (13/13 green) |
| 2 | v1.1 documents parse identically — existing tests pass with no regressions | VERIFIED | All 6 original `parseCalm` / `parseCalmFromString` tests still pass; regression test line 128-134 explicitly asserts `version: '1.1'` |
| 3 | v1.2 documents parse with `adrs`, `decorators`, `timelines` preserved | VERIFIED | `parser.test.ts` lines 163-177 parse v12Doc and assert `result.data.adrs` exists; `calmDocumentSchema` in `types.ts` accepts these as optional fields |
| 4 | Version detection returns correct label — `detectCalmVersion()` returns '1.0'/'1.1'/'1.2'; `ParseSuccess.version` carries value | VERIFIED | 15/15 normalizer tests pass; `ParseSuccess` interface in `parser.ts` line 11 has `version: CalmVersion` field |
| 5 | Store carries version — `useAnalysisStore().calmVersion` populated after any parse path | VERIFIED | `analysis-store.ts` line 17 declares `calmVersion: CalmVersion \| null`; `setCalmData` line 103 sets it from optional `version` param |
| 6 | All call sites updated — `setCalmData` called with version in all 6+ locations | VERIFIED | `header.tsx` line 46, `calm-upload-zone.tsx` line 88, `architecture-selector.tsx` line 71, `github-input.tsx` line 105, `page.tsx` line 46 all pass `result.version` or `data.version` |
| 7 | Dashboard displays version badge — "CALM v{version}" badge visible after successful parse | VERIFIED | `header.tsx` lines 104-111 render `<Badge>CALM v{calmVersion}</Badge>` conditionally when `calmVersion` is non-null |
| 8 | v1.0 demo selectable — API Gateway v1.0 appears in demo dropdown and parses successfully | VERIFIED | `examples/index.ts` lines 29-34 add `api-gateway-v10` entry importing `api-gateway.calm.v10.json`; fixture has `calmSchemaVersion: '1.0'` with legacy types |
| 9 | API routes return version — `fetch-calm` and `calm/parse` responses include `version` field | VERIFIED | `fetch-calm/route.ts` line 167 `version: calmResult.version`; `calm/parse/route.ts` line 53 `version: parseResult.version` |
| 10 | No agent code changes — zero files modified in `src/lib/agents/`, `agents/`, or `skills/` | VERIFIED | Git log for commits 27bf36b, 28d784f, 7174ad8, c38dcc3 shows no agent directory files; grep of agent imports returns 0 new files |

**Score:** 10/10 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/calm/normalizer.ts` | CalmVersion type, `detectCalmVersion()`, `normalizeCalmDocument()`, v1.0 transform pipeline | VERIFIED | 271-line file with full implementation — NODE_TYPE_MAP, RELATIONSHIP_TYPE_MAP, `normalizeV10Node`, `normalizeV10Relationship`, `normalizeV10`, exported functions |
| `src/__tests__/calm/normalizer.test.ts` | 15 unit tests for all detection paths and transformations | VERIFIED | 186-line file; 15 passing tests (6 `detectCalmVersion` + 9 `normalizeCalmDocument`); all pass |
| `examples/api-gateway.calm.v10.json` | v1.0 fixture with `calmSchemaVersion`, `apigateway`, `microservice`, `uses` types | VERIFIED | 27-line file with exact v1.0 structure matching plan spec |
| `src/lib/calm/types.ts` | v1.2 optional fields (`adrs`, `decorators`, `timelines`), v1.0 legacy fields (`calmSchemaVersion`, `name`), `CalmVersion` re-export | VERIFIED | Lines 13, 241-247 in `calmDocumentSchema` include all required additions |
| `src/lib/calm/parser.ts` | `parseCalm()` calls normalizer pre-Zod; `ParseSuccess.version` field | VERIFIED | Lines 65-66 call `detectCalmVersion` + `normalizeCalmDocument`; `ParseSuccess` interface line 11 has `version: CalmVersion` |
| `src/lib/calm/index.ts` | Re-exports normalizer module | VERIFIED | Line 15 `export * from './normalizer'` |
| `src/__tests__/calm/parser.test.ts` | 7 new multi-version tests + all 6 original tests passing | VERIFIED | 187-line file; 13 total tests, all pass |
| `src/store/analysis-store.ts` | `calmVersion: CalmVersion \| null` field; `setCalmData(data, input, version?)` signature | VERIFIED | Line 17 and line 44 match exactly; `setCalmData` implementation lines 103-110 set `calmVersion: version ?? null` |
| `src/components/dashboard/header.tsx` | `calmVersion` selector from store; `<Badge>CALM v{calmVersion}</Badge>` in JSX | VERIFIED | Line 21 selector; lines 104-111 conditional badge render |
| `src/components/calm/calm-upload-zone.tsx` | `setCalmData(localResult.data, input, localResult.version)` at success | VERIFIED | Line 88 passes `localResult.version` |
| `src/components/calm/architecture-selector.tsx` | `setCalmData(result.data, analysisInput, result.version)` | VERIFIED | Line 71 passes `result.version` |
| `src/components/calm/github-input.tsx` | `CalmVersion` import; `setCalmData(successData.calm, successData.analysisInput, successData.version as CalmVersion)` | VERIFIED | Line 13 import; line 105 call with cast |
| `src/app/page.tsx` | `CalmVersion` import; `setCalmData(data.calm, data.analysisInput, data.version as CalmVersion)` | VERIFIED | Line 14 import; line 46 call with cast |
| `src/app/api/github/fetch-calm/route.ts` | `version: calmResult.version` in response JSON | VERIFIED | Line 167 in response object |
| `src/app/api/calm/parse/route.ts` | `version: parseResult.version` in response JSON | VERIFIED | Line 53 in `Response.json()` call |
| `examples/index.ts` | `api-gateway-v10` entry with `api-gateway.calm.v10.json` import | VERIFIED | Lines 3, 29-34 add third demo entry |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `parseCalm()` | `detectCalmVersion()` | Direct call line 65 in parser.ts | WIRED | Called before `calmDocumentSchema.safeParse()` — pre-Zod normalization pattern confirmed |
| `parseCalm()` | `normalizeCalmDocument()` | Direct call line 66 in parser.ts | WIRED | Receives raw JSON and detected version; result fed to Zod |
| `ParseSuccess.version` | `useAnalysisStore.calmVersion` | `setCalmData(data, input, version)` signature | WIRED | All 5 component call sites pass `result.version` through; store action persists it |
| `store.calmVersion` | Dashboard `<Badge>` | `useAnalysisStore((state) => state.calmVersion)` in `header.tsx` line 21 | WIRED | Badge rendered at lines 104-111; conditional on `calmVersion` being non-null |
| `fetch-calm/route.ts` | `github-input.tsx` setCalmData | `FetchCalmResponse.version?` field + cast | WIRED | Route returns `version: calmResult.version`; client reads `successData.version as CalmVersion` |
| `api-gateway.calm.v10.json` | Demo selector | `examples/index.ts` `DEMO_ARCHITECTURES` array | WIRED | File imported at line 3; entry at lines 29-34; `ArchitectureSelector` and `Header` both consume `DEMO_ARCHITECTURES` |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CALM-01 | 09-01, 09-02 | Parser accepts valid CALM v1.0 documents | SATISFIED | `normalizer.ts` maps legacy node types + relationships; `parser.test.ts` lines 136-161 verify v1.0 parsing; v1.0 demo file added to selector |
| CALM-02 | 09-01, 09-02 | Parser accepts valid CALM v1.1 documents (no regression) | SATISFIED | All 6 original parser tests still pass; `normalizeCalmDocument('1.1')` is a pass-through (same object reference) |
| CALM-03 | 09-01, 09-02 | Parser accepts valid CALM v1.2 documents with optional decorators, timelines, ADRs | SATISFIED | `calmDocumentSchema` adds `adrs`, `decorators`, `timelines` as optional fields; `parser.test.ts` lines 163-177 assert `adrs` preserved |
| CALM-04 | 09-01, 09-02 | Version detection reports which CALM version a document conforms to | SATISFIED | `detectCalmVersion()` returns '1.0'/'1.1'/'1.2'; `ParseSuccess.version` carries value; store exposes `calmVersion`; dashboard badge displays it |

No orphaned requirements — all 4 CALM requirements declared in REQUIREMENTS.md are accounted for and marked Complete.

---

### Anti-Patterns Found

No anti-patterns detected.

Checked files: `normalizer.ts`, `parser.ts`, `types.ts`, `analysis-store.ts`, `header.tsx`, `calm-upload-zone.tsx`, `architecture-selector.tsx`, `github-input.tsx`, `page.tsx`, `fetch-calm/route.ts`, `calm/parse/route.ts`, `examples/index.ts`

- No TODO/FIXME/PLACEHOLDER comments in implementation files
- No stub return patterns (`return null`, `return {}`, `return []`)
- No empty handlers or console-log-only implementations
- No agent directory files touched (verified via git log)
- v1.0/v1.2 type casts in `github-input.tsx` and `page.tsx` use `as CalmVersion | undefined` — appropriate since API JSON is a string boundary; not a type-safety anti-pattern

---

### Human Verification Required

#### 1. Version badge visual confirmation

**Test:** Start the dev server. Open the landing page. From the "Select Demo Architecture" dropdown in the header, select "API Gateway (CALM v1.0)".
**Expected:** A badge labeled "CALM v1.0" appears in the header next to "Parsed: 2 nodes, 1 relationships". Badge uses neutral slate styling (no amber/warning color).
**Why human:** Badge rendering depends on runtime Zustand state and React rendering — cannot be verified programmatically without a browser.

#### 2. v1.1 demo no-badge-regression

**Test:** Select "Trading Platform" from the header demo dropdown.
**Expected:** A badge labeled "CALM v1.1" appears. Existing parse count badge also appears. No visual warnings or error states.
**Why human:** Confirms CALM-02 regression visually. Automated tests cover the logic; UI rendering requires browser.

#### 3. File upload version detection

**Test:** Drag-and-drop `examples/api-gateway.calm.v10.json` onto the upload zone on the landing page.
**Expected:** Upload succeeds, status shows "Ready for analysis". Navigate to dashboard — "CALM v1.0" badge appears in header.
**Why human:** Drag-and-drop file path through `parseCalmFile()` → `parseCalmFromString()` → `parseCalm()` → store; requires browser interaction to exercise the full path.

---

### Gaps Summary

No gaps. All 10 observable truths verified. All 16 artifact checks pass at all three levels (exists, substantive, wired). All 4 requirement IDs satisfied with implementation evidence.

The pre-Zod normalization architecture is clean: `detectCalmVersion` → `normalizeCalmDocument` → `calmDocumentSchema.safeParse` is a clear separation of concerns with zero leakage of version-handling complexity into the Zod schema. The `setCalmData` optional `version` parameter ensures backward compatibility with any call sites not yet updated, while all 5 active call sites pass the version.

---

_Verified: 2026-02-25T20:00:00Z_
_Verifier: Claude (gsd-verifier)_
