// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 FINOS

import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/store/analysis-store', () => ({
  useAnalysisStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      analysisResult: null,
      status: 'idle',
      agentEvents: [],
    }),
  ),
}));

const { FindingsTable } = await import('@/components/dashboard/findings-table');

describe('FindingsTable', () => {
  it('renders empty state snapshot', () => {
    const { container } = render(<FindingsTable />);
    expect(container).toMatchSnapshot();
  });
});
