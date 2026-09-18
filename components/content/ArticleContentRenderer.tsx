import type { ReactNode } from 'react'
import type { ArticleBlock, ArticleDocument, ArticleInline, ArticleMark } from '@/types/article-document'

const URL_PATTERN = /(https?:\/\/[^\s<]+)/gi

function safeExternalUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

function textWithAutomaticLinks(value: string, key: string): ReactNode {
  const parts = value.split(URL_PATTERN)
  return parts.map((part, index) => {
    const href = safeExternalUrl(part.replace(/[),.;!?]+$/g, ''))
    return href
      ? <a key={`${key}-${index}`} href={href} target="_blank" rel="noopener noreferrer">{part}</a>
      : <span key={`${key}-${index}`}>{part}</span>
  })
}

function applyMarks(content: ReactNode, marks: ArticleMark[] | undefined, key: string) {
  return (marks ?? []).reduce<ReactNode>((result, mark, index) => {
    const markKey = `${key}-mark-${index}`
    if (mark.type === 'bold') return <strong key={markKey}>{result}</strong>
    if (mark.type === 'italic') return <em key={markKey}>{result}</em>
    if (mark.type === 'underline') return <u key={markKey}>{result}</u>
    const href = safeExternalUrl(mark.attrs.href)
    return href ? <a key={markKey} href={href} target={mark.attrs.target} rel="noopener noreferrer">{result}</a> : result
  }, content)
}

function renderInline(node: ArticleInline, index: number): ReactNode {
  if (node.type === 'hardBreak') return <br key={`break-${index}`} />
  const content = textWithAutomaticLinks(node.text, `text-${index}`)
  return <span key={`text-${index}`}>{applyMarks(content, node.marks, `text-${index}`)}</span>
}

function renderInlineContent(content: ArticleInline[] | undefined) {
  return (content ?? []).map(renderInline)
}

function renderListItem(item: { content: ArticleBlock[] }, index: number) {
  return <li key={`item-${index}`}>{item.content.map((block, childIndex) => renderBlock(block, childIndex))}</li>
}

function renderBlock(block: ArticleBlock, index: number): ReactNode {
  switch (block.type) {
    case 'paragraph':
      return <p key={`paragraph-${index}`}>{renderInlineContent(block.content)}</p>
    case 'heading': {
      const Tag = `h${block.level}` as 'h1' | 'h2' | 'h3'
      return <Tag key={`heading-${index}`}>{renderInlineContent(block.content)}</Tag>
    }
    case 'bulletList':
      return <ul key={`bullet-${index}`}>{block.content.map(renderListItem)}</ul>
    case 'orderedList':
      return <ol key={`ordered-${index}`}>{block.content.map(renderListItem)}</ol>
    case 'blockquote':
      return <blockquote key={`quote-${index}`}>{block.content.map((child, childIndex) => renderBlock(child, childIndex))}</blockquote>
    case 'image': {
      const width = block.attrs.width ? { maxWidth: `${block.attrs.width}px` } : undefined
      return <figure key={`image-${index}`} className={`article-inline-image align-${block.attrs.alignment ?? 'center'}`} style={width}>
        <img src={block.attrs.src} alt={block.attrs.alt} loading="lazy" />
        {block.attrs.caption && <figcaption>{block.attrs.caption}</figcaption>}
      </figure>
    }
    case 'horizontalRule':
      return <hr key={`rule-${index}`} />
  }
}

export default function ArticleContentRenderer({ document }: { document: ArticleDocument }) {
  return <div className="article-content-renderer">{document.content.map(renderBlock)}</div>
}
