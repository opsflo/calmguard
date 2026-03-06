<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 FINOS -->

# ADR-003: localStorage for the Compliance Learning Store

**Status:** Accepted (Hackathon scope); PostgreSQL migration path documented
**Date:** 2026-02-25
**Deciders:** OpsFlow LLC (DTCC/FINOS Hackathon team)

## Context

CALMGuard's Learning Engine (Oracle) extracts compliance patterns from agent analysis results and promotes high-confidence patterns to deterministic pre-check rules. This learned state must persist across browser sessions without requiring a backend database setup for the hackathon demo.

Options considered:
- **A) In-memory only** — state lost on page refresh; unusable for multi-session learning
- **B) localStorage** — browser-native persistence, zero infrastructure, instant for demo
- **C) PostgreSQL (via Prisma)** — correct for production; adds infra dependency, outside hackathon scope
- **D) SQLite (via better-sqlite3)** — server-side persistence; requires persistent server (not compatible with Vercel serverless)

## Decision

Use `localStorage` via the Zustand persist middleware (`zustand/middleware`). The learning store is client-side only and serializes pattern data as JSON.

## Consequences

**Good:**
- Zero infrastructure: demo runs with just `pnpm dev` and an API key
- Zustand persist middleware handles serialization/deserialization automatically
- Data survives page refreshes, which is sufficient for the hackathon demo scenario

**Neutral:**
- Storage is browser-local (not shared across users or devices). Acceptable for single-user demo.
- ~5KB typical storage footprint for 50 patterns

**Bad:**
- Not suitable for production multi-user deployment. Migration path to PostgreSQL:
  1. Move `useLearningStore` writes to a server action or API route
  2. Add a `patterns` table in Prisma schema (id, framework, pattern, confidence, observationCount, promotedToRule)
  3. Replace `localStorage` persistence with server-side reads on component mount
  4. Add user/org scoping to the schema for multi-tenancy

**PostgreSQL migration effort estimate:** 2-3 days for a single developer including tests.
