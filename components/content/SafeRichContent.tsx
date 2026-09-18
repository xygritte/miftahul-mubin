import ArticleContentRenderer from '@/components/content/ArticleContentRenderer'
import { legacyNewsContentToDocument } from '@/lib/data/articleDocumentLegacy'

/** @deprecated News uses ArticleContentRenderer directly; kept for legacy callers. */
export default function SafeRichContent({ paragraphs }: { paragraphs: string[] }) {
  return <ArticleContentRenderer document={legacyNewsContentToDocument(paragraphs)} />
}
