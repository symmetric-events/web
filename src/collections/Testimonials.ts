import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'author_name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'author_name',
      type: 'text',
    },
    {
      name: 'author_title',
      type: 'text',
    },
    {
      name: 'author_company',
      type: 'text',
    },
  ],
}


