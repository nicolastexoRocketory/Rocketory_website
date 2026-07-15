type ServerLegacyContentProps = {
  html: string
}

/** Legacy-HTML serverseitig rendern — Inhalt ist im ersten HTML (LCP/SEO). */
export function ServerLegacyContent({ html }: ServerLegacyContentProps) {
  return (
    <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
  )
}
