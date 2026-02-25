# Phase 9: Multi-Version CALM - Research

**Researched:** 2026-02-25
**Domain:** CALM schema versioning, Zod lenient parsing, TypeScript normalization
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Version Detection**
- Use schema inference — detect version by which fields are present (no user action needed)
- v1.0: has `calmSchemaVersion` field, uses legacy node types (`apigateway`, `microservice`), legacy relationship types (`uses`)
- v1.1: has `description` on flow transitions, standard node-type enum, standard relationship types
- v1.2: has optional `decorators`, `timelines`, `adrs` fields
- If version is ambiguous, default to latest (v1.2) and parse leniently
- Version detection result shown as dashboard badge only (next to "Parsed: N nodes, M relationships")

**Schema Differences Handling**
- Fill missing fields with sensible defaults — if v1.0 lacks a field that v1.1 introduced, use empty string/empty array as default. File parses successfully, agents work with what's available
- Map old types to closest v1.1 equivalents — `apigateway` → `service`, `microservice` → `service`, `uses` → `connects`. Preserves compatibility without changing agent logic
- v1.2 extra fields (decorators, timelines, ADRs): Claude's discretion on whether to preserve or strip

**Version Display**
- Show detected version as a badge next to the parsed info in the top bar: "CALM v1.1" alongside "Parsed: 8 nodes, 6 relationships"
- No special treatment for older versions — just show the version. No warnings, no amber colors, no upgrade nudges

**Backward Compatibility Scope**
- Officially support v1.0, v1.1, v1.2 — all three stable releases
- Lenient validation — accept unknown field values (e.g. `node-type: 'lambda'` maps to `service`). Maximize compatibility over strictness
- Our parser already handles CALM CLI output with lenient aliases — Phase 9 extends that pattern for version differences

### Claude's Discretion

- Whether to preserve or strip v1.2 fields agents don't use yet
- Internal normalization data structure design
- How to handle edge cases not covered by the three version schemas
- Test strategy for version compatibility

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CALM-01 | Parser accepts valid CALM v1.0 documents (no `description` required on flow transitions) | Pre-normalization layer maps v1.0 node/relationship types before Zod validation |
| CALM-02 | Parser accepts valid CALM v1.1 documents (current behavior, no regression) | Existing `calmDocumentSchema` in `types.ts` handles v1.1 — normalization must be transparent and pass-through |
| CALM-03 | Parser accepts valid CALM v1.2 documents with optional decorators, timelines, and ADRs fields | `calmDocumentSchema` extended with optional `adrs`, `decorators`, `timelines` fields using `z.unknown()` or typed schemas |
| CALM-04 | Version detection reports which CALM version a document conforms to | `detectCalmVersion(raw: unknown): CalmVersion` function runs before normalization, returns `'1.0' | '1.1' | '1.2'`; stored in `ParseSuccess.version` |
</phase_requirements>

## Summary

Phase 9 is a parser-layer change only. No agent code changes. The existing `parseCalm()` function in `src/lib/calm/parser.ts` runs Zod validation against `calmDocumentSchema` in `src/lib/calm/types.ts`. The schema is strict about node-types (exact enum) and relationship-types (discriminated union), which causes v1.0 documents to fail on `apigateway`, `microservice` node types, and the `uses` relationship type.

The real-world v1.0 reference file (`api-gateway-customer-service.json`) confirms the differences: no `unique-id` on nodes (uses `name` instead), `type` field instead of `node-type`, `from`/`to`/`type` on relationships instead of structured relationship objects, and a root `calmSchemaVersion` field. CALM v1.2 adds `adrs` (array of strings — external ADR URLs), `decorators`, and `timelines` at the root level, while the nine core node-types and five relationship-types remain identical to v1.1.

The implementation pattern is: (1) detect version from raw JSON characteristics before any Zod validation, (2) normalize raw JSON into v1.1-compatible shape (type alias mappings, field renames, default injection), (3) pass normalized JSON through the existing `calmDocumentSchema` unchanged, (4) carry the detected version through `ParseSuccess`. The store gains a `calmVersion` field; the header badge reads from it. Total surface area: one new `normalizer.ts` file, small additions to `types.ts`, `parser.ts`, `analysis-store.ts`, and `header.tsx`.

