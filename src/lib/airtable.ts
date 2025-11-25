import type { Order } from '~/payload-types'

type LineItemInput = {
  name: string
  subtotal: number
}

export type AirtablePayload = Record<string, unknown>

function trimOrEmpty(value: string | null | undefined): string {
  return (value ?? '').toString().trim()
}

function isUsd(currency: string | null | undefined): boolean {
  return (currency ?? '').toUpperCase() === 'USD'
}

function toNumberOrZero(value: unknown): number {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : 0
}

// Minimal country code → full name mapping with sensible fallbacks
const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  CH: 'Switzerland',
  DE: 'Germany',
  AT: 'Austria',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  PT: 'Portugal',
  NL: 'Netherlands',
  BE: 'Belgium',
  LU: 'Luxembourg',
  IE: 'Ireland',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  SE: 'Sweden',
  NO: 'Norway',
  FI: 'Finland',
  DK: 'Denmark',
  PL: 'Poland',
  CZ: 'Czech Republic',
  SK: 'Slovakia',
  HU: 'Hungary',
  RO: 'Romania',
  BG: 'Bulgaria',
  GR: 'Greece',
  EE: 'Estonia',
  LV: 'Latvia',
  LT: 'Lithuania',
  US: 'United States',
  CA: 'Canada',
  AU: 'Australia',
  NZ: 'New Zealand'
}

function resolveCountryName(countryCodeOrName: string | null | undefined): string {
  const raw = trimOrEmpty(countryCodeOrName)
  if (!raw) return ''
  const upper = raw.toUpperCase()
  if (COUNTRY_CODE_TO_NAME[upper]) return COUNTRY_CODE_TO_NAME[upper]
  return raw
}

function mapPaymentMethod(method: Order['paymentMethod']): string {
  // Make mapping used Woo: offline_gateway → Card; bacs → Bank transfer; stripe → Stripe
  // For our system: 'card' → 'Card', 'invoice' → 'Bank transfer'
  if (method === 'card') return 'Card'
  if (method === 'invoice') return 'Bank transfer'
  return trimOrEmpty(method as string)
}

function detectRegistrationType(params: { lineItems?: LineItemInput[]; eventTitle?: string | null }): string {
  const haystacks: string[] = []
  if (params?.eventTitle) haystacks.push(params.eventTitle)
  if (Array.isArray(params?.lineItems)) haystacks.push(...params.lineItems.map(i => i.name))
  const hasRecording = haystacks.some(s => s?.toLowerCase().includes('recording'))
  return hasRecording ? 'Recording' : 'Standard'
}

function buildAddressMarkdown(order: Order): string {
  const address1 = trimOrEmpty(order.address?.address1)
  const address2 = trimOrEmpty(order.address?.address2)
  const city = trimOrEmpty(order.address?.city)
  const postcode = trimOrEmpty(order.address?.postcode)
  const state = trimOrEmpty(order.address?.state)
  const countryCode = trimOrEmpty(order.address?.country)
  const country = resolveCountryName(countryCode)

  const lines: string[] = []
  lines.push(`Address: ${address1}`)
  if (address2) lines.push(`Address 2: ${address2}`)
  if (city) lines.push(`City: ${city}`)
  if (postcode) lines.push(`Postcode: ${postcode}`)
  if (state) lines.push(`State: ${state}`)
  if (country) lines.push(`Country: ${country}`)
  return [''].concat(lines).join('\n') // Leading blank line to keep Make-style formatting
}

function computeSubtotal(order: Order, lineItems?: LineItemInput[]): number {
  const orderSubtotal = toNumberOrZero(order.subtotalAmount)
  if (orderSubtotal > 0) return orderSubtotal
  if (Array.isArray(lineItems) && lineItems.length > 0) {
    return lineItems.reduce((acc, li) => acc + toNumberOrZero(li.subtotal), 0)
  }
  const unit = isUsd(order.currency) ? toNumberOrZero(order.priceUSD) : toNumberOrZero(order.priceEUR)
  const qty = toNumberOrZero(order.quantity) || 1
  return unit * qty
}

export function buildAirtablePayload(order: Order, opts?: { couponCode?: string; lineItems?: LineItemInput[]; participantDetails?: { participantName?: string; participantJobtitle?: string; participantEmail?: string } }): AirtablePayload {
  const currencyUsd = isUsd(order.currency)
  const subtotal = computeSubtotal(order, opts?.lineItems)
  const discount = toNumberOrZero(order.discountAmount)
  const tax = toNumberOrZero(order.taxAmount)
  const firstName = trimOrEmpty(order.customerFirstName)
  const lastName = trimOrEmpty(order.customerLastName)
  const fullName = trimOrEmpty(`${firstName} ${lastName}`)
  const status = (order.status === 'cancelled' || order.status === 'failed') ? order.status : order.status

  // VAT/Discount transformations per Make mapping
  const vatValue = tax === 0 ? '' : (currencyUsd ? (tax / 1.1) : tax)
  const discountValue = discount === 0 ? '' : (currencyUsd ? (discount / 1.1) : discount)
  const fullPriceValue = currencyUsd ? (subtotal / 1.1) : subtotal

  // Build line items array
  const lineItems = opts?.lineItems || [{
    name: order.eventTitle || 'Training',
    quantity: order.quantity || 1,
    subtotal: subtotal,
    productId: order.eventId || ''
  }]

  // Build coupon lines array
  const couponLines = opts?.couponCode ? [{
    code: opts.couponCode,
    discount: discount.toString()
  }] : []

  // Build metadata array
  const metaData = []
  if (order.vatNumber) {
    metaData.push({
      key: '_billing_vat_number',
      value: order.vatNumber
    })
  }
  if (order.notes) {
    metaData.push({
      key: 'billing_notes',
      value: order.notes
    })
  }

  // Build participant details array
  const participantDetails = opts?.participantDetails ? [opts.participantDetails] : [{
    participantName: fullName,
    participantJobtitle: '',
    participantEmail: trimOrEmpty(order.customerEmail)
  }]

  const payload: AirtablePayload = {
    id: order.id,
    status: status,
    currency: order.currency,
    total: order.totalAmount.toString(),
    billing: {
      company: trimOrEmpty(order.customerCompany),
      city: trimOrEmpty(order.address?.city),
      state: trimOrEmpty(order.address?.state),
      postcode: trimOrEmpty(order.address?.postcode),
      country: trimOrEmpty(order.address?.country),
      email: trimOrEmpty(order.customerEmail),
      phone: trimOrEmpty(order.customerPhone),
      firstName: firstName,
      lastName: lastName,
      address1: trimOrEmpty(order.address?.address1),
      address2: trimOrEmpty(order.address?.address2),
      billingNotes: trimOrEmpty(order.notes)
    },
    dateCreated: trimOrEmpty(order.createdAt),
    paymentMethod: order.paymentMethod,
    totalTax: tax.toString(),
    discountTotal: discount.toString(),
    couponLines: couponLines,
    metaData: metaData,
    lineItems: lineItems,
    participantDetails: participantDetails
  }

  return payload
}


