// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 FINOS

import { type NextRequest } from 'next/server';
import { getSessionData } from '@/lib/session-store';

// Prevent Next.js from caching this route — pipeline results change per analysis
export const dynamic = 'force-dynamic';

/**
 * GET /api/pipeline?sessionId=UUID
 *
 * Returns the pipeline generation result for the given session.
 * sessionId is issued by POST /api/analyze in the done event.
 *
 * Response 200: { pipeline: PipelineConfig } (when available)
 * Response 200: { pipeline: null, message: string } (when not yet generated or no sessionId)
 */
export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return Response.json({ pipeline: null, message: 'No sessionId provided. Run analysis first.' });
  }

  const session = getSessionData(sessionId);
  if (session?.pipeline != null) {
    return Response.json({ pipeline: session.pipeline });
  }

  return Response.json({
    pipeline: null,
    message: 'No pipeline result available. Run analysis first.',
  });
}