**Primary recommendation:** Build a pre-Zod normalization layer (`src/lib/calm/normalizer.ts`) that transforms raw unknown JSON into v1.1-compatible shape, with an explicit version detector as its first step. Keep existing schemas and agents completely unchanged.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | Already installed (`z`) | Schema validation of normalized output | Already used throughout the codebase; `safeParse` gives discriminated union result |
| TypeScript | Strict mode (already configured) | Type-safe normalization logic | Project requirement; all transforms must be fully typed |
| Vitest | `^4.0.18` (already installed) | Unit tests for normalizer and version detector | Already used for all parser/extractor tests |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui `Badge` | Already installed | Display version badge in header | Used for existing "Parsed: N nodes" badge — same component |
| Zustand | Already installed | Persist `calmVersion` in store | Already used for all analysis state |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pre-Zod normalization | Multiple Zod schemas + `.or()` chaining | `.or()` produces terrible error messages; pre-normalization keeps a single ground-truth schema |
| Strict `z.enum(['1.0','1.1','1.2'])` for version | `z.string()` | Enum provides exhaustive switch in TypeScript; pick enum |
| Strip v1.2 extra fields | Preserve as `z.unknown()` | Preserving costs nothing; stripping loses information that might be useful for display |

**Installation:** No new packages needed. All libraries are already installed.

## Architecture Patterns

### Recommended Project Structure

```
src/lib/calm/
├── types.ts           # EXISTING — CalmDocument, CalmNode, etc. — ADD: v1.2 optional fields
├── normalizer.ts      # NEW — detectCalmVersion + normalizeCalmDocument
├── parser.ts          # EXISTING — parseCalm, parseCalmFromString — MODIFY: call normalizer first
├── extractor.ts       # EXISTING — no changes needed
└── index.ts           # EXISTING — re-export normalizer functions

src/__tests__/calm/
├── parser.test.ts     # EXISTING — ADD: v1.0 and v1.2 test cases
└── normalizer.test.ts # NEW — unit tests for detectCalmVersion and normalizeCalmDocument

src/store/
└── analysis-store.ts  # EXISTING — ADD: calmVersion field, setCalmVersion action

src/components/dashboard/
└── header.tsx         # EXISTING — ADD: CALM version badge next to parsed badge
```

### Pattern 1: Pre-Zod Normalization

**What:** Transform raw unknown JSON into a v1.1-compatible shape BEFORE Zod validation runs. The Zod schema never sees raw v1.0/v1.2 fields.

**When to use:** Whenever input can arrive in multiple schema versions that need to converge to one internal representation.

**Example:**

```typescript
// src/lib/calm/normalizer.ts

export type CalmVersion = '1.0' | '1.1' | '1.2';

/**
 * Detect CALM version from raw JSON by field presence (schema inference).
 * Runs BEFORE Zod validation on the raw unknown object.
 */
export function detectCalmVersion(raw: unknown): CalmVersion {
  if (typeof raw !== 'object' || raw === null) return '1.1'; // default

  const obj = raw as Record<string, unknown>;

  // v1.0 fingerprint: has calmSchemaVersion field OR uses legacy node type names
  if (
    typeof obj['calmSchemaVersion'] === 'string' ||
    hasLegacyNodeTypes(obj)
  ) {
    return '1.0';
  }

  // v1.2 fingerprint: has decorators, timelines, or adrs top-level fields
  if ('decorators' in obj || 'timelines' in obj || 'adrs' in obj) {
    return '1.2';
  }

  // Default to v1.1
  return '1.1';
}

/**
 * Normalize raw CALM JSON to v1.1-compatible shape.
 * Returns the input unchanged for v1.1/v1.2 (pass-through for v1.1 regression safety).
 */
export function normalizeCalmDocument(raw: unknown, version: CalmVersion): unknown {
  if (version === '1.1' || version === '1.2') return raw; // no-op for current versions
  if (version === '1.0') return normalizeV10(raw);
  return raw;
}
```

### Pattern 2: V1.0 Node + Relationship Normalization

**What:** Map v1.0 field names and type aliases to v1.1 equivalents. The real-world test case (`api-gateway-customer-service.json`) reveals the concrete differences:

