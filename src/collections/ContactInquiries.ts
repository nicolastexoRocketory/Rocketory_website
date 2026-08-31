import type { CollectionConfig } from 'payload'

import { sendContactInquiryNotification } from '@/lib/contact-mail'

const STATUS_OPTIONS = [
  { label: 'Neu', value: 'new' },
  { label: 'In Bearbeitung', value: 'in_progress' },
  { label: 'Erledigt', value: 'done' },
  { label: 'Spam', value: 'spam' },
] as const

export const ContactInquiries: CollectionConfig = {
  slug: 'contact-inquiries',
  defaultSort: '-createdAt',
  labels: {
    singular: 'Kontaktanfrage',
    plural: 'Kontaktanfragen',
  },
  admin: {
    useAsTitle: 'displayTitle',
    group: 'Kontaktanfragen',
    defaultColumns: ['intentLabel', 'name', 'email', 'status', 'createdAt'],
    listSearchableFields: ['name', 'email', 'company', 'intentLabel', 'message', 'phone'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
    description: 'Eingehende Anfragen vom Kontaktformular – sortiert nach Datum (neueste zuerst).',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data
        const name = data.name?.trim() || 'Unbekannt'
        const intent = data.intentLabel?.trim() || data.intent?.trim() || 'Anfrage'
        data.displayTitle = `${name} – ${intent}`
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create' && doc.source === 'website') {
          await sendContactInquiryNotification(req.payload, doc)
        }
      },
    ],
  },
  fields: [
    {
      name: 'displayTitle',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [...STATUS_OPTIONS],
      admin: {
        position: 'sidebar',
        description: 'Neu → In Bearbeitung → Erledigt (oder Spam).',
      },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'website',
      options: [
        { label: 'Webseiten-Formular', value: 'website' },
        { label: 'Manuell', value: 'manual' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Anfrage',
          fields: [
            {
              name: 'intent',
              type: 'text',
              label: 'Anliegen (Schlüssel)',
              admin: { readOnly: true },
            },
            {
              name: 'intentLabel',
              type: 'text',
              label: 'Anliegen',
              admin: { readOnly: true },
            },
            {
              name: 'detailSummary',
              type: 'textarea',
              label: 'Details / Zusammenfassung',
              admin: { readOnly: true },
            },
            {
              name: 'message',
              type: 'textarea',
              label: 'Nachricht',
              required: true,
            },
          ],
        },
        {
          label: 'Kontakt',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Name',
              required: true,
            },
            {
              name: 'company',
              type: 'text',
              label: 'Unternehmen',
            },
            {
              name: 'email',
              type: 'email',
              label: 'E-Mail',
              required: true,
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Telefon',
            },
            {
              name: 'referral',
              type: 'text',
              label: 'Wie erfahren?',
            },
          ],
        },
        {
          label: 'Projekt-Details',
          fields: [
            {
              name: 'projectBrief',
              type: 'textarea',
              label: 'Projektbeschreibung',
              admin: { readOnly: true },
            },
            {
              name: 'projectPages',
              type: 'text',
              label: 'Seitenumfang',
              admin: { readOnly: true },
            },
            {
              name: 'projectTimeline',
              type: 'text',
              label: 'Gewünschter Start',
              admin: { readOnly: true },
            },
            {
              name: 'festpreisPaket',
              type: 'text',
              label: 'Festpreis-Paket',
              admin: { readOnly: true },
            },
            {
              name: 'festpreisTech',
              type: 'text',
              label: 'Festpreis-Technologie',
              admin: { readOnly: true },
            },
            {
              name: 'seoLaufzeit',
              type: 'text',
              label: 'SEO-Laufzeit',
              admin: { readOnly: true },
            },
            {
              name: 'redesignTyp',
              type: 'text',
              label: 'ReDesign / ReLaunch',
              admin: { readOnly: true },
            },
            {
              name: 'budget',
              type: 'text',
              label: 'Budget',
              admin: { readOnly: true },
            },
          ],
        },
        {
          label: 'Meta',
          fields: [
            {
              name: 'ipAddress',
              type: 'text',
              label: 'IP-Adresse',
              admin: { readOnly: true },
            },
            {
              name: 'userAgent',
              type: 'text',
              label: 'Browser / User-Agent',
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
  ],
}
