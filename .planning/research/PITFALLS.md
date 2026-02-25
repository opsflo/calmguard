# Pitfalls Research

**Domain:** Multi-agent AI compliance dashboard with real-time streaming
**Researched:** 2026-02-15 (v1.3 additions: 2026-02-25)
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Multi-Agent Error Cascades

**What goes wrong:**
A single agent failure causes the entire orchestration to fail or produce corrupted output. With 4 agents (Architecture Analyzer, Compliance Mapper, Pipeline Generator, Risk Scorer), a failure in the Architecture Analyzer cascades downstream, causing all subsequent agents to work with flawed context and produce garbage results at higher cost.

**Why it happens:**
Multi-agent LLM systems fail at 41-86.7% rates in production, with nearly 79% of problems originating from specification and coordination issues. Inter-agent misalignment is the single most common failure mode—when one agent misreads a prompt or ignores its brief, downstream agents inherit flawed context and amplify the mistake.

**How to avoid:**
- Treat agent specifications like API contracts—use JSON schemas with Zod validation for all inter-agent communication
- Implement an independent validation step after each agent completes (don't trust agents to validate their own work)
- Add circuit breakers: if Architecture Analyzer fails validation, halt execution instead of running remaining 3 agents
- Include health checks in SSE stream: emit validation status per agent before downstream agents consume results

**Warning signs:**
- Agent outputs that don't match Zod schemas during development
- Finding tables showing duplicate or contradictory findings from different agents
- Compliance scores that don't align with the risk findings displayed
- SSE stream events arriving out of order or with missing agent completion markers

**Phase to address:**
Phase 2 (Multi-Agent System). Establish validation contracts before building orchestration logic.

**Sources:**
- [Why Multi-Agent LLM Systems Fail: Key Issues Explained](https://orq.ai/blog/why-do-multi-agent-llm-systems-fail)
- [Why do Multi-Agent LLM Systems Fail | Galileo](https://galileo.ai/blog/multi-agent-llm-systems-fail)
- [Multi-Agent System 17x Error Trap](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/)

---

### Pitfall 2: SSE Timeout on Vercel Serverless

**What goes wrong:**
SSE streaming connections close prematurely during agent execution, causing the dashboard to stop receiving updates mid-analysis. Users see a frozen progress indicator and incomplete results. For hackathon demos, this is catastrophic—the demo appears broken.

**Why it happens:**
Vercel has hard request duration limits: 10 seconds on Hobby tier, 60 seconds on Pro tier. LLM agent execution for compliance analysis can easily exceed these limits, especially with 4 sequential agents. SSE connections are request-scoped on serverless platforms, so timeout = connection death.

**How to avoid:**
- Use Vercel Edge Runtime instead of Node.js runtime for SSE endpoints (Edge allows long-lived connections)
- Enable Vercel Fluid Compute (enabled by default for new projects as of April 2025)—provides "scale to one" strategy preventing cold starts and extending connection lifetime
- Implement chunked agent execution: break long-running agents into multiple streaming chunks with keepalive pings every 5-10 seconds
- Add client-side SSE auto-reconnect with exponential backoff—if connection drops, resume from last received event
- For demo mode: pre-compute results and stream them on a controlled timer (guarantees sub-10s demo reliability)

**Warning signs:**
- SSE connections closing after exactly 10 or 60 seconds in production
- Local development works fine but Vercel deployment fails mid-stream
- Network tab shows SSE endpoint returning 504 Gateway Timeout
- Agent progress freezes at random points during analysis

**Phase to address:**
Phase 3 (Real-Time Streaming). Test SSE timeout behavior on Vercel early in the phase.

**Sources:**
- [SSE Time Limits on Vercel](https://community.vercel.com/t/sse-time-limits/5954)
- [Fixing Slow SSE in Next.js and Vercel](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996)
- [What can I do about Vercel Functions timing out?](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out)

---

### Pitfall 3: LLM Structured Output Validation Failures

**What goes wrong:**
LLMs generate JSON that looks correct but fails Zod validation due to subtle schema mismatches (field renamed "status" to "current_state", nested objects flattened, enums using different case). Vercel AI SDK's `generateObject` returns partial results during streaming that cannot be validated, causing UI crashes when components expect complete typed data.

**Why it happens:**
Schema compliance is only guaranteed for complete, successful generations. Interrupted generation (cancellation, token limits, provider errors) produces schema violations. Complex nested Zod schemas increase LLM confusion—the model might generate valid JSON but not match the exact structure. Partial streaming outputs cannot be validated since incomplete data doesn't conform to schemas.

**How to avoid:**
- Keep Zod schemas simple—avoid deeply nested structures, use flat objects where possible
- Add explicit retry logic with schema validation: if Zod parse fails, retry up to 3 times with schema in system prompt
- Use `streamText` with output parsing instead of deprecated `generateObject`/`streamObject` (legacy functions being removed)
- Implement graceful degradation: if validation fails after retries, show placeholder data instead of crashing UI
- Add schema examples to agent prompts: include 2-3 valid JSON examples directly in the prompt
- Don't validate partial streaming results—buffer until complete, then validate

**Warning signs:**
- Zod validation errors appearing in server logs during agent execution
- UI components showing "undefined" for expected fields
- Compliance scores displaying as NaN or negative numbers
- React Flow graph nodes missing required properties causing render failures

**Phase to address:**
Phase 2 (Multi-Agent System). Define and test all Zod schemas with real LLM outputs before building streaming layer.

**Sources:**
- [AI SDK Core: Error Handling](https://ai-sdk.dev/docs/ai-sdk-core/error-handling)
- [Zod schema validation edge cases](https://github.com/vercel/ai/discussions/1947)
- [How to Ensure LLM Output Adheres to JSON Schema](https://modelmetry.com/blog/how-to-ensure-llm-output-adheres-to-a-json-schema)

---

### Pitfall 4: React Flow Performance Collapse with Large CALM Architectures

**What goes wrong:**
When rendering CALM architectures with 50+ nodes and 100+ edges, React Flow becomes unresponsive. Dragging nodes lags, zoom is sluggish, and the dashboard feels broken. For hackathon demos with enterprise CALM examples, this kills credibility.

**Why it happens:**
React Flow re-renders on every node movement, causing performance bottlenecks in larger diagrams. Uncontrolled dependencies on node/edge arrays cause all components to re-render unnecessarily. Complex CSS (animations, shadows, gradients) compounds the problem. Default rendering renders all nodes even when off-screen.

**How to avoid:**
- Memoize all custom node/edge components with `React.memo`
- Enable `onlyRenderVisibleElements` prop on ReactFlow component (only helps with 50+ elements)
- Simplify node/edge CSS—avoid animations, shadows, and gradients for large graphs
- Use viewport-based node hiding: initially hide nodes, render only when expanded/visible
- Implement graph simplification for demo mode: show summarized view with 10-15 key nodes, allow drill-down
- Debounce node position updates during drag operations
- Use React Flow's stress test example as benchmark: test with 500+ nodes during development

**Warning signs:**
- FPS drops below 30 when dragging nodes
- Browser console showing "React is rendering too frequently" warnings
- Zoom operations taking >500ms to complete
- Chrome DevTools Performance tab showing long React reconciliation times

**Phase to address:**
Phase 4 (Visualization Layer). Load test with realistic enterprise CALM files (50+ nodes) before finalizing graph rendering.

**Sources:**
- [React Flow Performance Guide](https://reactflow.dev/learn/advanced-use/performance)
- [Ultimate Guide to Optimize React Flow](https://medium.com/@lukasz.jazwa_32493/the-ultimate-guide-to-optimize-react-flow-project-performance-42f4297b2b7b)
- [How to improve React Flow performance with large graphs](https://github.com/xyflow/xyflow/discussions/4975)

---

### Pitfall 5: Zustand State Race Conditions with SSE Events

**What goes wrong:**
SSE events arrive faster than Zustand can process state updates, causing race conditions where later events overwrite earlier ones or state updates are skipped entirely. The activity feed shows events out of order, compliance scores flicker between values, and the final state doesn't match what agents actually produced.

**Why it happens:**
Zustand's persist middleware had a race condition in v5.0.9 and earlier where concurrent rehydration attempts interfered with each other. SSE events can arrive milliseconds apart, faster than React's render cycle. Multiple rapid `setState` calls can batch unpredictably, causing lost updates.

**How to avoid:**
- Upgrade to Zustand v5.0.10+ (fixes persist middleware race condition)
- Use Zustand's `immer` middleware for nested state updates—prevents accidental mutations
- Implement event queue pattern: buffer SSE events in array, process sequentially with `requestAnimationFrame`
- Use atomic state updates: entire agent result in single `setState` call, not field-by-field updates
- Add event sequence numbers to SSE stream—detect and handle out-of-order events client-side
- Debounce UI updates: batch rapid state changes before triggering re-renders

**Warning signs:**
- Activity feed events appearing in wrong chronological order
- State inspector showing values that never appeared in SSE stream
- Compliance scores jumping between different values rapidly
- Missing events in Zustand state despite appearing in Network tab SSE stream

**Phase to address:**
Phase 3 (Real-Time Streaming). Test with rapid SSE event simulation before integrating with real agents.

**Sources:**
- [Zustand store update and race conditions](https://github.com/pmndrs/zustand/discussions/2034)
- [State Management 2026: Comparing Zustand, Signals, and Redux](https://veduis.com/blog/state-management-comparing-zustand-signals-redux/)
- [WebSockets vs SSE State Management Complexity](https://rxdb.info/articles/websockets-sse-polling-webrtc-webtransport.html)

---

### Pitfall 6: Multi-Provider LLM API Incompatibility

**What goes wrong:**
Code works perfectly with Gemini but breaks with Anthropic/OpenAI/Grok due to subtle API differences. Different providers handle streaming differently, return errors in different formats, and have different token limits. Demo fails when judges want to test with their preferred LLM provider.

**Why it happens:**
While OpenAI API has become the standard, providers like Anthropic and Mistral diverge in expected input parameters and output values. Rate limits, provider outages, and inconsistent model performance create failures. API key management differs across providers. Continuous change management required as providers update models without notice.

**How to avoid:**
- Use Vercel AI SDK's unified interface—handles provider differences automatically
- Test all 5 providers (Gemini, Anthropic, OpenAI, Ollama, Grok) during Phase 2 development
- Implement provider fallback: if primary provider fails, automatically retry with backup provider
- Add provider-specific error handling: map different error formats to common error shape
- Document token limits per provider: adjust agent prompts to stay under minimum (Gemini: 32k, GPT-4: 8k, Claude: 100k)
- Mock LLM responses for demo mode—guarantee consistent behavior regardless of provider

**Warning signs:**
- Tests passing with Gemini but failing with other providers
- Different compliance scores from same CALM file using different LLMs
- API errors with cryptic provider-specific error codes
- Structured output working with one provider but returning plain text with another

**Phase to address:**
Phase 2 (Multi-Agent System). Test multi-provider compatibility with real API calls before building orchestration.

**Sources:**
- [LiteLLM: Unified LLM API Gateway](https://medium.com/@mrutyunjaya.mohapatra/litellm-a-unified-llm-api-gateway-for-enterprise-ai-de23e29e9e68)
- [Multi-Provider LLM API Compatibility Issues](https://llmgateway.io)
- [5 Best AI Gateways in 2026](https://www.getmaxim.ai/articles/5-best-ai-gateways-in-2026/)

---

### Pitfall 7: Hackathon Demo Mode Unreliability

**What goes wrong:**
Demo works perfectly in testing but fails during the live hackathon presentation. LLM API rate limits hit mid-demo, network latency causes 30-second waits, or uploaded CALM file triggers edge case the system can't handle. With 5-10 minutes for presentation, any failure is disqualifying.

**Why it happens:**
Teams don't prepare for the pitch—the biggest mistake almost everyone makes. Live demos depend on external APIs (LLM providers, network), which can fail under load or rate limiting. Edge cases in CALM parsing weren't tested. No fallback when things go wrong. Spending time on "almost done" features instead of polishing the demo.

**How to avoid:**
- Implement pre-computed demo mode: use real agent results cached from testing, stream them on controlled timer
- Stop feature work 24 hours before deadline—focus entirely on demo polish and edge case handling
- Add fallback mode: if LLM API fails, gracefully show cached results with disclaimer
- Test demo script 10+ times before presentation—time it to stay under 5 minutes
- Prepare 2-3 demo CALM files: simple (guaranteed success), medium (shows capability), complex (wow factor)
- Add "wow effect" visualization: highlight the most impressive behind-the-scenes work visually
- Remove anything that doesn't work—half-built features hurt more than missing features

**Warning signs:**
- Demo requires manual steps or configuration changes to work
- Demo timing varies widely between runs (2 minutes vs. 8 minutes)
- Error states don't have graceful fallback UI
- Team hasn't practiced full presentation run-through 72 hours before deadline

**Phase to address:**
Phase 6 (Polish & Demo Mode). Reserve final 24 hours exclusively for demo preparation and edge case handling.

**Sources:**
- [Avoid These Five Pitfalls at Your Next Hackathon](https://sloanreview.mit.edu/article/avoid-these-five-pitfalls-at-your-next-hackathon/)
- [8 Mistakes That Help You Screw Up at Hackathon](https://sigma.software/about/media/8-mistakes-definitely-help-you-screw-hackathon)
- [Common Hackathon Submission Mistakes](https://www.ingeniumstem.org/docs/common-mistakes-to-avoid-when-submitting-a-hackathon-project/)

---

### Pitfall 8: Solo Developer Scope Creep

**What goes wrong:**
The roadmap looks achievable on day 1, but by day 5, you're still implementing Phase 2 with Phases 3-6 incomplete. Feature scope expands ("wouldn't it be cool if..."), technical debt accumulates, and the project becomes unshippable. You end up with 60% of 10 features instead of 100% of 6 critical features.

**Why it happens:**
Scope creep costs up to 4x initial development cost. 62% of projects experience budget overruns from uncontrolled scope expansion. Solo developers lack external accountability—no team to push back on scope additions. Unclear project requirements and optimistic estimates compound the problem. Gold plating (adding unnecessary features) feels productive but delays shipping.

**How to avoid:**
- Lock requirements before Phase 1—treat PROJECT.md as immutable contract with yourself
- Weekly scope reviews: at end of each day, verify you're still on original scope
- Use "deferred features" list: when tempted to add feature, write it down for post-hackathon instead of building it
- Time-box each phase: if Phase 2 takes >20% of timeline, cut features rather than extend
- Implement "looks done" checklist at phase boundaries—verify completeness before moving forward
- Focus on table stakes features first: parse CALM → run agents → display results. Everything else is secondary.
- Build vertical slices: complete end-to-end flow for 1 agent before adding other 3 agents

**Warning signs:**
- PROJECT.md requirements expanding after initial commit
- Phases taking 2x estimated time
- More than 3 "quick features" added mid-development
- Technical implementation discussions taking priority over shipping working features

**Phase to address:**
Pre-Phase 1 (Planning). Lock scope during roadmap creation, establish scope change approval process (spoiler: deny all changes).

**Sources:**
- [What is Scope Creep in Project Management? 2026 Guide](https://pmpwithray.com/blogs/what-is-scope-creep-in-project-management-your-complete-guide/)
- [Project Red Flags for the Solo Dev](https://deliciousbrains.com/project-red-flags-for-the-solo-dev/)
- [Navigating Software Development Scope and Feature Creep](https://reintech.io/blog/navigating-challenges-software-development-project-scope-feature-creep)

---

## v1.3 Integration Pitfalls (Added 2026-02-25)

The following pitfalls are specific to adding compliance skills, multi-version CALM support, 3-button GitOps, and a GitHub Action to the existing working v1.2 system. Each is an integration pitfall—the feature works in isolation but breaks the existing system when added.

---

### Pitfall 9: Hallucinated Control IDs from Compliance Skill Injection

**What goes wrong:**
The LLM generates plausible-sounding but entirely fabricated control IDs in compliance output — e.g., `PCI-DSS-8.3.7`, `NIST-CSF-PR.AC-9`, `SOC2-CC7.4.2` — that do not exist in the actual framework. These invented IDs pass Zod validation (the schema only requires `z.string()` for `controlId`), appear in the findings table, and get committed to remediated CALM files as `requirement-url` references. In a hackathon compliance demo, fabricated control IDs are catastrophic — a judge who knows PCI-DSS will spot them immediately.

**Why it happens:**
The existing `compliance-mapper.ts` prompts the LLM to produce `controlId` as a free-form string. Skill files (`skills/PCI-DSS.md`, `skills/NIST-CSF.md`) describe framework structure but the LLM still has to "fill in" IDs from memory. When skill content is comprehensive but the LLM's internal knowledge diverges (e.g., the LLM conflates PCI-DSS v3.2.1 and v4.0 numbering), it generates v3 IDs for a v4 framework. The model also invents sub-IDs beyond what skills list — if skills show `8.4`, the model may invent `8.4.1` and `8.4.2` without those existing.

**How to avoid:**
- Add an explicit closed-list of valid control IDs to each skill file for the controls you care about. In `skills/PCI-DSS.md`, add a section: `## Valid Control IDs (PCI-DSS v4.0)` with the canonical list. Instruct the LLM in the prompt: "Only use control IDs from the list above. If a finding maps to no listed ID, use the parent requirement (e.g., Req 8 not Req 8.4.2)."
- Add a Zod enum or regex validation layer post-generation: for each `controlId` in the output, check it matches a known pattern (`/^PCI-DSS-\d+\.\d+(\.\d+)?$/`). Findings with invalid IDs get flagged as `confidence: 'low'` rather than silently passed.
- Never inject free-form control IDs into the CALM remediation file's `requirement-url` field. Use canonical URLs from the skill file (e.g., `https://www.pcisecuritystandards.org/documents/PCI_DSS-QRG-v4_0.pdf`) rather than LLM-generated ones.
- Reduce LLM latitude: instead of "identify relevant controls," provide the candidate control list in the prompt and ask the LLM to select from it. Constrained selection beats free recall.

**Warning signs:**
- Control IDs in output that use sub-decimal notation not present in skill files (e.g., `8.4.2` when skill only defines `8.4`)
- `requirement-url` values in generated CALM files that return 404 or are not real URLs
- Compliance scores that are suspiciously high (90+) even for architectures with obvious gaps — hallucinated compliance rather than real mapping
- Different control IDs for the same finding across two runs with identical CALM input

**Phase to address:**
v1.3 Phase 1 (Compliance Skills). Lock skill files first, validate the LLM against the closed list before wiring skills into agent flow.

---

### Pitfall 10: Multi-Version CALM Parser Breaking Existing v1.1 Files

**What goes wrong:**
Adding multi-version support (v1.0, v1.1, v1.2) to `src/lib/calm/types.ts` breaks existing v1.1 parsing because the approach chosen to support new fields causes Zod's strict mode behavior to reject previously-valid files, or the version detection logic misidentifies v1.1 files as v1.0 and applies wrong schema transformations.

**Why it happens:**
The current `calmDocumentSchema` in `types.ts` uses strict Zod validation (`z.object()` without `.passthrough()`). When v1.2 adds new optional fields (`adrs`, `decorators`, `timelines`), the developer adds those fields to the single shared schema. Now v1.1 files that lack those fields still parse fine — but v1.0 files that use a slightly different `relationship-type` format (where the property is structured differently at the key level) fail. Conversely, if you create separate schemas per version and add a version detection step, you need a reliable version signal — but CALM files do not have a top-level `version` field in v1.0 or v1.1. Version detection via heuristics (presence of `decorators`, count of fields) is fragile.

**Specifically for v1.2:** Research confirms v1.0 through v1.2 share the same 9 node types and 5 relationship types (interacts, connects, deployed-in, composed-of, options) and the same 12 protocols. The structural difference is v1.2 adds optional `adrs` array and potentially decorator/timeline fields. The existing parser already handles v1.1 and will accept v1.2 files without changes IF those new fields are declared optional. The only real breaking risk is adding `.strict()` mode or removing `.optional()` from new fields.

**How to avoid:**
- Use the lenient parser strategy already noted in PROJECT.md decisions: keep a single `calmDocumentSchema` and add all v1.0-1.2 fields as `.optional()`. Do not create separate version-branched schemas — the core schema is stable enough.
- For version detection: detect by presence of v1.2-specific fields (`adrs`, `decorators`) as optional markers for UI display purposes only. Never reject a file based on detected version.
- Add unknown field tolerance: use `.passthrough()` on the root `calmDocumentSchema` so future schema fields don't cause parse failures.
- Regression test: run both existing demo CALM files (`examples/`) through the parser after every schema change. The test should be two lines: `parseCalmFile(tradingPlatform)` and `parseCalmFile(paymentGateway)` — both must return `success: true`.
- The real integration risk is NOT the Zod schema — it's that the v1.1 `relationship-type` object in existing demo files uses a specific key structure. Before adding multi-version support, confirm the existing demo files still parse correctly.

**Warning signs:**
- Previously passing `parseCalm()` calls returning `success: false` after schema changes
- TypeScript type errors on code that destructures `CalmDocument` after schema update (new optional fields need handling in downstream consumers like `extractor.ts`)
- `extractor.ts` crash because it accesses a field that is now typed as `T | undefined` where it was previously `T`
- Demo files in `examples/` directory failing upload validation

**Phase to address:**
v1.3 Phase 2 (Multi-Version CALM). Run the full parser regression suite before committing any type changes.

---

### Pitfall 11: GitHub Action Failing in Headless CI (No Browser, No Filesystem State)

**What goes wrong:**
The GitHub Action for continuous compliance checking invokes CALMGuard analysis in headless CI mode. Because the current analysis pipeline relies on Next.js API routes (SSE streaming, `globalThis` server state, file reading from `process.cwd()`), the GitHub Action cannot simply import and call the agent functions directly — they have implicit dependencies on Next.js runtime, `fs` access to the `agents/` and `skills/` directories, and the global event emitter. The Action fails with module resolution errors or silent empty results.

**Why it happens:**
Three specific implicit dependencies in the current codebase break in headless CI:

1. **`process.cwd()` in `registry.ts` and `loader.ts`**: Both use `join(process.cwd(), 'agents', ...)` and `join(process.cwd(), skillPath)`. In a GitHub Action step running `node script.js`, `process.cwd()` is the workspace root — which may not contain `agents/` and `skills/` if the Action is invoked from a different working directory.

2. **`globalThis.__lastPipelineResult`**: The PR generation route reads from `globalThis`. In a GitHub Action running as a Node.js script (not a Next.js server), these globals are never populated by the SSE analyze route. A naive port will read `undefined` and silently produce empty PR content.

3. **SSE event emitter**: `emitAgentEvent()` in `streaming.ts` assumes a streaming subscriber is listening. In headless mode, nothing subscribes. If any agent emits events and the emitter tries to push to a closed stream, it throws silently — the agent appears to complete but the error is swallowed.

**How to avoid:**
- Build the GitHub Action as a standalone Node.js script (`action/index.ts` or `action/index.mjs`) that explicitly imports only the agent functions — NOT the API routes or SSE emitter. The action calls `runAnalysis()` and awaits the result directly, bypassing streaming.
- Pass explicit paths via environment variables: `AGENTS_DIR` and `SKILLS_DIR` pointing to the correct directories. Modify `registry.ts` and `loader.ts` to accept path overrides via env vars rather than hardcoding `process.cwd()`.
- Create a no-op event emitter for CI mode: detect `process.env.CI === 'true'` in `streaming.ts` and skip all `emitAgentEvent()` calls (or log to stdout instead).
- Test the Action locally with `act` (GitHub Actions local runner) before committing — `act` reproduces the headless environment including working directory quirks.
- The Action's `action.yml` must specify `runs.using: node20` and pre-bundle the script (use `@vercel/ncc` to compile TypeScript to a single JS file with all dependencies included, avoiding `node_modules` resolution in CI).

**Warning signs:**
- `Error: Agent config not found: /home/runner/work/repo/agents/compliance-mapper.yaml` in Action logs (wrong working directory)
- Action completing in <1 second with exit code 0 but no compliance report — silent failure from uncaught emitter errors
- TypeScript compilation errors when building the Action separately from the Next.js project (different `tsconfig.json` targets)
- `Cannot find module '@/lib/agents/orchestrator'` — Next.js path aliases (`@/`) do not resolve outside Next.js build context

**Phase to address:**
v1.3 Phase 3 (GitHub Action). Build and test the Action as a completely isolated Node.js script from the start, not as an afterthought wrapper around the Next.js server code.

---

### Pitfall 12: 3-Button GitOps State Management — Concurrent PR Generation Corruption

**What goes wrong:**
Splitting the existing single "Generate PR" button into 3 separate buttons (DevSecOps CI, Compliance Remediation, Cloud Infra) creates a state management problem: if the user clicks two buttons in rapid succession, both API calls hit `POST /api/github/create-pr` concurrently. The route reads from `globalThis.__lastAnalysisResult` and `globalThis.__lastPipelineResult` — shared mutable server globals. Both requests race to read the same data, create branches with timestamp-based names, and may produce duplicate or corrupted PRs. The Zustand store only has `pipelinePR` and `remediationPR` — it doesn't have a third slot for "Cloud Infra", so adding a third button requires a store schema change that affects all existing components reading `pipelinePR` / `remediationPR`.

**Why it happens:**
The current `PRRecord` type in `src/lib/github/types.ts` has `type: 'pipeline' | 'remediation'` — a discriminated union with no third option. The Zustand store has `pipelinePR` and `remediationPR` as separate fields. Adding a third PR type requires changing the Zod union, the store's initial state, the `reset()` function, and every component that reads either PR field. This is a wider blast radius than it appears.

The `create-pr/route.ts` currently dispatches on `type: 'pipeline' | 'remediation'` — adding `'infra'` requires a third branch in that switch. If the developer forgets to add it, the `infra` button silently no-ops (the route returns 400 because the schema enum doesn't include `'infra'`).

Concurrent requests are a real risk: if the user clicks DevSecOps CI and then immediately clicks Compliance Remediation, both calls read `globalThis.__lastPipelineResult` at the same time (it was set once after analysis). This is safe for reading. But if both calls try to create branches with the same timestamp (`calmguard/pipeline-${Date.now()}`), GitHub rejects the second with 422 Unprocessable Entity.

**How to avoid:**
- Extend `PRRecord.type` to `'pipeline' | 'remediation' | 'infra'` and add `infraPR` as a third field in the Zustand store at the same time. Do this as a single atomic change to avoid type errors.
- Disable all three buttons while any one PR is generating. Use a derived Zustand selector: `const anyGenerating = pipelinePR.status === 'generating' || remediationPR.status === 'generating' || infraPR.status === 'generating'`. This prevents concurrent requests.
- Use millisecond + random suffix for branch names: `calmguard/pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` — avoids 422 from duplicate branch names on rapid clicks.
- Update the `createPRRequestSchema` in `create-pr/route.ts` to add `'infra'` to the enum **before** wiring the button. A schema-first approach means the API is ready before the UI sends requests.
- Add a UI guard: the DevSecOps CI and Compliance Remediation buttons are only enabled after analysis completes (currently gated by `analysisResult !== null`). The Cloud Infra button should have the same gate.

**Warning signs:**
- TypeScript error `Type '"infra"' is not assignable to type '"pipeline" | "remediation"'` propagating across multiple files after adding the third button — indicates schema wasn't updated atomically
- GitHub API 422 error in logs when clicking two buttons quickly — duplicate branch name race
- Third button appears but click does nothing visible — `create-pr` route returning 400 because `'infra'` is not in the Zod enum
- `reset()` in the store not resetting `infraPR` — leaving stale state after a new CALM file is uploaded

**Phase to address:**
v1.3 Phase 1 (3-Button GitOps). Schema-first: extend `PRRecord` type and Zustand store before building UI components. Write the `'infra'` route branch before creating the button.

---

### Pitfall 13: Skill File Content Overwhelming Agent Context Window

**What goes wrong:**
Adding specific control IDs to skill files (the fix for Pitfall 9) makes skill files significantly longer. The combined skill content injected into the compliance mapper prompt — four skill files, each potentially 2,000+ tokens — pushes the total prompt past Gemini Flash's effective context for structured output. The model starts truncating or summarizing skill content rather than using it as ground truth, which defeats the purpose of grounding and may produce worse control ID accuracy than the un-grounded original.

**Why it happens:**
The current `loadSkillsForAgent()` in `src/lib/skills/loader.ts` concatenates all skill files with `---` separators and injects the full content as a single string block in the prompt. With four compliance frameworks each getting a full control ID list, the total skills injection for the compliance mapper can exceed 8,000 tokens before the CALM input is even included. Gemini Flash 1.5 has a 1M token context window, but structured output quality degrades significantly when prompts exceed ~16,000 tokens total.

**How to avoid:**
- Scope skill injection to the frameworks actually selected by the user. The `mapCompliance()` function already receives `_selectedFrameworks` (currently unused — note the underscore prefix). Use it: if the user selected only PCI-DSS and NIST-CSF, inject only those two skill files, not all four.
- Split each skill file into a "summary" section (injected always) and a "control reference" section (injected only when that framework is selected). Use a markdown comment marker like `<!-- CONTROL-REFERENCE-START -->` to split at load time.
- Target total prompt size: keep skills injection under 3,000 tokens per selected framework. If the skill file exceeds this, include only the control IDs table, not the full narrative.
- Test with `console.log(prompt.length)` before and after adding control IDs to skill files — measure token count via the Vercel AI SDK's usage metadata.

**Warning signs:**
- Compliance mapper output with correct framework structure but vague, non-specific control descriptions (sign that model is summarizing rather than citing)
- LLM API returning errors about context length (Gemini: "The request body contains fields that are not allowed" when payload exceeds limits)
- Agent execution time jumping from ~5s to ~20s after skill file expansion (longer context = slower inference)
- Control IDs in output reverting to hallucinated values despite having a closed list in skills (model hit context limit before reaching the reference section)

**Phase to address:**
v1.3 Phase 1 (Compliance Skills). Measure prompt size after adding control reference sections before deploying. Wire `_selectedFrameworks` to `loadSkillsForAgent()` as part of this phase.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip Zod validation for agent outputs | Faster development, less boilerplate | Runtime crashes when LLM returns unexpected schema | Never—validation is critical for multi-agent reliability |
| Use `any` types for CALM parsing | Avoid TypeScript complexity | Type safety lost, bugs hidden until runtime | Never—CALM has TypeScript types via `@finos/calm-models` |
| Store SSE events in component state | Simple implementation | Re-renders on every event, performance issues | MVP only—migrate to Zustand by Phase 4 |
| Hardcode demo CALM files in code | Quick demo setup | Can't demonstrate custom file upload feature | Acceptable for Phase 1-2, must refactor by Phase 5 |
| Skip error boundaries around React Flow | Less boilerplate | Graph rendering errors crash entire dashboard | Never—graph is core feature, must be resilient |
| Single LLM provider (Gemini only) | Faster initial development | Can't demo multi-provider support (listed requirement) | Not acceptable—multi-provider is requirement |
| Synchronous agent execution | Simpler orchestration logic | 4x slower than parallel execution | Acceptable for Phase 2 MVP, parallelize in Phase 3 |
| Client-side CALM parsing | No API route needed | Large files block UI thread | Acceptable for <100KB files, move to worker for production |
| Free-form controlId string in Zod schema | No LLM constraint needed | Hallucinated IDs pass validation silently | Never for v1.3—must add closed-list validation |
| Single calmDocumentSchema for all versions | No branching logic needed | Breaking change risk when adding new optional fields | Acceptable if all new fields are `.optional()` + `.passthrough()` |
| `globalThis` for cross-route server state | No external state store needed | Race condition risk with concurrent requests in serverless | Acceptable in Vercel (single-tenant per request), but disable all PR buttons during generation |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vercel AI SDK | Using deprecated `generateObject`/`streamObject` | Use `streamText` with output property (legacy functions being removed) |
| CALM CLI | Assuming `@finos/calm-cli` validates all edge cases | Wrap CLI validation in try-catch, handle malformed JSON separately |
| SSE Endpoint | Forgetting to set `Content-Type: text/event-stream` header | Explicitly set headers, verify with curl before client integration |
| React Flow | Importing from `reactflow` instead of `@xyflow/react` | Use correct package name based on version (v11+ uses `@xyflow/react`) |
| Zustand Persist | Not handling hydration race conditions | Upgrade to v5.0.10+, implement loading states during rehydration |
| LLM Provider APIs | Assuming all providers support streaming | Check provider capabilities, implement fallback for non-streaming providers |
| Compliance Skill Files | Injecting all 4 framework skills regardless of selection | Use `selectedFrameworks` to scope skill injection, keep prompt under 3,000 tokens/framework |
| GitHub Action | Importing Next.js API route code directly | Build standalone Node.js script; resolve `@/` aliases; pre-bundle with `@vercel/ncc` |
| 3-Button GitOps | Adding 3rd button without extending Zustand store schema | Update `PRRecord` union and add `infraPR` field atomically before writing UI code |
| CALM v1.2 parser | Adding strict validation for new fields | Use `.optional()` for all new fields + `.passthrough()` on root schema |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Rendering all React Flow nodes simultaneously | Smooth at 10 nodes, laggy at 50+ | Enable `onlyRenderVisibleElements`, memoize components | 50+ nodes, 100+ edges |
| Subscribing to entire Zustand store in components | Works fine initially, causes re-render storms | Use selectors: `useStore(state => state.specificField)` | 10+ SSE events per second |
| Synchronous CALM JSON parsing in main thread | Fast for <10KB files | Move to Web Worker or API route for large files | CALM files >100KB |
| Unthrottled SSE event processing | Fine with 1 event/sec, overwhelms at 10/sec | Batch events with `requestAnimationFrame` | 5+ concurrent agents streaming |
| CSS-in-JS for dynamic node styling | Acceptable for 10 nodes | Use CSS variables for dynamic values | 30+ nodes with live updates |
| Re-computing compliance scores on every state update | Instant for simple calculations | Memoize with `useMemo`, recompute only when findings change | 100+ findings across 4 frameworks |
| Injecting all skill files regardless of framework selection | Fast for small skill files | Scope skills to selected frameworks only | Skills exceed 8,000 tokens per call |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing LLM API keys in client-side code | API key theft, quota exhaustion | Store in `.env.local`, access only in API routes, never send to client |
| Allowing arbitrary CALM file URLs | SSRF attacks, malicious file injection | Validate file size (<10MB), parse with schema validation, sanitize before display |
| Displaying raw LLM outputs without sanitization | XSS if LLM returns malicious HTML/JS | Sanitize all LLM outputs with DOMPurify before rendering |
| Trusting CALM file metadata without validation | Malicious scripts in description fields | Zod validate all fields, escape strings before rendering |
| Logging full agent responses | Sensitive compliance data in logs | Log only event types and status, not full content |
| Storing uploaded CALM files permanently | Data persistence violates "ephemeral" constraint | Use in-memory storage only, clear on session end |
| GitHub Action with hardcoded GITHUB_TOKEN in YAML | Token exposed in repo history | Always reference via `${{ secrets.GITHUB_TOKEN }}` — never inline |
| Compliance report containing fabricated control IDs | Legal/audit risk if report is presented to auditors | Add post-generation control ID validation against closed list |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading state during agent execution | Users think app is frozen | Show skeleton UI, progress indicators, estimated time remaining |
| Silent agent failures | Analysis appears complete but missing data | Display error states prominently, explain what failed and why |
| SSE reconnection without user feedback | Mysterious gaps in activity feed | Show "Reconnecting..." message, highlight missed events |
| Compliance scores without context | Numbers are meaningless without explanation | Add tooltips explaining score calculation, show pass/fail thresholds |
| Risk findings without remediation guidance | Users know there's a problem but not how to fix it | Include "How to fix" section per finding with specific steps |
| Graph auto-layout that changes on every render | Disorienting, hard to track nodes | Stable layout algorithm, persist node positions across re-renders |
| Export button that blocks UI for 30 seconds | Freezing during markdown generation | Use Web Worker for export, show progress indicator |
| Demo mode without clear indication | Users can't tell if they're seeing real or cached results | Add "Demo Mode" badge, explain data source |
| 3 PR buttons all active simultaneously | User clicks two buttons, creates duplicate branches | Disable all PR buttons when any one is generating |
| Compliance findings showing control IDs that don't exist | Destroys credibility in front of knowledgeable judge | Validate control IDs against closed list before rendering |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **SSE Streaming:** Connection works but doesn't handle reconnection—verify auto-reconnect logic with network throttling
- [ ] **Agent Orchestration:** Agents run but don't validate outputs—verify Zod schemas catch LLM mistakes
- [ ] **Error Handling:** Happy path works but edge cases crash—test with malformed CALM files, API failures, network issues
- [ ] **Multi-Provider Support:** UI shows provider selector but only Gemini works—test all 5 providers with real API calls
- [ ] **React Flow Graph:** Small graphs render but large graphs freeze—load test with 100+ node CALM architectures
- [ ] **Compliance Scoring:** Scores display but calculation logic is placeholder—verify against real framework requirements
- [ ] **Demo Mode:** Pre-computed data loads but timing feels instant—add realistic delays to match live analysis
- [ ] **File Upload:** Upload component exists but validation is missing—test with invalid JSON, oversized files, wrong format
- [ ] **Export Feature:** Generates markdown but formatting is broken—verify with long findings, special characters, nested lists
- [ ] **Activity Feed:** Shows events but events can appear out of order—test with rapid concurrent SSE events
- [ ] **Compliance Skills (v1.3):** Skill files added but control IDs are not validated—run `controlId` output against closed list from skill files
- [ ] **Multi-Version CALM (v1.3):** Parser "supports" v1.0-1.2 but demo files still work—run existing `examples/` through updated parser, confirm `success: true`
- [ ] **3-Button GitOps (v1.3):** Three buttons visible but clicking two simultaneously creates duplicate branches—test rapid double-click on different buttons
- [ ] **GitHub Action (v1.3):** `action.yml` exists but fails locally with `act`—test with `act pull_request` before committing

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Multi-Agent Error Cascade | HIGH | Add circuit breakers between agents, implement independent validation layer, may require re-architecting orchestration |
| SSE Timeout on Vercel | MEDIUM | Switch to Edge Runtime, enable Fluid Compute, implement chunked execution—requires endpoint refactor |
| LLM Schema Validation Failures | LOW | Add retry logic with schema in prompt, simplify Zod schemas, add fallback defaults—quick fixes |
| React Flow Performance Issues | MEDIUM | Enable viewport rendering, memoize components, simplify styling—requires component refactor |
| Zustand Race Conditions | LOW | Upgrade to v5.0.10+, implement event queue, batch updates—usually config changes |
| Multi-Provider Incompatibility | MEDIUM | Add provider abstraction layer, implement fallback chain—may require API route changes |
| Demo Mode Unreliability | LOW | Switch to pre-computed mode, add cached fallbacks—quick implementation |
| Scope Creep | HIGH | Cut features, focus on vertical slice, may need to descope phases entirely—painful decisions |
| Hallucinated Control IDs (v1.3) | MEDIUM | Add closed-list validation post-generation, re-run compliance mapper with constrained prompt, flag low-confidence findings—1-2 hours |
| Multi-Version Parser Breakage (v1.3) | LOW | Revert schema changes, add fields as `.optional()`, re-run examples/ regression—30 minutes if caught early |
| GitHub Action Headless Failure (v1.3) | MEDIUM | Rebuild as standalone script with explicit path resolution, pre-bundle with ncc—4-6 hours |
| 3-Button PR Race Condition (v1.3) | LOW | Add `anyGenerating` derived selector, disable all buttons during generation, add random suffix to branch names—30 minutes |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Multi-Agent Error Cascades | Phase 2 (Multi-Agent) | Run test with intentionally broken agent, verify system halts gracefully |
| SSE Timeout on Vercel | Phase 3 (Streaming) | Deploy to Vercel, run 2-minute streaming test, verify no disconnections |
| LLM Schema Validation | Phase 2 (Multi-Agent) | Test each agent 10x, collect all Zod validation errors, verify 100% pass rate |
| React Flow Performance | Phase 4 (Visualization) | Load 100-node CALM file, verify 60fps during drag operations |
| Zustand Race Conditions | Phase 3 (Streaming) | Send 50 rapid SSE events, verify all appear in state in correct order |
| Multi-Provider Incompatibility | Phase 2 (Multi-Agent) | Run same analysis with all 5 providers, verify similar results |
| Demo Mode Unreliability | Phase 6 (Polish) | Run full demo 10x, verify <5 minute runtime, zero failures |
| Scope Creep | Pre-Phase 1 (Planning) | Lock requirements before Phase 1, track any scope changes (target: zero) |
| Hallucinated Control IDs | v1.3 Phase 1 (Skills) | Run 5 analyses with same CALM file, compare control IDs across runs — must match closed list 100% |
| Multi-Version Parser Breakage | v1.3 Phase 2 (CALM Versions) | Run `examples/trading-platform.json` and `examples/payment-gateway.json` through parser after every schema change |
| GitHub Action Headless Failure | v1.3 Phase 3 (GitHub Action) | Run `act pull_request` locally; verify action completes with exit code 0 and produces report artifact |
| 3-Button PR Race Condition | v1.3 Phase 1 (GitOps Buttons) | Click DevSecOps CI and Compliance Remediation within 500ms of each other; verify only one request completes, second is blocked |
| Skill Context Overflow | v1.3 Phase 1 (Skills) | Log total prompt token count; verify under 16,000 tokens per agent call with all selected frameworks active |

## Solo Developer Survival Strategies

Specific tactics for single-person hackathon projects.

### Time Management
- **Rule of thirds:** 1/3 core features, 1/3 integration/polish, 1/3 demo prep and buffer
- **Daily scope check:** At end of each day, verify you can still ship complete project by deadline
- **Feature freeze:** Lock scope 48 hours before deadline, polish only

### Technical Decisions
- **Prefer libraries over custom code:** React Flow over custom graph, Recharts over custom charts
- **Use TypeScript strict mode:** Catch bugs at compile time when you don't have QA team
- **Implement feature flags:** Toggle incomplete features off without removing code

### Demo Preparation
- **Record backup video:** If live demo fails, have polished video ready
- **Practice pitch 10x:** Muscle memory prevents stage fright during presentation
- **Prepare for failure:** Have cached demo mode ready if APIs fail during presentation

### Health and Sustainability
- **Sleep minimum 5 hours:** Sleep deprivation kills decision-making and code quality
- **Set hard stop times:** Midnight deadline, walk away even if "almost done"
- **Celebrate small wins:** Completed phase = break time, maintain motivation

## CALM Architecture-Specific Pitfalls

Domain-specific issues when working with FINOS CALM schemas.

### CALM Schema Version Mismatch
**Problem:** Different CALM examples use different schema versions (1.0 vs 1.1), causing parsing failures.
**Prevention:** Explicitly support CALM 1.1 only, validate `version` field first, reject older versions with helpful error.

### Missing Required CALM Fields
**Problem:** CALM schemas have complex required/optional field rules that LLMs don't understand.
**Prevention:** Use `@finos/calm-models` TypeScript types directly, validate with type guards before passing to agents.

### CALM Relationship Complexity
**Problem:** CALM defines 20+ relationship types (`connects-to`, `deployed-in`, `owned-by`, etc.)—agents confuse them.
**Prevention:** Limit agent focus to 5 core relationships for MVP, extend later if time permits.

### Node Type Proliferation
**Problem:** CALM supports systems, services, databases, APIs, etc.—graph rendering needs different styles for each.
**Prevention:** Define 3-4 core node styles (system, service, data, external), group others under "generic".

### v1.2 Schema Field Blindspot (v1.3)
**Problem:** `calmDocumentSchema` doesn't include `adrs` (Architecture Decision Records array) — valid v1.2 files with ADRs fail parsing or silently drop the `adrs` field.
**Prevention:** Add `adrs: z.array(z.string()).optional()` to `calmDocumentSchema` as part of multi-version support. Since the field is optional and ADRs are strings, this is a 1-line change with zero breaking risk.

## Sources

### Multi-Agent Systems
- [Why Multi-Agent LLM Systems Fail: Key Issues Explained | Orq.ai](https://orq.ai/blog/why-do-multi-agent-llm-systems-fail)
- [Why do Multi-Agent LLM Systems Fail | Galileo](https://galileo.ai/blog/multi-agent-llm-systems-fail)
- [Why Your Multi-Agent System is Failing: 17x Error Trap | Towards Data Science](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/)
- [Why Multi-Agent LLM Systems Fail and How to Fix Them | Augment Code](https://www.augmentcode.com/guides/why-multi-agent-llm-systems-fail-and-how-to-fix-them)

### SSE and Serverless
- [SSE Time Limits on Vercel Community](https://community.vercel.com/t/sse-time-limits/5954)
- [Server-Sent Events don't work in Next API routes | GitHub](https://github.com/vercel/next.js/discussions/48427)
- [Fixing Slow SSE in Next.js and Vercel | Medium](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996)
- [What can I do about Vercel Functions timing out? | Vercel KB](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out)
- [Vercel Fluid Compute: Scale to One](https://vercel.com/blog/scale-to-one-how-fluid-solves-cold-starts)

### React Flow Performance
- [React Flow Performance Guide | Official Docs](https://reactflow.dev/learn/advanced-use/performance)
- [Ultimate Guide to Optimize React Flow | Medium](https://medium.com/@lukasz.jazwa_32493/the-ultimate-guide-to-optimize-react-flow-project-performance-42f4297b2b7b)
- [How to improve React Flow performance with large graphs | GitHub](https://github.com/xyflow/xyflow/discussions/4975)

### LLM Structured Output
- [AI SDK Core: Error Handling | Vercel](https://ai-sdk.dev/docs/ai-sdk-core/error-handling)
- [AI SDK Core: streamObject | Vercel](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-object)
- [How to Ensure LLM Output Adheres to JSON Schema | Modelmetry](https://modelmetry.com/blog/how-to-ensure-llm-output-adheres-to-a-json-schema)

### State Management
- [Zustand store update and race conditions | GitHub](https://github.com/pmndrs/zustand/discussions/2034)
- [State Management 2026: Zustand, Signals, Redux | Veduis Blog](https://veduis.com/blog/state-management-comparing-zustand-signals-redux/)
- [WebSockets vs SSE: State Management Complexity | RxDB](https://rxdb.info/articles/websockets-sse-polling-webrtc-webtransport.html)

### Multi-Provider LLM
- [LiteLLM: Unified LLM API Gateway | Medium](https://medium.com/@mrutyunjaya.mohapatra/litellm-a-unified-llm-api-gateway-for-enterprise-ai-de23e29e9e68)
- [5 Best AI Gateways in 2026 | Maxim](https://www.getmaxim.ai/articles/5-best-ai-gateways-in-2026/)
- [LLM Gateway - Unified API](https://llmgateway.io)

### Hackathon Best Practices
- [Avoid These Five Pitfalls at Your Next Hackathon | MIT Sloan](https://sloanreview.mit.edu/article/avoid-these-five-pitfalls-at-your-next-hackathon/)
- [8 Mistakes That Help You Screw Up at Hackathon | Sigma Software](https://sigma.software/about/media/8-mistakes-definitely-help-you-screw-hackathon)
- [Common Hackathon Submission Mistakes | IngeniumSTEM](https://www.ingeniumstem.org/docs/common-mistakes-to-avoid-when-submitting-a-hackathon-project/)

### DevSecOps and Compliance
- [Application Security Trends 2026 | OX Security](https://www.ox.security/blog/application-security-trends-in-2026/)
- [Why Data Architecture Became Hardest DevSecOps Problem | Infiligence](https://www.infiligence.com/post/why-data-architecture-governance-became-the-hardest-devsecops-problem-of-2025-and-why-tech-first-companies-cant-ignore-it)

### Scope Management
- [What is Scope Creep in Project Management? 2026 Guide | PMP With Ray](https://pmpwithray.com/blogs/what-is-scope-creep-in-project-management-your-complete-guide/)
- [Project Red Flags for the Solo Dev | Delicious Brains](https://deliciousbrains.com/project-red-flags-for-the-solo-dev/)
- [Navigating Software Development Scope Creep | Reintech](https://reintech.io/blog/navigating-challenges-software-development-project-scope-feature-creep)

### v1.3 Integration Pitfalls
- [LLMs for PCI DSS Control Mapping and Gap Analysis | GuruStartups](https://www.gurustartups.com/reports/llms-for-pci-dss-control-mapping-and-gap-analysis)
- [Hallucination Detection and Mitigation in LLMs | arXiv 2025](https://arxiv.org/pdf/2601.09929)
- [8 Ways to Prevent LLM Hallucinations | Airbyte](https://airbyte.com/agentic-data/prevent-llm-hallucinations)
- [dorny/paths-filter: Conditional GitHub Action execution | GitHub](https://github.com/dorny/paths-filter)
- [GitHub Actions Composite Actions | Earthly Blog](https://earthly.dev/blog/composite-actions-github/)
- [Managing Server-Side Global State in Next.js 15+ | Medium](https://medium.com/@tkxa7064/managing-server-side-global-state-in-next-js-15-17141db755d8)
- [FINOS CALM Repository | GitHub](https://github.com/finos/architecture-as-code/tree/main/calm/release)
- [Schema Versioning with Zod | JCore](https://www.jcore.io/articles/schema-versioning-with-zod)
- [OWASP Top 10 LLM Vulnerabilities 2025 | Bright Defense](https://www.brightdefense.com/resources/owasp-top-10-llm/)

---
*Pitfalls research for: CALMGuard - Multi-agent AI compliance dashboard*
*Researched: 2026-02-15*
*v1.3 Integration Pitfalls added: 2026-02-25*
