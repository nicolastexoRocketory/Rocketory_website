import type { Field } from 'payload'

export const contentSeoFields: Field[] = [
  {
    name: 'seo',
    type: 'group',
    label: 'SEO-Snippet',
    admin: {
      description:
        'Steuert, wie der Beitrag in Google und Social Media erscheint (Titel, Beschreibung, Vorschaubild). Leer = automatisch aus Kurzbeschreibung und Titelbild.',
    },
    fields: [
      {
        name: 'metaTitle',
        type: 'text',
        label: 'SEO-Titel',
        admin: {
          description:
            'Anzeige in Google-Suchergebnissen und Browser-Tab. Leer = Beitragstitel + „ – Rocketory“.',
        },
      },
      {
        name: 'metaDescription',
        type: 'textarea',
        label: 'Meta-Beschreibung',
        admin: {
          description:
            'Kurztext unter dem Titel in Google (ca. 150–160 Zeichen). Leer = Kurzbeschreibung oder Schema-Text.',
        },
      },
      {
        name: 'ogImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Vorschaubild (Open Graph)',
        admin: {
          description:
            'Bild für Google, Facebook, LinkedIn etc. Empfohlen: 1200×630 px. Leer = Titelbild.',
        },
      },
      {
        name: 'noIndex',
        type: 'checkbox',
        label: 'Nicht indexieren',
        defaultValue: false,
        admin: {
          description: 'Seite von Google ausschließen (z. B. für Entwürfe oder interne Inhalte).',
        },
      },
    ],
  },
]
