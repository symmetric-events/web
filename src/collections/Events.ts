import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

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
  },
  fields: [
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
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'Start Date',
          type: 'date',
          required: true,
        },
        {
          name: 'End Date',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      name: 'Price',
      type: 'group',
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
  ],
  timestamps: true,
}

