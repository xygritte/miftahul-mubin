# News Dependency Map

Status: PHASE 1 — Audit News Pipeline / L1
Scope: read/write dependency mapping only. No runtime behavior changed.

## 1. Canonical Storage Reality

The production schema already stores `public.news.content` as `jsonb` with a default empty JSON array. The application layer currently narrows that JSONB value to `string[]` and treats it as an array of paragraphs.

```text
Supabase `news.content` (JSONB)
        ↓
supabasePublicRepository.paragraphs()
        ↓
NewsRecord.content: string[]
        ↓
presentation.ts
        ↓
ArticleDetail / SafeRichContent
```

Implication: the planned document migration is an application-level contract migration inside the existing JSONB field, not a TEXT → JSONB storage migration.

## 2. Admin Write Pipeline

```text
/admin/(protected)/berita/page.tsx
        ↓
AdminNewsManager
        ├─ load news/categories
        ├─ create
        ├─ edit
        ├─ delete
        ├─ publish status
        ├─ thumbnail upload
        └─ content serialization
               ↓
        textarea string
               ↓
        split on blank lines
               ↓
        string[]
               ↓
        Supabase `news.content`
```

Primary consumer: `components/admin/AdminNewsManager.tsx`.

Key legacy assumption: article body is a paragraph array and the editor can be represented by a plain textarea.

## 3. Public Detail Pipeline

```text
Supabase `news`
        ↓
supabasePublicRepository
        ↓
NewsRecord
        ↓
newsRecordToLegacy()
        ↓
LiveArticleDetail
        ↓
ArticleDetail
        ↓
SafeRichContent
```

`ArticleDetail` owns the article shell: metadata, title, lead, hero image, article body, share area, and sidebar.

`SafeRichContent` currently renders paragraph strings, detects URLs, and converts recognized YouTube URLs into embeds. It is not a canonical rich-document renderer.

## 4. Public Listing Consumers

The homepage and `LiveNews` use news metadata rather than the full article body.

Primary fields used by listing/hero components:

```text
title
slug
excerpt
thumbnail_url
published_at
view_count
category
```

`LiveNews` intentionally maps `content` to an empty array for cards.

Implication: rich article content should remain a detail-page concern and must not unnecessarily inflate listing queries or client payloads.

## 5. Presentation Layer

`lib/data/presentation.ts` defines the UI-facing `NewsItem` contract and currently carries `content: string[]` forward from `NewsRecord`.

This is a future migration boundary, not an immediate change in L1.

## 6. Type Contract

`types/content.ts` currently defines:

```ts
export type NewsRecord = {
  ...
  content: string[]
  ...
}
```

This type is one of the main constraints preventing the existing JSONB column from representing a structured article document.

## 7. Storage Dependencies

Existing reusable storage infrastructure:

```text
lib/supabase/storage.ts
        ↓
news-media bucket
```

Current `news-media` configuration:

```text
public: true
max size: 8 MB
accepted: image/*, image/svg+xml
```

Existing helpers include public upload, generic upload, removal, filename sanitization, and raster image optimization.

Implication: the future inline-image feature should reuse this infrastructure rather than creating a second upload system.

## 8. Existing Admin Storage Surface

The repository already exposes an admin storage page under:

```text
app/admin/(protected)/storage/page.tsx
```

This is relevant to the future Media Management phase.

## 9. Authorization Findings

The repository has an authenticated `news_admin_read` policy for `super_admin`, `admin`, and `editor` roles, while the public-read policy limits anonymous reads to published news with a valid publication time.

The checked migrations do not expose a matching `news_admin_insert` / `news_admin_update` / `news_admin_delete` policy in the files searched during this audit. The current admin implementation nevertheless performs direct Supabase insert/update/delete operations, so the effective write authorization must be verified against the complete migration history and live Supabase policy state before any rich-editor write contract is introduced.

This remains an explicit pre-migration verification item; L1 does not change authorization.

## 10. Scope Boundary

Included in this feature:

```text
news data contract
news admin editor
article detail renderer
news inline images
news media integration
DOCX import
news preview/publishing flow
```

Not included merely because similar structures exist:

```text
Islamic article rich-text migration
announcement rich-text migration
event content migration
finance content migration
```

Those systems may be consumers of shared abstractions later, but they are not part of the initial news migration unless a direct dependency requires it.

## 11. Change Candidates for Later Phases

Likely high-impact files/components:

```text
types/content.ts
lib/data/presentation.ts
lib/data/repository.ts
lib/data/supabasePublicRepository.ts
components/admin/AdminNewsManager.tsx
components/content/ArticleDetail.tsx
components/content/SafeRichContent.tsx
components/live/LiveArticleDetail.tsx
lib/supabase/storage.ts
supabase/migrations/*
```

These are candidate consumers only. Each future `C` must re-audit the exact files before its corresponding `L`.

## 12. L1 Checkpoint Evidence

The current audit establishes the primary News Dependency Map and records the major compatibility boundary:

```text
JSONB storage
      ↓
legacy string[] application contract
      ↓
paragraph-based editor/renderer
```

The next phase must use this map when defining the canonical Article Document contract.
