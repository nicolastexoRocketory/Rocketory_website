import type { CollectionConfig } from 'payload'
import { revalidateTag } from 'next/cache'

function humanizeFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'isAiGenerated', 'alt', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (!data) return data

        if (!data.title?.trim()) {
          if (data.filename) {
            data.title = humanizeFilename(String(data.filename))
          } else if (operation === 'update') {
            data.title = 'Unbenanntes Medium'
          }
        }

        return data
      },
    ],
    afterChange: [
      () => {
        revalidateTag('ai-images')
      },
    ],
    afterDelete: [
      () => {
        revalidateTag('ai-images')
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel / Anzeigename',
      required: true,
      admin: {
        description: 'Name des Mediums im CMS (unabhängig vom Dateinamen auf dem Server).',
      },
    },
    {
      type: 'collapsible',
      label: 'Barrierefreiheit (ARIA & SEO)',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'isDecorative',
          type: 'checkbox',
          label: 'Dekoratives Bild',
          defaultValue: false,
          admin: {
            description:
              'Reine Verzierung ohne Informationsgehalt. Das Bild wird für Screenreader ausgeblendet (aria-hidden, leeres alt).',
          },
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Alt-Text',
          admin: {
            description:
              'Kurzbeschreibung des Bildinhalts. Wird als alt ausgegeben – wichtig für Google Image Search und Screenreader (ca. 125 Zeichen).',
            condition: (_, siblingData) => !siblingData?.isDecorative,
          },
          validate: (value: unknown, { siblingData }: { siblingData?: { isDecorative?: boolean } }) => {
            if (siblingData?.isDecorative) return true
            if (!value || !String(value).trim()) {
              return 'Alt-Text ist erforderlich (außer bei dekorativen Bildern).'
            }
            return true
          },
        },
        {
          name: 'ariaLabel',
          type: 'text',
          label: 'ARIA-Label',
          admin: {
            description:
              'Optional. Ergänzende aria-label-Bezeichnung für Screenreader, wenn der Alt-Text allein nicht ausreicht.',
            condition: (_, siblingData) => !siblingData?.isDecorative,
          },
        },
        {
          name: 'ariaDescription',
          type: 'textarea',
          label: 'Ausführliche Bildbeschreibung',
          admin: {
            description:
              'Längere Beschreibung für komplexe Bilder (Diagramme, Infografiken). Wird per aria-describedby an Screenreader übergeben.',
            rows: 4,
            condition: (_, siblingData) => !siblingData?.isDecorative,
          },
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Bildunterschrift (sichtbar)',
          admin: {
            description: 'Optional sichtbare Caption unter dem Bild – für alle Nutzer lesbar.',
            condition: (_, siblingData) => !siblingData?.isDecorative,
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Kennzeichnung',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'isAiGenerated',
          type: 'checkbox',
          label: 'KI-generiertes Bild',
          defaultValue: false,
          admin: {
            description:
              'Aktivieren, wenn das Bild (ganz oder teilweise) mit KI erstellt wurde. Im Frontend erscheint dann die Kennzeichnung „KI-Bild“.',
          },
        },
      ],
    },
  ],
  upload: {
    resizeOptions: {
      withoutEnlargement: true,
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        position: 'centre',
      },
      {
        name: 'card',
        width: 900,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: undefined,
        position: 'centre',
      },
    ],
    formatOptions: {
      format: 'webp',
      options: {
        quality: 82,
        alphaQuality: 80,
        effort: 6,
      },
    },
  },
}
