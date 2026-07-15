import { serializeSchemaGraph } from '@/lib/schema-org'

type PageSchemaProps = {
  nodes: Record<string, unknown>[]
}

export function PageSchema({ nodes }: PageSchemaProps) {
  if (nodes.length === 0) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeSchemaGraph(nodes) }}
    />
  )
}
