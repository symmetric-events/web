import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import { getPriceFromDates } from '~/lib/pricing'

type ParsedEvent = {
  title: string
  startDate?: string
  endDate?: string
  description?: string
  eurPrice?: number
  categories: { name: string; slug: string }[]
  whoFor?: string[]
  keyTopics?: string[]
  learningObjectives?: { title: string; description: string }[]
  whyAttend?: { title: string; description: string }[]
  trainingExperience?: { Title: string; Description: string }[]
  trainers?: { name: string; url?: string; imageUrl?: string }[]
}

// Map WP speaker IDs to canonical trainer names in Payload
const WP_SPEAKER_ID_TO_NAME: Record<string, string> = {
  '10521': 'Dr. Stephanie Pasas-Farmer',
  '2758': 'James Pink',
  '3111': 'Dr. Simon Day',
  '3114': 'Hanna Hanć',
  '3117': 'Dr. Michael Braun',
  '3144': 'Dr. Hans Rogl',
  '3147': 'Dr. Laura Buttafoco',
  '3270': 'Rob Walker',
  '3406': 'Dr. Paula Muniz',
  '3735': 'Dr. Sam Denby',
  '4039': 'Dr. Karl-Heinz Huemer',
  '5144': 'Dr. Felix Kern',
  '5553': 'Fritz Röder',
  '5691': 'James L. Drinkwater',
  '6044': 'Francois (Swa) Vandeweyer',
  '6098': 'Donal O’ Grady',
  '6113': 'Dr Mark Powell',
  '8415': 'Tara Scherder',
  '8679': 'Alice D’Alton',
  '8839': 'Steven Walfish',
  '9729': 'Dr. Manfred Fischer',
  '10516': 'Dr. Gwen Wise-Blackman',
  '10675': 'Dr. Len Pattenden',
  '10732': 'Henny Zijlstra',
  '14323': 'Dr. Eduardo Jule',
  '17205': 'Ruth Faulkner',
  '17307': 'Dr Peter Riechel',
  '17909': 'Simone Ahrens-Mende',
}

// Map WP event category IDs to our internal category slugs
const WP_CATEGORY_ID_TO_SLUG: Record<string, string> = {
  '270': 'clinical-trials',
  '269': 'cmc',
  '268': 'combination-products',
  '146': 'medical-devices',
  // Normalize to our existing internal slugs with ampersands for consistency
  '34': 'pharma-&-biotech',
  '139': 'public-&-online-training',
  '283': 'scale-up',
}

