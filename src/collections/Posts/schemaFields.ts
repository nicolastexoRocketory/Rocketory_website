import type { Field } from 'payload'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rocketory.de'

export const postSchemaFields: Field[] = [
  {
    name: 'schema',
    type: 'group',
    label: 'Schema.org (Google)',
    fields: [
      {
        type: 'collapsible',
        label: '📝 1. Allgemeine Beitrags-Informationen',
        admin: { initCollapsed: false },
        fields: [
          {
            name: 'blogPosting',
            type: 'group',
            label: false,
            fields: [
              {
                name: 'headline',
                type: 'text',
                label: 'Blog-Titel',
                admin: {
                  description:
                    'Schema: headline — Der exakte Haupttitel des Blogbeitrags. Knackig formulieren, idealerweise nicht mehr als 110 Zeichen.',
                },
              },
              {
                name: 'description',
                type: 'textarea',
                label: 'Kurzbeschreibung / Einleitung',
                admin: {
                  description:
                    'Schema: description — Die „Einleitung 1“ des Textes (ca. 1–2 Sätze). Meist identisch mit der Meta-Description für Google.',
                },
              },
              {
                name: 'articleBody',
                type: 'textarea',
                label: 'Haupttext / Beitragsinhalt',
                admin: {
                  description:
                    'Schema: articleBody — Der komplette Text des Beitrags (Einleitung, Hauptteil und Fazit). Beim Import aus HTML als Fließtext hinterlegt.',
                  rows: 12,
                },
              },
              {
                name: 'timeRequired',
                type: 'text',
                label: 'Lesezeit',
                defaultValue: 'PT5M',
                admin: {
                  description:
                    'Schema: timeRequired — Geschätzte Lesezeit im ISO-Format (z.B. PT5M für 5 Minuten, PT7M für 7 Minuten).',
                },
              },
              {
                name: 'datePublished',
                type: 'date',
                label: 'Veröffentlichungsdatum',
                admin: {
                  description: 'Schema: datePublished — Datum, an dem der Artikel live geht (Format JJJJ-MM-TT).',
                  date: { pickerAppearance: 'dayOnly' },
                },
              },
              {
                name: 'dateModified',
                type: 'date',
                label: 'Änderungsdatum',
                admin: {
                  description:
                    'Schema: dateModified — Datum der letzten inhaltlichen Aktualisierung. Bei neuen Beiträgen dasselbe wie Veröffentlichungsdatum.',
                  date: { pickerAppearance: 'dayOnly' },
                },
              },
              {
                name: 'image',
                type: 'text',
                label: 'Beitragsbild (URL)',
                admin: {
                  description:
                    'Schema: image — Direkter Link zum Hauptbild/Thumbnail. Mindestens 1200 Pixel breit, hochauflösend.',
                },
              },
              {
                name: 'mainEntityOfPage',
                type: 'text',
                label: 'Beitrags-URL',
                admin: {
                  description: `Schema: mainEntityOfPage — Vollständiger Link zur Blog-Seite (z.B. ${siteUrl}/blog/artikel-name).`,
                },
              },
              {
                name: 'inLanguage',
                type: 'text',
                label: 'Sprache',
                defaultValue: 'de-DE',
                admin: {
                  description: 'Schema: inLanguage — Sprachcode für den Artikel. Für Deutsch: de-DE.',
                },
              },
            ],
          },
        ],
      },
      {
        type: 'collapsible',
        label: '👤 2. Autoren-Informationen',
        fields: [
          {
            name: 'author',
            type: 'group',
            label: false,
            fields: [
              {
                name: 'name',
                type: 'text',
                label: 'Name des Autors',
                defaultValue: 'Rocketory Redaktion',
                admin: {
                  description: 'Schema: author.name — Vor- und Nachname der Person, die den Beitrag geschrieben hat.',
                },
              },
              {
                name: 'description',
                type: 'textarea',
                label: 'Kurz-Biografie',
                admin: {
                  description:
                    'Schema: author.description — Ein bis zwei Sätze über die Expertise (z.B. „Max Mustermann ist Webentwickler und Experte für Performance-Optimierung“).',
                },
              },
              {
                name: 'sameAs',
                type: 'array',
                label: 'Social-Media-Links',
                labels: { singular: 'Profil-Link', plural: 'Profil-Links' },
                admin: {
                  description:
                    'Schema: author.sameAs — Links zu beruflichen Profilen (LinkedIn, Xing, Instagram, …).',
                },
                fields: [{ name: 'url', type: 'text', required: true, label: 'URL' }],
              },
            ],
          },
        ],
      },
      {
        type: 'collapsible',
        label: '🏢 3. Herausgeber-Informationen (Firma)',
        fields: [
          {
            name: 'publisher',
            type: 'group',
            label: false,
            fields: [
              {
                name: 'name',
                type: 'text',
                label: 'Unternehmensname',
                defaultValue: 'Rocketory',
                admin: {
                  description: 'Schema: publisher.name — Name eurer Firma (z.B. „Rocketory“).',
                },
              },
              {
                name: 'logoUrl',
                type: 'text',
                label: 'Firmenlogo (URL)',
                defaultValue: `${siteUrl}/assets/images/logo_1.png`,
                admin: {
                  description:
                    'Schema: publisher.logo.url — Direkter Link zum Firmenlogo. Zeigt Google, unter welcher Marke der Beitrag erscheint.',
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
