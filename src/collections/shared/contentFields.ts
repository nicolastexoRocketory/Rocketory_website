import type { CollectionSlug, Field } from 'payload'

import { postSchemaFields } from '../Posts/schemaFields'
import { contentSeoFields } from './seoFields'

type ContentCollectionOptions = {
  categoryRelationTo: CollectionSlug
  categoryDescription: string
  excerptDescription: string
}

const bottomGalleryField: Field = {
  name: 'bottomGallery',
  type: 'array',
  label: 'Bilder unten (Slideshow)',
  labels: { singular: 'Bild', plural: 'Bilder' },
  admin: {
    description:
      'Optional. Diese Bilder erscheinen am Ende des Beitrags als Slideshow.',
    initCollapsed: false,
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Bild',
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Bildunterschrift (optional)',
    },
  ],
}

export function buildContentCollectionFields(options: ContentCollectionOptions): Field[] {
  return [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-Pfad, z.B. handwerk-buende-relaunch',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Inhalt',
          fields: [
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Kurzbeschreibung / Teaser',
              admin: {
                description: options.excerptDescription,
              },
            },
            {
              name: 'contentIntro',
              type: 'textarea',
              label: 'Einleitung (vor dem Inhaltsverzeichnis)',
              admin: {
                rows: 6,
                description:
                  'Optionaler Fließtext vor dem Inhaltsverzeichnis. HTML (p, strong, a, …) ist erlaubt.',
              },
            },
            {
              name: 'contentSections',
              type: 'array',
              label: 'Inhaltsabschnitte',
              labels: { singular: 'Abschnitt', plural: 'Abschnitte' },
              admin: {
                description:
                  'Jeder Abschnittstitel wird zum Punkt im Inhaltsverzeichnis und verlinkt auf den Text darunter.',
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  label: 'Titel (Inhaltsverzeichnis)',
                },
                {
                  name: 'body',
                  type: 'textarea',
                  required: true,
                  label: 'Text',
                  admin: {
                    rows: 12,
                    description:
                      'Abschnittstext. HTML (p, ul, strong, figure, …) ist erlaubt und wird unverändert ausgegeben.',
                  },
                },
              ],
            },
            {
              name: 'legacyHtml',
              type: 'code',
              label: 'Artikeltext (HTML, Fallback)',
              required: false,
              defaultValue: '',
              validate: (value: unknown, { siblingData }: { siblingData?: Record<string, unknown> }) => {
                const sections = siblingData?.contentSections
                const hasSections =
                  Array.isArray(sections) &&
                  sections.some(
                    (section) =>
                      section &&
                      typeof section === 'object' &&
                      typeof (section as { title?: unknown }).title === 'string' &&
                      String((section as { title?: unknown }).title).trim() &&
                      typeof (section as { body?: unknown }).body === 'string' &&
                      String((section as { body?: unknown }).body).trim(),
                  )
                if (hasSections) return true
                if (typeof value === 'string' && value.trim()) return true
                return 'Bitte mindestens einen Inhaltsabschnitt anlegen oder den HTML-Fallback nutzen.'
              },
              admin: {
                language: 'html',
                description:
                  'Nur nötig, wenn keine Inhaltsabschnitte gesetzt sind (z. B. ältere Beiträge). Bei gesetzten Abschnitten wird dieses Feld ignoriert.',
                condition: (_, siblingData) =>
                  !Array.isArray(siblingData?.contentSections) ||
                  siblingData.contentSections.length === 0,
              },
            },
            bottomGalleryField,
          ],
        },
        {
          label: 'Autor',
          fields: [
            {
              name: 'author',
              type: 'group',
              label: 'Autor',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: 'Name',
                  required: true,
                  defaultValue: 'Rocketory Redaktion',
                },
                {
                  name: 'jobTitle',
                  type: 'text',
                  label: 'Rolle / Tätigkeit',
                  defaultValue: 'Webdesign, SEO & Entwicklung',
                },
                {
                  name: 'bio',
                  type: 'textarea',
                  label: 'Kurzbiografie',
                  defaultValue:
                    'Die Rocketory Redaktion schreibt über Webdesign, SEO und digitale Auftritte aus der Praxis – aus Bünde für die Region.',
                },
                {
                  name: 'imageUrl',
                  type: 'text',
                  label: 'Profilbild (URL)',
                  defaultValue:
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
                },
                {
                  name: 'profileUrl',
                  type: 'text',
                  label: 'Profil-Link',
                  defaultValue: '/agentur',
                },
              ],
            },
          ],
        },
        {
          label: 'Schemas',
          fields: postSchemaFields,
        },
        {
          label: 'Medien & Meta',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Titelbild (Upload)',
            },
            {
              name: 'heroImageUrl',
              type: 'text',
              label: 'Titelbild (externe URL)',
              admin: {
                description: 'z.B. Unsplash-URL, falls kein Upload vorhanden ist.',
              },
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: options.categoryRelationTo,
              label: 'Kategorie',
              required: true,
              admin: {
                description: options.categoryDescription,
              },
            },
            {
              name: 'readTime',
              type: 'text',
              label: 'Lesezeit',
              admin: {
                description: 'z.B. "7 Min. Lesezeit"',
              },
            },
          ],
        },
        {
          label: 'SEO-Snippet',
          fields: contentSeoFields,
        },
        {
          label: 'Prompts',
          fields: [
            {
              name: 'blogPrompts',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/admin/BlogPostPrompts#BlogPostPrompts',
                },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'published',
      options: [
        { label: 'Entwurf', value: 'draft' },
        { label: 'Veröffentlicht', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ]
}
