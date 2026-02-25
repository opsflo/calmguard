import { z } from 'zod';
import { generateObject } from 'ai';
import { loadAgentConfig } from './registry';
import { getModelForAgent, getDefaultModel } from '@/lib/ai/provider';
import { emitAgentEvent } from '@/lib/ai/streaming';
import { type AgentResult, type AgentIdentity } from './types';
import type { AnalysisInput } from '@/lib/calm/extractor';

/**
 * Pipeline Config Schema
 * Defines the structured output for CI/CD pipeline generation
 */
export const pipelineConfigSchema = z.object({
  githubActions: z.object({
    name: z.string(),
    yaml: z.string().describe('Complete multi-line GitHub Actions YAML workflow. MUST use literal newline characters (\\n) to separate lines — never put the whole YAML on a single line. Indent nested YAML keys with 2 spaces after each newline.'),
  }),
  securityScanning: z.object({
    tools: z.array(
      z.object({
        name: z.enum(['semgrep', 'codeql', 'trivy', 'npm-audit']),
        description: z.string(),
        config: z.string().describe('Multi-line tool configuration. MUST use literal newline characters (\\n) to separate lines.'),
      })
    ),
    summary: z.string(),
  }),
  infrastructureAsCode: z.object({
    provider: z.enum(['terraform', 'cloudformation']),
    config: z.string().describe('Complete multi-line Terraform HCL or CloudFormation YAML. MUST use literal newline characters (\\n) to separate lines — never put the entire config on a single line. Indent nested blocks with 2 spaces.'),
  }),
  recommendations: z.array(
    z.object({
      category: z.enum(['ci-cd', 'security', 'infrastructure', 'monitoring']),
      recommendation: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
    })
  ),
  summary: z.string(),
});

export type PipelineConfig = z.infer<typeof pipelineConfigSchema>;

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate CI/CD pipeline configuration
 *
 * Creates GitHub Actions workflow, security scanning configs, and IaC templates.
 * Emits SSE events during execution.
 *
 * @param input - CALM analysis input with nodes, relationships, controls
 * @returns AgentResult with PipelineConfig data
 */
export async function generatePipeline(
  input: AnalysisInput
): Promise<AgentResult<PipelineConfig>> {
  const startTime = performance.now();
  const agentName = 'pipeline-generator';

  try {
    // Load agent configuration
    const config = loadAgentConfig(agentName);

    // Construct AgentIdentity from config metadata
    const agentIdentity: AgentIdentity = {
      name: config.metadata.name,
      displayName: config.metadata.displayName,
      icon: config.metadata.icon,
      color: config.metadata.color,
    };

    // Get model (prefer agent config, fallback to default)
    let model;
    try {
      model = getModelForAgent(config);
    } catch {
      model = getDefaultModel();
    }

    // Emit started event
    emitAgentEvent({
      type: 'started',
      agent: agentIdentity,
      message: 'Pipeline Generator started',
    });

    // Build prompt
    const prompt = `${config.spec.role}

You are generating CI/CD pipeline configurations for a CALM architecture definition.

**INPUT:**
${JSON.stringify(input, null, 2)}

**TASK:**
Generate production-ready CI/CD and infrastructure configurations:

1. **GitHub Actions Workflow**: Complete YAML with stages:
   - Lint and type checking
   - Build
   - Test (unit, integration)
   - Security scanning
   - Deploy (with environment gates)
   - Include appropriate triggers (push, pull_request)

2. **Security Scanning Tools**: Configure based on node types and protocols:
   - Semgrep: For code security patterns
   - CodeQL: For vulnerability detection
   - Trivy: For container/dependency scanning
   - npm-audit: For Node.js dependency vulnerabilities
   - Provide complete config files as strings

3. **Infrastructure as Code**: Generate Terraform or CloudFormation based on architecture:
   - Network infrastructure (VPCs, subnets, security groups)
   - Compute resources (based on node types)
   - Databases (based on database nodes)
   - Load balancers and API gateways
   - Include security controls from CALM definition

4. **Recommendations**: Actionable recommendations for:
   - CI/CD improvements (caching, parallelization, secrets management)
   - Security enhancements (SAST, DAST, dependency scanning)
   - Infrastructure optimizations (cost, performance, reliability)
   - Monitoring and observability

**GUIDELINES:**
- Use realistic, production-ready configurations
- Include comments explaining key sections
- Consider node types and protocols when generating configs
- Apply security controls from CALM definition to pipeline
- Be specific in recommendations (not generic advice)

**CRITICAL FORMATTING RULE:**
All YAML and HCL config strings MUST be properly formatted with real newline characters.
Each line of YAML/HCL/config must be separated by a newline character (\\n in the JSON string).
Example of CORRECT yaml field value: "name: ci\\non:\\n  push:\\n    branches: [main]\\njobs:\\n  build:\\n    runs-on: ubuntu-latest"
Example of WRONG yaml field value: "name: ci on: push: branches: [main] jobs: build: runs-on: ubuntu-latest"
Never compress multi-line configs into a single line.

Provide structured output matching the schema.`;

    // Emit thinking event
    emitAgentEvent({
      type: 'thinking',
      agent: agentIdentity,
      message: 'Generating CI/CD pipeline and security scanning configurations...',
    });

    // Call generateObject with retry logic
    let result: PipelineConfig | null = null;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await generateObject({
          model,
          schema: pipelineConfigSchema,
          prompt: attempt === 0 ? prompt : `${prompt}\n\nPREVIOUS ERROR: ${lastError?.message}\n\nPlease try again with valid output.`,
        });

        result = response.object;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[Pipeline Generator] Attempt ${attempt + 1} failed:`, lastError.message); // nosemgrep: unsafe-formatstring

        if (attempt < 2) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 1000;
          await sleep(delay);
        }
      }
    }

    if (!result) {
      throw new Error(`Failed after 3 attempts: ${lastError?.message || 'Unknown error'}`);
    }

    // Emit finding events for high-priority recommendations
    for (const rec of result.recommendations.filter((r) => r.priority === 'high')) {
      emitAgentEvent({
        type: 'finding',
        agent: agentIdentity,
        message: `${rec.category}: ${rec.recommendation}`,
        severity: 'high',
        data: {
          category: rec.category,
          priority: rec.priority,
        },
      });
    }

    // Emit completed event
    emitAgentEvent({
      type: 'completed',
      agent: agentIdentity,
      message: `Pipeline generation complete: GitHub Actions workflow, ${result.securityScanning.tools.length} security tools, ${result.recommendations.length} recommendations`,
    });

    const duration = performance.now() - startTime;

    return {
      agentName,
      success: true,
      data: result,
      duration,
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Emit error event
    emitAgentEvent({
      type: 'error',
      agent: {
        name: agentName,
        displayName: 'Pipeline Generator',
        icon: 'git-branch',
        color: 'purple',
      },
      message: `Pipeline generation failed: ${errorMessage}`,
      severity: 'critical',
    });

    return {
      agentName,
      success: false,
      error: errorMessage,
      duration,
    };
  }
}
