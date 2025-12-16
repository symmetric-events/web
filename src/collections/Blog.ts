import { lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

export const Blog: CollectionConfig = {
  slug: 'blog',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        const title = data.title as string | undefined
        const existingSlug = (data as any).slug as string | undefined

        if (!existingSlug && title) {
          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')

          ;(data as any).slug = slug
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly version of the title (auto-generated if not provided)',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      label: 'Content',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
      admin: {
        description: 'Main blog post content',
      },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Private', value: 'private' },
      ],
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary of the blog post (used in listings and meta descriptions)',
      },
    },
    {
      name: 'publishedAt',
      label: 'Published Date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Original publication date',
      },
    },
    {
      name: 'modifiedAt',
      label: 'Last Modified Date',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Last modification date',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Author from Users collection',
      },
    },
    {
      name: 'authorName',
      label: 'Author Name',
      type: 'text',
      admin: {
        description: 'Author name (used when author is not in Users collection)',
      },
    },
    {
      name: 'featuredImage',
      label: 'Featured Image',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Main image for the blog post',
      },
    },
    {
      name: 'featuredImageUrl',
      label: 'Featured Image URL',
      type: 'text',
      admin: {
        description: 'External URL for featured image (if not using Media collection)',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'tags',
      type: 'array',
      labels: {
        singular: 'Tag',
        plural: 'Tags',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Tags for categorizing blog posts',
      },
    },
    {
      name: 'relatedEvents',
      label: 'Related Events',
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      admin: {
        description: 'Events to display as "Where to go from here" section',
      },
    },
    {
      name: 'sticky',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Pin this post to the top of blog listings',
      },
    },
    {
      name: 'readingTime',
      label: 'Reading Time',
      type: 'text',
      admin: {
        description: 'Estimated reading time (e.g., "6 minutes")',
      },
    },
    {
      name: 'seo',
      label: 'SEO Settings',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          label: 'Meta Title',
          type: 'text',
          admin: {
            description: 'SEO title (if different from post title)',
          },
        },
        {
          name: 'metaDescription',
          label: 'Meta Description',
          type: 'textarea',
          admin: {
            description: 'SEO meta description',
          },
        },
        {
          name: 'ogImage',
          label: 'Open Graph Image',
          type: 'relationship',
          relationTo: 'media',
          admin: {
            description: 'Image for social media sharing (defaults to featured image)',
          },
        },
        {
          name: 'ogImageUrl',
          label: 'Open Graph Image URL',
          type: 'text',
          admin: {
            description: 'External URL for Open Graph image',
          },
        },
        {
          name: 'canonicalUrl',
          label: 'Canonical URL',
          type: 'text',
          admin: {
            description: 'Canonical URL for SEO (if different from default)',
          },
        },
      ],
    },
  ],
  timestamps: true,
}

