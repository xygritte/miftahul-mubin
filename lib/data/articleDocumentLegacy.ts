import type { ArticleDocument } from '@/types/article-document'
import { ARTICLE_DOCUMENT_VERSION, isArticleDocument, validateArticleDocument } from '@/types/article-document'

export function emptyArticleDocument(): ArticleDocument {
  return { type: 'doc', version: ARTICLE_DOCUMENT_VERSION, content: [] }
}

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

/**
 * The database JSONB column can contain either the historical paragraph array or
 * a versioned ArticleDocument. Keep that compatibility boundary in one place.
 */
export function newsContentToArticleDocument(value: unknown): ArticleDocument {
  return isArticleDocument(value) ? value : legacyNewsContentToDocument(value)
}

/** Turns Tiptap's document JSON into the versioned storage contract. */
export function editorJsonToArticleDocument(value: unknown): ArticleDocument {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Dokumen editor tidak valid.')
  }

  const candidate = {
    ...(value as Record<string, unknown>),
    type: 'doc' as const,
    version: ARTICLE_DOCUMENT_VERSION,
  }
  const result = validateArticleDocument(candidate)
  if (!result.valid) throw new Error(`Dokumen editor tidak valid: ${result.errors[0]}`)
  return candidate as ArticleDocument
}

export function articleDocumentToEditorJson(document: ArticleDocument) {
  return { type: 'doc' as const, content: document.content }
}

export function articleDocumentHasContent(document: ArticleDocument) {
  return document.content.some((block) => {
    if (block.type === 'image' || block.type === 'horizontalRule') return true
    if ('content' in block) return (block.content ?? []).length > 0
    return false
  })
}

