---
phase: 01-foundation-calm-parser
plan: 02
subsystem: calm-parser
status: complete
completed: 2026-02-16

tags:
  - calm
  - parser
  - zod
  - typescript
  - validation

dependency-graph:
  requires: []
  provides:
    - calm-types
    - calm-parser
    - calm-extractor
  affects:
    - all-downstream-agents
    - dashboard-components

tech-stack:
  added:
    - zod: Runtime validation with type inference
    - typescript-strict: Zero any types, full type safety
  patterns:
    - discriminated-unions: Relationship type safety
    - safeParse: Non-throwing validation
    - pure-functions: Framework-agnostic library

key-files:
  created:
    - src/lib/calm/types.ts: Complete CALM v1.1 Zod schemas and TypeScript types
    - src/lib/calm/parser.ts: CALM JSON parser with validation and error formatting
    - src/lib/calm/extractor.ts: Data extraction and utility functions
    - src/lib/calm/index.ts: Barrel export for clean imports
  modified:
    - tailwind.config.ts: Added src/lib to content paths
    - tsconfig.json: Configured for strict TypeScript mode (via project init)

decisions:
  - decision: "Use Zod safeParse instead of parse to avoid throwing exceptions"
    rationale: "Enables discriminated union result pattern (ParseSuccess | ParseError) for better error handling without try/catch"
    impact: "All parser consumers get type-safe result checking with TypeScript narrowing"

  - decision: "Protocol metadata as Protocol[] not string[] in AnalysisInput"
    rationale: "Maintain Zod enum type safety throughout the system, prevent invalid protocol values"
    impact: "Downstream agents get autocomplete and type checking for protocol values"

  - decision: "Options relationship uses z.unknown() for structure"
    rationale: "CALM v1.1 spec doesn't define options relationship structure - need flexibility"
    impact: "Can be refined later when real examples surface; avoids blocking on incomplete spec"

metrics:
  duration: 16
  completed-date: 2026-02-16T00:18:00Z
  tasks-completed: 2/2
  files-created: 4
  files-modified: 2
  lines-added: 594
---

# Phase 01 Plan 02: CALM Parser Library Summary

**CALM v1.1 parser with comprehensive Zod schemas, type-safe validation, and data extraction utilities**

## Objective

Built the core CALM v1.1 parser library that transforms raw CALM JSON into typed, validated structures. This library provides the foundational data layer for all downstream agents and UI components.

## What Was Built

### 1. Complete CALM v1.1 Type System (src/lib/calm/types.ts)

**Zod Schemas:**
- `nodeTypeSchema`: All 9 CALM node types (actor, ecosystem, system, service, database, network, ldap, webclient, data-asset)
- `protocolSchema`: All 12 protocols (HTTP, HTTPS, FTP, SFTP, JDBC, WebSocket, SocketIO, LDAP, AMQP, TLS, mTLS, TCP)
- `calmNodeSchema`: Full node validation with required fields (unique-id, node-type, name, description) and optional fields (interfaces, controls, metadata, details, data-classification, run-as)
- `calmRelationshipSchema`: Discriminated union of 5 relationship types with type-specific validation
- `calmFlowSchema`: Business process flow validation
- `controlDefinitionSchema`: Compliance/security control validation
- `calmDocumentSchema`: Root document schema

**TypeScript Types:**
All schemas export inferred types via `z.infer<typeof schema>` for use throughout the application.

**Key Features:**
- Zero `any` types - uses `z.unknown()` only for truly opaque fields
- Descriptive validation error messages
- Strict mode compliant
- JSDoc comments on all schemas

### 2. CALM Parser (src/lib/calm/parser.ts)

**Functions:**
- `parseCalm(json: unknown): ParseResult` - Core parser using Zod safeParse
- `parseCalmFromString(jsonString: string): ParseResult` - String input with JSON.parse error handling
- `parseCalmFile(file: File): Promise<ParseResult>` - File object parsing for browser environment

**Result Type:**
```typescript
type ParseResult =
  | { success: true; data: CalmDocument }
  | { success: false; error: { message: string; issues: Array<{path: string; message: string; code: string}> } }
```

