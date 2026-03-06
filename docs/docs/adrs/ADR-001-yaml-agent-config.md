<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 FINOS -->

# ADR-001: YAML Files for Agent Configuration

**Status:** Accepted
**Date:** 2026-02-24
**Deciders:** OpsFlow LLC (DTCC/FINOS Hackathon team)

## Context

CALMGuard agents need configurable properties: name, display name, description, skill file references, and model parameters. These properties needed to be modifiable without TypeScript recompilation, and readable by non-engineers adding new compliance frameworks.

Options considered:
- **A) Hardcoded TypeScript constants** — type-safe but requires recompile; not extensible
- **B) JSON files** — parseable but no comments, no multi-line strings for prompts
- **C) YAML files** — human-readable, supports comments and multi-line strings, widely used in DevOps tooling

## Decision

Use YAML files in the `agents/` directory, one file per agent. Files are loaded at runtime by `src/lib/agents/registry.ts` using the `yaml` npm package (already a dependency for CALM document parsing).

## Consequences

**Good:**
- Non-engineers can add or modify agents without touching TypeScript
- YAML aligns with FINOS CALM's own YAML-first approach to architecture definitions
- Comments in YAML allow inline documentation of agent purpose
- No additional runtime dependency — `yaml` package was already required

**Neutral:**
- No compile-time type safety at config load time. Mitigated by Zod validation in `registry.ts` which throws on malformed config at startup.

**Bad:**
- YAML indentation errors fail at runtime, not build time. Acceptable given the small number of agent files (7 at time of writing).