const slugToCategoryName = (slug: string): string => {
  switch (slug) {
    case 'clinical-trials':
      return 'Clinical Trials'
    case 'cmc':
      return 'CMC'
    case 'combination-products':
      return 'Combination Products'
    case 'medical-devices':
      return 'Medical Devices'
    case 'pharma-&-biotech':
      return 'Pharma & Biotech'
    case 'public-&-online-training':
      return 'Public & Online Training'
    case 'scale-up':
      return 'Scale up'
    default:
      return slug
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function parseWpEvent(html: string): Promise<ParsedEvent> {
  const $ = cheerio.load(html)

  // Title: try h1 first
  const title = ($('h1').first().text() || '').trim()

  // Description: pick the first substantial paragraph below the title
  let description = ''
  const paragraphs = $('p')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t && t.length > 40)
  if (paragraphs.length) description = paragraphs[0] ?? ''

  // Dates: attempt to find patterns like "6 – 8 October 2025" or similar
  const bodyText = $('body').text() || ''
  const dateRangeRegex = /(\d{1,2})\s*[–-]\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/ // 6 – 8 October 2025
  const singleDateRegex = /(\d{1,2})\.?\s*([A-Za-z]+)\s+(\d{4})/

  let startDate: string | undefined
  let endDate: string | undefined

  const rangeMatch = bodyText.match(dateRangeRegex)
  if (rangeMatch) {
    const [, d1, d2, month, year] = rangeMatch
    const start = new Date(`${d1} ${month} ${year}`)
    const end = new Date(`${d2} ${month} ${year}`)
    if (!isNaN(start.getTime())) startDate = start.toISOString()
    if (!isNaN(end.getTime())) endDate = end.toISOString()
  } else {
    const singleMatch = bodyText.match(singleDateRegex)
    if (singleMatch) {
      const [, d, month, year] = singleMatch
      const dt = new Date(`${d} ${month} ${year}`)
      if (!isNaN(dt.getTime())) {
        startDate = dt.toISOString()
        endDate = dt.toISOString()
      }
    }
  }

  // EUR Price: look for numbers like 1 850 € or 1850 €
  let eurPrice: number | undefined
  const priceRegex = /(\d{1,3}(?:[\s\.,]\d{3})*|\d+)[\s]*€/
  const priceMatch = bodyText.match(priceRegex)
  if (priceMatch && priceMatch[1]) {
    const raw = priceMatch[1].replace(/[\s\.,]/g, '')
    const n = Number(raw)
    if (!Number.isNaN(n)) eurPrice = n
  }

  // Category heuristic (map known categories by body text)
  const categories: { name: string; slug: string }[] = []
  const addCat = (name: string, slug: string) => {
    if (!categories.find((c) => c.slug === slug)) categories.push({ name, slug })
  }
  // Clinical Trials
  if (/(\bClinical\s*Trials?\b|\bICH\s*E6\b|\bGCP\b)/i.test(bodyText)) addCat('Clinical Trials', 'clinical-trials')
  // Public & Online Training
  if (/(Online\s*training|Online\s*Participation|Live\s*Online|Live,?\s*Interactive)/i.test(bodyText)) addCat('Public & Online Training', 'public-&-online-training')
  // Pharma & Biotech
  if (/(\bPharma\s*&\s*Biotech\b|\bbiopharma\b)/i.test(bodyText)) addCat('Pharma & Biotech', 'pharma-&-biotech')
  // Medical Devices
  if (/(\bMedical\s*Devices?\b|\bISO\s*13485\b|\bMDR\b)/i.test(bodyText)) addCat('Medical Devices', 'medical-devices')
  // Combination Products
  if (/(\bCombination\s*Products?\b)/i.test(bodyText)) addCat('Combination Products', 'combination-products')
  // CMC
  if (/\bCMC\b/i.test(bodyText)) addCat('cmc', 'cmc')
  // Scale up
  if (/(\bScale\s*-?\s*up\b|\bscaleup\b|technology\s*transfer)/i.test(bodyText)) addCat('Scale up', 'scale-up')
  // Post-process: if specific product-area categories present, drop broad ones
  {
    const categorySlugs = (categories || []).map((c) => c.slug)
    const hasProductArea = ['medical-devices', 'combination-products', 'cmc', 'clinical-trials', 'scale-up'].some((s) => categorySlugs.includes(s))
    if (hasProductArea) {
      // remove Pharma & Biotech as overly broad
      for (let i = categories.length - 1; i >= 0; i--) {
        const item = categories[i]
        if (item && item.slug === 'pharma-&-biotech') categories.splice(i, 1)
      }
    }
    // Keep Public & Online Training only if no product-area category was detected
    if (hasProductArea) {
      for (let i = categories.length - 1; i >= 0; i--) {
        const item = categories[i]
        if (item && item.slug === 'public-&-online-training') categories.splice(i, 1)
      }
    }
  }
  // No fallback: if nothing matches, leave categories empty so none are auto-added

  // Who is this training for? Find heading then nearest list
  let whoFor: string[] | undefined
  const heading = $('h1, h2, h3, h4, h5, h6').filter((_, el) => /who\s+is\s+this\s+training\s+for\?/i.test($(el).text() || ''))
  if (heading.length) {
    const list = heading.first().nextAll('ul,ol').first()
    if (list && list.length) {
      const items = list
        .find('li')
        .map((_, li) => $(li).text().trim())
        .get()
        .filter(Boolean)
      if (items.length) whoFor = items
    }
  }
  // Visual Composer fallback: [vc_column_text ... el_class="designed_for"]Label[/vc_column_text]
  if (!whoFor) {
    const designedForRegex = /el_class\s*=\s*"designed_for"\]\s*([\s\S]*?)\s*\[\/vc_column_text\]/gi
    const matches: string[] = []
    let m2: RegExpExecArray | null
    while ((m2 = designedForRegex.exec(bodyText)) !== null) {
      const label = (m2[1] || '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      if (label) matches.push(label)
    }
    if (matches.length) whoFor = matches
  }

  // Key Topics: try list under heading first
  let keyTopics: string[] | undefined
  const topicsHeading = $('h1, h2, h3, h4, h5, h6').filter((_, el) => /key\s*topics/i.test($(el).text() || ''))
  if (topicsHeading.length) {
    const list = topicsHeading.first().nextAll('ul,ol').first()
    if (list && list.length) {
      const items = list
        .find('li')
        .map((_, li) => $(li).text().trim())
        .get()
        .filter(Boolean)
      if (items.length) keyTopics = items
    }
  }
  // Visual Composer fallback: [vc_column_text ... el_class="key_topic"]Label[/vc_column_text]
  if (!keyTopics) {
    const keyTopicRegex = /el_class\s*=\s*"key_topic"\]\s*([\s\S]*?)\s*\[\/vc_column_text\]/gi
    const topics: string[] = []
    let m3: RegExpExecArray | null
    while ((m3 = keyTopicRegex.exec(bodyText)) !== null) {
      const label = (m3[1] || '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
      if (label) topics.push(label)
    }
    if (topics.length) keyTopics = topics
  }
  if (!whoFor) {
    // Fallback: regex lines after the section title in body text
  const sectionRegex = /who\s+is\s+this\s+training\s+for\?[\s\S]*?(clinical\s+trial\s+managers[\s\S]*?)(?:#|register|key\s+topics|trainer|$)/i
  const m = bodyText.match(sectionRegex) || null
  if (m && m[1]) {
    whoFor = m[1]
        .split(/\n|\r|\u2022|\*/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && /[A-Za-z]/.test(s))
    }
  }

  // Learning Objectives
  let learningObjectives: { title: string; description: string }[] | undefined
  // First, attempt to parse from VC raw HTML blocks that often contain encoded shortcodes
  const rawBlocks = [...html.matchAll(/\[vc_raw_html\]([\s\S]*?)\[\/vc_raw_html\]/gi)].map((m) => (m[1] || '').trim())
  const decodedBodies: string[] = []
  for (const blk of rawBlocks) {
    const tryDecode = (val: string): string | null => {
      try {
        const b64 = Buffer.from(val, 'base64').toString('utf8')
        try {
          return decodeURIComponent(b64)
        } catch {
          return b64
        }
      } catch {
        try {
          const u = decodeURIComponent(val)
          return Buffer.from(u, 'base64').toString('utf8')
        } catch {
          return null
        }
      }
    }
    const d = tryDecode(blk)
    if (d) decodedBodies.push(d)
  }
  // Extract [learning_objective title="..."]Text[/learning_objective] or generic title="..." text="..."
  const loItems: { title: string; description: string }[] = []
  for (const body of decodedBodies) {
    let m: RegExpExecArray | null
    const r = /\[learning_objective[^\]]*title\s*=\s*"([^"]+)"[^\]]*\]([\s\S]*?)\[\/learning_objective\]/gi
    while ((m = r.exec(body)) !== null) {
      const titlePart = (m[1] || '').replace(/<[^>]*>/g, '').trim()
      const textPart = (m[2] || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      if (titlePart || textPart) loItems.push({ title: titlePart, description: textPart })
    }
    // Fallback: match title="..." and text="..." in any order
    const r2 = /title\s*=\s*"([^"]+)"[\s\S]*?text\s*=\s*"([^"]+)"/gi
    while ((m = r2.exec(body)) !== null) {
      const titlePart = (m[1] || '').replace(/<[^>]*>/g, '').trim()
      const textPart = (m[2] || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      if (titlePart || textPart) loItems.push({ title: titlePart, description: textPart })
    }
  }
  if (loItems.length) learningObjectives = loItems
  // Fallback: after heading "Learning Objectives" pick bullet list
  if (!learningObjectives) {
    const loHeading = $('h1, h2, h3, h4, h5, h6').filter((_, el) => /learning\s*objectives/i.test($(el).text() || ''))
    if (loHeading.length) {
      const list = loHeading.first().nextAll('ul,ol').first()
      if (list && list.length) {
        const items = list
          .find('li')
          .map((_, li) => ({
            title: $(li).find('strong,b').first().text().trim() || $(li).text().split('\n')[0]?.trim() || $(li).text().trim(),
            description: $(li).clone().children('strong,b').remove().end().text().replace(/\s+/g, ' ').trim(),
          }))
          .get()
          .filter((it: any) => it.title || it.description)
        if (items.length) learningObjectives = items as any
      }
    }
  }

  // Why Should You Attend: WPBakery yellow boxes
  let whyAttend: { title: string; description: string }[] | undefined
  {
    const yellowRegex = /\[vc_column_text[^\]]*el_class\s*=\s*"yellow-box"[^\]]*\]([\s\S]*?)\[\/vc_column_text\]/gi
    const items: { title: string; description: string }[] = []
    let m: RegExpExecArray | null
    while ((m = yellowRegex.exec(html)) !== null) {
      const raw = String(m[1] ?? '')
        .replace(/<[^>]*>/g, ' ') // strip tags
        .replace(/\r\n|\r/g, '\n')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      if (raw.length) {
        const titleLine = raw[0] || ''
        const desc = raw.slice(1).join(' ').replace(/\s+/g, ' ').trim()
        items.push({ title: titleLine, description: desc })
      }
    }
    if (items.length) whyAttend = items
  }

  // Training Experience: pairs of [vc_raw_html]Title[/vc_raw_html] followed by [vc_column_text]Description[/vc_column_text]
  let trainingExperience: { Title: string; Description: string }[] | undefined
  {
    const pairRegex = /\[vc_raw_html\]([\s\S]*?)\[\/vc_raw_html\]\s*\[vc_column_text[^\]]*\]([\s\S]*?)\[\/vc_column_text\]/gi
    const items: { Title: string; Description: string }[] = []
    let m: RegExpExecArray | null
    while ((m = pairRegex.exec(html)) !== null) {
      const rawTitleEncoded = (m[1] || '').trim()
      const rawDesc = (m[2] || '')
      // Decode potential base64/URI encoded inner content
      let decodedTitle = ''
      try {
        const b64 = Buffer.from(rawTitleEncoded, 'base64').toString('utf8')
        try {
          decodedTitle = decodeURIComponent(b64)
        } catch {
          decodedTitle = b64
        }
      } catch {
        try {
          const u = decodeURIComponent(rawTitleEncoded)
          decodedTitle = Buffer.from(u, 'base64').toString('utf8')
        } catch {
          decodedTitle = rawTitleEncoded
        }
      }
      const titleText = decodedTitle.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      const descText = String(rawDesc ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      if (titleText && descText) items.push({ Title: titleText, Description: descText })
    }
    if (items.length) trainingExperience = items
  }

  // Trainers: detect Eventchamp speakers listing or generic speaker anchors
  let trainers: { name: string; url?: string; imageUrl?: string }[] | undefined
  {
    const found: { name: string; url?: string; imageUrl?: string }[] = []
    // Eventchamp/GTheme structure
    $('.gt-speakers-listing .gt-speaker').each((_, el) => {
      const name = $(el).find('.gt-name a').first().text().trim()
      const url = $(el).find('.gt-name a').first().attr('href') || undefined
      const imageUrl = $(el).find('.gt-image img').first().attr('src') || undefined
      if (name) found.push({ name, url, imageUrl })
    })
    // Fallback: any anchor to /speaker/... with text
    if (found.length === 0) {
      $('a[href*="/speaker/"]').each((_, a) => {
        const name = ($(a).text() || '').trim()
        const url = $(a).attr('href') || undefined
        if (name) found.push({ name, url })
      })
    }
    if (found.length) trainers = found
  }

  return { title, startDate, endDate, description, eurPrice, categories, whoFor, keyTopics, learningObjectives, whyAttend, trainingExperience, trainers }
}

