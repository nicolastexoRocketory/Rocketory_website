import type { GlobalConfig } from 'payload'

import { revalidateHomepageAfterChange } from './hooks/revalidateHomepage'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Startseite',
  admin: {
    group: 'Webseite',
  },
  hooks: {
    afterChange: [revalidateHomepageAfterChange],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'featuredPostSection',
      type: 'group',
      label: 'Beitrag im Fokus',
      admin: {
        description:
          'Erscheint auf der Startseite und unter „Alles inklusive“ auf der Leistungen-Seite – direkt vor den Paketpreisen.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Sektions-Titel',
          required: true,
          defaultValue: 'Beitrag im Fokus.',
        },
        {
          name: 'titleEm',
          type: 'text',
          label: 'Sektions-Titel (kursiv)',
          defaultValue: 'Was gerade wichtig ist.',
        },
        {
          name: 'intro',
          type: 'textarea',
          label: 'Sektions-Text',
          admin: {
            description: 'Kurzer Einleitungstext neben der Überschrift.',
          },
        },
        {
          name: 'post',
          type: 'relationship',
          relationTo: 'posts',
          label: 'Beitrag',
          required: false,
          admin: {
            description: 'Nur veröffentlichte Beiträge werden auf der Webseite angezeigt.',
          },
          filterOptions: {
            status: { equals: 'published' },
          },
        },
      ],
    },
  ],
}
