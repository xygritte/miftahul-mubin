'use client'

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { AlignCenter, AlignLeft, AlignRight, Bold, Code2, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Redo2, RemoveFormatting, RotateCcw, Underline } from 'lucide-react'
import type { ArticleBlock, ArticleDocument, ArticleInline, ArticleMark } from '@/types/article-document'
import { editorJsonToArticleDocument } from '@/lib/data/articleDocumentLegacy'
import { publicStorageUrl } from '@/lib/supabase/storage'
import { supabase } from '@/lib/supabase/client'

type MediaObject = { name: string; updated_at?: string; metadata?: { size?: number } }

type Props = {
  value: ArticleDocument
  onChange: (document: ArticleDocument) => void
  onUploadImage: (file: File) => Promise<string>
  onUploadStateChange?: (uploading: boolean) => void
  disabled?: boolean
}

function safeHttpUrl(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

function appendInline(parent: HTMLElement, inline: ArticleInline) {
  if (inline.type === 'hardBreak') {
    parent.append(document.createElement('br'))
    return
  }

  let node: Node = document.createTextNode(inline.text)
  for (const mark of inline.marks ?? []) {
    if (mark.type === 'bold') {
      const element = document.createElement('strong')
      element.append(node)
      node = element
    } else if (mark.type === 'italic') {
      const element = document.createElement('em')
      element.append(node)
      node = element
    } else if (mark.type === 'underline') {
      const element = document.createElement('u')
      element.append(node)
      node = element
    } else {
      const href = safeHttpUrl(mark.attrs.href)
      if (href) {
        const element = document.createElement('a')
        element.href = href
        element.target = mark.attrs.target ?? '_blank'
        element.rel = 'noopener noreferrer'
        element.append(node)
        node = element
      }
    }
  }
  parent.append(node)
}

function appendBlock(parent: HTMLElement, block: ArticleBlock) {
  if (block.type === 'paragraph' || block.type === 'heading') {
    const element = document.createElement(block.type === 'heading' ? `h${block.level}` : 'p')
    ;(block.content ?? []).forEach((inline) => appendInline(element, inline))
    if (!element.childNodes.length) element.append(document.createElement('br'))
    parent.append(element)
    return
  }

  if (block.type === 'bulletList' || block.type === 'orderedList') {
    const list = document.createElement(block.type === 'bulletList' ? 'ul' : 'ol')
    block.content.forEach((item) => {
      const listItem = document.createElement('li')
      item.content.forEach((child) => appendBlock(listItem, child))
      if (!listItem.childNodes.length) listItem.append(document.createElement('p'))
      list.append(listItem)
    })
    parent.append(list)
    return
  }

  if (block.type === 'blockquote') {
    const quote = document.createElement('blockquote')
    block.content.forEach((child) => appendBlock(quote, child))
    parent.append(quote)
    return
  }

  if (block.type === 'horizontalRule') {
    parent.append(document.createElement('hr'))
    return
  }

  const figure = document.createElement('figure')
  figure.dataset.articleImage = 'true'
  figure.dataset.caption = block.attrs.caption ?? ''
  figure.dataset.alignment = block.attrs.alignment ?? 'center'
  if (block.attrs.width) {
    figure.dataset.width = String(block.attrs.width)
    figure.style.maxWidth = `${block.attrs.width}px`
  }
  figure.contentEditable = 'false'
  figure.className = `editor-image align-${block.attrs.alignment ?? 'center'}`
  const image = document.createElement('img')
  image.src = block.attrs.src
  image.alt = block.attrs.alt
  figure.append(image)
  if (block.attrs.caption) {
    const caption = document.createElement('figcaption')
    caption.textContent = block.attrs.caption
    figure.append(caption)
  }
  parent.append(figure)
}

function markForElement(element: HTMLElement, current: ArticleMark[]) {
  const tag = element.tagName.toLowerCase()
  const marks = [...current]
  if (tag === 'strong' || tag === 'b') marks.push({ type: 'bold' })
  if (tag === 'em' || tag === 'i') marks.push({ type: 'italic' })
  if (tag === 'u') marks.push({ type: 'underline' })
  if (tag === 'a') {
    const href = safeHttpUrl(element.getAttribute('href'))
    if (href) marks.push({ type: 'link', attrs: { href, target: element.getAttribute('target') === '_blank' ? '_blank' : undefined } })
  }
  return marks
}

function inlineFromNode(node: Node, marks: ArticleMark[] = []): ArticleInline[] {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ? [{ type: 'text', text: node.textContent, marks: marks.length ? marks : undefined }] : []
  if (!(node instanceof HTMLElement)) return []
  if (node.tagName.toLowerCase() === 'br') return [{ type: 'hardBreak' }]
  const nextMarks = markForElement(node, marks)
  return Array.from(node.childNodes).flatMap((child) => inlineFromNode(child, nextMarks))
}

function paragraphFromNode(node: Node): ArticleBlock {
  const content = inlineFromNode(node)
  return { type: 'paragraph', content: content.length ? content : undefined }
}

function blocksFromContainer(container: HTMLElement): ArticleBlock[] {
  return Array.from(container.childNodes).flatMap((node): ArticleBlock[] => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent?.trim() ? [paragraphFromNode(node)] : []
    if (!(node instanceof HTMLElement)) return []
    const tag = node.tagName.toLowerCase()
    if (tag === 'p' || tag === 'div') return [paragraphFromNode(node)]
    if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
      const content = inlineFromNode(node)
      return [{ type: 'heading', level: Number(tag.slice(1)) as 1 | 2 | 3, content: content.length ? content : undefined }]
    }
    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(node.children).filter((child) => child.tagName.toLowerCase() === 'li').map((item) => {
        const content = blocksFromContainer(item as HTMLElement)
        return { type: 'listItem' as const, content: content.length ? content : [{ type: 'paragraph' as const }] }
      })
      return items.length ? [{ type: tag === 'ul' ? 'bulletList' : 'orderedList', content: items }] : []
    }
    if (tag === 'blockquote') {
      const content = blocksFromContainer(node)
      return [{ type: 'blockquote', content: content.length ? content : [{ type: 'paragraph' }] }]
    }
    if (tag === 'hr') return [{ type: 'horizontalRule' }]
    if (tag === 'figure' && node.dataset.articleImage) {
      const image = node.querySelector('img')
      const src = safeHttpUrl(image?.getAttribute('src') ?? null)
      if (!src) return []
      const rawWidth = Number(node.dataset.width)
      return [{
        type: 'image',
        attrs: {
          src,
          alt: image?.getAttribute('alt') ?? '',
          caption: node.dataset.caption || undefined,
          alignment: node.dataset.alignment === 'left' || node.dataset.alignment === 'right' ? node.dataset.alignment : 'center',
          width: Number.isInteger(rawWidth) && rawWidth > 0 ? rawWidth : undefined,
        },
      }]
    }
    if (tag === 'img') {
      const src = safeHttpUrl(node.getAttribute('src'))
      return src ? [{ type: 'image', attrs: { src, alt: node.getAttribute('alt') ?? '', alignment: 'center' } }] : []
    }
    return [paragraphFromNode(node)]
  })
}

