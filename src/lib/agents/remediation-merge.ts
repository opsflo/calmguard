import type { CalmDocument, CalmNode, CalmRelationship } from '@/lib/calm/types';
import type { ControlDefinition } from '@/lib/calm/types';

/**
 * Merge controls: start with original, overlay new controls from remediation.
 * Never removes existing controls — only adds.
 */
function mergeControls(
  original: Record<string, ControlDefinition> | undefined,
  remediated: Record<string, ControlDefinition> | undefined,
): Record<string, ControlDefinition> | undefined {
  if (!original && !remediated) return undefined;

  const merged: Record<string, ControlDefinition> = {};

  // Start with all original controls
  if (original) {
    for (const [key, value] of Object.entries(original)) {
      merged[key] = value;
    }
  }

  // Overlay new controls from remediation (won't overwrite existing)
  if (remediated) {
    for (const [key, value] of Object.entries(remediated)) {
      if (!(key in merged)) {
        merged[key] = value;
      }
    }
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

/**
 * Merge a remediated node with its original, preserving existing controls.
 */
function mergeNode(original: CalmNode, remediated: CalmNode | undefined): CalmNode {
  if (!remediated) return original;

  return {
    ...original,
    // Preserve new fields the LLM added (data-classification, etc.)
    ...remediated,
    // But always merge controls — never replace
    controls: mergeControls(original.controls, remediated.controls),
  };
}

/**
 * Merge a remediated relationship with its original, preserving controls
 * and keeping protocol upgrades.
 */
function mergeRelationship(
  original: CalmRelationship,
  remediated: CalmRelationship | undefined,
): CalmRelationship {
  if (!remediated) return original;

  // Start with original as base, then apply remediated changes
  const merged = {
    ...original,
    ...remediated,
    // Merge controls — never replace
    controls: mergeControls(original.controls, remediated.controls),
  };

  return merged as CalmRelationship;
}

/**
 * Merge LLM-generated remediated CALM document with the original.
 *
 * LLMs are unreliable at faithfully reproducing large JSON documents.
 * They tend to strip existing controls, drop nodes, and simplify structures.
 *
 * This function ensures:
 * - All original controls are preserved (never removed)
 * - New controls from remediation are added
 * - Protocol upgrades from remediation are kept
 * - Nodes/relationships dropped by the LLM are recovered from the original
 * - New fields (data-classification, etc.) from remediation are preserved
 *
 * @param original - The original CALM document before remediation
 * @param remediated - The LLM-generated remediated document
 * @returns Merged document with all original content plus remediation additions
 */
export function mergeRemediatedCalm(
  original: CalmDocument,
  remediated: CalmDocument,
): CalmDocument {
  // Build lookup maps for remediated entities
  const remediatedNodeMap = new Map<string, CalmNode>();
  for (const node of remediated.nodes) {
    remediatedNodeMap.set(node['unique-id'], node);
  }

  const remediatedRelMap = new Map<string, CalmRelationship>();
  for (const rel of remediated.relationships) {
    remediatedRelMap.set(rel['unique-id'], rel);
  }

  // Merge nodes: start from original, overlay remediation
  const mergedNodes = original.nodes.map((origNode) => {
    const remNode = remediatedNodeMap.get(origNode['unique-id']);
    return mergeNode(origNode, remNode);
  });

  // Add any new nodes the LLM created that weren't in the original
  for (const [id, node] of remediatedNodeMap) {
    if (!original.nodes.some(n => n['unique-id'] === id)) {
      mergedNodes.push(node);
    }
  }

  // Merge relationships: start from original, overlay remediation
  const mergedRelationships = original.relationships.map((origRel) => {
    const remRel = remediatedRelMap.get(origRel['unique-id']);
    return mergeRelationship(origRel, remRel);
  });

  // Add any new relationships the LLM created
  for (const [id, rel] of remediatedRelMap) {
    if (!original.relationships.some(r => r['unique-id'] === id)) {
      mergedRelationships.push(rel);
    }
  }

  // Merge top-level controls
  const mergedTopControls = mergeControls(original.controls, remediated.controls);

  return {
    ...original,
    nodes: mergedNodes,
    relationships: mergedRelationships,
    controls: mergedTopControls,
    // Preserve flows from original (LLM shouldn't touch these)
    flows: original.flows,
  };
}
