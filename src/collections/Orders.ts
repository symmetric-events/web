import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'status', 'totalAmount', 'customerEmail', 'createdAt'],
  },
  access: {
    read: () => true, // Allow reading for order management
    create: () => true, // Allow creating for checkout
    update: () => true, // Allow updating for payment status
    delete: () => true, // Allow deletion of orders
  },
  fields: [
    {
      name: 'sessionId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'stripeSessionId',
      type: 'text',
      index: true,
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Draft (Cart)', value: 'draft' },
        { label: 'Pending', value: 'pending' },
        { label: 'Pending Invoice', value: 'pending_invoice' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Abandoned', value: 'abandoned' },
      ],
      index: true,
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      defaultValue: 'card',
      options: [
        { label: 'Credit Card', value: 'card' },
        { label: 'Invoice', value: 'invoice' },
      ],
    },
    { name: 'eventId', type: 'text' },
    { name: 'eventTitle', type: 'text' },
    { name: 'eventSlug', type: 'text' },
    { name: 'eventDateId', type: 'text' },
    { name: 'quantity', type: 'number', min: 1, defaultValue: 1 },
    { name: 'startDate', type: 'date' },
    { name: 'endDate', type: 'date' },
    {
      name: 'discountAmount',
      type: 'number',
      required: false,
      min: 0,
    },
    {
      name: 'taxAmount',
      type: 'number',
      required: false,
      min: 0,
    },
    {
      name: 'paymentDueDate',
      type: 'date',
    },
    {
      name: 'invoiceId',
      type: 'text',
    },
    {
      name: 'invoiceNumber',
      type: 'text',
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'currency',
      type: 'text',
      required: true,
      defaultValue: 'USD',
    },
    {
      name: 'customerEmail',
      type: 'email',
    },
    {
      name: 'customerFirstName',
      type: 'text',
    },
    {
      name: 'customerLastName',
      type: 'text',
    },
    {
      name: 'customerCompany',
      type: 'text',
    },
    {
      name: 'customerPhone',
      type: 'text',
    },
    // Address fields to unify cart + order contact info
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'country', type: 'text' },
        { name: 'address1', type: 'text' },
        { name: 'address2', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'postcode', type: 'text' },
      ],
    },
    // Timeline fields for abandoned cart tracking
    {
      name: 'lastActivityAt',
      type: 'date',
      admin: { description: 'Updated on each draft change' }
    },
    {
      name: 'abandonedAt',
      type: 'date',
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    { name: 'vatNumber', type: 'text' },
    { name: 'poNumber', type: 'text' },
    { name: 'notes', type: 'textarea' },
    {
      name: 'participants',
      type: 'array',
      label: 'Participants',
      admin: {
        description: 'List of participants for this order',
      },
      fields: [
        {
          name: 'participantId',
          type: 'text',
          required: true,
          label: 'Participant ID',
          admin: {
            description: 'Computed as {orderId}-{participantNumber}',
            readOnly: true,
          },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Name',
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          label: 'Email',
        },
        {
          name: 'jobPosition',
          type: 'text',
          required: true,
          label: 'Job Position',
        },
      ],
    },
  ],
  timestamps: true,
}
