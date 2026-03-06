// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 FINOS

import type { PipelineConfig } from '@/lib/agents/pipeline-generator';
import type { AnalysisResult } from '@/lib/agents/orchestrator';
import type { CalmDocument } from '@/lib/calm/types';
import type { CloudInfraConfig } from '@/lib/agents/cloud-infra-generator';

interface SessionData {
  pipeline: PipelineConfig | null;
  cloudInfra: CloudInfraConfig | null;
  analysisResult: AnalysisResult | null;
  calmDocument: CalmDocument | null;
  createdAt: number;
}

const sessions = new Map<string, SessionData>();

const DEFAULT_SESSION: Omit<SessionData, 'createdAt'> = {
  pipeline: null,
  cloudInfra: null,
  analysisResult: null,
  calmDocument: null,
};

export function createSession(id: string): void {
  sessions.set(id, { ...DEFAULT_SESSION, createdAt: Date.now() });
}

export function setSessionData(
  id: string,
  partial: Partial<Omit<SessionData, 'createdAt'>>,
): void {
  const existing = sessions.get(id);
  if (!existing) return;
  sessions.set(id, { ...existing, ...partial });
}

export function getSessionData(id: string): SessionData | undefined {
  return sessions.get(id);
}

export function deleteSession(id: string): void {
  sessions.delete(id);
}

export function cleanupExpiredSessions(maxAgeMs = 30 * 60 * 1000): void {
  const now = Date.now();
  for (const [id, data] of sessions.entries()) {
    if (now - data.createdAt > maxAgeMs) {
      sessions.delete(id);
    }
  }
}

/** Exposed for testing only */
export function getSessionCount(): number {
  return sessions.size;
}