async function handleImport(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    return NextResponse.json({ error: `Failed to fetch URL: ${res.status}` }, { status: 400 })
  }
  const html = await res.text()
  const parsed = await parseWpEvent(html)

  // Try to enrich with structured data from WP JSON API by slug
  // Source: https://www.symmetric.events/wp-json/wp/v2/event?_fields=event_end_date,event_end_time,event_start_date,event_start_time,eventcat,event_speakers,slug,title,yoast_head_json
  let wpMeta:
    | {
        slug?: string
        title?: { rendered?: string }
        event_start_date?: string
        event_start_time?: string
        event_end_date?: string
        event_end_time?: string
        eventcat?: number[]
        event_speakers?: Record<string, number>
        yoast_head_json?: {
          description?: string
          og_description?: string
          og_image?: Array<{ url?: string; width?: number; height?: number }>
        }
      }
    | undefined
  try {
    const u = new URL(url)
    const slugFromUrl = u.pathname
      .split('/')
      .filter(Boolean)
      .pop()
    if (slugFromUrl) {
      const apiUrl = `https://www.symmetric.events/wp-json/wp/v2/event?slug=${encodeURIComponent(
        slugFromUrl,
      )}&_fields=event_end_date,event_end_time,event_start_date,event_start_time,eventcat,event_speakers,slug,title,yoast_head_json`
      const apiRes = await fetch(apiUrl, { cache: 'no-store' as any })
      if (apiRes.ok) {
        const arr = (await apiRes.json()) as any[]
        if (Array.isArray(arr) && arr.length) {
          wpMeta = arr[0]
        }
      }
    }
  } catch {}

  // Prefer WP JSON values when available
  const titleFromApi = wpMeta?.title?.rendered?.trim()
  const slugFromApi = wpMeta?.slug?.trim()
  const startDateFromApi = wpMeta?.event_start_date?.trim()
  const startTimeFromApi = wpMeta?.event_start_time?.trim()
  const endDateFromApi = wpMeta?.event_end_date?.trim()
  const endTimeFromApi = wpMeta?.event_end_time?.trim()

  const toIsoOrUndefined = (d?: string | null, t?: string | null): string | undefined => {
    if (!d) return undefined
    let datePart = d.trim()

    // WP often stores dates as "YYYY-MM-DD HH:MM:SS" — strip the time part if present
    const matchDateOnly = /^(\d{4}-\d{2}-\d{2})\b/
    const m = datePart.match(matchDateOnly)
    if (m && m[1]) {
      datePart = m[1]
    }

    const timePart = (t && /\d{1,2}:\d{2}/.test(t) ? t.trim() : '00:00') + ':00'
    const iso = new Date(`${datePart}T${timePart}Z`)
    if (!isNaN(iso.getTime())) return iso.toISOString()

    // Fallback: try letting JS parse the original value directly
    const fallback = new Date(d)
    return isNaN(fallback.getTime()) ? undefined : fallback.toISOString()
  }

  const merged = {
    ...parsed,
    title: titleFromApi || parsed.title,
    startDate: toIsoOrUndefined(startDateFromApi || undefined, startTimeFromApi || undefined) || parsed.startDate,
    endDate: toIsoOrUndefined(endDateFromApi || undefined, endTimeFromApi || undefined) || parsed.endDate,
    // Use Yoast description if available and better than HTML parsed
    description: wpMeta?.yoast_head_json?.description?.trim() || wpMeta?.yoast_head_json?.og_description?.trim() || parsed.description,
  }

  // Merge categories from WP JSON eventcat IDs
  if (wpMeta?.eventcat && Array.isArray(wpMeta.eventcat)) {
    const fromApi = (wpMeta.eventcat as any[])
      .map((id) => WP_CATEGORY_ID_TO_SLUG[String(id)])
      .filter((s): s is string => Boolean(s))
      .map((slug) => ({ name: slugToCategoryName(slug), slug }))
    for (const c of fromApi) {
      if (!merged.categories.find((x) => x.slug === c.slug)) {
        merged.categories.push(c)
      }
    }
  }

  if (!merged.title) {
    return NextResponse.json({ error: 'Could not parse title from page' }, { status: 422 })
  }

  const payload = await getPayload({ config: await payloadConfig })

  // Handle featured image from Yoast og_image
  const ogImageUrl = wpMeta?.yoast_head_json?.og_image?.[0]?.url

  // Ensure categories
  const categoryIds: any[] = []
  for (const cat of merged.categories) {
    const existing = await payload.find({ collection: 'categories', where: { slug: { equals: cat.slug } }, limit: 1 })
    if (existing.docs?.[0]) {
      // @ts-ignore id can be string or number depending on adapter
      categoryIds.push(existing.docs[0].id)
    } else {
      const created = await payload.create({ collection: 'categories', data: { name: cat.name, slug: cat.slug } as any })
      // @ts-ignore id can be string or number depending on adapter
      categoryIds.push(created.id)
    }
  }

  // Create event
  // Resolve trainer IDs by exact name match from HTML plus WP JSON event_speakers mapping
  const trainerIds: any[] = []
  const namesFromHtml = (merged.trainers || []).map((t) => (t.name || '').trim()).filter(Boolean)
  const namesFromApi = (() => {
    const map = wpMeta?.event_speakers || {}
    const ids = Object.values(map || {}) as (string | number)[]
    const names = ids
      .map((id) => WP_SPEAKER_ID_TO_NAME[String(id)])
      .filter((n): n is string => Boolean(n))
    return names
  })()
  const allNames = Array.from(new Set([...(namesFromHtml || []), ...(namesFromApi || [])]))
  if (allNames.length) {
    for (const name of allNames) {
      const existing = await payload.find({ collection: 'trainers', where: { name: { equals: name } }, limit: 1 })
      if (existing.docs?.[0]) {
        // @ts-ignore id can be string or number depending on adapter
        trainerIds.push(existing.docs[0].id)
      }
    }
  }

  // Ensure we have a valid slug
  const finalSlug = slugFromApi || slugify(merged.title)
  console.log('Final slug:', finalSlug)

  if (!finalSlug || finalSlug.length === 0) {
    return NextResponse.json({ error: 'Could not generate valid slug' }, { status: 422 })
  }

  // Common data payload for create/update
  const eventData: any = {
    slug: finalSlug,
    Title: merged.title,
    status: 'draft',
    category: categoryIds,
    Description: merged.description ?? '',
    Price: {
      EUR: getPriceFromDates(merged.startDate, merged.endDate),
      USD: getPriceFromDates(merged.startDate, merged.endDate),
    },
    ...(ogImageUrl ? { 'Featured Image': ogImageUrl } : {}),
    ...(trainerIds.length ? { Trainers: trainerIds } : {}),
    // Only include Event Dates if we have valid start and end dates
    ...(merged.startDate && merged.endDate
      ? {
          'Event Dates': [
            {
              'Start Date': merged.startDate,
              'End Date': merged.endDate,
              ...(startTimeFromApi ? { 'Start Time': startTimeFromApi } : {}),
              ...(endTimeFromApi ? { 'End Time': endTimeFromApi } : {}),
            },
          ],
        }
      : {}),
    ...(merged.whoFor && merged.whoFor.length
      ? { 'Who Is Training For': merged.whoFor.map((item) => ({ item })) }
      : {}),
    ...(merged.keyTopics && merged.keyTopics.length
      ? { 'Key Topic': merged.keyTopics.map((item) => ({ item })) }
      : {}),
    ...(merged.learningObjectives && merged.learningObjectives.length
      ? {
          'Learning Objectives': merged.learningObjectives.map((lo) => ({
            Title: lo.title,
            Description: lo.description,
          })),
        }
      : {}),
    ...(merged.whyAttend && merged.whyAttend.length
      ? {
          'Why Attend': merged.whyAttend.map((wa) => ({
            Title: wa.title,
            Description: wa.description,
          })),
        }
      : {}),
    ...(merged.trainingExperience && merged.trainingExperience.length
      ? { 'Training Experience': merged.trainingExperience }
      : {}),
  }

  // If an event with this slug already exists, update it instead of creating a duplicate
  const existing = await payload.find({
    collection: 'events',
    where: { slug: { equals: finalSlug } },
    limit: 1,
  })

  const savedEvent =
    existing.docs && existing.docs[0]
      ? await payload.update({
          collection: 'events',
          // @ts-ignore id may be string or number depending on adapter
          id: existing.docs[0].id,
          data: eventData,
        })
      : await payload.create({
          collection: 'events',
          data: eventData,
        })

  return NextResponse.json({ ok: true, event: savedEvent })
}

export async function POST(req: NextRequest) {
  try {
    const { url } = (await req.json()) as { url?: string }
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }
    return handleImport(url)
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


