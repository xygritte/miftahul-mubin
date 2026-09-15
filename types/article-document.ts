export const ARTICLE_DOCUMENT_VERSION = 1 as const

export type ArticleDocument = {
  type: 'doc'
  version: typeof ARTICLE_DOCUMENT_VERSION
  content: ArticleBlock[]
}

export type ArticleBlock =
  | ArticleParagraph
  | ArticleHeading
  | ArticleBulletList
  | ArticleOrderedList
  | ArticleBlockquote
  | ArticleImage
  | ArticleHorizontalRule

export type ArticleInline = ArticleText | ArticleHardBreak

export type ArticleMark =
  | ArticleBoldMark
  | ArticleItalicMark
  | ArticleUnderlineMark
  | ArticleLinkMark

export type ArticleText = {
  type: 'text'
  text: string
  marks?: ArticleMark[]
}

export type ArticleHardBreak = {
  type: 'hardBreak'
}

export type ArticleParagraph = {
  type: 'paragraph'
  content?: ArticleInline[]
}

export type ArticleHeading = {
  type: 'heading'
  level: 1 | 2 | 3
  content?: ArticleInline[]
}

export type ArticleListItem = {
  type: 'listItem'
  content: ArticleBlock[]
}

export type ArticleBulletList = {
  type: 'bulletList'
  content: ArticleListItem[]
}

export type ArticleOrderedList = {
  type: 'orderedList'
  content: ArticleListItem[]
}

export type ArticleBlockquote = {
  type: 'blockquote'
  content: ArticleBlock[]
}

export type ArticleImage = {
  type: 'image'
  attrs: {
    src: string
    alt: string
    caption?: string
    alignment?: 'left' | 'center' | 'right'
    width?: number
  }
}

export type ArticleHorizontalRule = {
  type: 'horizontalRule'
}

export type ArticleBoldMark = {
  type: 'bold'
}

export type ArticleItalicMark = {
  type: 'italic'
}

export type ArticleUnderlineMark = {
  type: 'underline'
}

export type ArticleLinkMark = {
  type: 'link'
  attrs: {
    href: string
    target?: '_blank'
  }
}

export type ArticleDocumentValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

function validateMarks(value: unknown, path: string, errors: string[]) {
  if (value === undefined) return
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`)
    return
  }

  value.forEach((mark, index) => {
    const markPath = `${path}[${index}]`
    if (!isRecord(mark) || typeof mark.type !== 'string') {
      errors.push(`${markPath} must be a mark object`)
      return
    }

    if (mark.type === 'bold' || mark.type === 'italic' || mark.type === 'underline') return

    if (mark.type !== 'link') {
      errors.push(`${markPath}.type is not supported`)
      return
    }

    if (!isRecord(mark.attrs) || !isNonEmptyString(mark.attrs.href)) {
      errors.push(`${markPath}.attrs.href must be a non-empty string`)
      return
    }

    if (mark.attrs.target !== undefined && mark.attrs.target !== '_blank') {
      errors.push(`${markPath}.attrs.target must be "_blank" when provided`)
    }
  })
}

function validateInlineContent(value: unknown, path: string, errors: string[]) {
  if (value === undefined) return
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`)
    return
  }

  value.forEach((node, index) => {
    const nodePath = `${path}[${index}]`
    if (!isRecord(node) || typeof node.type !== 'string') {
      errors.push(`${nodePath} must be an inline node`)
      return
    }

    if (node.type === 'hardBreak') return

    if (node.type !== 'text' || typeof node.text !== 'string') {
      errors.push(`${nodePath} must be a supported inline node`)
      return
    }

    validateMarks(node.marks, `${nodePath}.marks`, errors)
  })
}

function validateBlock(value: unknown, path: string, errors: string[]) {
  if (!isRecord(value) || typeof value.type !== 'string') {
    errors.push(`${path} must be a block object`)
    return
  }

  switch (value.type) {
    case 'paragraph':
    case 'heading':
      validateInlineContent(value.content, `${path}.content`, errors)
      if (value.type === 'heading' && value.level !== 1 && value.level !== 2 && value.level !== 3) {
        errors.push(`${path}.level must be 1, 2, or 3`)
      }
      return

    case 'listItem':
      if (!Array.isArray(value.content)) {
        errors.push(`${path}.content must be an array`)
        return
      }
      value.content.forEach((child, index) => validateBlock(child, `${path}.content[${index}]`, errors))
      return

    case 'bulletList':
    case 'orderedList':
      if (!Array.isArray(value.content)) {
        errors.push(`${path}.content must be an array`)
        return
      }
      value.content.forEach((item, index) => {
        const itemPath = `${path}.content[${index}]`
        if (!isRecord(item) || item.type !== 'listItem' || !Array.isArray(item.content)) {
          errors.push(`${itemPath} must be a listItem node`)
          return
        }
        item.content.forEach((child, childIndex) => validateBlock(child, `${itemPath}.content[${childIndex}]`, errors))
      })
      return

    case 'blockquote':
      if (!Array.isArray(value.content)) {
        errors.push(`${path}.content must be an array`)
        return
      }
      value.content.forEach((child, index) => validateBlock(child, `${path}.content[${index}]`, errors))
      return

    case 'image': {
      if (!isRecord(value.attrs)) {
        errors.push(`${path}.attrs must be an object`)
        return
      }
      if (!isNonEmptyString(value.attrs.src)) errors.push(`${path}.attrs.src must be a non-empty string`)
      if (typeof value.attrs.alt !== 'string') errors.push(`${path}.attrs.alt must be a string`)
      if (value.attrs.caption !== undefined && typeof value.attrs.caption !== 'string') errors.push(`${path}.attrs.caption must be a string`)
      if (value.attrs.alignment !== undefined && !['left', 'center', 'right'].includes(value.attrs.alignment as string)) {
        errors.push(`${path}.attrs.alignment is invalid`)
      }
      if (value.attrs.width !== undefined && (!isInteger(value.attrs.width) || value.attrs.width <= 0)) {
        errors.push(`${path}.attrs.width must be a positive integer`)
      }
      return
    }

    case 'horizontalRule':
      return

    default:
      errors.push(`${path}.type is not supported`)
  }
}

export function validateArticleDocument(value: unknown): ArticleDocumentValidationResult {
  const errors: string[] = []

  if (!isRecord(value)) return { valid: false, errors: ['Document must be an object'] }

  if (value.type !== 'doc') errors.push('Document type must be "doc"')
  if (value.version !== ARTICLE_DOCUMENT_VERSION) errors.push(`Document version must be ${ARTICLE_DOCUMENT_VERSION}`)
  if (!Array.isArray(value.content)) {
    errors.push('Document content must be an array')
  } else {
    value.content.forEach((block, index) => validateBlock(block, `content[${index}]`, errors))
  }

  return errors.length ? { valid: false, errors } : { valid: true }
}

export function isArticleDocument(value: unknown): value is ArticleDocument {
  return validateArticleDocument(value).valid
}
