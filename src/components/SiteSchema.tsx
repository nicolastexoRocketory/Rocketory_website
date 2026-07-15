import { buildGlobalSchemaScript } from '@/lib/schema-org'

export function SiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: buildGlobalSchemaScript() }}
    />
  )
}