function renderDocument(root: HTMLDivElement, value: ArticleDocument) {
  root.replaceChildren()
  value.content.forEach((block) => appendBlock(root, block))
  if (!root.childNodes.length) root.append(document.createElement('p'))
}

function imageDetails(figure: HTMLElement | null) {
  const image = figure?.querySelector('img')
  const rawWidth = Number(figure?.dataset.width)
  return {
    alt: image?.alt ?? '',
    caption: figure?.dataset.caption ?? '',
    alignment: figure?.dataset.alignment === 'left' || figure?.dataset.alignment === 'right' ? figure.dataset.alignment : 'center',
    width: Number.isInteger(rawWidth) && rawWidth > 0 ? rawWidth : undefined,
  } as const
}

function formatSize(bytes: number | undefined) {
  if (!bytes) return ''
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`
}

export default function RichArticleEditor({ value, onChange, onUploadImage, onUploadStateChange, disabled = false }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const emittedValue = useRef('')
  const [selectedImage, setSelectedImage] = useState<HTMLElement | null>(null)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaObject[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [error, setError] = useState('')

  const signature = JSON.stringify(value)
  useEffect(() => {
    const root = rootRef.current
    if (!root || emittedValue.current === signature) return
    renderDocument(root, value)
    emittedValue.current = signature
    setSelectedImage(null)
  }, [signature, value])

  function emitChange() {
    const root = rootRef.current
    if (!root) return
    try {
      const article = editorJsonToArticleDocument({ type: 'doc', content: blocksFromContainer(root) })
      emittedValue.current = JSON.stringify(article)
      onChange(article)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Isi artikel tidak dapat dibaca.')
    }
  }

  function run(command: string, argument?: string) {
    if (disabled) return
    rootRef.current?.focus()
    document.execCommand(command, false, argument)
    emitChange()
  }

  function setBlock(tag: 'p' | 'h1' | 'h2' | 'h3' | 'blockquote') {
    run('formatBlock', tag)
  }

  function addLink() {
    const href = safeHttpUrl(window.prompt('Masukkan URL tautan (https://...)', '') ?? '')
    if (!href) return
    run('createLink', href)
  }

  function insertImage(url: string, alt = '') {
    const root = rootRef.current
    if (!root) return
    const src = safeHttpUrl(url)
    if (!src) { setError('URL gambar harus memakai http atau https.'); return }
    const figure = document.createElement('figure')
    figure.dataset.articleImage = 'true'
    figure.dataset.alignment = 'center'
    figure.className = 'editor-image align-center'
    figure.contentEditable = 'false'
    const image = document.createElement('img')
    image.src = src
    image.alt = alt
    figure.append(image)
    const paragraph = document.createElement('p')
    paragraph.append(document.createElement('br'))
    const selection = window.getSelection()
    const range = selection?.rangeCount && root.contains(selection.getRangeAt(0).commonAncestorContainer) ? selection.getRangeAt(0) : null
    if (range) {
      range.deleteContents()
      range.insertNode(paragraph)
      range.insertNode(figure)
    } else {
      root.append(figure, paragraph)
    }
    const nextRange = document.createRange()
    nextRange.selectNodeContents(paragraph)
    nextRange.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(nextRange)
    setSelectedImage(figure)
    emitChange()
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || disabled) return
    onUploadStateChange?.(true)
    setError('')
    try {
      const url = await onUploadImage(file)
      insertImage(url, file.name.replace(/\.[^.]+$/, ''))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gambar gagal diunggah.')
    } finally {
      onUploadStateChange?.(false)
    }
  }

  async function openMediaPicker() {
    if (disabled) return
    setMediaOpen(true)
    setMediaLoading(true)
    setError('')
    const { data, error: listError } = await supabase.storage.from('news-media').list('', { limit: 40, offset: 0, sortBy: { column: 'updated_at', order: 'desc' } })
    if (listError) setError('Media berita tidak dapat dimuat. Pastikan akun memiliki izin Storage.')
    else setMediaItems((data ?? []) as MediaObject[])
    setMediaLoading(false)
  }

  function updateSelectedImage(update: Partial<ReturnType<typeof imageDetails>>) {
    if (!selectedImage) return
    const image = selectedImage.querySelector('img')
    if (!image) return
    if (update.alt !== undefined) image.alt = update.alt
    if (update.caption !== undefined) selectedImage.dataset.caption = update.caption
    if (update.alignment !== undefined) {
      selectedImage.dataset.alignment = update.alignment
      selectedImage.className = `editor-image align-${update.alignment}`
    }
    if (update.width !== undefined) {
      if (update.width > 0) {
        selectedImage.dataset.width = String(update.width)
        selectedImage.style.maxWidth = `${update.width}px`
      } else {
        delete selectedImage.dataset.width
        selectedImage.style.removeProperty('max-width')
      }
    }
    const currentCaption = selectedImage.querySelector('figcaption')
    if (selectedImage.dataset.caption) {
      const caption = currentCaption ?? document.createElement('figcaption')
      caption.textContent = selectedImage.dataset.caption
      if (!currentCaption) selectedImage.append(caption)
    } else currentCaption?.remove()
    emitChange()
  }

  function toolbarButton(label: string, icon: ReactNode, action: () => void, active = false) {
    return <button type="button" className={`article-editor-tool${active ? ' active' : ''}`} aria-label={label} title={label} onMouseDown={(event) => event.preventDefault()} onClick={action} disabled={disabled}>{icon}</button>
  }

  const currentImage = imageDetails(selectedImage)

  return <section className="rich-article-editor" aria-label="Editor isi berita">
    <div className="article-editor-toolbar" role="toolbar" aria-label="Format artikel">
      <select aria-label="Format paragraf" defaultValue="p" onChange={(event) => setBlock(event.target.value as 'p' | 'h1' | 'h2' | 'h3' | 'blockquote')} disabled={disabled}>
        <option value="p">Paragraf</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="blockquote">Kutipan</option>
      </select>
      <span className="article-editor-tool-group">{toolbarButton('Tebal', <Bold size={16} />, () => run('bold'))}{toolbarButton('Miring', <Italic size={16} />, () => run('italic'))}{toolbarButton('Garis bawah', <Underline size={16} />, () => run('underline'))}</span>
      <span className="article-editor-tool-group">{toolbarButton('Daftar berpoin', <List size={16} />, () => run('insertUnorderedList'))}{toolbarButton('Daftar bernomor', <ListOrdered size={16} />, () => run('insertOrderedList'))}{toolbarButton('Kutipan', <Quote size={16} />, () => setBlock('blockquote'))}{toolbarButton('Garis pemisah', <RemoveFormatting size={16} />, () => run('insertHorizontalRule'))}</span>
      <span className="article-editor-tool-group">{toolbarButton('Tambahkan tautan', <Link2 size={16} />, addLink)}{toolbarButton('Urungkan', <RotateCcw size={16} />, () => run('undo'))}{toolbarButton('Ulangi', <Redo2 size={16} />, () => run('redo'))}</span>
      <span className="article-editor-media-actions"><button type="button" className="article-editor-insert" onMouseDown={(event) => event.preventDefault()} onClick={() => fileRef.current?.click()} disabled={disabled}><ImagePlus size={16} /> Unggah gambar</button><button type="button" className="article-editor-insert" onMouseDown={(event) => event.preventDefault()} onClick={openMediaPicker} disabled={disabled}><Code2 size={16} /> Pilih media</button></span>
      <input ref={fileRef} className="sr-only" type="file" accept="image/*" onChange={uploadImage} />
    </div>
    <div ref={rootRef} className="article-editor-canvas" contentEditable={!disabled} suppressContentEditableWarning onInput={emitChange} onClick={(event) => {
      const target = event.target instanceof HTMLElement ? event.target : null
      setSelectedImage(target?.closest('figure[data-article-image]') as HTMLElement | null)
    }} data-placeholder="Mulai menulis isi berita…" />
    {selectedImage && <div className="article-editor-image-controls" aria-label="Pengaturan gambar terpilih">
      <label><span>Teks alternatif</span><input value={currentImage.alt} onChange={(event) => updateSelectedImage({ alt: event.target.value })} /></label>
      <label><span>Keterangan gambar</span><input value={currentImage.caption} onChange={(event) => updateSelectedImage({ caption: event.target.value })} /></label>
      <label><span>Lebar (px)</span><input type="number" min="160" max="1600" step="10" value={currentImage.width ?? ''} onChange={(event) => updateSelectedImage({ width: event.target.value ? Number(event.target.value) : 0 })} /></label>
      <span className="article-editor-align" aria-label="Perataan gambar">{toolbarButton('Rata kiri', <AlignLeft size={16} />, () => updateSelectedImage({ alignment: 'left' }), currentImage.alignment === 'left')}{toolbarButton('Rata tengah', <AlignCenter size={16} />, () => updateSelectedImage({ alignment: 'center' }), currentImage.alignment === 'center')}{toolbarButton('Rata kanan', <AlignRight size={16} />, () => updateSelectedImage({ alignment: 'right' }), currentImage.alignment === 'right')}</span>
      <button type="button" className="article-editor-delete-image" onClick={() => { selectedImage.remove(); setSelectedImage(null); emitChange() }}>Hapus gambar</button>
    </div>}
    {mediaOpen && <div className="article-editor-media-picker"><div><strong>Media berita</strong><button type="button" onClick={() => setMediaOpen(false)}>Tutup</button></div>{mediaLoading ? <p>Memuat media…</p> : mediaItems.length ? <div className="article-editor-media-grid">{mediaItems.map((item) => { const url = publicStorageUrl('news-media', item.name); return <button type="button" key={item.name} onClick={() => { insertImage(url, item.name.replace(/\.[^.]+$/, '')); setMediaOpen(false) }}><img src={url} alt="" /><span>{item.name}</span><small>{formatSize(item.metadata?.size)}</small></button> })}</div> : <p>Belum ada media yang dapat dipilih.</p>}</div>}
    {error && <p className="article-editor-error" role="alert">{error}</p>}
    <p className="article-editor-hint">Format yang didukung: heading, tebal, miring, garis bawah, tautan, daftar, kutipan, garis pemisah, dan gambar inline.</p>
  </section>
}
