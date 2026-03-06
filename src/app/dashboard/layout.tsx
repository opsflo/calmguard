// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 FINOS

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
