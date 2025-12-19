import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { env } from '@/env'

// Webhook URL from the PHP code
const WEBHOOK_URL = 'https://hkdk.events/w8j54crxpw7kgb'

// Gmail API OAuth2 functions
async function getGmailAccessToken(): Promise<string | null> {
  // Note: Using process.env directly since these are optional env vars
  // Make sure GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN
  // are set in your .env file and match the OAuth 2.0 client credentials
  // in Google Cloud Console. The refresh token must be generated using the
  // same client ID/secret pair.
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('Gmail API credentials are missing', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRefreshToken: !!refreshToken,
    })
    return null
  }

  try {
    const formData = new URLSearchParams()
    formData.append('client_id', clientId)
    formData.append('client_secret', clientSecret)
    formData.append('refresh_token', refreshToken)
    formData.append('grant_type', 'refresh_token')

    const bodyString = formData.toString()

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyString,
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Failed to get Gmail access token:', {
        status: response.status,
        statusText: response.statusText,
        response: responseText,
      })

      // Try to parse error for more details
      try {
        const errorData = JSON.parse(responseText)
        console.error('Gmail API error details:', errorData)

        if (errorData.error === 'invalid_grant') {
          console.error(
            'TROUBLESHOOTING: "invalid_grant" error usually means:\n' +
            '1. The refresh token was generated with different Client ID/Secret\n' +
            '2. The refresh token has expired or been revoked\n' +
            '3. The OAuth client type is incorrect (should be "Web application")\n' +
            '4. There are extra spaces/quotes in your .env file values\n\n' +
            'SOLUTION: Regenerate the refresh token using the same Client ID/Secret:\n' +
            '- Go to Google Cloud Console > APIs & Services > Credentials\n' +
            '- Find your OAuth 2.0 Client ID\n' +
            '- Use OAuth 2.0 Playground or generate a new refresh token\n' +
            '- Make sure the Client ID matches GMAIL_CLIENT_ID exactly'
          )
        }
      } catch (e) {
        // Not JSON, that's okay
      }

      return null
    }

    const data = JSON.parse(responseText)
    if (!data.access_token) {
      console.error('No access_token in Gmail API response:', data)
      return null
    }

    console.log('Successfully obtained Gmail access token')
    return data.access_token
  } catch (error) {
    console.error('Error getting Gmail access token:', error)
    return null
  }
}

