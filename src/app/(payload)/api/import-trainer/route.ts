import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import payloadConfig from '@payload-config'

type ParsedTrainer = {
  wpId?: number
  name: string
  biography?: string
  position?: string
  image_url?: string
}

function isJunkParagraph(text: string): boolean {
  const t = text.trim()
  const patterns: RegExp[] = [
    /Join\s+Symmetric\s+Newsletter/i,
    /^Sign up today/i,
    /^TOP\s+3\s+Pharma/i,
    /^Interviews\s+With\s+Industry\s+Professionals/i,
    /^Regular\s+Event\s+Calendar/i,
    /Terms\s*&\s*Conditions/i,
    /Privacy\s*Policy/i,
    /Change\s+Your\s+Cookie\s+Consent/i,
    /Symmetric\s+s\.r\.o\./i,
    /Mliekarenska/i,
    /VAT\s*No/i,
    /ID:\s*\d+/i,
    /Office:\s*\+/i,
    /Booking\s*&\s*Customer\s*Support/i,
    /European\s*Customers/i,
    /US\s*Customers/i,
    /Email:\s*/i,
    /Copyright\s*20\d{2}/i,
    /Created\s+by/i,
  ]
  return patterns.some((re) => re.test(t))
}

function extractBetweenTags(html: string, selector: string): string | undefined {
  const $ = cheerio.load(html)
  const el = $(selector).first()
  const txt = (el.text() || '').replace(/\s+/g, ' ').trim()
  return txt || undefined
}

function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseWpSpeakerRow(raw: string): ParsedTrainer | null {
  // raw is a single VC row block text from WordPress (as provided by user)
  const name = extractBetweenTags(raw, 'h1') || undefined
  // Profession line commonly inside <em>...</em>; may include comma separating company
  let em = extractBetweenTags(raw, 'em') || undefined
  // Fallback: regex search for <em>...</em> if selector fails
  if (!em) {
    const m = raw.match(/<em[^>]*>([\s\S]*?)<\/em>/i)
    if (m && m[1]) em = stripTags(m[1])
  }
  const position: string | undefined = em ? em.trim() : undefined
  // Biography: concatenate <p> texts excluding the one that contains <em> (position)
  const $ = cheerio.load(raw)
  const parts: string[] = []
  $('p').each((_, el) => {
    const hasEm = $(el).find('em').length > 0
    const t = $(el).text().replace(/\s+/g, ' ').trim()
    if (!hasEm && t && !isJunkParagraph(t)) parts.push(t)
  })
  // Fallback: if nothing found, use all text minus name/position
  let biography: string | undefined
  if (parts.length) {
    biography = parts.join('\n\n')
  } else {
    const fullText = $('vc_column_text, p, div, body').text() || $('body').text() || $.root().text()
    if (fullText) {
      let b = stripTags(fullText)
      if (name) b = b.replace(name, '').trim()
      if (em) b = b.replace(em, '').trim()
      // Remove newsletter/footer starting from marker phrases
      const cutMarkers = [
        'Join Symmetric Newsletter',
        'Sign up today',
        'Booking & Customer Support',
        'Terms & Conditions',
      ]
      for (const marker of cutMarkers) {
        const idx = b.indexOf(marker)
        if (idx !== -1) {
          b = b.slice(0, idx).trim()
        }
      }
      b = b.replace(/Request consulting/gi, '').trim()
      // Drop residual junk lines
      b = b
        .split(/\n+/)
        .filter((line) => line.trim() && !isJunkParagraph(line))
        .join('\n')
        .trim()
      if (b.length > 0) biography = b
    }
  }
  // Image from inline <img>
  let image_url: string | undefined
  const imgSrc = $('img').first().attr('src') || undefined
  if (imgSrc && !/^data:/.test(imgSrc)) image_url = imgSrc
  if (!name) return null
  return { name, position, biography, image_url }
}

function resolveUrlMaybe(src: string | undefined, baseUrl?: string): string | undefined {
  if (!src || /^data:/.test(src)) return undefined
  try {
    if (baseUrl) return new URL(src, baseUrl).toString()
  } catch (_) {
    // fallthrough
  }
  return src
}

