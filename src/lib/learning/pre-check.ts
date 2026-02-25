import type { AnalysisInput } from '@/lib/calm/extractor';
import type { DeterministicRule, PreCheckResult } from './types';

/**
 * Check if a CALM input matches a rule's trigger conditions.
 *
 * Logic: AND across non-empty trigger categories, OR within each category.
 * - If rule requires protocols ['HTTP'] and nodeTypes ['database'], input must have
 *   at least one HTTP protocol AND at least one database node.
 * - Empty trigger arrays are ignored (always match).
 */
function matchesTriggers(
  input: AnalysisInput,
  triggers: DeterministicRule['triggers'],
): { matches: boolean; matchedNodes: string[]; matchedRelationships: string[] } {
  const matchedNodes: string[] = [];
  const matchedRelationships: string[] = [];

  // Check protocols (OR within)
  if (triggers.protocols.length > 0) {
    const inputProtocols = new Set(input.metadata.protocols);
    const hasMatch = triggers.protocols.some(p => inputProtocols.has(p));
    if (!hasMatch) return { matches: false, matchedNodes: [], matchedRelationships: [] };

    // Track which relationships matched
    for (const rel of input.relationships) {
      if (rel.protocol && triggers.protocols.includes(rel.protocol)) {
        matchedRelationships.push(rel['unique-id']);
      }
    }
  }

  // Check node types (OR within)
  if (triggers.nodeTypes.length > 0) {
    const inputNodeTypes = new Set(Object.keys(input.metadata.nodeTypes));
    const hasMatch = triggers.nodeTypes.some(nt => inputNodeTypes.has(nt));
    if (!hasMatch) return { matches: false, matchedNodes: [], matchedRelationships: [] };

    // Track which nodes matched
    for (const node of input.nodes) {
      if (triggers.nodeTypes.includes(node['node-type'])) {
        matchedNodes.push(node['unique-id']);
      }
    }
  }

  // Check relationship types (OR within)
  if (triggers.relationshipTypes.length > 0) {
    const inputRelTypes = new Set(Object.keys(input.metadata.relationshipTypes));
    const hasMatch = triggers.relationshipTypes.some(rt => inputRelTypes.has(rt));
    if (!hasMatch) return { matches: false, matchedNodes: [], matchedRelationships: [] };
  }

  // Check missing controls (OR within — at least one required control is absent)
  if (triggers.missingControls.length > 0) {
    const inputControlKeys = new Set(Object.keys(input.controls));
    // Also collect controls from all nodes
    const allNodeControls = new Set<string>();
    for (const node of input.nodes) {
      if (node.controls) {
        for (const key of Object.keys(node.controls)) {
          allNodeControls.add(key);
        }
      }
    }

    const allControls = new Set([...inputControlKeys, ...allNodeControls]);
    const hasMissing = triggers.missingControls.some(mc => !allControls.has(mc));
    if (!hasMissing) return { matches: false, matchedNodes: [], matchedRelationships: [] };
  }

  return { matches: true, matchedNodes, matchedRelationships };
}

/**
 * Run deterministic pre-checks against CALM input using promoted rules.
 *
 * This is the instant, reproducible layer that fires before the LLM.
 * Each promoted rule checks structural conditions in the CALM document
 * and produces findings without any AI calls.
 *
 * @param input - CALM analysis input
 * @param rules - Array of promoted deterministic rules
 * @returns Array of pre-check results for matching rules
 */
export function runDeterministicPreChecks(
  input: AnalysisInput,
  rules: DeterministicRule[],
): PreCheckResult[] {
  const results: PreCheckResult[] = [];

  for (const rule of rules) {
    const { matches, matchedNodes, matchedRelationships } = matchesTriggers(input, rule.triggers);

    if (matches) {
      results.push({
        ruleId: rule.id,
        fingerprint: rule.sourceFingerprint,
        framework: rule.framework,
        status: rule.status,
        severity: rule.severity,
        description: rule.description,
        recommendation: rule.recommendation,
        matchedNodes,
        matchedRelationships,
      });
    }
  }

  return results;
}
