import { z } from 'zod';
import { loadAgentConfig } from './registry';
import { emitAgentEvent } from '@/lib/ai/streaming';
import type { AgentIdentity } from './types';
import type { AnalysisInput } from '@/lib/calm/extractor';
import { analyzeArchitecture, type ArchitectureAnalysis, architectureAnalysisSchema } from './architecture-analyzer';
import { mapCompliance, type ComplianceMapping, complianceMappingSchema } from './compliance-mapper';
import { generatePipeline, type PipelineConfig, pipelineConfigSchema } from './pipeline-generator';
import { scoreRisk, type RiskAssessment, riskAssessmentSchema } from './risk-scorer';

/**
 * Analysis Result Schema
 * Combines outputs from all 4 agents with execution metadata
 */
export const analysisResultSchema = z.object({
  architecture: architectureAnalysisSchema.nullable(),
  compliance: complianceMappingSchema.nullable(),
  pipeline: pipelineConfigSchema.nullable(),
  risk: riskAssessmentSchema.nullable(),
  duration: z.number(),
  completedAgents: z.array(z.string()),
  failedAgents: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

/**
 * Run complete analysis orchestration
 *
 * Coordinates all 4 agents:
 * - Phase 1 (Parallel): Architecture Analyzer, Compliance Mapper, Pipeline Generator
 * - Phase 2 (Sequential): Risk Scorer (requires Phase 1 results)
 *
 * Uses Promise.allSettled for graceful degradation - one agent failure doesn't cancel others.
 *
 * @param input - CALM analysis input
 * @returns AnalysisResult with all agent outputs (null for failed agents)
 */
export async function runAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
  const startTime = performance.now();

  try {
    // Load orchestrator configuration
    const config = loadAgentConfig('orchestrator');

    // Construct AgentIdentity from config metadata
    const agentIdentity: AgentIdentity = {
      name: config.metadata.name,
      displayName: config.metadata.displayName,
      icon: config.metadata.icon,
      color: config.metadata.color,
    };

    // Emit orchestrator started event
    emitAgentEvent({
      type: 'started',
      agent: agentIdentity,
      message: 'Orchestrator started - coordinating 4 AI agents',
    });

    // Track completed and failed agents
    const completedAgents: string[] = [];
    const failedAgents: string[] = [];

    // Initialize result containers
    let architecture: ArchitectureAnalysis | null = null;
    let compliance: ComplianceMapping | null = null;
    let pipeline: PipelineConfig | null = null;
    let risk: RiskAssessment | null = null;

    // ========================================================================
    // PHASE 1: Parallel execution (Architecture Analyzer, Compliance Mapper, Pipeline Generator)
    // ========================================================================

    emitAgentEvent({
      type: 'thinking',
      agent: agentIdentity,
      message: 'Running Architecture Analyzer, Compliance Mapper, and Pipeline Generator in parallel...',
    });

    const phase1Results = await Promise.allSettled([
      analyzeArchitecture(input),
      mapCompliance(input),
      generatePipeline(input),
    ]);

    // Extract Architecture Analyzer result
    const archResult = phase1Results[0];
    if (archResult.status === 'fulfilled' && archResult.value.success && archResult.value.data) {
      architecture = archResult.value.data;
      completedAgents.push('architecture-analyzer');
    } else {
      const error = archResult.status === 'rejected'
        ? archResult.reason
        : archResult.value.error || 'Unknown error';
      failedAgents.push('architecture-analyzer');

      emitAgentEvent({
        type: 'finding',
        agent: agentIdentity,
        message: `Architecture Analyzer failed: ${error}`,
        severity: 'critical',
      });
    }

    // Extract Compliance Mapper result
    const compResult = phase1Results[1];
    if (compResult.status === 'fulfilled' && compResult.value.success && compResult.value.data) {
      compliance = compResult.value.data;
      completedAgents.push('compliance-mapper');
    } else {
      const error = compResult.status === 'rejected'
        ? compResult.reason
        : compResult.value.error || 'Unknown error';
      failedAgents.push('compliance-mapper');

      emitAgentEvent({
        type: 'finding',
        agent: agentIdentity,
        message: `Compliance Mapper failed: ${error}`,
        severity: 'critical',
      });
    }

    // Extract Pipeline Generator result
    const pipeResult = phase1Results[2];
    if (pipeResult.status === 'fulfilled' && pipeResult.value.success && pipeResult.value.data) {
      pipeline = pipeResult.value.data;
      completedAgents.push('pipeline-generator');
    } else {
      const error = pipeResult.status === 'rejected'
        ? pipeResult.reason
        : pipeResult.value.error || 'Unknown error';
      failedAgents.push('pipeline-generator');

      emitAgentEvent({
        type: 'finding',
        agent: agentIdentity,
        message: `Pipeline Generator failed: ${error}`,
        severity: 'critical',
      });
    }

    // ========================================================================
    // PHASE 2: Sequential execution (Risk Scorer requires Phase 1 results)
    // ========================================================================

    // Risk Scorer requires at least Architecture AND Compliance to run
    if (architecture && compliance) {
      emitAgentEvent({
        type: 'thinking',
        agent: agentIdentity,
        message: 'Running Risk Scorer with aggregated results...',
      });

      try {
        const riskResult = await scoreRisk({
          architecture,
          compliance,
          pipeline: pipeline || {
            githubActions: { name: 'N/A', yaml: '' },
            securityScanning: { tools: [], summary: 'Pipeline generation failed' },
            infrastructureAsCode: { provider: 'terraform', config: '' },
            recommendations: [],
            summary: 'Pipeline data unavailable',
          },
          originalInput: input,
        });

        if (riskResult.success && riskResult.data) {
          risk = riskResult.data;
          completedAgents.push('risk-scorer');
        } else {
          failedAgents.push('risk-scorer');

          emitAgentEvent({
            type: 'finding',
            agent: agentIdentity,
            message: `Risk Scorer failed: ${riskResult.error || 'Unknown error'}`,
            severity: 'high',
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        failedAgents.push('risk-scorer');

        emitAgentEvent({
          type: 'finding',
          agent: agentIdentity,
          message: `Risk Scorer failed: ${errorMessage}`,
          severity: 'high',
        });
      }
    } else {
      // Skip Risk Scorer if prerequisites missing
      failedAgents.push('risk-scorer');

      const missingAgents = [];
      if (!architecture) missingAgents.push('Architecture Analyzer');
      if (!compliance) missingAgents.push('Compliance Mapper');

      emitAgentEvent({
        type: 'finding',
        agent: agentIdentity,
        message: `Risk Scorer skipped: Missing required inputs from ${missingAgents.join(' and ')}`,
        severity: 'high',
      });
    }

    // ========================================================================
    // Complete orchestration
    // ========================================================================

    const duration = performance.now() - startTime;

    const successCount = completedAgents.length;
    const totalCount = 4;

    emitAgentEvent({
      type: 'completed',
      agent: agentIdentity,
      message: `Analysis complete: ${successCount}/${totalCount} agents succeeded`,
    });

    return {
      architecture,
      compliance,
      pipeline,
      risk,
      duration,
      completedAgents,
      failedAgents,
    };
  } catch (error) {
    // Catastrophic error (e.g., no LLM providers configured)
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Emit error event with fallback identity if config load failed
    emitAgentEvent({
      type: 'error',
      agent: {
        name: 'orchestrator',
        displayName: 'Orchestrator',
        icon: 'layers',
        color: 'slate',
      },
      message: `Orchestration failed: ${errorMessage}`,
      severity: 'critical',
    });

    // Re-throw to signal complete failure
    throw error;
  }
}
