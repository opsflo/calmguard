<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright 2026 FINOS -->

# ADR-005: Multi-Provider LLM Registry

**Status:** Accepted
**Date:** 2026-02-24
**Deciders:** OpsFlow LLC (DTCC/FINOS Hackathon team)

## Context

CALMGuard uses LLMs for all 4 compliance agents. The choice of LLM provider affects cost, latency, output quality, and vendor lock-in. Financial services organizations (like DTCC) have specific vendor approval processes that may require flexibility.

Options considered:
- **A) Single provider (Gemini only)** — simplest; creates hard dependency on Google
- **B) Multi-provider with manual switching** — flexible but operational burden
- **C) Multi-provider via Vercel AI SDK** — unified API across providers; provider swapped via config

## Decision

Use Vercel AI SDK with a multi-provider registry in `src/lib/ai/provider-registry.ts`. Supported providers: Google Gemini (default), Anthropic Claude, OpenAI GPT, xAI Grok. Provider selection is controlled by the `AI_PROVIDER` environment variable (or defaults to Gemini).

All agent calls go through the shared provider registry — no provider SDK is imported directly in agent files.

## Consequences

**Good:**
- Financial services customers can swap to their approved LLM vendor without code changes
- Vercel AI SDK abstracts `generateObject` across all providers — no agent rewrite needed per provider
- Gemini 2.0 Flash is the fastest/cheapest option for hackathon demo; Claude Opus available for higher-quality output
- Reduces vendor lock-in risk — a key concern for FINOS open-source adoption

**Neutral:**
- 4 provider packages in production dependencies (adds ~200KB to bundle). All are optional — only the active provider's API key is required.

**Bad:**
- Provider-specific model capabilities differ (context windows, structured output reliability). Each provider requires validation testing when switching. Not yet automated.
