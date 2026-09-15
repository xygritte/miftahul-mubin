import type { ArticleDocument } from '@/types/article-document'
import { ARTICLE_DOCUMENT_VERSION } from '@/types/article-document'

export function legacyNewsContentToDocument(value: unknown): ArticleDocument {
  const paragraphs = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : typeof value === 'string'
      ? [value]
      : []

  return {
    type: 'doc',
    version: ARTICLE_DOCUMENT_VERSION,
    content: paragraphs.map((text) => ({
      type: 'paragraph',
      content: text.length ? [{ type: 'text', text }] : undefined,
    })),
  }
}
