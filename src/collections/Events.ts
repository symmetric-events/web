import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { env } from '~/env'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'Title',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [({ data }) => {
      if (!data) return data
      const title = data.Title as string | undefined
      const existingSlug = data.slug as string | undefined
      if (!existingSlug && title) {
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          ; (data as any).slug = slug
      }
      return data
    }],
    afterChange: [
      async ({ doc, operation }) => {
        // Only revalidate on create/update (not on read).
        if (operation !== 'create' && operation !== 'update') return doc

        const slug = (doc as any)?.slug
        if (!slug || typeof slug !== 'string') return doc

        try {
          const configured = (env.NEXT_PUBLIC_APP_URL || '').trim()
          const baseUrl =
            configured ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
            'http://localhost:3000'
          const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')

          const res = await fetch(`${normalizedBaseUrl}/api/revalidate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              secret: env.REVALIDATION_SECRET,
              slug,
            }),
          })

          if (!res.ok) {
            const text = await res.text().catch(() => '')
            console.error(
              `Failed to revalidate event pages for slug="${slug}": ${res.status} ${text}`,
            )
          }
        } catch (error) {
          console.error('Failed to call revalidation endpoint for event', {
            slug,
            error,
          })
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'eventLink',
      type: 'text',
      admin: {
        components: {
          Field: '~/collections/Events/EventLinkField#EventLinkField',
        },
        readOnly: true,
        hidden: false,
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories' as any,
      hasMany: true,
      required: true,
    },
    {
      name: 'Event Dates',
      type: 'array',
      labels: {
        singular: 'Event Date Range',
        plural: 'Event Date Ranges',
      },
      fields: [
        {
          name: 'Start Date',
          type: 'date',
        },
        {
          name: 'Start Time',
          type: 'text',
          admin: {
            description: 'Format: HH:MM (24-hour format, e.g., 09:00, 14:30)',
            placeholder: '09:00',
          },
          validate: (value: string | string[] | null | undefined) => {
            if (!value || Array.isArray(value)) return true; // Optional field
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(value)) {
              return 'Please enter time in HH:MM format (24-hour)';
            }
            return true;
          },
        },
        {
          name: 'End Date',
          type: 'date',
        },
        {
          name: 'End Time',
          type: 'text',
          admin: {
            description: 'Format: HH:MM (24-hour format, e.g., 17:00, 18:30)',
            placeholder: '17:00',
          },
          validate: (value: string | string[] | null | undefined) => {
            if (!value || Array.isArray(value)) return true; // Optional field
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(value)) {
              return 'Please enter time in HH:MM format (24-hour)';
            }
            return true;
          },
        },
      ],
    },
    {
      name: 'Price',
      type: 'group',
      admin: {
        hidden: true,
      },
      fields: [
        {
          name: 'USD',
          label: 'USD ($)',
          type: 'number',
          required: true,
          defaultValue: 0,
        },
        {
          name: 'EUR',
          label: 'EUR (€)',
          type: 'number',
          required: true,
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'Training Type',
      type: 'select',
      required: true,
      defaultValue: 'online',
      options: [
        { label: 'Online', value: 'online' },
        { label: 'In-Person', value: 'in-person' },
      ],
      admin: {
        description: 'Select whether this training will be conducted online or in-person',
      },
    },
    {
      name: 'Training Location',
      type: 'text',
      admin: {
        condition: (data) => data['Training Type'] === 'in-person',
        description: 'Enter the physical location for in-person training (e.g., "Vienna, Austria", "London, UK")',
      },
    },
    {
      name: 'Description',
      type: 'textarea',
    },
    {
      name: 'Featured Image',
      type: 'text',
    },
    {
      name: 'Key Topic',
      type: 'array',
      labels: {
        singular: 'Key Topic',
        plural: 'Key Topics',
      },
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'Why Attend',
      type: 'array',
      labels: {
        singular: 'Why Attend',
        plural: 'Why Attend',
      },
      fields: [
        {
          name: 'Title',
          type: 'textarea',
          required: true,
        },
        {
          name: 'Description',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'Training Experience',
      type: 'array',
      labels: {
        singular: 'Training Experience',
        plural: 'Training Experience',
      },
      fields: [
        {
          name: 'Title',
          type: 'text',
          required: true,
        },
        {
          name: 'Description',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'Learning Objectives',
      type: 'array',
      labels: {
        singular: 'Learning Objective',
        plural: 'Learning Objectives',
      },
      fields: [
        {
          name: 'Title',
          type: 'text',
          required: true,
        },
        {
          name: 'Description',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'Testimonials',
      type: 'relationship',
      relationTo: 'testimonials' as any,
      hasMany: true,
    },
    {
      name: 'Who Is Training For',
      type: 'array',
      labels: {
        singular: 'Audience',
        plural: 'Audience',
      },
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'Trainers',
      type: 'relationship',
      relationTo: 'trainers' as any,
      hasMany: true,
    },
    {
      name: 'video',
      type: 'text',
      admin: {
        description: 'Video URL (e.g., YouTube, Vimeo, or direct video link)',
      },
    },
    {
      name: 'sneekPeek',
      type: 'group',
      admin: {
        description: 'Sneak peek preview with image and PDF link',
      },
      fields: [
        {
          name: 'imageUrl',
          type: 'text',
          admin: {
            description: 'URL of the sneak peek image',
          },
        },
        {
          name: 'pdfLink',
          type: 'text',
          admin: {
            description: 'Link to the PDF file',
          },
        },
      ],
    },
    {
      name: 'Agenda',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Upload a PDF file for the event agenda (PDF only)',
      },
    },
  ],
  timestamps: true,
}

