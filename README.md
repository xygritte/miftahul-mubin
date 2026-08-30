# Miftahul Mubin

Portal informasi dan sistem informasi Masjid Miftahul Mubin.

## Konsep

Website dibangun sebagai portal editorial masjid: berita, kegiatan, keislaman, dokumentasi, kepengurusan, transparansi keuangan, dan informasi profil tersedia melalui halaman terpisah.

Referensi visual dan pola editorial: NU Online, tetapi identitas visual, konten, dan struktur Miftahul Mubin dibuat sendiri.

## Public Portal

- Beranda / landing page
- Berita + detail artikel
- Kegiatan + detail agenda
- Keislaman + detail artikel
- Pengumuman
- Kepengurusan
- Keuangan
- Profil masjid
- Dokumentasi
- Kontak dan lokasi
- Global search overlay
- Responsive desktop/tablet/mobile
- Accessible navigation dasar
- 404 page
- Sitemap dan robots metadata

## Status

**Fase 1 — Public Portal / Static Preview: aktif dikembangkan**

Seluruh halaman publik menggunakan dummy content. Database, login, CMS, storage, dan transaksi keuangan nyata belum terhubung.

## Route Map

```text
/                             Beranda
/berita/                      Daftar berita
/berita/[slug]/               Detail berita
/keislaman/                   Daftar konten keislaman
/keislaman/[slug]/            Detail konten keislaman
/kegiatan/                    Daftar kegiatan
/kegiatan/[slug]/             Detail kegiatan
/kepengurusan/                Struktur pengurus
/keuangan/                    Transparansi keuangan
/profil/                      Profil masjid
/dokumentasi/                 Arsip dokumentasi
/pengumuman/                  Pengumuman resmi
/kontak/                      Kontak dan lokasi
```

## Struktur Proyek

```text
app/
  page.tsx
  berita/
    page.tsx
    [slug]/page.tsx
  keislaman/
    page.tsx
    [slug]/page.tsx
  kegiatan/
    page.tsx
    [slug]/page.tsx
  kepengurusan/page.tsx
  keuangan/page.tsx
  profil/page.tsx
  dokumentasi/page.tsx
  pengumuman/page.tsx
  kontak/page.tsx
  not-found.tsx
  robots.ts
  sitemap.ts
  layout.tsx
  globals.css
components/
  content/
  layout/
lib/
  content.ts
  islamic.ts
docs/
supabase/
types/
.github/workflows/
  deploy.yml
```

## Teknologi

- Next.js + TypeScript
- React
- Lucide React
- Static export untuk GitHub Pages (preview)
- Supabase PostgreSQL/Auth/Storage direncanakan untuk fase CMS
- Vercel direncanakan untuk production ketika membutuhkan runtime server

## Roadmap

```text
Public Portal
   -> Detail Content
   -> Supabase Database
   -> Admin CMS
   -> Finance + Audit
   -> SEO/Security/Performance
   -> Production
```
