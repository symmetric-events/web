import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { env } from '@/env'

type CheckoutItem = {
  eventId: string
  eventTitle: string
  eventSlug: string
  price: number // in cents
  currency: 'EUR' | 'USD'
  quantity: number
  startDate?: string
  endDate?: string
  earlyBirdDiscount?: number // in cents
}

type CustomerPayload = {
  firstName: string
  lastName: string
  email: string
  phone: string
  company?: string
  vatNumber?: string
  poNumber?: string
  country?: string
  city?: string
  address1?: string
  postcode?: string
  notes?: string
}

async function getIdokladAccessToken() {
  const identityBase = 'https://identity.idoklad.cz/server/v2'
  const url = `${identityBase.replace(/\/$/, '')}/connect/token`
  const clientId = env.IDOKLAD_CLIENT_ID
  const clientSecret = env.IDOKLAD_CLIENT_SECRET
  const applicationId = env.IDOKLAD_APPLICATION_ID

  if (!clientId || !clientSecret || !applicationId) {
    throw new Error('iDoklad client credentials not configured')
  }

  const form = new URLSearchParams()
  form.set('grant_type', 'client_credentials')
  form.set('application_id', applicationId)
  form.set('client_id', clientId)
  form.set('client_secret', clientSecret)
  form.set('scope', 'idoklad_api')

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
    // Ensure not cached in Next
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to obtain iDoklad token: ${res.status} ${text}`)
  }
  const json = await res.json() as { access_token: string }
  if (!json.access_token) throw new Error('iDoklad token missing in response')
  return json.access_token
}

async function getCountryInfoFromName(countryName: string): Promise<{ id: number; isEuMember: boolean } | null> {
  try {
    const accessToken = await getIdokladAccessToken()
    
    // First, try to get all countries and search locally
    // This is more reliable than using complex filter syntax
    const searchUrl = 'https://api.idoklad.cz/v3/Countries?pagesize=1000'
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to search countries: ${response.status} ${response.statusText}`, errorText)
      return null
    }

    const data = await response.json()
    const countries = data.Data?.Items || []
    
    console.log(`Found ${countries.length} countries, searching for: "${countryName}"`)
    
    // Find exact match first (case-insensitive) in English name
    const exactMatch = countries.find((country: any) => 
      country.NameEnglish?.toLowerCase() === countryName.toLowerCase()
    )
    
    if (exactMatch) {
      console.log(`Found exact match: ${exactMatch.NameEnglish} (ID: ${exactMatch.Id}, EU: ${exactMatch.IsEuMember})`)
      return { id: exactMatch.Id, isEuMember: exactMatch.IsEuMember || false }
    }
    
    // Try partial match in English name
    const partialMatch = countries.find((country: any) => 
      country.NameEnglish?.toLowerCase().includes(countryName.toLowerCase())
    )
    
    if (partialMatch) {
      console.log(`Found partial match: ${partialMatch.NameEnglish} (ID: ${partialMatch.Id}, EU: ${partialMatch.IsEuMember})`)
      return { id: partialMatch.Id, isEuMember: partialMatch.IsEuMember || false }
    }
    
    // Try match in Czech name as fallback
    const czechMatch = countries.find((country: any) => 
      country.Name?.toLowerCase() === countryName.toLowerCase() ||
      country.Name?.toLowerCase().includes(countryName.toLowerCase())
    )
    
    if (czechMatch) {
      console.log(`Found Czech match: ${czechMatch.Name} (ID: ${czechMatch.Id}, EU: ${czechMatch.IsEuMember})`)
      return { id: czechMatch.Id, isEuMember: czechMatch.IsEuMember || false }
    }
    
    console.log(`No match found for country: "${countryName}"`)
    return null
  } catch (error) {
    console.error('Error looking up country info:', error)
    return null
  }
}

