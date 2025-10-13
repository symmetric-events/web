import { NextRequest, NextResponse } from 'next/server'
// import { stripe, formatAmountForStripe } from '~/lib/stripe'
// import { getPayload } from 'payload'
// import config from '~/payload.config'
// import { type CartItem } from '~/lib/cart'
// import { env } from '~/env'

// iDoklad API integration
// async function createInvoice({ items, total, currency, customer }: {
//   items: CartItem[]
//   total: number
//   currency: string
//   customer: any
// }) {
//   const IDOKLAD_API_KEY = env.IDOKLAD_API_KEY
//   const IDOKLAD_BASE_URL = 'https://api.idoklad.cz/v3'

//   if (!IDOKLAD_API_KEY) {
//     throw new Error('iDoklad API key not configured')
//   }

//   // Convert items to iDoklad line items
//   const lineItems = items.map((item) => ({
//     Name: item.eventTitle,
//     Description: `Training Event${item.startDate && item.endDate ? ` - ${new Date(item.startDate).toLocaleDateString()} to ${new Date(item.endDate).toLocaleDateString()}` : ''}`,
//     UnitPrice: item.price / 100, // Convert from cents to currency units
//     Amount: item.quantity,
//     Unit: 'ks', // Czech for "pieces"
//     VatRateType: 0, // 0% VAT for training services (adjust as needed)
//   }))

//   // Create customer contact
//   const customerData = {
//     Name: customer.company || `${customer.firstName} ${customer.lastName}`,
//     Email: customer.email,
//     Phone: customer.phone,
//     Country: customer.country || 'CZ',
//     City: customer.city,
//     Street: customer.address1,
//     PostalCode: customer.postcode,
//     IsVatPayer: !!customer.vatNumber,
//     VatNumber: customer.vatNumber,
//   }

//   // Create invoice data
//   const invoiceData = {
//     DocumentType: 0, // Regular invoice
//     DateOfIssue: new Date().toISOString().split('T')[0],
//     DateOfTaxing: new Date().toISOString().split('T')[0],
//     DateOfMaturity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
//     Currency: currency.toUpperCase(),
//     Items: lineItems,
//     Partner: customerData,
//     Note: customer.notes || '',
//   }

//   try {
//     // Create the invoice
//     const response = await fetch(`${IDOKLAD_BASE_URL}/IssuedInvoices`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${IDOKLAD_API_KEY}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(invoiceData),
//     })

//     if (!response.ok) {
//       const errorText = await response.text()
//       console.error('iDoklad API error:', errorText)
//       throw new Error(`iDoklad API error: ${response.status}`)
//     }

//     const invoice = await response.json()
//     return {
//       id: invoice.Data.Id,
//       number: invoice.Data.DocumentNumber,
//       url: invoice.Data.PdfUrl,
//     }
//   } catch (error) {
//     console.error('Error creating invoice in iDoklad:', error)
//     throw error
//   }
// }

// POST /api/checkout-payload - Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {





    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
