# Phase 2: Multi-Agent Infrastructure - Research

**Researched:** 2026-02-16
**Domain:** Multi-agent AI orchestration, LLM structured output, SSE streaming, compliance framework mapping
**Confidence:** HIGH

## Summary

Phase 2 implements a multi-agent AI system for analyzing CALM architectures using the Vercel AI SDK with SSE streaming to a Next.js dashboard. The architecture uses four specialized agents (Architecture Analyzer, Compliance Mapper, Pipeline Generator, Risk Scorer) coordinated by an orchestrator that runs three agents in parallel (Phase 1) then aggregates results through a sequential risk scorer (Phase 2).

The AI SDK provides a unified interface across multiple LLM providers (Gemini, Claude, OpenAI, Ollama, Grok) with `generateObject` for Zod-validated structured outputs. Server-Sent Events (SSE) via Next.js 15 Route Handlers stream real-time agent events to the dashboard using EventSource on the client. Agents are defined via YAML configuration files with markdown skill files injected into prompts for compliance knowledge.

**Primary recommendation:** Use Vercel AI SDK 5+ with provider registry pattern, Next.js SSE streaming with `force-dynamic` exports, YAML agent definitions with markdown skill injection, and exponential backoff retry for LLM validation failures.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | 5.x | Vercel AI SDK | Multi-provider LLM abstraction, `generateObject` with Zod, streaming support, TypeScript-native |
| `@ai-sdk/google` | 3.0.29+ | Google Gemini provider | Default LLM (per PLAN.md), low cost, structured output support |
| `@ai-sdk/anthropic` | 3.0.44+ | Anthropic Claude provider | Alternative provider, excellent structured output quality |
| `@ai-sdk/openai` | Latest | OpenAI provider | Fallback provider, GPT-5.x models |
| `@ai-sdk/xai` | Latest | xAI Grok provider | Multi-provider flexibility |
| `zod` | 3.24.1 | Schema validation | Runtime validation for LLM outputs, pairs with AI SDK `generateObject` |
| `yaml` | Latest | YAML parsing | Agent configuration file parsing |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `ollama-ai-provider` | Latest | Ollama local models | Local LLM execution for development/testing |
| `EventSource` (browser) | Native | SSE client | Built-in browser API, no library needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel AI SDK | LangChain | LangChain more features but heavier, AI SDK simpler for structured output |
| YAML configs | JSON configs | YAML more human-readable, supports comments, better for skill injection |
| SSE | WebSockets | WebSockets bidirectional but SSE simpler, works with Vercel serverless, sufficient for one-way streaming |

**Installation:**

```bash
pnpm add ai @ai-sdk/google @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/xai zod yaml
```

Environment variables:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=xxx    # Gemini (default)
ANTHROPIC_API_KEY=xxx               # Claude
OPENAI_API_KEY=xxx                  # OpenAI
XAI_API_KEY=xxx                     # Grok
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   ├── agents/               # Agent implementations
│   │   ├── types.ts          # AgentEvent, AgentConfig, AgentResult
│   │   ├── registry.ts       # YAML agent loader
│   │   ├── orchestrator.ts   # Fleet coordinator (parallel + sequential)
│   │   ├── architecture-analyzer.ts
│   │   ├── compliance-mapper.ts
│   │   ├── pipeline-generator.ts
│   │   └── risk-scorer.ts
│   ├── ai/
│   │   ├── provider.ts       # Multi-provider registry
│   │   └── streaming.ts      # SSE event emitter
│   └── skills/
│       └── loader.ts         # SKILL.md reader
├── app/api/
│   ├── analyze/route.ts      # SSE streaming endpoint
│   └── agents/route.ts       # Agent events stream
└── hooks/
    └── use-agent-stream.ts   # EventSource hook
agents/                       # YAML agent definitions
skills/                       # Markdown compliance knowledge
```

### Pattern 1: Multi-Provider AI SDK Setup

**What:** Provider registry centralizes LLM provider configuration with model selection via `provider:model` syntax.

**When to use:** Need to support multiple LLM providers with consistent API.

**Example:**

```typescript
// src/lib/ai/provider.ts
import { createProviderRegistry } from 'ai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';

export const registry = createProviderRegistry({
  google,
  anthropic,
  openai,
  xai,
});

