import type { CollectionConfig } from 'payload'

export const Trainers: CollectionConfig = {
  slug: 'trainers',
  admin: {
    useAsTitle: 'name',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        const name = data.name as string | undefined
        const existingSlug = (data as any).slug as string | undefined

        if (!existingSlug && name) {
          const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')

            ; (data as any).slug = slug
        }

        return data
      },
    ],
  },
  access: {
    read: () => true,
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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'Featured Trainer',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark this trainer as featured',
      },
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


