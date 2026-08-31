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
- Keuangan publik
- Profil masjid
- Dokumentasi
- Kontak dan lokasi
- Global search overlay berbasis repository
- Responsive desktop/tablet/mobile
- Accessible navigation dasar
- 404 page
- Sitemap dan robots metadata

## Status

**Fase 2 — Public Portal + Supabase Data Foundation**

Schema Supabase, RLS, seed data, repository contract, static fallback, dan Supabase public repository sudah tersedia. Halaman publik utama menggunakan `contentRepository` sebagai boundary data; GitHub Pages tetap menggunakan static export sehingga perubahan data Supabase setelah deployment memerlukan build/deploy berikutnya.

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
components/
lib/
  content.ts                  Legacy static content source
  islamic.ts                  Legacy Islamic content source
  data/
    repository.ts             Public content contract
    staticRepository.ts       Local fallback implementation
    supabaseRepository.ts     Supabase implementation
    presentation.ts           Domain → UI adapters
  supabase/
    client.ts                 Browser-safe client for future auth/UI
    server.ts                 Server/build-time public client
supabase/
types/
docs/
.github/workflows/
```

## Teknologi

- Next.js + TypeScript
- React
- Lucide React
- Static export untuk GitHub Pages (preview)
- Supabase PostgreSQL/Auth/Storage
- Repository/data adapter pattern
- Vercel direncanakan untuk production ketika membutuhkan runtime server/ISR

## Roadmap

```text
Public Portal
   -> Supabase Data Foundation
   -> Full Public Data Migration
   -> Authentication
   -> Admin CMS
   -> Storage + Media
   -> Finance + Audit
   -> SEO/Security/Performance
   -> Runtime Production / ISR
```
