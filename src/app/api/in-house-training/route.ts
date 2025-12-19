import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { env } from '@/env'

// Email recipients from the PHP code
const RECIPIENTS = [
  // 'matus.laco@symmetric.events'
  'b.zalubel@symmetric.events',
  'm.babusiak@symmetric.events',
  'a.molnar@symmetric.events',
  'm.boda@symmetric.events'
]

function sanitize(value: any): string {
  if (typeof value !== 'string') return ''
  // Basic HTML sanitization - remove script tags and dangerous content
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

function nl2br(text: string): string {
  return text.replace(/\n/g, '<br>')
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
    }

    const safe = (key: string): string => {
      return data[key] ? sanitize(String(data[key])) : ''
    }

    const name = safe('name')
    const firstName = safe('first_name')
    const lastName = safe('last_name')
    const function_val = safe('function')
    const company = safe('company')
    const email = safe('email')
    const audience = safe('audience_msg')
    const objective = safe('objective_msg')
    const url = safe('url')
    const date = safe('date')
    const time = safe('time')

    // Build HTML email body
    let body = '<h2>New In-House Training Request</h2>'
    body += `<p><strong>Name:</strong> ${name}</p>`
    body += `<p><strong>First name:</strong> ${firstName}</p>`
    body += `<p><strong>Last name:</strong> ${lastName}</p>`
    body += `<p><strong>Function:</strong> ${function_val}</p>`
    body += `<p><strong>Company:</strong> ${company}</p>`
    body += `<p><strong>Email:</strong> ${email}</p>`
    body += `<p><strong>Audience:</strong><br>${nl2br(audience)}</p>`
    body += `<p><strong>Training Objective:</strong><br>${nl2br(objective)}</p>`
    body += `<p><strong>URL:</strong> <a href="${url}">${url}</a></p>`
    body += `<p><strong>Date:</strong> ${date} <strong>Time:</strong> ${time}</p>`

    // Build plain text version
    const textBody = `New In-House Training Request

Name: ${name}
First name: ${firstName}
Last name: ${lastName}
Function: ${function_val}
Company: ${company}
Email: ${email}
Audience: ${audience.replace(/\n/g, '\n  ')}
Training Objective: ${objective.replace(/\n/g, '\n  ')}
URL: ${url}
Date: ${date} Time: ${time}`

    // Send email using nodemailer
    const smtpHost = env.SMTP_HOST || 'smtp.websupport.sk'
    const smtpPort = 465
    const smtpUser = env.SMTP_USER || 'info@symmetric.events'
    const smtpPass = env.SMTP_PASS || ''
    const fromEmail = env.SMTP_FROM_EMAIL || smtpUser
    const fromName = env.SMTP_FROM_NAME || 'Symmetric'

    if (!smtpPass) {
      console.warn('SMTP_PASS not configured, email will not be sent')
      return NextResponse.json({ 
        success: false, 
        message: 'Email configuration missing' 
      }, { status: 500 })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // Send email
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: RECIPIENTS.join(', '),
      replyTo: email || fromEmail,
      subject: 'New In-House Training Request',
      text: textBody,
      html: body,
    })

    console.log('Email sent successfully:', info.messageId)

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent',
      messageId: info.messageId
    })
  } catch (error) {
    console.error('Error sending in-house training email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

