# Miftahul Mubin — Development Roadmap

## Phase 0 — Blueprint ✅

- Product concept
- Public/admin feature flow
- Route map
- UI structure
- Database plan
- Permission model

## Phase 1 — Foundation ✅

- Bootstrap Next.js + TypeScript.
- Configure static export for GitHub Pages.
- Create root layout, shared header, footer, navigation, mobile navigation.
- Create responsive design tokens and editorial styles.
- Add accessible search overlay and mobile menu.
- Establish reusable page shell and page-intro components.

**Output:** working static website foundation.

## Phase 1B — Multi-page Public Portal ✅

The public website is now separated into dedicated pages instead of one long homepage:

- `/` — landing page / Beranda
- `/berita/` — berita dan informasi
- `/keislaman/` — artikel, kajian, khutbah
- `/kegiatan/` — agenda dan program
- `/kepengurusan/` — struktur pengurus
- `/keuangan/` — transparansi keuangan
- `/profil/` — profil masjid
- `/dokumentasi/` — galeri kegiatan
- `/pengumuman/` — pengumuman resmi
- `/kontak/` — kontak dan lokasi

All pages share the same header/footer system and responsive editorial visual language.

**Output:** complete static public portal with separate routes.

## Phase 2 — Public Content Expansion

1. News listing + detail pages.
2. Keislaman listing + detail pages.
3. Events listing + detail pages.
4. Search results page.
5. Rich gallery/video pages.
6. Real mosque identity, address, contacts, management data, and content.

**Output:** complete public content experience.

## Phase 3 — Supabase + CMS

1. Create database schema.
2. Configure Auth.
3. Configure Storage buckets.
4. Apply RLS policies.
5. Connect public pages to database.
6. Build admin authentication and dashboard.
7. Build CRUD for news, events, announcements, media, and management.

**Output:** content-managed portal.

## Phase 4 — Finance

1. Finance categories.
2. Income/expense transaction CRUD.
3. Automatic balance calculation.
4. Period/month filtering.
5. Public finance summary.
6. Public transaction report.
7. Proof upload.
8. Audit log.
9. PDF export.

**Output:** transparent finance module.

## Phase 5 — Production Hardening

- SEO metadata and sitemap
- Image optimization
- Error/loading states
- Security review
- RLS review
- Permission review
- Form validation
- Performance review
- Backup strategy
- Production deployment

## Recommended Order

```text
Static multi-page portal
   -> Real content
   -> Database
   -> Admin CMS
   -> Finance
   -> Security/SEO
   -> Production
```