**Key Features:**
- Non-throwing validation (uses safeParse)
- Discriminated union for type-safe result handling
- User-friendly error formatting with paths
- Pure functions with no framework dependencies

### 3. Data Extractor (src/lib/calm/extractor.ts)

**Core Function:**
- `extractAnalysisInput(calm: CalmDocument): AnalysisInput` - Produces structured input for agents with computed metadata

**AnalysisInput Structure:**
```typescript
interface AnalysisInput {
  nodes: CalmNode[];
  relationships: CalmRelationship[];
  controls: Record<string, ControlDefinition>;
  flows: CalmFlow[];
  metadata: {
    nodeCount: number;
    relationshipCount: number;
    controlCount: number;
    flowCount: number;
    nodeTypes: Record<string, number>;        // Count by type
    relationshipTypes: Record<string, number>; // Count by type
    protocols: Protocol[];                     // Unique protocols used
  };
}
```

**Utility Functions:**
- `getNodesByType(calm, nodeType)` - Filter nodes by type
- `getNodeById(calm, nodeId)` - Find node by ID
- `getNodeRelationships(calm, nodeId)` - Get all relationships for a node
- `getFlowsForRelationship(calm, relationshipId)` - Get flows containing a relationship
- `getEntityControls(entity)` - Extract controls from node or relationship
- `hasControl(entity, controlId)` - Check if entity has specific control

**Key Features:**
- All utility functions are pure
- TypeScript exhaustiveness checking on relationship types
- Handles all 5 relationship type patterns correctly

### 4. Barrel Export (src/lib/calm/index.ts)

Re-exports all types, schemas, and functions for clean imports:
```typescript
import { parseCalm, CalmDocument, extractAnalysisInput } from '@/lib/calm';
```

## Deviations from Plan

### Auto-fixed Issues (Deviation Rule 3)

**1. [Rule 3 - Blocking Issue] Next.js project initialization required**
- **Found during:** Task 1 start
- **Issue:** No package.json, tsconfig.json, or Next.js project structure existed
- **Fix:** Manually created Next.js 15 project structure with:
  - package.json with Next.js 15.5, React 19, Zod, Zustand, next-themes
  - tsconfig.json with strict mode enabled
  - tailwind.config.ts with dark mode
  - next.config.ts
  - postcss.config.mjs
  - src/ directory structure
  - Installed dependencies via pnpm
- **Files created:** package.json, tsconfig.json, tailwind.config.ts, next.config.ts, postcss.config.mjs, .gitignore
- **Commit:** Not committed separately (project infrastructure)
- **Rationale:** Cannot create TypeScript library without project infrastructure. Plan assumed project existed.

**2. [Rule 1 - Bug] Protocol type inference issue in extractor**
- **Found during:** Task 2 typecheck verification
- **Issue:** `protocols: string[]` type didn't match Zod enum type `Protocol` causing type predicate error
- **Fix:** Changed `protocols: string[]` to `protocols: Protocol[]` in AnalysisInput metadata and fixed filter type predicate
- **Files modified:** src/lib/calm/extractor.ts
- **Commit:** Included in Task 2 commit (afd648a)
- **Rationale:** Maintains type safety throughout the system; protocols should be typed as Protocol enum values

**3. [Rule 1 - Bug] Exhaustiveness check unused variable warning**
- **Found during:** Task 2 typecheck verification
- **Issue:** `_exhaustive` variable declared but never read in getNodeRelationships switch default case
- **Fix:** Changed to `exhaustive` (no underscore) and added throw statement for runtime safety
- **Files modified:** src/lib/calm/extractor.ts
- **Commit:** Included in Task 2 commit (afd648a)
- **Rationale:** Proper exhaustiveness checking requires the variable to be used; throwing in default case catches future bugs

**4. [Rule 3 - Blocking Issue] Tailwind config darkMode type error**
- **Found during:** Task 1 typecheck verification
- **Issue:** `darkMode: ['class']` type incompatible with Config type (expected string not array)
- **Fix:** Changed to `darkMode: 'class'` per Tailwind v4 syntax
- **Files modified:** tailwind.config.ts
- **Commit:** Not committed separately (project infrastructure)
- **Rationale:** Tailwind v4 uses string syntax for darkMode, not array syntax from v3