// Usage in agent
const result = await generateObject({
  model: registry.languageModel('google:gemini-2.5-flash'),
  schema: myZodSchema,
  prompt: 'Analyze this architecture...',
});
```

Source: [AI SDK Provider Management](https://ai-sdk.dev/docs/ai-sdk-core/provider-management)

### Pattern 2: Structured Output with Zod + Retry

**What:** `generateObject` with Zod schema validation and retry logic for malformed outputs.

**When to use:** Need guaranteed type-safe structured output from LLMs.

**Example:**

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

const complianceMappingSchema = z.object({
  frameworkMappings: z.array(z.object({
    framework: z.enum(['SOX', 'PCI-DSS', 'CCC', 'NIST-CSF']),
    controlId: z.string(),
    calmControlId: z.string(),
    status: z.enum(['compliant', 'partial', 'non-compliant', 'not-applicable']),
    evidence: z.string(),
    recommendation: z.string(),
    severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  })),
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
});

async function mapComplianceWithRetry(input: AnalysisInput, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { object } = await generateObject({
        model: registry.languageModel('google:gemini-2.5-flash'),
        schema: complianceMappingSchema,
        prompt: buildPrompt(input),
      });
      return object; // Success
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      // Exponential backoff
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
}
```

Sources:
- [AI SDK Structured Output](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)
- [LLM Retry Strategies](https://apxml.com/courses/prompt-engineering-llm-application-development/chapter-7-output-parsing-validation-reliability/implementing-retry-mechanisms)

### Pattern 3: SSE Streaming in Next.js Route Handlers

**What:** ReadableStream with TextEncoder for Server-Sent Events from API routes.

**When to use:** Stream real-time events from server to client (agent progress, LLM chunks).

**Example:**

```typescript
// src/app/api/analyze/route.ts
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'; // CRITICAL: Prevents caching

export async function POST(req: NextRequest) {
  const calmJson = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Subscribe to agent events
      const unsubscribe = agentEventEmitter.on((event) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      });

      // Run orchestrator in background
      orchestrator.analyze(calmJson).then(result => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`)
        );
        controller.close();
      }).catch(error => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`)
        );
        controller.close();
      });

      // Cleanup on client disconnect
      req.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });
}
```

Source: [SSE in Next.js](https://www.pedroalonso.net/blog/sse-nextjs-real-time-notifications/)

### Pattern 4: EventSource React Hook with Reconnection

**What:** Custom React hook wrapping EventSource with exponential backoff reconnection.

**When to use:** Client-side SSE consumption with robust error handling.

**Example:**

```typescript
// src/hooks/use-agent-stream.ts
import { useEffect, useState, useCallback, useRef } from 'react';

interface UseSSEOptions {
  url: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  maxRetries?: number;
  initialRetryDelay?: number;
}

export function useAgentStream(options: UseSSEOptions) {
  const { url, onMessage, onError, maxRetries = 5, initialRetryDelay = 1000 } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  const calculateRetryDelay = useCallback((attempt: number): number => {
    const delay = Math.min(initialRetryDelay * Math.pow(2, attempt), 30000);
    const jitter = delay * 0.3 * Math.random();
    return delay + jitter;
  }, [initialRetryDelay]);

  const connect = useCallback(() => {
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setRetryCount(0);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    };

    eventSource.onerror = (error) => {
      setIsConnected(false);
      eventSource.close();
      onError?.(error);

      if (retryCount < maxRetries) {
        const delay = calculateRetryDelay(retryCount);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          connect();
        }, delay);
      }
    };

    return eventSource;
  }, [url, onMessage, onError, retryCount, maxRetries, calculateRetryDelay]);

  useEffect(() => {
    const eventSource = connect();
    return () => {
      eventSource.close();
    };
  }, [connect]);

  return { isConnected };
}
```

Source: [React SSE Hook](https://oneuptime.com/blog/post/2026-01-15-server-sent-events-sse-react/view)

### Pattern 5: YAML Agent Configuration

**What:** Agent definitions in YAML with markdown skill injection.

**When to use:** Need human-readable, version-controllable agent configs.

**Example:**

```yaml
# agents/compliance-mapper.yaml
apiVersion: calmguard/v1
kind: Agent
metadata:
  name: compliance-mapper
  displayName: "Compliance Mapper"
  icon: "shield-check"
  color: "#22c55e"
spec:
  role: "Map CALM architecture controls to regulatory compliance frameworks"
  model:
    provider: google
    model: gemini-2.5-flash
    temperature: 0.2
  skills:
    - skills/SOX.md
    - skills/PCI-DSS.md
    - skills/FINOS-CCC.md
    - skills/NIST-CSF.md
  inputs:
    - type: parsed-architecture
  outputs:
    - type: compliance-mapping
  maxTokens: 4096
```

```typescript
// src/lib/agents/registry.ts
import { readFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import { join } from 'path';

interface AgentConfig {
  metadata: {
    name: string;
    displayName: string;
    icon: string;
    color: string;
  };
  spec: {
    role: string;
    model: { provider: string; model: string; temperature: number };
    skills: string[];
    inputs: { type: string }[];
    outputs: { type: string }[];
    maxTokens: number;
  };
}

export function loadAgentConfig(name: string): AgentConfig {
  const yamlPath = join(process.cwd(), 'agents', `${name}.yaml`);
  const yamlContent = readFileSync(yamlPath, 'utf-8');
  return parseYaml(yamlContent) as AgentConfig;
}

// Load skills (markdown files)
export function loadSkills(skillPaths: string[]): string {
  return skillPaths
    .map(path => readFileSync(join(process.cwd(), path), 'utf-8'))
    .join('\n\n---\n\n');
}
```

Sources:
- [Swarms YAML Agents](https://docs.swarms.world/en/latest/swarms/agents/create_agents_yaml/)
- [CrewAI YAML Config](https://docs.crewai.com/en/concepts/agents)

### Pattern 6: Parallel-Sequential Orchestration

**What:** Run multiple agents in parallel (Phase 1), aggregate results, run sequential agent (Phase 2).

**When to use:** Independent analysis tasks followed by aggregation step.

**Example:**

```typescript
// src/lib/agents/orchestrator.ts
export async function analyzeArchitecture(input: AnalysisInput) {
  // Phase 1: Parallel execution
  emitEvent({ type: 'phase-1-started', agents: 3 });

  const [archAnalysis, complianceMap, pipeline] = await Promise.all([
    architectureAnalyzer.analyze(input),
    complianceMapper.analyze(input),
    pipelineGenerator.analyze(input),
  ]);

  emitEvent({ type: 'phase-1-complete' });

  // Phase 2: Sequential aggregation
  emitEvent({ type: 'phase-2-started', agent: 'risk-scorer' });

  const riskScore = await riskScorer.analyze({
    architecture: archAnalysis,
    compliance: complianceMap,
    pipeline: pipeline,
  });

  return {
    architecture: archAnalysis,
    compliance: complianceMap,
    pipeline: pipeline,
    risk: riskScore,
  };
}
```

Sources:
- [AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Sequential vs Concurrent Orchestration](https://www.kore.ai/blog/choosing-the-right-orchestration-pattern-for-multi-agent-systems)

### Anti-Patterns to Avoid

- **Awaiting stream processing in route handler**: Return Response immediately, stream in background. Route handler completion blocks client response.
- **Missing `export const dynamic = 'force-dynamic'`**: Next.js will cache/buffer responses, breaking SSE streaming.
- **No retry logic for LLM validation failures**: LLMs produce malformed JSON ~5-10% of the time; always retry with backoff.
- **Closing EventSource without cleanup**: Memory leaks; always clean up in useEffect return.
- **Hardcoding provider in agent code**: Use provider registry for multi-provider flexibility.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| LLM provider abstraction | Custom OpenAI/Anthropic wrappers | Vercel AI SDK | Handles provider differences, streaming, retries, standardized API |
| Structured output validation | Manual JSON parsing + validation | AI SDK `generateObject` + Zod | Native integration, automatic retries, type safety |
| SSE client reconnection | Manual EventSource wrapper | React hook with exponential backoff | Edge cases (network loss, server restart, connection timeout) |
| Agent configuration format | Custom JSON schema | YAML with standardized fields | Human-readable, comments, multi-line strings for prompts |
| Compliance framework mapping | Custom control database | Existing mappings (PCI-to-NIST, ISO-to-SOC2) | Industry-standard mappings already exist |

**Key insight:** LLM structured output and streaming are deceptively complex. AI SDK handles provider quirks, retry logic, streaming protocols, and type safety. Custom implementations miss edge cases.

## Common Pitfalls

### Pitfall 1: SSE Streaming Buffering in Next.js

**What goes wrong:** SSE events don't arrive incrementally—client receives all at once after stream completes.

**Why it happens:** Next.js defaults to static optimization and caching. Without `export const dynamic = 'force-dynamic'`, route handlers buffer responses.

**How to avoid:**

```typescript
// REQUIRED at top of route file
export const dynamic = 'force-dynamic';
```

**Warning signs:**
- Events arrive in batches instead of real-time
- Network tab shows single large response instead of streaming chunks
- localhost works but Vercel deployment buffers

Sources:
- [Fixing Slow SSE Streaming](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996)
- [Next.js Streaming](https://github.com/vercel/next.js/discussions/47816)

### Pitfall 2: LLM Structured Output Validation Failures

**What goes wrong:** `generateObject` throws parsing errors for malformed JSON or schema violations.

**Why it happens:** LLMs occasionally produce invalid JSON (missing brackets, incorrect types, extra text). Rate ~5-10% depending on model and schema complexity.

**How to avoid:**

```typescript
// Retry with exponential backoff
async function generateWithRetry<T>(
  config: { model: any; schema: z.Schema<T>; prompt: string },
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { object } = await generateObject(config);
      return object;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      // Exponential backoff: 1s, 2s, 4s
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));

      // Add error feedback to next prompt
      config.prompt += `\n\nPrevious attempt failed with: ${error.message}. Please correct and output valid JSON matching the schema.`;
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Warning signs:**
- `NoObjectGeneratedError` exceptions
- Empty or partial structured output
- "Property X does not match schema" errors

Sources:
- [LLM Output Parsing Errors](https://apxml.com/courses/prompt-engineering-llm-application-development/chapter-7-output-parsing-validation-reliability/handling-parsing-errors)
- [Retry Mechanisms](https://apxml.com/courses/prompt-engineering-llm-application-development/chapter-7-output-parsing-validation-reliability/implementing-retry-mechanisms)

### Pitfall 3: EventSource Memory Leaks

**What goes wrong:** EventSource connections remain open after component unmount, causing memory leaks and duplicate event handlers.

**Why it happens:** Forgetting to close EventSource in useEffect cleanup.

**How to avoid:**

```typescript
useEffect(() => {
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    setData(JSON.parse(event.data));
  };

  // CRITICAL: Cleanup
  return () => {
    eventSource.close();
  };
}, [url]);
```

**Warning signs:**
- Multiple EventSource connections in Network tab
- Duplicate events firing
- Memory usage grows over time

### Pitfall 4: Provider API Key Missing at Runtime

**What goes wrong:** Application crashes with "API key not found" in production.

**Why it happens:** Environment variables not set in deployment platform (Vercel).

**How to avoid:**

```typescript
// Provider registry with validation
export function createProviderRegistry() {
  const providers: any = {};

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    providers.google = google;
  }
  if (process.env.ANTHROPIC_API_KEY) {
    providers.anthropic = anthropic;
  }
  if (process.env.OPENAI_API_KEY) {
    providers.openai = openai;
  }

  if (Object.keys(providers).length === 0) {
    throw new Error('No LLM provider API keys configured. Set at least one: GOOGLE_GENERATIVE_AI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY');
  }

  return createProviderRegistry(providers);
}
```

**Warning signs:**
- Works locally, fails in production
- "Unauthorized" or "Invalid API key" errors
- Provider initialization errors

### Pitfall 5: YAML Agent Config Load Failures

**What goes wrong:** Agent registry fails to load YAML files with cryptic errors.

**Why it happens:** Incorrect paths (CWD differs in dev vs production), missing files, YAML syntax errors.

**How to avoid:**

```typescript
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';

export function loadAgentConfig(name: string): AgentConfig {
  const yamlPath = join(process.cwd(), 'agents', `${name}.yaml`);

  if (!existsSync(yamlPath)) {
    throw new Error(`Agent config not found: ${yamlPath}`);
  }

  try {
    const yamlContent = readFileSync(yamlPath, 'utf-8');
    return parseYaml(yamlContent) as AgentConfig;
  } catch (error) {
    throw new Error(`Failed to parse ${yamlPath}: ${error.message}`);
  }
}
```

**Warning signs:**
- "File not found" errors
- YAML parsing exceptions
- Agent registry returns empty configs

## Code Examples

Verified patterns from official sources and research:

### Complete SSE Route Handler

```typescript
// src/app/api/analyze/route.ts
import { NextRequest } from 'next/server';
import { orchestrator } from '@/lib/agents/orchestrator';
import { agentEventEmitter } from '@/lib/ai/streaming';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const calmJson = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Subscribe to global event emitter
      const unsubscribe = agentEventEmitter.on((event) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      });

      // Start analysis in background
      try {
        const result = await orchestrator.analyze(calmJson);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`)
        );
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`)
        );
      } finally {
        unsubscribe();
        controller.close();
      }

      // Cleanup on client disconnect
      req.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
```

### Agent Implementation with generateObject

```typescript
// src/lib/agents/compliance-mapper.ts
import { generateObject } from 'ai';
import { z } from 'zod';
import { registry } from '@/lib/ai/provider';
import { loadSkills } from './registry';
import { emitAgentEvent } from '@/lib/ai/streaming';

const complianceMappingSchema = z.object({
  frameworkMappings: z.array(z.object({
    framework: z.enum(['SOX', 'PCI-DSS', 'CCC', 'NIST-CSF']),
    controlId: z.string(),
    calmControlId: z.string(),
    status: z.enum(['compliant', 'partial', 'non-compliant', 'not-applicable']),
    evidence: z.string(),
    recommendation: z.string(),
    severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  })),
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
});

export async function analyzeCompliance(input: AnalysisInput) {
  emitAgentEvent({ type: 'started', agent: 'compliance-mapper' });

  // Load skill knowledge
  const skills = loadSkills([
    'skills/SOX.md',
    'skills/PCI-DSS.md',
    'skills/FINOS-CCC.md',
    'skills/NIST-CSF.md',
  ]);

  const prompt = `
You are a compliance expert. Analyze this CALM architecture and map controls to regulatory frameworks.

# Compliance Knowledge
${skills}

# Architecture to Analyze
${JSON.stringify(input, null, 2)}

Map each CALM control to applicable framework requirements. Assess compliance status and provide recommendations.
  `;

  emitAgentEvent({ type: 'thinking', agent: 'compliance-mapper', message: 'Analyzing controls...' });

  const { object } = await generateObject({
    model: registry.languageModel('google:gemini-2.5-flash'),
    schema: complianceMappingSchema,
    prompt,
  });

  // Emit findings
  object.frameworkMappings
    .filter(m => m.status !== 'compliant')
    .forEach(finding => {
      emitAgentEvent({
        type: 'finding',
        agent: 'compliance-mapper',
        severity: finding.severity,
        message: `${finding.framework}: ${finding.controlId} - ${finding.status}`,
      });
    });

  emitAgentEvent({ type: 'completed', agent: 'compliance-mapper' });

  return object;
}
```

### Global Event Emitter for SSE

```typescript
// src/lib/ai/streaming.ts
import { EventEmitter } from 'events';

export interface AgentEvent {
  type: 'started' | 'thinking' | 'finding' | 'completed' | 'error';
  agent: string;
  message?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  data?: any;
  timestamp: string;
}

class AgentEventEmitter extends EventEmitter {
  emit(event: AgentEvent): boolean {
    return super.emit('agent-event', event);
  }

  on(listener: (event: AgentEvent) => void): () => void {
    super.on('agent-event', listener);
    return () => this.off('agent-event', listener);
  }
}

export const agentEventEmitter = new AgentEventEmitter();

export function emitAgentEvent(event: Omit<AgentEvent, 'timestamp'>) {
  agentEventEmitter.emit({
    ...event,
    timestamp: new Date().toISOString(),
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `generateObject` function | `generateText` with `output` property | AI SDK 5.0 (July 2025) | `generateObject` deprecated but still works; migrate to modern API |
| Manual JSON parsing | Zod + `generateObject` | 2024-2025 | Type safety, validation, retry logic built-in |
| WebSockets for streaming | Server-Sent Events (SSE) | Ongoing | SSE simpler for one-way streams, works with serverless |
| JSON agent configs | YAML agent configs | 2025-2026 | Human-readable, comments, multi-line strings |
| Hardcoded compliance mappings | Framework mapping standards (PCI-to-NIST, CIS) | Ongoing | Industry standard mappings reduce custom work |

**Deprecated/outdated:**

- **`generateObject` as standalone function**: Use `generateText({ output: Output.object(schema) })` in new code (AI SDK 5+). Legacy function still works but will be removed in future major version.
- **OpenAI-specific SDKs**: Use AI SDK multi-provider abstraction instead of `openai` package directly.
- **Manual retry logic**: AI SDK handles retries internally; configure via provider options.

## Open Questions

1. **FINOS CCC Control Format**
   - What we know: CCC controls are YAML-based, cloud-agnostic, focused on financial services cybersecurity/resiliency/compliance
   - What's unclear: Exact schema structure, how to programmatically access controls (GitHub repo has specs but no npm package)
   - Recommendation: Parse CCC controls from GitHub releases during build, create control mapping table in `skills/FINOS-CCC.md`

2. **AI SDK Provider Priority**
   - What we know: PLAN.md specifies Gemini as default but doesn't specify fallback order
   - What's unclear: Should we try Anthropic → OpenAI → Ollama in sequence if Gemini fails?
   - Recommendation: Configure provider priority via environment variable: `LLM_PROVIDER_PRIORITY=google,anthropic,openai,ollama`

3. **LLM Retry Budget**
   - What we know: 3 retries with exponential backoff is standard
   - What's unclear: For hackathon demo reliability, should we increase to 5 retries or use multiple providers as fallback?
   - Recommendation: 3 retries per provider, then try next provider in priority list. Max 2 providers per agent call (6 total attempts).

4. **SSE Connection Limits**
   - What we know: Browsers limit SSE connections to ~6 per domain
   - What's unclear: If dashboard connects to both `/api/analyze` and `/api/agents`, does this cause issues?
   - Recommendation: Use single SSE endpoint (`/api/analyze`) that streams all events. Avoid parallel connections.

## Sources

### Primary (HIGH confidence)

- [AI SDK Core Overview](https://ai-sdk.dev/docs/ai-sdk-core/overview) - generateObject, multi-provider, Zod integration
- [AI SDK Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) - generateObject usage, error handling
- [AI SDK Providers](https://ai-sdk.dev/providers/ai-sdk-providers) - Google, Anthropic, OpenAI, xAI, Ollama
- [AI SDK Provider Management](https://ai-sdk.dev/docs/ai-sdk-core/provider-management) - Provider registry pattern
- [AI SDK streamText Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text) - Streaming API, callbacks
- [AI SDK streamObject Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-object) - Streaming structured data (deprecated)
- [Next.js SSE Tutorial](https://www.pedroalonso.net/blog/sse-nextjs-real-time-notifications/) - Complete route handler + client hook
- [React SSE Hook](https://oneuptime.com/blog/post/2026-01-15-server-sent-events-sse-react/view) - useSSE implementation with reconnection
- [Swarms YAML Agents](https://docs.swarms.world/en/latest/swarms/agents/create_agents_yaml/) - YAML agent config schema
- [CrewAI YAML Config](https://docs.crewai.com/en/concepts/agents) - Agent role/goal definitions

### Secondary (MEDIUM confidence)

- [AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) - Parallel/sequential patterns (Azure-specific)
- [Multi-Agent Orchestration](https://www.kore.ai/blog/choosing-the-right-orchestration-pattern-for-multi-agent-systems) - Sequential vs concurrent
- [FINOS CCC Project](https://www.finos.org/common-cloud-controls-project) - Common Cloud Controls overview
- [CCC GitHub](https://github.com/finos/common-cloud-controls) - Control definitions, structure
- [LinkedIn SAST Pipeline](https://www.infoq.com/news/2026/02/linkedin-redesigns-sast-pipeline/) - GitHub Actions + CodeQL + Semgrep
- [PCI-DSS to NIST Mapping](https://www.cisecurity.org/cybersecurity-tools/mapping-compliance) - Framework mapping approach
- [LLM Retry Mechanisms](https://apxml.com/courses/prompt-engineering-llm-application-development/chapter-7-output-parsing-validation-reliability/implementing-retry-mechanisms) - Exponential backoff, error feedback

### Tertiary (LOW confidence)

- [AI Agent Orchestration 2026](https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2026/ai-agent-orchestration.html) - Market outlook (Deloitte report, high-level)
- [AI SDK Provider Registry Template](https://vercel.com/templates/next.js/ai-sdk-provider-registry) - Vercel template (not full docs)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Official AI SDK docs, npm package versions confirmed, patterns verified in recent articles (Jan-Feb 2026)
- Architecture: HIGH - SSE patterns verified in Next.js 15 tutorials, AI SDK examples from official docs, orchestration patterns from multiple sources
- Pitfalls: MEDIUM-HIGH - SSE buffering issue verified in multiple Next.js discussions, LLM retry patterns from educational sources, EventSource cleanup from MDN/React docs

**Research date:** 2026-02-16
**Valid until:** ~2026-03-16 (30 days - AI SDK is stable, Next.js 15 is current, patterns unlikely to change rapidly)

**Key gaps addressed:**

✅ Multi-provider AI SDK setup (provider registry pattern)
✅ SSE streaming in Next.js 15 (force-dynamic export)
✅ Structured output with Zod + retry logic
✅ YAML agent configuration format
✅ Compliance framework mapping approach
✅ EventSource reconnection patterns
❓ FINOS CCC programmatic access (manual parsing needed)
❓ Optimal retry budget for demo reliability (recommend 3 + fallback provider)
