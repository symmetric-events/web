import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import * as cheerio from 'cheerio'

type WpPostListItem = {
  id: number
  slug: string
  link: string
  status?: string
}

type WpPost = {
  id: number
  date: string
  date_gmt: string
  modified: string
  modified_gmt: string
  slug: string
  status: 'publish' | 'draft' | 'private' | 'pending'
  type: string
  link: string
  title: { rendered: string }
  content: { rendered: string; protected?: boolean }
  excerpt?: { rendered: string }
  author: number
  featured_media: number
  sticky: boolean
  format: string
  jetpack_featured_media_url?: string
  yoast_head_json?: {
    title?: string
    description?: string
    og_title?: string
    og_description?: string
    og_image?: Array<{ url?: string; width?: number; height?: number; type?: string }>
    author?: string
    twitter_misc?: {
      'Written by'?: string
      'Est. reading time'?: string
    }
  }
}

const WP_POSTS_API = 'https://www.symmetric.events/wp-json/wp/v2/posts'

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Convert HTML to Lexical JSON format
 * Creates a basic Lexical structure with paragraph nodes
 */
function htmlToLexical(html: string): any {
  if (!html || html.trim().length === 0) {
    return {
      root: {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    }
  }

  const $ = cheerio.load(html)
  const children: any[] = []

  // Process all elements
  $('body > *, body').contents().each((_, el) => {
    if (el.type === 'text') {
      const text = $(el).text().trim()
      if (text) {
        children.push({
          children: [{ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        })
      }
    } else if (el.type === 'tag') {
      const tagName = el.tagName?.toLowerCase()
      const text = $(el).text().trim()
      
      if (!text) return

      let nodeType = 'paragraph'
      let format = 0

      // Handle headings
      if (tagName?.match(/^h[1-6]$/)) {
        nodeType = 'heading'
        const level = parseInt(tagName.charAt(1)) || 1
        format = level
      } else if (tagName === 'p') {
        nodeType = 'paragraph'
      } else if (tagName === 'li') {
        nodeType = 'listitem'
      }

      // Create text nodes
      const textNodes: any[] = []
      $(el).contents().each((_, child) => {
        if (child.type === 'text') {
          const childText = $(child).text()
          if (childText.trim()) {
            let textFormat = 0
            // Check for bold/strong
            if ($(child).parent().is('strong, b') || $(el).is('strong, b')) {
              textFormat = 1 // bold
            }
            textNodes.push({
              detail: 0,
              format: textFormat,
              mode: 'normal',
              style: '',
              text: childText,
              type: 'text',
              version: 1,
            })
          }
        }
      })

      // If no text nodes were created from children, use the element's text
      if (textNodes.length === 0 && text) {
        textNodes.push({
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text,
          type: 'text',
          version: 1,
        })
      }

      if (textNodes.length > 0) {
        children.push({
          children: textNodes,
          direction: 'ltr',
          format: nodeType === 'heading' ? format : '',
          indent: 0,
          tag: nodeType === 'heading' ? `h${format}` : undefined,
          type: nodeType,
          version: 1,
        })
      }
    }
  })

  // If no children were created, create a paragraph with the plain text
  if (children.length === 0) {
    const plainText = stripHtmlTags(html)
    if (plainText) {
      children.push({
        children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: plainText, type: 'text', version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      })
    }
  }

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

function mapWpStatus(wpStatus: string): 'draft' | 'published' | 'private' {
  switch (wpStatus) {
    case 'publish':
      return 'published'
    case 'private':
      return 'private'
    default:
      return 'draft'
  }
}

async function fetchAllWpPosts(): Promise<WpPostListItem[]> {
  const perPage = 50
  let page = 1
  const all: WpPostListItem[] = []

  // Paginate through all WP posts
  while (true) {
    const url = `${WP_POSTS_API}?per_page=${perPage}&page=${page}&status=publish&_fields=id,slug,link,status`
    const res = await fetch(url, { cache: 'no-store' as any })

    if (!res.ok) {
      // Stop cleanly if we hit pagination limits or bad request
      if (res.status === 400 || res.status === 404) break
      throw new Error(`Failed to fetch posts page ${page}: ${res.status}`)
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

async function fetchWpPostById(id: number): Promise<WpPost | null> {
  const apiUrl = `${WP_POSTS_API}/${id}`
  const res = await fetch(apiUrl, { cache: 'no-store' })
  if (!res.ok) return null
  return (await res.json()) as WpPost
}

async function importSingleBlog(postId: number, payload: any): Promise<{ ok: boolean; action?: 'created' | 'updated'; error?: string }> {
  try {
    const wpPost = await fetchWpPostById(postId)
    if (!wpPost) {
      return { ok: false, error: 'Could not fetch WordPress post' }
    }

    const yoast = wpPost.yoast_head_json

    // Extract title
    const title = stripHtmlTags(wpPost.title.rendered)

    // Get content HTML and convert to Lexical
    const contentHtml = wpPost.content.rendered || ''
    const content = htmlToLexical(contentHtml)

    // Get excerpt (strip HTML)
    const excerpt = wpPost.excerpt?.rendered ? stripHtmlTags(wpPost.excerpt.rendered) : undefined

    // Get featured image URL
    const featuredImageUrl =
      wpPost.jetpack_featured_media_url ||
      yoast?.og_image?.[0]?.url ||
      undefined

    // Get author name from Yoast
    const authorName =
      yoast?.author ||
      yoast?.twitter_misc?.['Written by'] ||
      undefined

    // Get reading time
    const readingTime = yoast?.twitter_misc?.['Est. reading time'] || undefined

    // Parse dates
    const publishedAt = wpPost.date_gmt ? new Date(wpPost.date_gmt + 'Z').toISOString() : undefined
    const modifiedAt = wpPost.modified_gmt ? new Date(wpPost.modified_gmt + 'Z').toISOString() : undefined

    // Check if blog post with this slug already exists
    const existingBySlug = await payload.find({
      collection: 'blog',
      where: { slug: { equals: wpPost.slug } },
      limit: 1,
    })

    const existingDoc = existingBySlug.docs?.[0]

    const blogData: any = {
      slug: wpPost.slug,
      title,
      status: mapWpStatus(wpPost.status),
      content,
      excerpt,
      publishedAt,
      modifiedAt,
      authorName,
      featuredImageUrl,
      sticky: wpPost.sticky || false,
      readingTime,
      seo: {
        metaTitle: yoast?.title || yoast?.og_title || undefined,
        metaDescription: yoast?.description || yoast?.og_description || undefined,
        ogImageUrl: yoast?.og_image?.[0]?.url || undefined,
        canonicalUrl: wpPost.link || undefined,
      },
    }

    if (existingDoc) {
      await payload.update({
        collection: 'blog',
        id: (existingDoc as any).id,
        data: blogData,
      })
      return { ok: true, action: 'updated' }
    } else {
      await payload.create({
        collection: 'blog',
        data: blogData,
      })
      return { ok: true, action: 'created' }
    }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? 'Unknown error' }
  }
}

async function runBulkImport(req: NextRequest) {
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

  const wpPosts = await fetchAllWpPosts()
  const toImport = typeof limit === 'number' ? wpPosts.slice(0, limit) : wpPosts

  const results: Array<{
    id: number
    slug: string
    link: string
    ok: boolean
    status?: number
    error?: string
    skipped?: boolean
    action?: 'created' | 'updated'
  }> = []

  const payload = await getPayload({ config: await payloadConfig })

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

    const result = await importSingleBlog(item.id, payload)
    results.push({
      id: item.id,
      slug: item.slug,
      link: item.link,
      ok: result.ok,
      error: result.error,
      action: result.action,
    })
  }

  const imported = results.filter((r) => r.ok && !r.skipped).length
  const created = results.filter((r) => r.ok && !r.skipped && r.action === 'created').length
  const updated = results.filter((r) => r.ok && !r.skipped && r.action === 'updated').length

  return NextResponse.json({
    ok: true,
    totalFound: wpPosts.length,
    attempted: toImport.length,
    imported,
    created,
    updated,
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