async function sendAgendaEmail(
  email: string,
  eventTitle: string,
  name: string,
  agendaFileUrl: string | null,
  agendaFileName: string | null,
  eventDate: string | null,
): Promise<boolean> {
  const accessToken = await getGmailAccessToken()
  if (!accessToken) {
    console.error('Failed to get Gmail access token')
    return false
  }

  const subject = 'Your Requested Course Agenda from Symmetric'

  // Build email message body
  const messageBody = eventDate
    ? `<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <p>Dear ${name},</p>

    <p>Thank you for your interest in our training course.</p>

    <p>As requested, please find the full agenda attached to this email.</p>

    <p>If you have any questions or need further assistance with registration, don't hesitate to get in touch.</p>

    <p>Best regards,</p>

    <p><strong>Laura Kristensen</strong><br>
    Booking & Registrations Department<br>
    <a href='mailto:laura.kristensen@symmetricevents.com'>laura.kristensen@symmetricevents.com</a><br>
    <a href='https://www.symmetric.events'>www.symmetric.events</a><br>
    +421 222 200 165</p>
</body>
</html>`
    : `<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <p>Dear ${name},</p>

    <p>Thank you for your interest in our training course.</p>

    <p>As requested, please find the full agenda attached.</p>

    <p>Please note: that the course is not currently scheduled.</p>

    <p>Additionally, <strong>if your team has five or more participants, we can organize the course as a public session and open it</strong> to others.</p>

    <p>If you'd like to explore in-house training options in the meantime, feel free to reply to this email.</p>

    <p>Best regards,</p>

    <p><strong>Laura Kristensen</strong><br>
    Booking & Registrations Department<br>
    <a href='mailto:laura.kristensen@symmetricevents.com'>laura.kristensen@symmetricevents.com</a><br>
    <a href='https://www.symmetric.events'>www.symmetric.events</a><br>
    +421 222 200 165</p>
</body>
</html>`

  // Build email headers
  const headers = [
    `From: "Laura Kristensen" <laura.kristensen@symmetricevents.com>`,
    `Reply-To: laura.kristensen@symmetricevents.com`,
    `To: ${email}`,
    `Bcc: 2621090@bcc.hubspot.com`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
  ]

  let emailContent = ''
  let boundary = ''

  if (agendaFileUrl) {
    try {
      // Download the PDF file
      console.log('Downloading agenda PDF from:', agendaFileUrl)
      const pdfResponse = await fetch(agendaFileUrl)
      
      if (!pdfResponse.ok) {
        console.error('Failed to download PDF file:', pdfResponse.status, pdfResponse.statusText)
        throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`)
      }

      const pdfBuffer = await pdfResponse.arrayBuffer()
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')
      
      // Use provided filename or extract from URL as fallback
      let finalFileName = agendaFileName || 'agenda.pdf'
      
      // If filename doesn't end with .pdf, add it
      if (!finalFileName.endsWith('.pdf')) {
        finalFileName = `${finalFileName}.pdf`
      }
      
      console.log('Using filename for attachment:', finalFileName)

      console.log('PDF downloaded successfully, size:', pdfBuffer.byteLength, 'bytes')

      boundary = `boundary_${Date.now()}`
      headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`)

      // Build multipart message with HTML body and PDF attachment
      emailContent = `--${boundary}\r\n`
      emailContent += `Content-Type: text/html; charset=UTF-8\r\n\r\n`
      emailContent += `${messageBody}\r\n\r\n`
      emailContent += `--${boundary}\r\n`
      emailContent += `Content-Type: application/pdf; name="${finalFileName}"\r\n`
      emailContent += `Content-Disposition: attachment; filename="${finalFileName}"\r\n`
      emailContent += `Content-Transfer-Encoding: base64\r\n\r\n`
      
      // Chunk base64 content into 76-character lines (RFC 2045)
      const chunks = []
      for (let i = 0; i < pdfBase64.length; i += 76) {
        chunks.push(pdfBase64.slice(i, i + 76))
      }
      emailContent += chunks.join('\r\n')
      emailContent += `\r\n`
      emailContent += `--${boundary}--\r\n`
      
      console.log('PDF attachment prepared successfully')
    } catch (error) {
      console.error('Error downloading or attaching PDF:', error)
      // If PDF download fails, we should still send the email but log the error
      // The email will be sent without attachment
      console.warn('Sending email without PDF attachment due to download error')
    }
  }

  // If no PDF attachment was prepared, send plain HTML email
  if (!emailContent) {
    headers.push(`Content-Type: text/html; charset=UTF-8\r\n\r\n`)
    emailContent = messageBody
    if (agendaFileUrl) {
      console.warn('Agenda URL was provided but attachment was not created')
    }
  }

  // Join headers and ensure proper separation from body
  const rawMessage = headers.join('\r\n') + '\r\n\r\n' + emailContent
  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  try {
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to send email via Gmail API:', response.status, errorText)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending email via Gmail API:', error)
    return false
  }
}

