import { createProviderRegistry } from 'ai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import type { AgentConfig } from '@/lib/agents/types';

/**
 * NOTE: AI SDK 5.x deprecates generateObject in favor of generateText with `output` property.
 * We're using generateObject for now (still works, simpler API) - migration can happen later.
 */

/**
 * Build provider registry object conditionally based on available API keys
 */
const providers: Record<string, any> = {};

if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  providers.google = google;
}

if (process.env.ANTHROPIC_API_KEY) {
  providers.anthropic = anthropic;
}

if (process.env.OPENAI_API_KEY) {
  providers.openai = openai;
}

if (process.env.XAI_API_KEY) {
  providers.xai = xai;
}

/**
 * Multi-provider registry
 * Resolves model strings like "google:gemini-2.5-flash" to actual provider models
 *
 * NOTE: Registry may have zero providers at build time (no API keys in CI).
 * Validation is deferred to first use in getDefaultModel/getModelForAgent.
 */
export const registry = createProviderRegistry(providers);

/**
 * Validate that at least one LLM provider is configured.
 * Called by getDefaultModel/getModelForAgent at runtime — not at module initialization
 * to allow Next.js to build without API keys (build-time static analysis).
 */
function assertProviderConfigured(): void {
  if (Object.keys(providers).length === 0) {
    throw new Error(
      'No LLM provider API keys configured. Set at least one of: GOOGLE_GENERATIVE_AI_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, XAI_API_KEY'
    );
  }
}

/**
 * Get default model with fallback chain
 * Priority: Google Gemini → Anthropic Claude → OpenAI GPT-4o → xAI Grok
 */
export function getDefaultModel() {
  assertProviderConfigured();

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return registry.languageModel('google:gemini-2.0-flash-exp');
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return registry.languageModel('anthropic:claude-sonnet-4-20250514');
  }

  if (process.env.OPENAI_API_KEY) {
    return registry.languageModel('openai:gpt-4o');
  }

  if (process.env.XAI_API_KEY) {
    return registry.languageModel('xai:grok-2-1212');
  }

  // This should never happen due to the earlier validation check
  throw new Error('No LLM provider available');
}

/**
 * Resolve model from agent config
 * @param config - Agent configuration with provider and model spec
 * @returns Language model instance from registry
 */
export function getModelForAgent(config: AgentConfig) {
  assertProviderConfigured();
  const modelString = `${config.spec.model.provider}:${config.spec.model.model}` as `${string}:${string}`;
  return registry.languageModel(modelString);
}
