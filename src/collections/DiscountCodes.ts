import type { CollectionConfig } from 'payload'

export const DiscountCodes: CollectionConfig = {
  slug: 'discount-codes',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'expiresAt', 'limitedUsage', 'usesLeft'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'type',
      type: 'radio',
      required: true,
      defaultValue: 'percentage',
      options: [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Flat', value: 'flat' },
      ],
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      admin: {
        description: 'Percentage (e.g. 10 for 10%) or flat amount depending on type',
      },
      min: 0,
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'limitedUsage',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Limit the number of times this code can be used',
      },
    },
    {
      name: 'usesLeft',
      type: 'number',
      min: 0,
      required: false,
      admin: {
        description: 'Number of remaining uses when limited',
        condition: (data) => Boolean((data as any)?.limitedUsage),
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}


