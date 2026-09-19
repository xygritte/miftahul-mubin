import { ARTICLE_DOCUMENT_VERSION, type ArticleBlock, type ArticleDocument, type ArticleInline, type ArticleMark } from '@/types/article-document'

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'

type ArchiveEntry = { name: string; data: Uint8Array }
type RelationshipMap = Map<string, string>
type ImportedImage = { id: string; file: File; alt: string }

export type DocxImportResult = {
  document: ArticleDocument
  images: ImportedImage[]
  warnings: string[]
}

function findEndOfCentralDirectory(bytes: Uint8Array) {
  const lowerBound = Math.max(0, bytes.length - 65_557)
  for (let index = bytes.length - 22; index >= lowerBound; index -= 1) {
    if (bytes[index] === 0x50 && bytes[index + 1] === 0x4b && bytes[index + 2] === 0x05 && bytes[index + 3] === 0x06) return index
  }
  throw new Error('Berkas DOCX tidak memiliki arsip ZIP yang valid.')
}

function asArrayBuffer(data: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(data.byteLength)
  new Uint8Array(buffer).set(data)
  return buffer
}

async function inflate(data: Uint8Array, method: number) {
  if (method === 0) return data
  if (method !== 8 || typeof DecompressionStream === 'undefined') throw new Error('Format kompresi DOCX tidak didukung oleh browser ini.')
  const stream = new Blob([asArrayBuffer(data)]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function readZip(file: File): Promise<Map<string, ArchiveEntry>> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const end = findEndOfCentralDirectory(bytes)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const count = view.getUint16(end + 10, true)
  let cursor = view.getUint32(end + 16, true)
  const entries = new Map<string, ArchiveEntry>()
  const decoder = new TextDecoder()

  for (let index = 0; index < count; index += 1) {
    if (view.getUint32(cursor, true) !== 0x02014b50) throw new Error('Struktur arsip DOCX tidak valid.')
    const method = view.getUint16(cursor + 10, true)
    const compressedSize = view.getUint32(cursor + 20, true)
    const fileNameLength = view.getUint16(cursor + 28, true)
    const extraLength = view.getUint16(cursor + 30, true)
    const commentLength = view.getUint16(cursor + 32, true)
    const localOffset = view.getUint32(cursor + 42, true)
    const name = decoder.decode(bytes.slice(cursor + 46, cursor + 46 + fileNameLength))
    if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('Entri arsip DOCX tidak valid.')
    const localNameLength = view.getUint16(localOffset + 26, true)
    const localExtraLength = view.getUint16(localOffset + 28, true)
    const start = localOffset + 30 + localNameLength + localExtraLength
    const data = await inflate(bytes.slice(start, start + compressedSize), method)
    entries.set(name, { name, data })
    cursor += 46 + fileNameLength + extraLength + commentLength
  }
  return entries
}

function xml(entry: ArchiveEntry | undefined, label: string) {
  if (!entry) throw new Error(`Dokumen DOCX tidak memiliki ${label}.`)
  const parsed = new DOMParser().parseFromString(new TextDecoder().decode(entry.data), 'application/xml')
  if (parsed.querySelector('parsererror')) throw new Error(`${label} tidak dapat dibaca.`)
  return parsed
}

function directChildren(element: Element, localName: string) {
  return Array.from(element.children).filter((child) => child.localName === localName)
}

function firstDescendant(element: Element, localName: string) {
  return Array.from(element.getElementsByTagNameNS('*', localName))[0] ?? null
}

function attribute(element: Element | null, name: string, namespace?: string) {
  return element?.getAttributeNS(namespace ?? WORD_NS, name) ?? element?.getAttribute(`w:${name}`) ?? element?.getAttribute(name) ?? null
}

function relationships(document: Document) {
  const result: RelationshipMap = new Map()
  Array.from(document.getElementsByTagNameNS('*', 'Relationship')).forEach((item) => {
    const id = item.getAttribute('Id')
    const target = item.getAttribute('Target')
    if (id && target && item.getAttribute('TargetMode') !== 'External') result.set(id, target)
  })
  return result
}

function mimeType(path: string) {
  const extension = path.split('.').pop()?.toLowerCase()
  if (extension === 'png') return 'image/png'
  if (extension === 'gif') return 'image/gif'
  if (extension === 'webp') return 'image/webp'
  if (extension === 'svg') return 'image/svg+xml'
  if (extension === 'bmp') return 'image/bmp'
  if (extension === 'tif' || extension === 'tiff') return 'image/tiff'
  return 'image/jpeg'
}

function isWordTrue(element: Element | null, name: string) {
  const node = element ? directChildren(element, name)[0] : null
  return Boolean(node && attribute(node, 'val') !== '0' && attribute(node, 'val') !== 'false')
}

function marksForRun(run: Element): ArticleMark[] {
  const properties = directChildren(run, 'rPr')[0] ?? null
  const marks: ArticleMark[] = []
  if (isWordTrue(properties, 'b')) marks.push({ type: 'bold' })
  if (isWordTrue(properties, 'i')) marks.push({ type: 'italic' })
  const underline = properties ? directChildren(properties, 'u')[0] : null
  if (underline && attribute(underline, 'val') !== 'none') marks.push({ type: 'underline' })
  return marks
}

function parseRun(run: Element, inheritedMarks: ArticleMark[]) {
  const marks = [...inheritedMarks, ...marksForRun(run)]
  const result: ArticleInline[] = []
  Array.from(run.children).forEach((child) => {
    if (child.localName === 't') {
      const text = child.textContent ?? ''
      if (text) result.push({ type: 'text', text, marks: marks.length ? marks : undefined })
    } else if (child.localName === 'br' || child.localName === 'cr') result.push({ type: 'hardBreak' })
    else if (child.localName === 'tab') result.push({ type: 'text', text: '\t', marks: marks.length ? marks : undefined })
  })
  return result
}

function parseInlines(paragraph: Element, relationMap: RelationshipMap) {
  const result: ArticleInline[] = []
  Array.from(paragraph.children).forEach((child) => {
    if (child.localName === 'r') result.push(...parseRun(child, []))
    if (child.localName === 'hyperlink') {
      const relationId = attribute(child, 'id', REL_NS)
      const href = relationId ? relationMap.get(relationId) : null
      const marks: ArticleMark[] = href?.startsWith('http') ? [{ type: 'link', attrs: { href, target: '_blank' } }] : []
      directChildren(child, 'r').forEach((run) => result.push(...parseRun(run, marks)))
    }
  })
  return result
}

function paragraphStyle(paragraph: Element) {
  const properties = directChildren(paragraph, 'pPr')[0] ?? null
  const style = properties ? directChildren(properties, 'pStyle')[0] : null
  const styleName = attribute(style, 'val')?.toLowerCase().replace(/[ _-]/g, '') ?? ''
  const numbering = properties ? directChildren(properties, 'numPr')[0] : null
  const numberId = numbering ? attribute(directChildren(numbering, 'numId')[0] ?? null, 'val') : null
  return { styleName, numberId }
}

function resolveMediaPath(target: string) {
  try {
    const normalizedTarget = target.replace(/^\/+/, '')
    return decodeURIComponent(new URL(normalizedTarget, 'https://docx.local/word/').pathname.replace(/^\/+/, ''))
  } catch {
    return null
  }
}

function parseImages(paragraph: Element, relationMap: RelationshipMap, entries: Map<string, ArchiveEntry>, knownImages: Map<string, ImportedImage>, warnings: string[]) {
  const imageBlocks: ArticleBlock[] = []
  Array.from(paragraph.getElementsByTagNameNS('*', 'blip')).forEach((blip) => {
    const relationId = attribute(blip, 'embed', REL_NS)
    const target = relationId ? relationMap.get(relationId) : null
    if (!target) { warnings.push('Satu gambar DOCX tidak memiliki relasi media yang dapat dibaca.'); return }
    const path = resolveMediaPath(target)
    if (!path) { warnings.push(`Media DOCX “${target}” memiliki path yang tidak valid.`); return }
    const entry = entries.get(path)
    if (!entry) { warnings.push(`Media DOCX “${target}” tidak ditemukan.`); return }
    let image = knownImages.get(path)
    if (!image) {
      const id = `docx-image-${knownImages.size + 1}`
      const fileName = path.split('/').pop() || `${id}.jpg`
      const description = firstDescendant(paragraph, 'docPr')?.getAttribute('descr') || firstDescendant(paragraph, 'docPr')?.getAttribute('name') || ''
      image = { id, file: new File([asArrayBuffer(entry.data)], fileName, { type: mimeType(fileName) }), alt: description }
      knownImages.set(path, image)
    }
    if (!imageBlocks.some((block) => block.type === 'image' && block.attrs.src === `docx:${image.id}`)) {
      imageBlocks.push({ type: 'image', attrs: { src: `docx:${image.id}`, alt: image.alt, alignment: 'center' } })
    }
  })
  return imageBlocks
}

function listFormat(numbering: Map<string, 'bullet' | 'ordered'>, numberId: string | null) {
  return numberId ? numbering.get(numberId) ?? 'ordered' : null
}

function parseNumbering(document: Document) {
  const abstractFormats = new Map<string, 'bullet' | 'ordered'>()
  Array.from(document.getElementsByTagNameNS('*', 'abstractNum')).forEach((abstract) => {
    const id = attribute(abstract, 'abstractNumId')
    const format = firstDescendant(abstract, 'numFmt')
    if (id) abstractFormats.set(id, attribute(format, 'val') === 'bullet' ? 'bullet' : 'ordered')
  })
  const formats = new Map<string, 'bullet' | 'ordered'>()
  Array.from(document.getElementsByTagNameNS('*', 'num')).forEach((number) => {
    const id = attribute(number, 'numId')
    const abstractId = attribute(firstDescendant(number, 'abstractNumId'), 'val')
    if (id) formats.set(id, abstractFormats.get(abstractId ?? '') ?? 'ordered')
  })
  return formats
}

/**
 * Imports the Word structures that the ArticleDocument V1 contract supports.
 * Unsupported tables and shapes are reported, never silently converted to HTML.
 */
export async function importDocxArticle(file: File): Promise<DocxImportResult> {
  if (!file.name.toLowerCase().endsWith('.docx')) throw new Error('Pilih berkas DOCX (.docx).')
  const entries = await readZip(file)
  const documentXml = xml(entries.get('word/document.xml'), 'word/document.xml')
  const relationMap = relationships(xml(entries.get('word/_rels/document.xml.rels'), 'relasi dokumen'))
  const numbering = entries.has('word/numbering.xml') ? parseNumbering(xml(entries.get('word/numbering.xml'), 'numbering.xml')) : new Map<string, 'bullet' | 'ordered'>()
  const body = firstDescendant(documentXml.documentElement, 'body')
  if (!body) throw new Error('Isi dokumen DOCX tidak ditemukan.')

  const warnings: string[] = []
  const importedImages = new Map<string, ImportedImage>()
  const content: ArticleBlock[] = []
  let activeList: { type: 'bulletList' | 'orderedList'; content: Array<{ type: 'listItem'; content: ArticleBlock[] }> } | null = null
  const flushList = () => {
    if (activeList) content.push(activeList)
    activeList = null
  }

  Array.from(body.children).forEach((node) => {
    if (node.localName === 'tbl') { flushList(); warnings.push('Tabel DOCX belum didukung dan tidak ikut diimpor.'); return }
    if (node.localName !== 'p') return
    const { styleName, numberId } = paragraphStyle(node)
    const inline = parseInlines(node, relationMap)
    const images = parseImages(node, relationMap, entries, importedImages, warnings)
    const blocks: ArticleBlock[] = []
    if (inline.length) {
      const headingLevel = styleName.includes('heading1') || styleName === 'title' ? 1 : styleName.includes('heading2') ? 2 : styleName.includes('heading3') ? 3 : null
      blocks.push(headingLevel ? { type: 'heading', level: headingLevel, content: inline } : { type: 'paragraph', content: inline })
    }
    blocks.push(...images)
    if (!blocks.length) return
    const format = listFormat(numbering, numberId)
    if (format) {
      const type = format === 'bullet' ? 'bulletList' : 'orderedList'
      if (!activeList || activeList.type !== type) { flushList(); activeList = { type, content: [] } }
      activeList.content.push({ type: 'listItem', content: blocks })
    } else { flushList(); content.push(...blocks) }
  })
  flushList()
  if (!content.length) warnings.push('Tidak ada paragraf yang dapat diimpor dari DOCX ini.')
  return { document: { type: 'doc', version: ARTICLE_DOCUMENT_VERSION, content }, images: Array.from(importedImages.values()), warnings }
}

export function replaceImportedImageSources(document: ArticleDocument, sources: Record<string, string>): ArticleDocument {
  const replace = (blocks: ArticleBlock[]): ArticleBlock[] => blocks.map((block) => {
    if (block.type === 'image') return { ...block, attrs: { ...block.attrs, src: sources[block.attrs.src] ?? block.attrs.src } }
    if (block.type === 'blockquote') return { ...block, content: replace(block.content) }
    if (block.type === 'bulletList' || block.type === 'orderedList') return { ...block, content: block.content.map((item) => ({ ...item, content: replace(item.content) })) }
    return block
  })
  return { ...document, content: replace(document.content) }
}
