/**
 * GET /api/readiness/result/[id]
 *
 * Returns the publicly-shareable view of a readiness assessment. Anyone with
 * the id can read the result. To protect PII (the email captured for the
 * playbook, the contact info from the Book a Call form), we deliberately
 * project only the fields a public reader should see:
 *
 *   - overall score, band
 *   - pillar scores + tiers
 *   - focus areas
 *   - completed timestamp
 *   - composition schema version (for client-side cache invalidation)
 *
 * NOT returned:
 *   - email, phone, name, company, suburb
 *   - playbook_storage_path (would let anyone download someone else's PDF)
 *   - user_agent, referrer, ip_country (attribution only)
 *   - raw answers (avoid leaking exactly what they clicked)
 *
 * Response shape:
 *   200 { result: PublicResult }
 *   404 { error: "Result not found" }
 *   500 { error: "..." }
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';
import { bandByKey } from '@/lib/readiness/bands';
import type { BandKey, PillarKey, PillarTier } from '@/lib/readiness/types';

// ── Public projection shape ──────────────────────────────────────────────────

export interface PublicResult {
  id: string;
  overallScore: number;
  band: {
    key: BandKey;
    label: string;
    description: string;
  };
  pillarScores: Record<PillarKey, number>;
  pillarTiers: Record<PillarKey, PillarTier>;
  focusAreas: PillarKey[];
  strongestPillar: PillarKey;
  completedAt: string | null;
  schemaVersion: number;
}

// UUID format check -- cheap input validation before DB hit
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid result id' }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('readiness_assessments')
    .select(
      'id, overall_score, band, pillar_scores, pillar_tiers, focus_areas, strongest_pillar, completed_at, composition_schema_version, deleted_at'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[readiness/result] read failed:', error);
    return NextResponse.json({ error: 'Failed to load result' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }

  if (data.deleted_at) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }

  // Build sanitised public projection. Notice that we look up the band's full
  // label and description from lib/readiness/bands rather than persisting them
  // in the DB -- single source of truth, and band copy can be tweaked without
  // rewriting any rows.
  const band = bandByKey(data.band as BandKey);

  const result: PublicResult = {
    id: data.id,
    overallScore: data.overall_score,
    band: {
      key: band.key,
      label: band.label,
      description: band.description,
    },
    pillarScores: data.pillar_scores as Record<PillarKey, number>,
    pillarTiers: data.pillar_tiers as Record<PillarKey, PillarTier>,
    focusAreas: data.focus_areas as PillarKey[],
    strongestPillar: data.strongest_pillar as PillarKey,
    completedAt: data.completed_at,
    schemaVersion: data.composition_schema_version,
  };

  // Cache headers: 1h public, 5m stale-while-revalidate. The result never
  // changes (score is fixed once written), so longer caching is safe -- but
  // we keep it modest in case we need to invalidate quickly.
  return NextResponse.json(
    { result },
    {
      status: 200,
      headers: {
        'Cache-Control':
          'public, s-maxage=3600, stale-while-revalidate=300',
      },
    }
  );
}
