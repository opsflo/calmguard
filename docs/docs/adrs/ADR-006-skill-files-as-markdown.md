<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 FINOS -->

# ADR-006: Compliance Skill Files as Markdown

**Status:** Accepted
**Date:** 2026-02-25
**Deciders:** OpsFlow LLC (DTCC/FINOS Hackathon team)

## Context

CALMGuard agents need grounded compliance knowledge: specific control IDs (e.g., PCI-DSS Req 4.2.1, NIST CSF PR.DS-01), CALM field mappings, and protocol upgrade rationale. This knowledge must be injected into agent prompts without hallucination.

Options considered:
- **A) Hardcoded TypeScript strings** — type-safe but requires recompile; non-engineers cannot update
- **B) Structured JSON/YAML** — machine-readable but poor for human authoring of multi-paragraph compliance rationale
- **C) Markdown files** — human-readable, supports tables (for control ID matrices), requires no compilation

## Decision

Use Markdown files in the `skills/` directory. Each file covers one compliance framework (e.g., `skills/PCI-DSS.md`, `skills/SOC2.md`). Files are loaded at runtime by `src/lib/skills/loader.ts` and injected verbatim into agent system prompts.

Control ID tables use `CITE EXACTLY AS SHOWN` instructions to prevent LLM hallucination of non-existent IDs.

## Consequences

**Good:**
- Compliance officers and domain experts can edit skill files without TypeScript knowledge
- Markdown tables are the natural format for control ID matrices (framework x CALM field)
- Skill content is source-controlled and reviewable in GitHub PRs
- Aligns with how FINOS CALM itself uses human-readable architecture definitions

**Neutral:**
- No runtime type-checking of skill content. Mitigated by the `CITE EXACTLY AS SHOWN` enforcement pattern in prompts.

**Bad:**
- Large skill files increase prompt token cost. Current files average ~400 tokens each — acceptable for Gemini 2.0's 1M context window.
