import type { CollectionSlug, Field } from 'payload'

import { postSchemaFields } from '../Posts/schemaFields'
import { contentSeoFields } from './seoFields'

type ContentCollectionOptions = {
  categoryRelationTo: CollectionSlug
  categoryDescription: string
  excerptDescription: string
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
              name: 'legacyHtml',
              type: 'code',
              label: 'Artikeltext (HTML)',
              required: true,
              admin: {
                language: 'html',
                description:
                  'Vollständiger HTML-Inhalt. KI-Prompts findest du im Tab „Prompts“.',
              },
            },
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