async function createIdokladInvoice(params: {
  items: CheckoutItem[]
  currency: 'EUR' | 'USD'
  customer: CustomerPayload
}) {
  const apiBase = 'https://api.idoklad.cz/v3'
  const token = await getIdokladAccessToken()

  async function idokladGet<T>(path: string): Promise<T> {
    const res = await fetch(`${apiBase}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`iDoklad GET ${path} failed: ${res.status} ${text}`)
    }
    return res.json() as Promise<T>
  }

  async function idokladPost<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${apiBase}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`iDoklad POST ${path} failed: ${res.status} ${text}`)
    }
    return res.json() as Promise<T>
  }

  // 1) Ensure Contact exists → PartnerId
  const emailB64 = Buffer.from(params.customer.email ?? '', 'utf8').toString('base64')
  const companyName = params.customer.company || `${params.customer.firstName} ${params.customer.lastName}`.trim()
  // Look up country info early so we can use it for VAT logic
  const countryInfo = params.customer.country 
    ? await getCountryInfoFromName(params.customer.country)
    : null
  
  const isEuMember = countryInfo?.isEuMember ?? false
  console.log(`Country: ${params.customer.country}, EU Member: ${isEuMember}`)

  const companyB64 = Buffer.from(companyName, 'utf8').toString('base64')
  // Try search by email, fallback to company name
  const contactsList: any = await idokladGet(`/Contacts?filter=(Email~eq:base64~${emailB64})`)
  let partnerId: number | undefined = contactsList?.Data?.[0]?.Id ?? contactsList?.Items?.[0]?.Id
  if (!partnerId) {
    const fallbackList: any = await idokladGet(`/Contacts?filter=(CompanyName~eq:base64~${companyB64})`)
    partnerId = fallbackList?.Data?.[0]?.Id ?? fallbackList?.Items?.[0]?.Id
  }
  if (!partnerId) {
    // Create minimal contact
    const newContactPayload = {
      CompanyName: companyName,
      Email: params.customer.email,
      Phone: params.customer.phone,
      City: params.customer.city ?? '',
      Street: params.customer.address1 ?? '',
      PostalCode: params.customer.postcode ?? '',
      CountryId: countryInfo?.id ?? 1, // Fallback to 1 if country lookup fails
      VatNumber: params.customer.vatNumber ?? undefined,
      IsRegisteredForVatOnPay: false,
    }
    const created: any = await idokladPost('/Contacts', newContactPayload)
    const createdData = created?.Data ?? created
    partnerId = createdData?.Id
  }

  if (!partnerId) {
    throw new Error('Failed to resolve PartnerId for iDoklad contact')
  }

  // Map items with appropriate VAT logic based on EU membership
  const lineItems = params.items.map((item) => {
    const basePrice = Math.round(item.price) / 100 // cents -> units
    
    // Price logic:
    // - Customer sees base price (e.g., €1000)
    // - EU customers: Invoice shows €1000 + 20% VAT = €1200 total
    // - Non-EU customers: Invoice shows €1000 total (no VAT)
    // iDoklad automatically calculates VAT based on VatRateType
    const unitPrice = basePrice
    
    console.log(`Item: ${item.eventTitle}, Base Price: €${unitPrice}, EU Member: ${isEuMember}, VAT Rate: ${isEuMember ? '20%' : '0%'}`)
    
    return {
      Name: item.eventTitle,
      Description: `Training${item.startDate && item.endDate ? ` - ${new Date(item.startDate).toLocaleDateString()} to ${new Date(item.endDate).toLocaleDateString()}` : ''}`,
      UnitPrice: unitPrice,
      Amount: item.quantity,
      Unit: 'pcs',
      // For non-EU countries, use zero VAT rate (RateType: 2 = Zero rate)
      // For EU countries, use basic VAT rate (RateType: 1 = Basic rate) - 20% VAT will be calculated automatically
      VatRateType: isEuMember ? 1 : 2, // 1 = Basic (20%), 2 = Zero
      DiscountPercentage: 0,
      IsTaxMovement: isEuMember, // Only true for EU countries
      PriceType: 0,
    }
  })

  // 2) Fetch Default invoice model to get required fields prefilled
  const defaults: any = await idokladGet('/IssuedInvoices/Default')
  const base = defaults?.Data ?? defaults

  // 3) Build invoice from defaults
  // Resolve CurrencyId for requested currency (USD/EUR) using code books
  let resolvedCurrencyId: number | undefined
  try {
    const codebooks: any = await idokladGet('/System/GetCodeBooks')
    const currencies = codebooks?.Data?.Currencies ?? codebooks?.Currencies ?? []
    const cur = Array.isArray(currencies)
      ? currencies.find((c: any) => (c?.Code || '').toUpperCase() === (params.currency || '').toUpperCase())
      : undefined
    if (cur?.Id) resolvedCurrencyId = cur.Id as number
  } catch {}

  const payload = {
    ...base,
    Description: `Training invoice${params.items?.length ? ` - ${params.items.map(i => i.eventTitle).join(', ')}` : ''}`,
    CurrencyId: resolvedCurrencyId ?? base?.CurrencyId,
    Items: lineItems,
    PartnerId: partnerId,
    OrderNumber: (params.customer as any)?.poNumber || base?.OrderNumber,
    Note: params.customer.notes ?? base?.Note ?? '',
  }

  const invoice = await idokladPost<any>('/IssuedInvoices', payload)
  // iDoklad often wraps data in { Data: {...} }
  const data = invoice?.Data ?? invoice
  return {
    id: data?.Id ?? data?.id,
    number: data?.DocumentNumber ?? data?.documentNumber,
    pdfUrl: data?.PdfUrl ?? data?.pdfUrl,
  }
}

function formatDateRangeLabel(startISO: string, endISO: string): string {
  const start = new Date(startISO)
  const end = new Date(endISO)
  const sameDay = start.toDateString() === end.toDateString()
  const fmt = (d: Date, withYear: boolean) =>
    d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: withYear ? 'numeric' : undefined,
    })
  if (sameDay) return fmt(start, true)
  const sameYear = start.getFullYear() === end.getFullYear()
  if (sameYear) return `${fmt(start, false)} – ${fmt(end, true)}`
  return `${fmt(start, true)} – ${fmt(end, true)}`
}

/**
 * Fetch pricing info including early bird discount for an item
 */
async function getPricingInfo(
  eventSlug: string,
  startDate: string,
  endDate: string,
  quantity: number,
): Promise<{ basePrice: number; earlyBirdDiscount: number; finalPrice: number } | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(
      `${baseUrl}/api/events/${eventSlug}/pricing?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&quantity=${quantity}`,
      { cache: 'no-store' },
    )
    if (!res.ok) return null
    const data = await res.json()
    return {
      basePrice: data.basePrice || 0,
      earlyBirdDiscount: data.earlyBirdDiscount || 0,
      finalPrice: data.finalPrice || data.basePrice || 0,
    }
  } catch (error) {
    console.error('Failed to fetch pricing info:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const paymentMethod: 'card' | 'invoice' = body.paymentMethod
    const items: CheckoutItem[] = body.items ?? []

    // Require dates for each item and append selected dates to eventTitle
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }
    for (const it of items) {
      if (!it.startDate || !it.endDate) {
        return NextResponse.json({ error: 'Event dates are required' }, { status: 400 })
      }
    }

    // Verify early bird eligibility and apply discounts
    const itemsWithPricing = await Promise.all(
      items.map(async (it) => {
        const label = formatDateRangeLabel(it.startDate as string, it.endDate as string)
        let finalPrice = it.price // Price already in cents
        let earlyBirdDiscount = 0

        // Fetch pricing info to get early bird discount
        if (it.eventSlug && it.startDate && it.endDate) {
          const pricingInfo = await getPricingInfo(
            it.eventSlug,
            it.startDate,
            it.endDate,
            it.quantity,
          )
          if (pricingInfo) {
            // Convert final price from EUR to cents
            finalPrice = Math.round(pricingInfo.finalPrice * 100)
            earlyBirdDiscount = Math.round(pricingInfo.earlyBirdDiscount * 100)
          }
        }

        return {
          ...it,
          eventTitle: `${it.eventTitle} (${label})`,
          price: finalPrice, // Update price with early bird discount applied
          earlyBirdDiscount, // Store early bird discount amount
        }
      }),
    )

    const itemsWithDates: CheckoutItem[] = itemsWithPricing
    const customer: CustomerPayload = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.customerEmail || body.email,
      phone: body.customerPhone || body.phone,
      company: body.customerCompany || body.company,
      vatNumber: body.vatNumber,
      country: body.country,
      city: body.city,
      address1: body.address1,
      postcode: body.postcode,
      notes: body.notes,
    }

    if (paymentMethod === 'invoice') {
      const currency = (itemsWithDates[0]?.currency ?? 'EUR') as 'EUR' | 'USD'
      const created = await createIdokladInvoice({ items: itemsWithDates, currency, customer })
      return NextResponse.json({
        success: true,
        orderId: created.id,
        invoiceNumber: created.number,
        invoicePdfUrl: created.pdfUrl,
      })
    }

    // Stripe card flow
    const currency = (itemsWithDates[0]?.currency ?? 'EUR') as 'EUR' | 'USD'
    
    // Determine VAT logic based on customer country
    const countryInfo = customer.country 
      ? await getCountryInfoFromName(customer.country)
      : null
    
    const isEuMember = countryInfo?.isEuMember ?? false
    const vatRate = isEuMember ? 0.20 : 0 // 20% VAT for EU, 0% for non-EU
    console.log(`Stripe checkout - Country: ${customer.country}, EU Member: ${isEuMember}, VAT Rate: ${(vatRate * 100).toFixed(0)}%`)
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: itemsWithDates.map((item) => {
        const basePrice = item.price // Already in cents
        const vatAmount = Math.round(basePrice * vatRate)
        const totalPrice = basePrice + vatAmount
        
        console.log(`Item: ${item.eventTitle}, Base: ${basePrice/100}, VAT: ${vatAmount/100}, Total: ${totalPrice/100}`)
        
        return {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: item.eventTitle,
              description: `Training${item.startDate && item.endDate ? ` - ${new Date(item.startDate).toLocaleDateString()} to ${new Date(item.endDate).toLocaleDateString()}` : ''}`,
            },
            unit_amount: totalPrice, // Total price including VAT
          },
          quantity: item.quantity,
        }
      }),
      mode: 'payment',
      success_url: `${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register/cancel`,
      customer_email: customer.email,
      metadata: {
        customerName: `${customer.firstName} ${customer.lastName}`.trim(),
        customerCompany: customer.company || '',
        customerPhone: customer.phone,
        customerCountry: customer.country || '',
        customerCity: customer.city || '',
        customerAddress: customer.address1 || '',
        customerPostcode: customer.postcode || '',
        customerVatNumber: customer.vatNumber || '',
        customerPoNumber: customer.poNumber || '',
        customerNotes: customer.notes || '',
        eventIds: itemsWithDates.map(item => item.eventId).join(','),
        eventSlugs: itemsWithDates.map(item => item.eventSlug).join(','),
        participants: JSON.stringify(body.participants || []),
        isEuMember: isEuMember.toString(),
        vatRate: (vatRate * 100).toString(),
        basePrices: JSON.stringify(itemsWithDates.map(item => ({
          eventId: item.eventId,
          basePrice: item.price,
          vatAmount: Math.round(item.price * vatRate),
          totalPrice: item.price + Math.round(item.price * vatRate)
        }))),
        earlyBirdDiscounts: JSON.stringify(itemsWithDates.map(item => ({
          eventId: item.eventId,
          earlyBirdDiscount: item.earlyBirdDiscount || 0,
        }))),
      },
    })

    return NextResponse.json({
      success: true,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
