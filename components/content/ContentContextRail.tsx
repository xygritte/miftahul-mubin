import Link from 'next/link'
import { ArrowRight, CalendarDays } from 'lucide-react'

export type ContentContextLink = {
  label: string
  href: string
  active?: boolean
}

export type ContentContextRelatedItem = {
  title: string
  href: string
  meta: string
  image?: string | null
}

export type ContentContextRelatedGroup = {
  label: string
  href: string
  items: ContentContextRelatedItem[]
}

export type ContentContextRailData = {
  eyebrow: string
  title: string
  links: ContentContextLink[]
  note: string
}

export default function ContentContextRail({
  data,
  relatedGroups,
  relatedLoading = false,
}: {
  data: ContentContextRailData
  relatedGroups: ContentContextRelatedGroup[]
  relatedLoading?: boolean
}) {
  const showRelated = relatedLoading || relatedGroups.some((group) => group.items.length > 0)

  return (
    <div className="content-context-rail">
      {showRelated && (
        <section className="content-context-related" aria-labelledby="content-context-related-title" aria-busy={relatedLoading || undefined}>
          <div className="content-context-related-head">
            <span className="eyebrow">Terbaru</span>
            <h2 id="content-context-related-title">Konten terkait</h2>
          </div>

          {relatedLoading ? (
            <div className="content-context-related-loading" role="status" aria-label="Memuat konten terkait">
              {relatedGroups.map((group) => (
                <div key={group.label} className="content-context-related-group" aria-hidden="true">
                  <div className="content-context-group-head">
                    <span>{group.label}</span>
                  </div>
                  <div className="content-context-related-list">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="content-context-related-skeleton">
                        <span className="content-context-skeleton-index" />
                        <span className="content-context-skeleton-thumb" />
                        <span className="content-context-skeleton-copy">
                          <span className="content-context-skeleton-line content-context-skeleton-title" />
                          <span className="content-context-skeleton-line content-context-skeleton-meta" />
                        </span>
                        <span className="content-context-skeleton-arrow" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="content-context-related-groups">
              {relatedGroups.filter((group) => group.items.length > 0).map((group) => (
                <div key={group.label} className="content-context-related-group">
                  <div className="content-context-group-head">
                    <span>{group.label}</span>
                    <Link href={group.href}>Semua</Link>
                  </div>
                  <div className="content-context-related-list">
                    {group.items.map((item, index) => (
                      <Link
                        key={item.href}
                        className={"content-context-related-item" + (item.image ? " has-image" : "")}
                        href={item.href}
                      >
                        <span className="content-context-item-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                        {item.image && <img src={item.image} alt="" loading="lazy" decoding="async" />}
                        <span className="content-context-item-copy">
                          <strong>{item.title}</strong>
                          <small>{item.meta}</small>
                        </span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <nav className="content-context-nav" aria-label={data.title}>
        <div className="content-context-head">
          <span className="eyebrow">{data.eyebrow}</span>
          <h3>{data.title}</h3>
        </div>
        <div className="content-context-links">
          {data.links.map((item, index) => (
            <Link
              key={item.href}
              className={item.active ? 'active' : undefined}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
            >
              <span className="content-context-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span className="content-context-label">{item.label}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </nav>

      <div className="content-context-note">
        <CalendarDays size={17} aria-hidden="true" />
        <p>{data.note}</p>
      </div>
    </div>
  )
}
