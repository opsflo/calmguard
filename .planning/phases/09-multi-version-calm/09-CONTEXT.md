# Phase 9: Multi-Version CALM - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can analyze CALM architecture files from any stable version (1.0, 1.1, 1.2) without parser failures. The parser detects the version, normalizes fields to a common internal representation, and passes clean data to agents. No agent changes needed — this is a parser-layer change transparent to the AI system.

Reference file that currently fails: https://github.com/vishnurevi/calm-usecases/blob/main/api-gateway-customer-service.json (CALM v1.0 with `apigateway`/`microservice` node types and `uses` relationship type).

</domain>

<decisions>
## Implementation Decisions

### Version Detection
- Use **schema inference** — detect version by which fields are present (no user action needed)
- v1.0: has `calmSchemaVersion` field, uses legacy node types (`apigateway`, `microservice`), legacy relationship types (`uses`)
- v1.1: has `description` on flow transitions, standard node-type enum, standard relationship types
- v1.2: has optional `decorators`, `timelines`, `adrs` fields
- If version is ambiguous, **default to latest** (v1.2) and parse leniently
- Version detection result shown as **dashboard badge only** (next to "Parsed: N nodes, M relationships")

### Schema Differences Handling
- **Fill missing fields with sensible defaults** — if v1.0 lacks a field that v1.1 introduced, use empty string/empty array as default. File parses successfully, agents work with what's available
- **Map old types to closest v1.1 equivalents** — `apigateway` → `service`, `microservice` → `service`, `uses` → `connects`. Preserves compatibility without changing agent logic
- v1.2 extra fields (decorators, timelines, ADRs): **Claude's discretion** on whether to preserve or strip — pick what's cleanest architecturally

### Version Display
- Show detected version as a badge **next to the parsed info** in the top bar: "CALM v1.1" alongside "Parsed: 8 nodes, 6 relationships"
- **No special treatment** for older versions — just show the version. No warnings, no amber colors, no upgrade nudges

### Backward Compatibility Scope
- Officially support **v1.0, v1.1, v1.2** — all three stable releases
- **Lenient validation** — accept unknown field values (e.g. `node-type: 'lambda'` maps to `service`). Maximize compatibility over strictness
- Our parser already handles CALM CLI output with lenient aliases — Phase 9 extends that pattern for version differences

### Claude's Discretion
- Whether to preserve or strip v1.2 fields agents don't use yet
- Internal normalization data structure design
- How to handle edge cases not covered by the three version schemas
- Test strategy for version compatibility

</decisions>

<specifics>
## Specific Ideas

- The file at https://github.com/vishnurevi/calm-usecases/blob/main/api-gateway-customer-service.json should be used as a real-world v1.0 test case — it currently fails our parser
- Keep existing v1.1 demo files (payment-gateway, trading-platform) — no need to create v1.2 demo files for the hackathon
- Everything should be documented properly — version support, type mappings, and detection logic

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-multi-version-calm*
*Context gathered: 2026-02-25*