```typescript
// V1.0 → V1.1 node normalization
function normalizeV10Node(rawNode: Record<string, unknown>): Record<string, unknown> {
  return {
    'unique-id': rawNode['unique-id'] ?? rawNode['name'] ?? 'unknown',
    'node-type': mapNodeType(String(rawNode['type'] ?? rawNode['node-type'] ?? 'service')),
    name: rawNode['name'] ?? rawNode['unique-id'] ?? 'Unknown',
    description: rawNode['description'] ??
      (typeof rawNode['metadata'] === 'object' && rawNode['metadata'] !== null
        ? ((rawNode['metadata'] as Record<string, unknown>)['description'] ?? '')
        : ''),
    ...rawNode, // preserve any extra fields
  };
}

// V1.0 type alias map
const NODE_TYPE_MAP: Record<string, string> = {
  'apigateway':   'service',
  'microservice': 'service',
  'api-gateway':  'service',
  'lambda':       'service',
  'queue':        'service',
  'cache':        'database',
  'relational':   'database',
};

function mapNodeType(raw: string): string {
  return NODE_TYPE_MAP[raw.toLowerCase()] ?? raw;
}

// V1.0 → V1.1 relationship normalization
function normalizeV10Relationship(rawRel: Record<string, unknown>, idx: number): Record<string, unknown> {
  if (typeof rawRel['relationship-type'] === 'string') return rawRel; // already v1.1

  // v1.0 uses { from, to, type: 'uses' } or similar
  const relType = String(rawRel['type'] ?? 'connects');
  const mappedType = relType === 'uses' ? 'connects' : relType;

  if (mappedType === 'connects') {
    return {
      'unique-id': rawRel['unique-id'] ?? `rel-${idx}`,
      'relationship-type': 'connects',
      connects: {
        source: { node: rawRel['from'] ?? '' },
        destination: { node: rawRel['to'] ?? '' },
      },
    };
  }

  // Fallback for unknown types — treat as connects
  return {
    'unique-id': rawRel['unique-id'] ?? `rel-${idx}`,
    'relationship-type': 'connects',
    connects: {
      source: { node: rawRel['from'] ?? '' },
      destination: { node: rawRel['to'] ?? '' },
    },
  };
}
```

### Pattern 3: V1.2 Extra Fields — Preserve with `z.unknown()`

**What:** The existing `calmDocumentSchema` does not have `adrs`, `decorators`, or `timelines`. Extend it with optional `z.unknown()` fields so Zod doesn't strip or reject them (Zod strips extra keys by default on `.parse()` but passes them through on `.safeParse()` when using `.passthrough()` or explicit optional fields).

**Example:**

```typescript
// In types.ts — extend calmDocumentSchema
export const calmDocumentSchema = z.object({
  nodes: z.array(calmNodeSchema).min(1, 'Document must have at least one node'),
  relationships: z.array(calmRelationshipSchema),
  controls: z.record(z.string(), controlDefinitionSchema).optional(),
  flows: z.array(calmFlowSchema).optional(),
  // v1.2 additions — preserve without strict typing
  adrs: z.array(z.string()).optional(),
  decorators: z.unknown().optional(),
  timelines: z.unknown().optional(),
  // v1.0 legacy top-level field — accept but ignore
  calmSchemaVersion: z.string().optional(),
  name: z.string().optional(),
});
```

### Pattern 4: Carry Version Through ParseResult

**What:** `ParseSuccess` needs to carry the detected version so the store and UI can display it.

**Example:**

```typescript
// parser.ts — modify ParseSuccess to include version
export interface ParseSuccess {
  success: true;
  data: CalmDocument;
  version: CalmVersion; // NEW
}

// parseCalm updated to call normalizer first
export function parseCalm(json: unknown): ParseResult {
  const version = detectCalmVersion(json);
  const normalized = normalizeCalmDocument(json, version);

  const result = calmDocumentSchema.safeParse(normalized);

  if (result.success) {
    return { success: true, data: result.data, version };
  }

  return { success: false, error: formatZodError(result.error) };
}
```

### Pattern 5: Store + Badge Integration

**What:** Add `calmVersion` to Zustand store; display in header alongside existing badge.

**Example:**

