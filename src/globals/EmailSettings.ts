import type { GlobalConfig } from 'payload'

export const EmailSettings: GlobalConfig = {
  slug: 'email-settings',
  label: 'E-Mail & SMTP',
  admin: {
    group: 'Kontaktanfragen',
    description:
      'SMTP-Zugang, Absender und Empfänger für Kontaktformular-Benachrichtigungen. Ohne aktive SMTP-Konfiguration werden Anfragen nur im Backend gespeichert.',
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
          defaultValue: 'Rocketory Website',
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
          label: 'Benachrichtigung an',
          defaultValue:
            'beratung@rocketory.de, nicolas@rocketory.de, nicolastexo@rocketory.de',
          admin: {
            description:
              'Eine oder mehrere E-Mail-Adressen (komma- oder semikolongetrennt), an die neue Kontaktanfragen gesendet werden.',
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
      label: 'Google Maps',
      fields: [
        {
          name: 'googleMapsEmbedUrl',
          type: 'text',
          label: 'Google Maps Embed-URL',
          defaultValue:
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25135.8!2d8.5864!3d52.1984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47ba74da50b9f0e9%3A0x422e0d927eb334fc!2s32257%20B%C3%BCnde!5e0!3m2!1sde!2sde!4v1710000000000!5m2!1sde!2sde',
          admin: {
            description:
              'Einbettungs-URL aus Google Maps → Teilen → Karte einbetten. Wird auf der Agentur-Seite unter „Über Bünde“ verwendet.',
          },
        },
        {
          name: 'googleMapsLinkUrl',
          type: 'text',
          label: 'Google Maps Link (neuer Tab)',
          defaultValue: 'https://www.google.com/maps/search/?api=1&query=52.1984,8.5864',
        },
      ],
    },
  ],
}
