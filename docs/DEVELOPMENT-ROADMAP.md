# Miftahul Mubin — Development Roadmap

## Phase 0 — Blueprint (current)

- Product concept
- Public/admin feature flow
- Route map
- UI structure
- Database plan
- Permission model

## Phase 1 — Foundation

1. Bootstrap Next.js + TypeScript project.
2. Configure Tailwind CSS and global design tokens.
3. Create root layout, header, footer, navigation, mobile navigation.
4. Create reusable editorial components.
5. Establish environment configuration for Supabase.

**Output:** navigable static portal shell.

## Phase 2 — Public Portal

1. Home editorial layout.
2. News listing + detail.
3. Keislaman listing + detail.
4. Events listing + detail.
5. Announcements.
6. Management page.
7. Profile/contact.
8. Documentation gallery.
9. Search.

**Output:** public portal with complete navigation and responsive layout.

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
Foundation
   -> Public UI
   -> Database
   -> Admin CMS
   -> Finance
   -> Security/SEO
   -> Production
```

Do not build payment/donation gateway or native mobile apps until the core portal and data model are stable.