```typescript
// analysis-store.ts additions
interface AnalysisState {
  calmVersion: CalmVersion | null; // NEW
  setCalmData: (data: CalmDocument, input: AnalysisInput, version: CalmVersion) => void; // UPDATED signature
}

// header.tsx — add second badge
{analysisInput && (
  <>
    {calmVersion && (
      <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">
        CALM v{calmVersion}
      </Badge>
    )}
    <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">
      Parsed: {nodeCount} nodes, {relationshipCount} relationships
    </Badge>
  </>
)}
```

### Anti-Patterns to Avoid

- **Multiple Zod schemas with `.or()` chaining:** Produces ambiguous error messages when all schemas fail. Pre-normalization to a single schema is cleaner.
- **Changing `calmDocumentSchema` to use `z.string()` for node-type:** Loses TypeScript enum exhaustiveness in the entire codebase. Use the type-alias map in the normalizer instead.
- **Modifying agent prompts for version awareness:** Phase 9 is explicitly a parser-layer-only change. Agents receive clean v1.1-shaped data regardless of input version.
- **Treating `description` as required on nodes in v1.0:** The real v1.0 test case puts description inside `metadata.description`, not as a top-level field. The normalizer must extract it.
- **Auto-generating `unique-id` from index only:** Use `name` field (always present in v1.0) as the fallback unique-id. This keeps IDs human-readable and stable.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Type alias mapping | Custom versioned schema | Lookup table in normalizer | Simple O(1) map; exhaustive TypeScript union type for completeness |
| Unknown field preservation | Custom JSON merge | `z.object().passthrough()` or explicit optional fields | Zod handles passthrough correctly; don't re-implement |
| Badge display | Custom CSS badge | `shadcn/ui Badge` component | Already used in same component (`header.tsx`) |
| Version-conditional logic in agents | Version checks in 4 agent files | Normalize once in parser layer | Agent transparency is the explicit design goal |

**Key insight:** The normalizer is the only place version awareness lives. Every downstream consumer (agents, extractor, store, UI) gets clean v1.1-shaped data.

## Common Pitfalls

### Pitfall 1: V1.0 Nodes Lack `unique-id`

**What goes wrong:** The real-world v1.0 file (`api-gateway-customer-service.json`) uses `name` as the node identifier. No `unique-id` field exists. Zod validation fails with "Node unique-id is required."

**Why it happens:** v1.0 predates the `unique-id` requirement; `name` served as the identifier in early CALM.

**How to avoid:** In `normalizeV10Node()`, set `'unique-id': rawNode['unique-id'] ?? rawNode['name'] ?? 'unknown'`. If both are missing (malformed v1.0), generate `'node-${index}'`.

**Warning signs:** `ParseError` with `path: 'nodes.0.unique-id'` and `code: 'too_small'` on a v1.0 document.

### Pitfall 2: V1.0 Uses `type` Not `node-type`

**What goes wrong:** v1.0 nodes use `"type": "apigateway"` while v1.1 expects `"node-type": "service"`. Even after mapping the value, the wrong key name causes Zod failure.

**Why it happens:** Field was renamed between v1.0 and v1.1.

**How to avoid:** In normalizer, always emit `'node-type'` key: `'node-type': mapNodeType(rawNode['type'] ?? rawNode['node-type'] ?? 'service')`.

**Warning signs:** `ParseError` with `path: 'nodes.0.node-type'` and `code: 'invalid_type'` — field missing because key was `type` not `node-type`.

### Pitfall 3: V1.0 Relationships Have No Discriminated Structure

**What goes wrong:** v1.0 relationships are `{ from, to, type }` flat objects. Zod's `discriminatedUnion('relationship-type', [...])` fails immediately because the `relationship-type` discriminant key is missing.

**Why it happens:** Discriminated union requires the discriminant key to exist to select the right sub-schema.

**How to avoid:** The v1.0 normalizer must convert ALL relationships to structured v1.1 form before Zod sees them. The discriminated union approach in `types.ts` doesn't need to change.

**Warning signs:** Zod error `code: 'invalid_union_discriminator'` or `code: 'invalid_literal'` on `relationships.0`.

### Pitfall 4: Zod Strips Unknown Keys by Default

**What goes wrong:** v1.2's `adrs`, `decorators`, `timelines` fields get silently stripped by Zod's `.safeParse()` if not declared in the schema. No error — they just vanish from `result.data`.

