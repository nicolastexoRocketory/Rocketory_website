type LexicalTextNode = {
  type: 'text'
  text: string
  format?: number
  version: 1
}

type LexicalElementNode = {
  type: string
  tag?: string
  children: Array<LexicalTextNode | LexicalElementNode>
  direction: 'ltr'
  format: string
  indent: number
  version: 1
  listType?: 'bullet' | 'number'
  value?: number
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
}

function parseInlineNodes(html: string): LexicalTextNode[] {
  const nodes: LexicalTextNode[] = []
  const tokenRegex = /<(strong|b|em|i|a)(?:[^>]*)>([\s\S]*?)<\/\1>|([^<]+)/gi
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(html)) !== null) {
    if (match[3]) {
      const text = decodeEntities(match[3])
      if (text) nodes.push({ type: 'text', text, version: 1 })
      continue
    }

    const tag = match[1].toLowerCase()
    const inner = match[2]
    const text = stripHtml(inner)
    if (!text) continue

    let format = 0
    if (tag === 'strong' || tag === 'b') format = 1
    if (tag === 'em' || tag === 'i') format = 2

    nodes.push({ type: 'text', text, format, version: 1 })
  }

  if (nodes.length === 0) {
    const plain = stripHtml(html)
    if (plain) nodes.push({ type: 'text', text: plain, version: 1 })
  }

  return nodes
}

function blockNode(
  type: string,
  children: Array<LexicalTextNode | LexicalElementNode>,
  extra: Partial<LexicalElementNode> = {},
): LexicalElementNode {
  return {
    type,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    ...extra,
  }
}

function parseListItems(listHtml: string): LexicalElementNode[] {
  const items: LexicalElementNode[] = []
  const itemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(listHtml)) !== null) {
    items.push(
      blockNode('listitem', parseInlineNodes(match[1])),
    )
  }

  return items
}

export function htmlToLexical(html: string) {
  const cleaned = html
    .replace(/<nav class="rk-blog-toc"[\s\S]*?<\/nav>/gi, '')
    .replace(/<p class="rk-blog-intro">[\s\S]*?<\/p>/i, '')
    .trim()

  const children: LexicalElementNode[] = []
  const blockRegex = /<(h2|h3|p|blockquote|ul|ol)([^>]*)>([\s\S]*?)<\/\1>/gi
  let match: RegExpExecArray | null

  while ((match = blockRegex.exec(cleaned)) !== null) {
    const tag = match[1].toLowerCase()
    const inner = match[3]

    if (tag === 'h2' || tag === 'h3') {
      children.push(blockNode('heading', parseInlineNodes(inner), { tag }))
      continue
    }

    if (tag === 'p') {
      const inline = parseInlineNodes(inner)
      if (inline.length > 0) children.push(blockNode('paragraph', inline))
      continue
    }

    if (tag === 'blockquote') {
      children.push(blockNode('quote', parseInlineNodes(inner)))
      continue
    }

    if (tag === 'ul' || tag === 'ol') {
      const listItems = parseListItems(inner)
      if (listItems.length > 0) {
        children.push(
          blockNode('list', listItems, {
            listType: tag === 'ol' ? 'number' : 'bullet',
          }),
        )
      }
    }
  }

  if (children.length === 0) {
    const plain = stripHtml(cleaned)
    if (plain) {
      children.push(blockNode('paragraph', [{ type: 'text', text: plain, version: 1 }]))
    }
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr' as const,
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
