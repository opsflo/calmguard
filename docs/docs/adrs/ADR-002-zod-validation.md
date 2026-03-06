<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 FINOS -->

# ADR-002: Zod for Runtime Validation

**Status:** Accepted
**Date:** 2026-02-24
**Deciders:** OpsFlow LLC (DTCC/FINOS Hackathon team)

## Context

CALMGuard processes external data in three places where runtime validation is critical:
1. **CALM document input** — user-uploaded JSON of unknown shape
2. **LLM agent output** — structured JSON from Gemini/Anthropic/OpenAI that may deviate from expected schema
3. **API request bodies** — JSON from client-side fetch calls

TypeScript types provide compile-time safety but are erased at runtime. A solution for runtime validation was needed.

Options considered:
- **A) TypeScript-only types** — no runtime safety; LLM output shape errors silently propagate
- **B) Custom validation functions** — verbose, error-prone, not composable
- **C) Zod** — runtime schema with TypeScript type inference; integrates natively with Vercel AI SDK `generateObject`
- **D) io-ts** — functional approach, steeper learning curve, less ecosystem adoption

## Decision

Use Zod for all external data: CALM parsing, LLM output schemas (passed to `generateObject`), and API request body schemas. Zod schemas serve as the single source of truth for both TypeScript types and runtime validation.

## Consequences

**Good:**
- `z.infer<typeof schema>` eliminates duplicate type definitions
- Vercel AI SDK `generateObject` requires a Zod schema — no impedance mismatch
- Zod parse errors include field-level detail, making debugging LLM output issues straightforward
- Industry standard in the Next.js/TypeScript ecosystem; reviewers will recognize it

**Neutral:**
- Bundle size impact (~8KB gzipped). Acceptable for a server-rendered Next.js app where Zod runs server-side.

**Bad:**
- None identified. No superior alternative exists for this use case.