**Why it happens:** Zod uses "strip" mode by default (not "passthrough"). Only declared fields survive.

**How to avoid:** Add `adrs: z.array(z.string()).optional()`, `decorators: z.unknown().optional()`, `timelines: z.unknown().optional()` to `calmDocumentSchema` in `types.ts`. Also add `calmSchemaVersion: z.string().optional()` and `name: z.string().optional()` to accept v1.0 root-level fields without stripping.

**Warning signs:** `result.data` missing `adrs` after parsing a v1.2 document. No error emitted — silent data loss.

### Pitfall 5: Version Detection Order Matters

**What goes wrong:** A document could have both `calmSchemaVersion` (v1.0 marker) AND `adrs` (v1.2 marker) if someone hand-crafted a hybrid file. Detection must be deterministic.

**Why it happens:** Inference-based detection with no official version declaration creates ambiguity.

**How to avoid:** Apply detection in priority order: v1.0 first (strongest signal = `calmSchemaVersion` field or legacy node types), then v1.2 (has new fields), then default v1.1. The v1.0 check wins because a hand-crafted hybrid is more likely a legacy file with new additions than a true v1.2 file.

**Warning signs:** Non-deterministic version display on the same document across page reloads.

### Pitfall 6: `setCalmData` Signature Change Propagates to Call Sites

**What goes wrong:** `setCalmData(data, input)` is called in `header.tsx` and the landing page CTA. Adding `version` as a third argument breaks both call sites at compile time.

**Why it happens:** TypeScript strict mode — signature mismatch is caught.

**How to avoid:** Update all call sites simultaneously. There are two call sites: `header.tsx` (demo selection) and the file upload handler. Search with `rg "setCalmData"` to find all call sites before modifying the store.

**Warning signs:** TypeScript `Expected 3 arguments, but got 2` error on `pnpm typecheck`.

## Code Examples

Verified patterns from the existing codebase:

### Existing parseCalm pattern (parser.ts)

```typescript
// Current pattern — to be extended with normalizer call
export function parseCalm(json: unknown): ParseResult {
  const result = calmDocumentSchema.safeParse(json);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: formatZodError(result.error) };
}

// Updated pattern for Phase 9
export function parseCalm(json: unknown): ParseResult {
  const version = detectCalmVersion(json);           // step 1: detect
  const normalized = normalizeCalmDocument(json, version); // step 2: normalize
  const result = calmDocumentSchema.safeParse(normalized); // step 3: validate
  if (result.success) {
    return { success: true, data: result.data, version }; // step 4: carry version
  }
  return { success: false, error: formatZodError(result.error) };
}
```

### Existing store setCalmData (analysis-store.ts)

```typescript
// Current
setCalmData: (data, input) =>
  set({ rawCalmData: data, analysisInput: input, status: 'parsed', error: null }),

// Updated for Phase 9
setCalmData: (data, input, version) =>
  set({ rawCalmData: data, analysisInput: input, calmVersion: version, status: 'parsed', error: null }),
```

### Existing header.tsx call site

```typescript
// Current (header.tsx line 44-45)
const input = extractAnalysisInput(result.data);
setCalmData(result.data, input);

// Updated for Phase 9
const input = extractAnalysisInput(result.data);
setCalmData(result.data, input, result.version);
```

### V1.0 test fixture (new, to add to parser.test.ts)

