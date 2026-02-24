import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/github/status
 *
 * Returns whether GitHub integration is configured (i.e., GITHUB_TOKEN is set).
 * Called by the ArchitectureSelector on mount to conditionally show the "From GitHub" tab.
 *
 * Response: { enabled: boolean }
 */
export async function GET(): Promise<Response> {
  return NextResponse.json({ enabled: !!process.env.GITHUB_TOKEN });
}
