import type { GlobalConfig } from 'payload'

export const EmailSettings: GlobalConfig = {
  slug: 'email-settings',
  label: 'E-Mail & SMTP',
  admin: {
    group: 'Kontaktanfragen',
    description:
      'SMTP-Zugang, Absender und Formular-Einstellungen (Kontakt + KI-Check). Turnstile-Keys in Cloudflare anlegen (Domains rocketory.de und localhost). Ohne aktive SMTP-Konfiguration werden Anfragen nur im Backend gespeichert.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: 'collapsible',
      label: 'SMTP-Server',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'smtpEnabled',
          type: 'checkbox',
          label: 'E-Mail-Versand aktivieren',
          defaultValue: false,
        },
        {
          name: 'smtpHost',
          type: 'text',
          label: 'SMTP-Host',
          admin: {
            description: 'z. B. smtp.mittwald.de oder smtp.gmail.com',
            condition: (_, siblingData) => Boolean(siblingData?.smtpEnabled),
          },
        },
        {
          name: 'smtpPort',
          type: 'number',
          label: 'SMTP-Port',
          defaultValue: 587,
          admin: {
            description: 'Üblich: 587 (STARTTLS) oder 465 (SSL)',
            condition: (_, siblingData) => Boolean(siblingData?.smtpEnabled),
          },
        },
        {
          name: 'smtpSecure',
          type: 'select',
          label: 'Verschlüsselung',
          defaultValue: 'starttls',
          options: [
            { label: 'STARTTLS (Port 587)', value: 'starttls' },
            { label: 'SSL/TLS (Port 465)', value: 'ssl' },
            { label: 'Keine (nur lokal/test)', value: 'none' },
          ],
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.smtpEnabled),
          },
        },
        {
          name: 'smtpUser',
          type: 'text',
          label: 'SMTP-Benutzername',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.smtpEnabled),
          },
        },
        {
          name: 'smtpPassword',
          type: 'text',
          label: 'SMTP-Passwort',
          admin: {
            description: 'Wird verschlüsselt in der Datenbank gespeichert.',
            condition: (_, siblingData) => Boolean(siblingData?.smtpEnabled),
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Absender & Empfänger',
      fields: [
        {
          name: 'fromName',
          type: 'text',
          label: 'Absender-Name',
          defaultValue: 'Rocketory Webseite',
        },
        {
          name: 'fromEmail',
          type: 'email',
          label: 'Absender-E-Mail',
          defaultValue: 'beratung@rocketory.de',
        },
        {
          name: 'replyToEmail',
          type: 'email',
          label: 'Antwort-an-Adresse (Reply-To)',
          admin: {
            description: 'Optional. Standard: Absender-E-Mail.',
          },
        },
        {
          name: 'notificationEmail',
          type: 'text',
          label: 'Benachrichtigung an (Fallback)',
          defaultValue:
            'beratung@rocketory.de, nicolas@rocketory.de, nicolastexo@rocketory.de',
          admin: {
            description:
              'Fallback, falls beim Kontakt- oder KI-Check-Formular keine eigenen Empfänger gesetzt sind. Komma- oder semikolongetrennt.',
          },
        },
        {
          name: 'notificationSubjectPrefix',
          type: 'text',
          label: 'Betreff-Präfix',
          defaultValue: 'Kontaktanfrage',
        },
        {
          name: 'sendCustomerConfirmation',
          type: 'checkbox',
          label: 'Bestätigung an Absender senden',
          defaultValue: true,
          admin: {
            description: 'Sendet dem Besucher eine kurze Eingangsbestätigung.',
          },
        },
        {
          name: 'customerConfirmationSubject',
          type: 'text',
          label: 'Betreff Bestätigungsmail',
          defaultValue: 'Deine Anfrage bei Rocketory',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.sendCustomerConfirmation),
          },
        },
        {
          name: 'notificationCc',
          type: 'text',
          label: 'CC (optional)',
          admin: {
            description: 'Zusätzliche Empfänger (komma- oder semikolongetrennt).',
          },
        },
        {
          name: 'notificationBcc',
          type: 'text',
          label: 'BCC (optional)',
          admin: {
            description: 'Blindkopie-Empfänger (komma- oder semikolongetrennt).',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'E-Mail-Texte (optional)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'adminEmailFooter',
          type: 'textarea',
          label: 'Zusatztext Benachrichtigung (intern)',
          admin: {
            description: 'Wird am Ende der internen Benachrichtigungsmail angehängt.',
          },
        },
        {
          name: 'customerConfirmationBody',
          type: 'textarea',
          label: 'Text Bestätigungsmail',
          admin: {
            description:
              'Optional. Platzhalter: {name}, {intent}. Leer = Standardtext.',
            condition: (_, siblingData) => Boolean(siblingData?.sendCustomerConfirmation),
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Kontaktformular',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'kontaktNotificationEmail',
          type: 'text',
          label: 'Admin-Mails (Kontaktformular)',
          admin: {
            description:
              'Empfänger für Anfragen vom Kontaktformular. Komma- oder semikolongetrennt. Leer = Fallback „Benachrichtigung an“.',
          },
        },
        {
          name: 'kontaktTurnstileEnabled',
          type: 'checkbox',
          label: 'Turnstile aktiv',
          defaultValue: true,
          admin: {
            description: 'Cloudflare Turnstile für das Kontaktformular. Wirkt nur, wenn Site Key und Secret Key gesetzt sind.',
          },
        },
        {
          name: 'kontaktTurnstileSiteKey',
          type: 'text',
          label: 'Turnstile Site Key',
          admin: {
            description: 'Öffentlicher Key (Widget im Frontend).',
            condition: (_, siblingData) => Boolean(siblingData?.kontaktTurnstileEnabled),
          },
        },
        {
          name: 'kontaktTurnstileSecretKey',
          type: 'text',
          label: 'Turnstile Secret Key',
          admin: {
            description: 'Nur Backend – wird nie an den Browser ausgegeben.',
            condition: (_, siblingData) => Boolean(siblingData?.kontaktTurnstileEnabled),
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'KI-Check Formular',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'kiCheckNotificationEmail',
          type: 'text',
          label: 'Admin-Mails (KI-Check)',
          admin: {
            description:
              'Empfänger für Anfragen vom KI-Check-Formular. Komma- oder semikolongetrennt. Leer = Fallback „Benachrichtigung an“.',
          },
        },
        {
          name: 'kiCheckTurnstileEnabled',
          type: 'checkbox',
          label: 'Turnstile aktiv',
          defaultValue: true,
          admin: {
            description: 'Cloudflare Turnstile für den KI-Check. Wirkt nur, wenn Site Key und Secret Key gesetzt sind.',
          },
        },
        {
          name: 'kiCheckTurnstileSiteKey',
          type: 'text',
          label: 'Turnstile Site Key',
          admin: {
            description: 'Öffentlicher Key (Widget im Frontend).',
            condition: (_, siblingData) => Boolean(siblingData?.kiCheckTurnstileEnabled),
          },
        },
        {
          name: 'kiCheckTurnstileSecretKey',
          type: 'text',
          label: 'Turnstile Secret Key',
          admin: {
            description: 'Nur Backend – wird nie an den Browser ausgegeben.',
            condition: (_, siblingData) => Boolean(siblingData?.kiCheckTurnstileEnabled),
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Google Maps',
      fields: [
        {
          name: 'googleMapsEmbedUrl',
          type: 'text',
          label: 'Google Maps Embed-URL',
          defaultValue:
            'https://www.google.com/maps?q=Rocketory,+Zimmerstra%C3%9Fe+16,+32257+B%C3%BCnde&hl=de&z=17&output=embed',
          admin: {
            description:
              'Einbettungs-URL mit Firmenpin (Rocketory, Zimmerstr. 16). Alternativ: Google Maps → Teilen → Karte einbetten. Wird auf Agentur / Bünde verwendet.',
          },
        },
        {
          name: 'googleMapsLinkUrl',
          type: 'text',
          label: 'Google Maps Link (neuer Tab)',
          defaultValue:
            'https://www.google.com/maps/search/?api=1&query=Rocketory,+Zimmerstra%C3%9Fe+16,+32257+B%C3%BCnde',
        },
      ],
    },
  ],
}