```typescript
// The reference v1.0 document from vishnurevi/calm-usecases
const v10Document = {
  calmSchemaVersion: '1.0',
  name: 'API Gateway to Customer Service',
  nodes: [
    { name: 'API Gateway', type: 'apigateway', metadata: { description: 'Handles API requests' } },
    { name: 'Customer Service', type: 'microservice', metadata: { description: 'Handles customer logic' } },
  ],
  relationships: [
    { from: 'API Gateway', to: 'Customer Service', type: 'uses' },
  ],
};

it('parses a CALM v1.0 document with legacy node types', () => {
  const result = parseCalm(v10Document);
  expect(result.success).toBe(true);
  if (!result.success) throw new Error('Expected success');
  expect(result.version).toBe('1.0');
  expect(result.data.nodes[0]['node-type']).toBe('service'); // apigateway → service
  expect(result.data.relationships[0]['relationship-type']).toBe('connects'); // uses → connects
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single strict Zod schema (`calmDocumentSchema`) | Pre-Zod normalization layer + existing schema | Phase 9 | v1.0 documents parse; existing v1.1 behavior preserved |
| No version tracking | `CalmVersion` type + `ParseSuccess.version` | Phase 9 | UI can display detected version |
| `CALM_SCHEMA_VERSION = '1.1'` constant in types.ts | `CalmVersion = '1.0' | '1.1' | '1.2'` union type | Phase 9 | Replaces hardcoded constant with dynamic detection |

**Current state:** `CALM_SCHEMA_VERSION = '1.1'` is a hardcoded string constant in `types.ts` (line 7). It is not used in any logic — purely a documentation comment. It can be replaced or supplemented by the dynamic `CalmVersion` type without breaking anything.

## Open Questions

1. **Should the v1.0 demo file be added to `DEMO_ARCHITECTURES` in `examples/index.ts`?**
   - What we know: CONTEXT.md says to use the reference file as a real-world v1.0 test case
   - What's unclear: Whether to expose it as a selectable demo in the UI or keep it as a test-only fixture
   - Recommendation: Add it as a third entry in `DEMO_ARCHITECTURES` so the dashboard demonstrably shows v1.0 support (better demo value for the hackathon). Download and save as `examples/api-gateway.calm.v10.json`.

2. **How deeply to type `decorators` and `timelines` in v1.2?**
   - What we know: CONTEXT.md says Claude's discretion. CALM v1.2 release notes describe decorators as "supplementary info without modifying core architecture" and timelines as "moments — time-based architecture snapshots."
   - What's unclear: Whether any hackathon demo files use these fields
   - Recommendation: Use `z.unknown().optional()` for both. No agent uses them; typing them fully costs effort with zero payoff for the hackathon.

3. **V1.0 nodes without `description` at root — use empty string or extract from metadata?**
   - What we know: Real v1.0 test file puts description inside `metadata.description`
   - What's unclear: All v1.0 files do this, or only some?
   - Recommendation: Try extracting from `metadata.description` first; fall back to empty string `''`. This gives agents the best available context without failing validation.

## Sources

### Primary (HIGH confidence)

- Codebase inspection: `src/lib/calm/types.ts` — complete Zod schema for v1.1 (`calmDocumentSchema`, `nodeTypeSchema`, `calmRelationshipSchema`)
- Codebase inspection: `src/lib/calm/parser.ts` — `parseCalm` flow; entry point for normalization layer
- Codebase inspection: `src/store/analysis-store.ts` — `setCalmData` signature; call sites to update
- Codebase inspection: `src/components/dashboard/header.tsx` — badge location, call sites
- Codebase inspection: `vitest.config.mts` + `src/__tests__/calm/parser.test.ts` — test framework and existing patterns
- WebFetch: `https://raw.githubusercontent.com/vishnurevi/calm-usecases/main/api-gateway-customer-service.json` — confirmed v1.0 document structure: `calmSchemaVersion`, `type` (not `node-type`), `from`/`to`/`type` relationships, no `unique-id`
- WebFetch: FINOS CALM v1.2 release notes + `core.json` — confirmed: core node-types identical to v1.1 (9 types), `adrs` is array of strings, `decorators` and `timelines` are supplementary top-level fields

### Secondary (MEDIUM confidence)

- FINOS CALM v1.0 release notes: v1.0 stable introduced `unique-id` as required, `interacts`/`connects`/`deployed-in`/`composed-of` as relationship types — the reference test file predates or ignores this, suggesting it was written with pre-stable v1.0 field names
- CALM v1.2 `core.json` schema: Confirmed `adrs: z.array(z.string())` pattern (external links to ADR documents)

### Tertiary (LOW confidence)

- Assumption: All v1.0 community files follow the same `type` (not `node-type`) and `from`/`to` pattern as the reference file. Only one real file was inspected.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all tools already installed and used in the codebase
- Architecture: HIGH — pre-Zod normalization pattern is well-established; real v1.0 file inspected directly to confirm field names
- Pitfalls: HIGH — most pitfalls derived from direct inspection of the Zod schema and real v1.0 test file, not speculation

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (CALM spec is stable; schema unlikely to change within 30 days)
