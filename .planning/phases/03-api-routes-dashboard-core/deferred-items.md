# Deferred Items — Phase 03

## Pre-existing Build Error (pnpm build)

**Confirmed:** `pnpm build` fails on ANY commit in this branch — pre-existing from Phase 2.

**Error:**
```
Error: No LLM provider API keys configured. Set at least one of: GOOGLE_GENERATIVE_AI_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, XAI_API_KEY
```

**Root cause:** `src/lib/ai/provider.ts` throws at module initialization if no API keys are set. Next.js `pnpm build` runs module-level code at build time ("collecting page data"), which triggers this throw.

**Impact:** `pnpm build` fails but `pnpm typecheck` (`tsc --noEmit`) passes.

**Fix:** Set at least one LLM provider API key as an environment variable before running `pnpm build`. Alternatively, make the provider validation lazy (deferred to first call). The current "fail-fast" approach was a deliberate Phase 2 architectural decision.

**Priority:** Fix before Vercel deployment by setting `GOOGLE_GENERATIVE_AI_API_KEY` in environment. Not blocking development (dev server works with env vars).

**Verification method:** Use `pnpm typecheck` for TypeScript correctness in all plans. The `pnpm build` target requires API keys.
