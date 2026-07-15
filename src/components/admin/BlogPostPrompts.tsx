'use client'

import React from 'react'
import { Collapsible, CopyToClipboard } from '@payloadcms/ui'

import { BLOG_HTML_FORMAT_PROMPT } from '@/lib/blog-html-prompt'
import { BLOG_POST_METADATA_PROMPT } from '@/lib/blog-post-metadata-prompt'

import './blog-post-prompts.scss'

type PromptAccordionProps = {
  title: string
  description: string
  prompt: string
}

function PromptAccordion({ title, description, prompt }: PromptAccordionProps) {
  return (
    <Collapsible
      initCollapsed
      className="rk-blog-prompt-collapsible"
      header={
        <div className="rk-blog-prompt-header">
          <p className="rk-blog-prompt-title">{title}</p>
          <p className="rk-blog-prompt-description">{description}</p>
        </div>
      }
      actions={
        <CopyToClipboard
          value={prompt}
          defaultMessage="Prompt kopieren"
          successMessage="Kopiert!"
        />
      }
    >
      <pre className="rk-blog-prompt-text">{prompt}</pre>
    </Collapsible>
  )
}

export function BlogPostPrompts() {
  return (
    <div className="rk-blog-prompts">
      <div className="rk-blog-prompts-intro">
        <p className="rk-blog-prompts-intro-title">So nutzt ihr die KI-Prompts</p>
        <ol className="rk-blog-prompts-intro-list">
          <li>Rohtext in ChatGPT, Claude o. ä. einfügen</li>
          <li>
            <strong>Prompt 1</strong> → Felder in die Tabs Inhalt, Autor, Schemas und Medien & Meta
            übertragen
          </li>
          <li>
            <strong>Prompt 2</strong> → HTML in das Feld „Artikeltext (HTML)“ im Tab Inhalt einfügen
          </li>
        </ol>
      </div>

      <PromptAccordion
        title="Prompt 1 — Backend-Felder aus Rohtext"
        description="Titel, Slug, Kurzbeschreibung, Schema-Felder, Meta, Kategorie, Lesezeit und mehr."
        prompt={BLOG_POST_METADATA_PROMPT}
      />

      <PromptAccordion
        title="Prompt 2 — Beitragstext als HTML formatieren"
        description="Wandelt den Rohtext in das Rocketory-HTML-Format mit TOC, Überschriften und Links um."
        prompt={BLOG_HTML_FORMAT_PROMPT}
      />
    </div>
  )
}
