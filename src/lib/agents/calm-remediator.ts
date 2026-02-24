import { z } from 'zod';
import { generateObject } from 'ai';
import { loadAgentConfig } from './registry';
import { getModelForAgent, getDefaultModel } from '@/lib/ai/provider';
import { emitAgentEvent } from '@/lib/ai/streaming';
import { type AgentResult, type AgentIdentity } from './types';
import { calmDocumentSchema, type CalmDocument } from '@/lib/calm/types';
import type { ComplianceMapping } from './compliance-mapper';
import type { RiskAssessment } from './risk-scorer';

/**
 * CALM Remediation Output Schema
 * Structured output from the CALM remediator agent:
 * - remediatedCalm: the full modified CALM document
 * - changes: per-change explanations with before/after and rationale
 * - summary: human-readable summary of all changes made
 */
export const calmRemediationOutputSchema = z.object({
  remediatedCalm: calmDocumentSchema,
  changes: z.array(
    z.object({
      nodeOrRelationshipId: z.string(),
      changeType: z.enum(['protocol-upgrade', 'control-added']),
      description: z.string(),
      rationale: z.string(),
      before: z.string(),
      after: z.string(),
    })
  ),
  summary: z.string(),
});

export type CalmRemediationOutput = z.infer<typeof calmRemediationOutputSchema>;

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Remediate a CALM document to address compliance gaps
 *
 * Analyzes compliance findings and risk assessment, then modifies the CALM document to:
 * 1. Upgrade weak protocols to secure equivalents (HTTP→HTTPS, FTP→SFTP, etc.)
 * 2. Add missing security controls to nodes and relationships
 *
 * Emits SSE events during execution and returns structured remediation output.
 *
 * @param originalCalm - The original CALM document to remediate
 * @param compliance - Compliance mapping with identified gaps
 * @param risk - Risk assessment with top findings
 * @returns AgentResult with CalmRemediationOutput data
 */
export async function remediateCalm(
  originalCalm: CalmDocument,
  compliance: ComplianceMapping,
  risk: RiskAssessment,
): Promise<AgentResult<CalmRemediationOutput>> {
  const startTime = performance.now();
  const agentName = 'calm-remediator';

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
      message: 'CALM Remediator started',
    });

    // Build prompt
    const prompt = `${config.spec.role}

You are remediating a CALM v1.1 architecture document to address compliance gaps.

**ORIGINAL CALM DOCUMENT:**
${JSON.stringify(originalCalm, null, 2)}

**COMPLIANCE GAPS IDENTIFIED:**
${JSON.stringify(compliance.gaps, null, 2)}

**NON-COMPLIANT FRAMEWORK MAPPINGS:**
${JSON.stringify(compliance.frameworkMappings.filter((m) => m.status !== 'compliant'), null, 2)}

**TOP RISK FINDINGS:**
${JSON.stringify(risk.topFindings, null, 2)}

**TASK:**
Modify the CALM document to address the compliance gaps and risk findings:

1. **Protocol Upgrades** — Upgrade weak protocols to their secure equivalents:
   - HTTP → HTTPS
   - LDAP → TLS (LDAPS is not in the CALM enum; use TLS as the protocol and add a control noting LDAP+TLS)
   - TCP → TLS
   - FTP → SFTP
   Only upgrade protocols that appear in the original document's relationships.

2. **Add Missing Controls** — For each compliance gap, add a control to the relevant node or relationship:
   - Use the control key format: {framework}-{controlId} (e.g., "pci-dss-req-4.1")
   - Include a description explaining the control
   - Add a requirement with a requirement-url pointing to the framework spec (use https://example.com/{framework}/{controlId} as placeholder URL)

3. **Document Every Change** — For each modification, add an entry to the changes array with:
   - nodeOrRelationshipId: the unique-id of the modified node/relationship
   - changeType: 'protocol-upgrade' or 'control-added'
   - description: what was changed (human-readable)
   - rationale: why it was changed (reference the compliance gap or risk finding)
   - before: the value before modification
   - after: the value after modification

Return the COMPLETE modified document (all nodes, relationships, controls, flows) plus the changes array.`;

    // Emit thinking event
    emitAgentEvent({
      type: 'thinking',
      agent: agentIdentity,
      message: 'Analyzing compliance gaps and generating remediation...',
    });

    // Call generateObject with retry logic (exponential backoff: 1s, 2s, 4s)
    let result: CalmRemediationOutput | null = null;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await generateObject({
          model,
          schema: calmRemediationOutputSchema,
          prompt:
            attempt === 0
              ? prompt
              : `${prompt}\n\nPREVIOUS ERROR: ${lastError?.message}\n\nPlease try again with valid output. Remember: protocol values MUST be exactly one of: HTTP, HTTPS, FTP, SFTP, JDBC, WebSocket, SocketIO, LDAP, AMQP, TLS, mTLS, TCP. Node-type values MUST be exactly one of: actor, ecosystem, system, service, database, network, ldap, webclient, data-asset.`,
        });

        result = response.object;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[CALM Remediator] Attempt ${attempt + 1} failed:`, lastError.message); // nosemgrep: unsafe-formatstring

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

    // Emit finding events for each change
    for (const change of result.changes) {
      emitAgentEvent({
        type: 'finding',
        agent: agentIdentity,
        message: `${change.changeType}: ${change.description}`,
        severity: change.changeType === 'protocol-upgrade' ? 'high' : 'medium',
        data: {
          changeType: change.changeType,
          nodeOrRelationshipId: change.nodeOrRelationshipId,
        },
      });
    }

    // Emit completed event
    emitAgentEvent({
      type: 'completed',
      agent: agentIdentity,
      message: `Remediation complete: ${result.changes.length} changes — ${result.changes.filter((c) => c.changeType === 'protocol-upgrade').length} protocol upgrades, ${result.changes.filter((c) => c.changeType === 'control-added').length} controls added`,
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
        displayName: 'CALM Remediator',
        icon: 'shield-plus',
        color: '#10b981',
      },
      message: `Remediation failed: ${errorMessage}`,
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
