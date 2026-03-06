// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 FINOS

import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock requestAnimationFrame — jsdom does not implement it
// ComplianceCard uses useCountUp which calls rAF internally
beforeAll(() => {
  global.requestAnimationFrame = vi.fn((cb) => {
    cb(0);
    return 0;
  });
  global.cancelAnimationFrame = vi.fn();
});

// Mock the Zustand store — ComplianceCard reads analysisResult and status
vi.mock('@/store/analysis-store', () => ({
  useAnalysisStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      analysisResult: null,
      status: 'idle',
      agentEvents: [],
      activeAgents: [],
    }),
  ),
}));

// Dynamic import to resolve after mocks are set up
const { ComplianceCard } = await import('@/components/dashboard/compliance-card');

describe('ComplianceCard', () => {
  it('renders empty/idle state snapshot', () => {
    const { container } = render(<ComplianceCard />);
    expect(container).toMatchSnapshot();
  });
});