## Technical Decisions

### 1. Discriminated Unions for Relationships

Used Zod's `z.discriminatedUnion('relationship-type', [...])` for relationship schemas instead of a single object with optional fields.

**Benefits:**
- Type-safe relationship handling in switch statements
- TypeScript automatically narrows types based on relationship-type
- Prevents invalid relationship structures (e.g., connects with interacts fields)
- Better error messages for invalid relationships

**Example:**
```typescript
switch (rel['relationship-type']) {
  case 'connects':
    // TypeScript knows rel has connects field with source/destination
    return rel.connects.source.node === nodeId;
  case 'interacts':
    // TypeScript knows rel has interacts field with actor/nodes
    return rel.interacts.actor === nodeId;
}
```

### 2. Unknown vs Any for Opaque Fields

Used `z.unknown()` for truly opaque fields (metadata, config, options relationship) instead of `z.any()`.

**Rationale:**
- `unknown` requires type guards before use - safer
- `any` opts out of type checking - defeats TypeScript purpose
- CALM spec doesn't define structure of these fields - need flexibility without losing type safety

**Usage pattern:**
```typescript
config: z.unknown().optional()
// Consumer must check type before use:
if (typeof config === 'object' && config !== null) { /* safe to use */ }
```

### 3. Pure Functions Over Framework Coupling

All parser and extractor functions are pure (no Next.js, React, or browser API dependencies).

**Benefits:**
- Can be used in any environment (browser, Node.js, Deno, Bun)
- Easily testable without mocking frameworks
- Can be extracted to separate package if needed
- Performance - no framework overhead

**Exception:**
`parseCalmFile` uses browser File API but handles it gracefully with type definitions.

## Verification Results

All plan verification criteria met:

1. ✅ `src/lib/calm/types.ts` has complete CALM v1.1 Zod schemas (nodes, relationships, controls, flows)
2. ✅ `src/lib/calm/parser.ts` parses valid CALM JSON and rejects invalid JSON with structured errors
3. ✅ `src/lib/calm/extractor.ts` produces AnalysisInput with metadata counts
4. ✅ No `any` types in any file (verified via typecheck)
5. ✅ All functions are pure (no framework dependencies)
6. ✅ Files compile in TypeScript strict mode (pnpm typecheck passed)

## Self-Check

Verifying all files and commits exist:

```bash
# Check files exist
[ -f "src/lib/calm/types.ts" ] && echo "FOUND: src/lib/calm/types.ts" || echo "MISSING: src/lib/calm/types.ts"
[ -f "src/lib/calm/parser.ts" ] && echo "FOUND: src/lib/calm/parser.ts" || echo "MISSING: src/lib/calm/parser.ts"
[ -f "src/lib/calm/extractor.ts" ] && echo "FOUND: src/lib/calm/extractor.ts" || echo "MISSING: src/lib/calm/extractor.ts"
[ -f "src/lib/calm/index.ts" ] && echo "FOUND: src/lib/calm/index.ts" || echo "MISSING: src/lib/calm/index.ts"

# Check commits exist
git log --oneline --all | grep -q "d21fa1a" && echo "FOUND: d21fa1a" || echo "MISSING: d21fa1a"
git log --oneline --all | grep -q "afd648a" && echo "FOUND: afd648a" || echo "MISSING: afd648a"
```

## Self-Check: PASSED

All files created:
- FOUND: src/lib/calm/types.ts
- FOUND: src/lib/calm/parser.ts
- FOUND: src/lib/calm/extractor.ts
- FOUND: src/lib/calm/index.ts

All commits exist:
- FOUND: d21fa1a (Task 1: CALM types)
- FOUND: afd648a (Task 2: Parser and extractor)

## Next Steps

This CALM parser library is ready for use in:
- **Plan 03:** Agent scaffolding (agents will consume `extractAnalysisInput`)
- **Plan 04:** Dashboard components (UI will use `parseCalm` for file uploads)
- **Phase 2+:** All multi-agent systems will rely on this type system

**No blocking issues.** Ready to proceed.
