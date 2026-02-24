import { describe, it, expect } from 'vitest';
import { parseCalm, parseCalmFromString } from '@/lib/calm/parser';
import type { CalmDocument } from '@/lib/calm/types';

// Minimal valid CALM node fixture factory
function makeNode(
  id: string,
  nodeType: string,
  name = 'Test Node',
  description = 'A test node'
) {
  return {
    'unique-id': id,
    'node-type': nodeType,
    name,
    description,
  };
}

// Minimal valid CALM document with one node and no relationships
function makeMinimalDoc(overrides: Partial<CalmDocument> = {}): unknown {
  return {
    nodes: [makeNode('node-1', 'service')],
    relationships: [],
    ...overrides,
  };
}

describe('parseCalm', () => {
  it('parses a valid minimal CALM document with one node', () => {
    const result = parseCalm(makeMinimalDoc());

    expect(result.success).toBe(true);
    if (!result.success) throw new Error('Expected success');
    expect(result.data.nodes).toHaveLength(1);
    expect(result.data.nodes[0]['unique-id']).toBe('node-1');
  });

  it('rejects a document with an empty nodes array', () => {
    const result = parseCalm({ nodes: [], relationships: [] });

    expect(result.success).toBe(false);
    if (result.success) throw new Error('Expected failure');
    expect(result.error.issues.length).toBeGreaterThan(0);
  });

  it('rejects a document with an invalid node-type', () => {
    const result = parseCalm({
      nodes: [makeNode('n1', 'invalid-type')],
      relationships: [],
    });

    expect(result.success).toBe(false);
    if (result.success) throw new Error('Expected failure');
    expect(result.error.issues.length).toBeGreaterThan(0);
  });

  it('accepts all 9 valid CALM node types', () => {
    const nodeTypes = [
      'actor',
      'ecosystem',
      'system',
      'service',
      'database',
      'network',
      'ldap',
      'webclient',
      'data-asset',
    ] as const;

    for (const nodeType of nodeTypes) {
      const result = parseCalm({
        nodes: [makeNode(`node-${nodeType}`, nodeType, `${nodeType} Node`, `A ${nodeType} node`)],
        relationships: [],
      });

      expect(result.success, `Expected node-type '${nodeType}' to be valid`).toBe(true);
    }
  });
});

describe('parseCalmFromString', () => {
  it('parses a valid JSON string into a CALM document', () => {
    const jsonString = JSON.stringify(makeMinimalDoc());

    const result = parseCalmFromString(jsonString);

    expect(result.success).toBe(true);
    if (!result.success) throw new Error('Expected success');
    expect(result.data.nodes).toHaveLength(1);
  });

  it('returns an error for malformed (non-JSON) input', () => {
    const result = parseCalmFromString('this is not valid { json at all');

    expect(result.success).toBe(false);
    if (result.success) throw new Error('Expected failure');
    // The error message should indicate a JSON parsing issue
    expect(result.error.message.toLowerCase()).toContain('json');
  });
});
