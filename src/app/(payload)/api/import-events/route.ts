import { NextRequest, NextResponse } from 'next/server'

type WpEventListItem = {
  id: number
  slug: string
  link: string
  status?: string
}

const WP_EVENTS_API =
  'https://www.symmetric.events/wp-json/wp/v2/event'

async function fetchAllWpEvents(): Promise<WpEventListItem[]> {
  const perPage = 50
  let page = 1
  const all: WpEventListItem[] = []

  // Paginate through all WP events
  // See example single event JSON: https://www.symmetric.events/wp-json/wp/v2/event?slug=biometrics-in-clinical-trials
  while (true) {
    const url = `${WP_EVENTS_API}?per_page=${perPage}&page=${page}&status=publish&_fields=id,slug,link,status`
    const res = await fetch(url, { cache: 'no-store' as any })

    if (!res.ok) {
      // Stop cleanly if we hit pagination limits or bad request
      if (res.status === 400 || res.status === 404) break
      throw new Error(`Failed to fetch events page ${page}: ${res.status}`)
    }

    const items = (await res.json()) as unknown
    if (!Array.isArray(items) || items.length === 0) break

    all.push(
      ...items.map((item: any) => ({
        id: Number(item?.id),
        slug: String(item?.slug ?? ''),
        link: String(item?.link ?? ''),
        status: item?.status ? String(item.status) : undefined,
      })),
    )

    const totalPagesHeader = res.headers.get('X-WP-TotalPages') ?? res.headers.get('x-wp-totalpages')
    const totalPages = totalPagesHeader ? Number(totalPagesHeader) : NaN
    if (!Number.isFinite(totalPages) || page >= totalPages) break

    page += 1
  }

  // Filter out any malformed entries
  return all.filter((e) => e.id && e.slug && e.link)
}

async function runBulkImport(req: NextRequest) {
  const origin = req.nextUrl.origin
  const { searchParams } = req.nextUrl

  const dryRunParam = searchParams.get('dryRun') ?? searchParams.get('dry_run')
  const limitParam = searchParams.get('limit')

  const body = await req
    .json()
    .catch(() => ({} as { dryRun?: boolean; limit?: number }))

  const dryRun =
    typeof body.dryRun === 'boolean'
      ? body.dryRun
      : dryRunParam === '1' || dryRunParam === 'true'

  const limitFromBody =
    typeof body.limit === 'number' && Number.isFinite(body.limit)
      ? body.limit
      : undefined
  const limitFromQuery =
    limitParam && Number.isFinite(Number(limitParam))
      ? Number(limitParam)
      : undefined
  const limit =
    typeof limitFromBody === 'number' ? limitFromBody : limitFromQuery

  const wpEvents = await fetchAllWpEvents()
  const toImport = typeof limit === 'number' ? wpEvents.slice(0, limit) : wpEvents

  const results: Array<{
    id: number
    slug: string
    link: string
    ok: boolean
    status?: number
    error?: string
    skipped?: boolean
  }> = []

  for (const item of toImport) {
    if (dryRun) {
      results.push({
        id: item.id,
        slug: item.slug,
        link: item.link,
        ok: true,
        skipped: true,
      })
      continue
    }

    try {
      // Reuse the existing single-event importer at /api/import-event
      const importUrl = `${origin}/api/import-event?url=${encodeURIComponent(
        item.link,
      )}`
      const res = await fetch(importUrl, { method: 'GET' })
      const json = (await res
        .json()
        .catch(() => null)) as { ok?: boolean; error?: string } | null

      const ok = res.ok && (json?.ok === true || json?.ok === undefined)

      results.push({
        id: item.id,
        slug: item.slug,
        link: item.link,
        ok,
        status: res.status,
        error: ok ? undefined : json?.error ?? 'Unknown error from import-event',
      })
    } catch (err: any) {
      results.push({
        id: item.id,
        slug: item.slug,
        link: item.link,
        ok: false,
        error: err?.message ?? 'Failed to call /api/import-event',
      })
    }
  }

  const imported = results.filter((r) => r.ok && !r.skipped).length

  return NextResponse.json({
    ok: true,
    totalFound: wpEvents.length,
    attempted: toImport.length,
    imported,
    dryRun,
    results,
  })
}

export async function GET(req: NextRequest) {
  try {
    return await runBulkImport(req)
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    return await runBulkImport(req)
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 },
    )
  }
}