async function parseTrainerFromHtml(html: string, pageUrl?: string): Promise<ParsedTrainer | null> {
  const $ = cheerio.load(html)
  // Name
  const name = ($('.wpb_wrapper h1').first().text() || $('h1').first().text() || '').trim()
  // Position in <em>
  let position = ($('.wpb_wrapper em').first().text() || $('em').first().text() || '').replace(/\s+/g, ' ').trim() || undefined
  if (!position) {
    const m = html.match(/<em[^>]*>([\s\S]*?)<\/em>/i)
    if (m && m[1]) position = stripTags(m[1])
  }
  // Bio: paragraphs under the main content wrapper
  const paragraphs: string[] = []
  $('.wpb_wrapper p').each((_, el) => {
    const hasEm = $(el).find('em').length > 0
    if (hasEm) return
    const t = $(el).text().replace(/\s+/g, ' ').trim()
    if (t && !isJunkParagraph(t)) paragraphs.push(t)
  })
  if (paragraphs.length === 0) {
    $('p').each((_, el) => {
      const hasEm = $(el).find('em').length > 0
      if (hasEm) return
      const t = $(el).text().replace(/\s+/g, ' ').trim()
      if (t && !isJunkParagraph(t)) paragraphs.push(t)
    })
  }
  // Remove name/position duplicates from bio start
  let biography: string | undefined
  if (paragraphs.length) {
    const filtered = paragraphs.filter((p) => !name || p !== name)
    biography = filtered.join('\n\n')
  }
  // Image: prefer og:image, then content image
  let image_url: string | undefined
  const og = $('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content') || undefined
  const bodyImg = ($('.wpb_wrapper img').first().attr('src') || $('img').first().attr('src') || undefined)
  image_url = resolveUrlMaybe(og || bodyImg, pageUrl)
  if (!name) return null
  return { name, position, biography, image_url }
}

async function handleImport(url: string) {
  const res = await fetch(url)
  if (!res.ok) return NextResponse.json({ error: `Failed to fetch URL: ${res.status}` }, { status: 400 })
  const html = await res.text()
  const parsed = await parseTrainerFromHtml(html, url)
  if (!parsed) return NextResponse.json({ error: 'Could not parse trainer from page' }, { status: 422 })
  const saved = await upsertTrainer(parsed)
  return NextResponse.json({ ok: true, trainer: saved })
}

async function upsertTrainer(data: ParsedTrainer) {
  const payload = await getPayloadHMR({ config: payloadConfig })
  // Try to find by exact name
  const existing = await payload.find({ collection: 'trainers', where: { name: { equals: data.name } }, limit: 1 })
  if (existing.docs?.[0]) {
    const doc = existing.docs[0]
    const updateData: any = { name: data.name, biography: data.biography }
    if (data.position && data.position.trim().length > 0) {
      updateData.position = data.position
    }
    if (data.image_url && data.image_url.trim().length > 0) {
      updateData.image_url = data.image_url
    }
    return await payload.update({ collection: 'trainers', id: (doc as any).id, data: updateData })
  }
  const createData: any = { name: data.name, biography: data.biography }
  if (data.position && data.position.trim().length > 0) {
    createData.position = data.position
  }
  if (data.image_url && data.image_url.trim().length > 0) {
    createData.image_url = data.image_url
  }
  return await payload.create({ collection: 'trainers', data: createData })
}

function splitBulkInput(input: string): string[] {
  // Split on new WP posts or VC rows; fallback to double newlines
  const blocks: string[] = []
  const parts = input.split(/\n(?=\d+\t)|\n(?=\[vc_row\])|\n{2,}/g).map((s) => s.trim()).filter(Boolean)
  for (const p of parts) {
    if (p.includes('[vc_row]') || /<h1>|<em>/i.test(p)) {
      blocks.push(p)
    }
  }
  return blocks.length ? blocks : [input]
}

async function handleSingleHtml(html: string) {
  const parsed = parseWpSpeakerRow(html)
  if (!parsed) return NextResponse.json({ error: 'Could not parse trainer from input' }, { status: 422 })
  const saved = await upsertTrainer(parsed)
  return NextResponse.json({ ok: true, trainer: saved })
}

async function handleBulk(input: string) {
  const blocks = splitBulkInput(input)
  const results: any[] = []
  for (const block of blocks) {
    const parsed = parseWpSpeakerRow(block)
    if (parsed) {
      const saved = await upsertTrainer(parsed)
      results.push({ ok: true, name: parsed.name, id: (saved as any).id })
    } else {
      results.push({ ok: false, error: 'parse_failed' })
    }
  }
  return NextResponse.json({ ok: true, count: results.length, results })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const { html, bulk, url } = (body || {}) as { html?: string; bulk?: string; url?: string }
    if (url) return handleImport(url)
    if (!html && !bulk) return NextResponse.json({ error: 'Provide url, html or bulk' }, { status: 400 })
    if (html) return handleSingleHtml(html)
    if (bulk) return handleBulk(bulk)
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url') || undefined
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  return handleImport(url)
}


