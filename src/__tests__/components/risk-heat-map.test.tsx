// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 FINOS

import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/store/analysis-store', () => ({
  useAnalysisStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      analysisResult: null,
      status: 'idle',
    }),
  ),
}));

const { RiskHeatMap } = await import('@/components/dashboard/risk-heat-map');

describe('RiskHeatMap', () => {
  it('renders empty state snapshot', () => {
    const { container } = render(<RiskHeatMap />);
    expect(container).toMatchSnapshot();
  });
});