async function sendWebhookNotification(
  name: string,
  company: string,
  email: string,
  phone: string,
  eventTitle: string,
  eventSlug: string,
  eventId: number | string,
  firstName: string,
  lastName: string,
  currentUrl: string,
): Promise<void> {
  const now = new Date()
  const date = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const webhookData = {
    training: eventTitle,
    post_id: eventId,
    url: currentUrl,
    ip_address: '', // Will be set by server if needed
    date,
    time,
    'your-name': name,
    first_name: firstName,
    last_name: lastName,
    'your-company': company,
    'your-email': email,
    'your-phone': phone,
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(webhookData as any),
    })
  } catch (error) {
    console.error('Error sending webhook notification:', error)
    // Don't throw - webhook failure shouldn't fail the request
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const name = (data.name as string) || ''
    const firstName = (data.first_name as string) || ''
    const lastName = (data.last_name as string) || ''
    const company = (data.company as string) || ''
    const email = (data.email as string) || ''
    const phone = (data.phone as string) || ''
    const eventSlug = (data.event_slug as string) || ''
    const eventTitle = (data.event_title as string) || ''
    const eventId = data.event_id || ''
    const currentUrl = (data.current_url as string) || ''

    // Validate required fields
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 },
      )
    }

    if (!eventSlug) {
      return NextResponse.json(
        { error: 'Event information is missing' },
        { status: 400 },
      )
    }

    // Fetch event to get agenda PDF
    const payload = await getPayload({ config: await config })
    const eventRes = await payload.find({
      collection: 'events',
      where: {
        slug: {
          equals: eventSlug,
        },
      },
      depth: 2,
      limit: 1,
    })

    const event = eventRes.docs[0]
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 },
      )
    }

    // Get agenda PDF URL and filename
    // Agenda is a group field with 'pdf' and 'Agenda Image' properties
    let agendaFileUrl: string | null = null
    let agendaFileName: string | null = null
    
    if (event.Agenda?.pdf) {
      // pdf is a relationship field, so it might be an ID or populated object
      let agendaMedia: any = null
      const pdfField = event.Agenda.pdf
      
      if (typeof pdfField === 'object' && pdfField !== null) {
        agendaMedia = pdfField
      } else if (typeof pdfField === 'number' || typeof pdfField === 'string') {
        // If it's just an ID, fetch the media
        try {
          agendaMedia = await payload.findByID({
            collection: 'media',
            id: pdfField,
          })
        } catch (error) {
          console.error('Error fetching agenda media:', error)
        }
      }

      if (agendaMedia?.url) {
        // Get filename from media object
        agendaFileName = agendaMedia.filename || null
        
        // If URL is relative, make it absolute
        if (agendaMedia.url.startsWith('http')) {
          agendaFileUrl = agendaMedia.url
        } else {
          const baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          agendaFileUrl = `${baseUrl}${agendaMedia.url}`
        }
        
        console.log('Agenda PDF found:', {
          url: agendaFileUrl,
          filename: agendaFileName,
          mimeType: agendaMedia.mimeType,
          filesize: agendaMedia.filesize,
        })
      } else {
        console.warn('Agenda PDF media object found but no URL available')
      }
    } else {
      console.log('No agenda PDF found in event.Agenda.pdf')
    }

    // Get event date for email template
    const eventDates = event['Event Dates'] || []
    const firstDateRange = eventDates[0]
    const eventDate = firstDateRange?.['Start Date'] || null

    // Send email with agenda PDF attachment
    const emailSent = await sendAgendaEmail(
      email,
      eventTitle,
      firstName || name,
      agendaFileUrl,
      agendaFileName,
      eventDate,
    )

    if (!emailSent) {
      return NextResponse.json(
        {
          error:
            'Failed to send email. Please try again or contact us directly at laura.kristensen@symmetricevents.com',
        },
        { status: 500 },
      )
    }

    // Send webhook notification (fire-and-forget)
    sendWebhookNotification(
      name,
      company,
      email,
      phone,
      eventTitle,
      eventSlug,
      eventId,
      firstName,
      lastName,
      currentUrl,
    ).catch((error) => {
      console.error('Webhook notification failed:', error)
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error processing agenda request:', error)
    return NextResponse.json(
      {
        error:
          'An error occurred while processing your request. Please try again or contact us directly at laura.kristensen@symmetricevents.com',
      },
      { status: 500 },
    )
  }
}

