type SchemaLink = { url?: string }

type PostSchemaInput = {
  blogPosting?: {
    headline?: string | null
    description?: string | null
    articleBody?: string | null
    timeRequired?: string | null
    datePublished?: string | null
    dateModified?: string | null
    image?: string | null
    mainEntityOfPage?: string | null
    inLanguage?: string | null
  }
  author?: {
    name?: string | null
    description?: string | null
    sameAs?: SchemaLink[] | null
  }
  publisher?: {
    name?: string | null
    logoUrl?: string | null
  }
}

function mapUrls(items?: SchemaLink[] | null) {
  return items?.map((item) => item.url).filter(Boolean) as string[] | undefined
}

export function buildPostSchemaJsonLd(schema: PostSchemaInput | null | undefined) {
  if (!schema?.blogPosting?.headline) return []

  const bp = schema.blogPosting
  const author = schema.author
  const publisher = schema.publisher

  const blogPosting: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: bp.headline,
  }

  if (bp.description) blogPosting.description = bp.description
  if (bp.articleBody) blogPosting.articleBody = bp.articleBody
  if (bp.timeRequired) blogPosting.timeRequired = bp.timeRequired
  if (bp.datePublished) blogPosting.datePublished = bp.datePublished
  if (bp.dateModified) blogPosting.dateModified = bp.dateModified
  if (bp.image) blogPosting.image = bp.image
  if (bp.inLanguage) blogPosting.inLanguage = bp.inLanguage

  if (bp.mainEntityOfPage) {
    blogPosting.mainEntityOfPage = {
      '@type': 'WebPage',
      '@id': bp.mainEntityOfPage,
    }
  }

  if (author?.name) {
    const authorBlock: Record<string, unknown> = {
      '@type': 'Person',
      name: author.name,
    }
    if (author.description) authorBlock.description = author.description
    const sameAs = mapUrls(author.sameAs)
    if (sameAs?.length) authorBlock.sameAs = sameAs
    blogPosting.author = authorBlock
  }

  if (publisher?.name) {
    const publisherBlock: Record<string, unknown> = {
      '@type': 'Organization',
      name: publisher.name,
    }
    if (publisher.logoUrl) {
      publisherBlock.logo = {
        '@type': 'ImageObject',
        url: publisher.logoUrl,
      }
    }
    blogPosting.publisher = publisherBlock
  }

  return [blogPosting]
}
