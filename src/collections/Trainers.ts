import type { CollectionConfig } from 'payload'

export const Trainers: CollectionConfig = {
  slug: 'trainers',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'biography',
      type: 'textarea',
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'position',
      type: 'text',
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'image_url',
      type: 'text',
    },

  ],
}


