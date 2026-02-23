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

// Immediate validation - fail fast if no providers configured
if (Object.keys(providers).length === 0) {
  throw new Error(
    'No LLM provider API keys configured. Set at least one of: GOOGLE_GENERATIVE_AI_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, XAI_API_KEY'
  );
}

/**
 * Multi-provider registry
 * Resolves model strings like "google:gemini-2.5-flash" to actual provider models
 */
export const registry = createProviderRegistry(providers);

/**
 * Get default model with fallback chain
 * Priority: Google Gemini → Anthropic Claude → OpenAI GPT-4o → xAI Grok
 */
export function getDefaultModel() {
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
  const modelString = `${config.spec.model.provider}:${config.spec.model.model}` as `${string}:${string}`;
  return registry.languageModel(modelString);
}
