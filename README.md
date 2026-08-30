# Miftahul Mubin

Portal informasi dan sistem informasi Masjid Miftahul Mubin.

## Konsep

Website dibangun dengan pendekatan portal berita/editorial: informasi masjid, berita, kegiatan, konten keislaman, dokumentasi, kepengurusan, dan transparansi keuangan berada dalam satu ekosistem.

Referensi visual dan pola editorial: NU Online, tetapi identitas visual, konten, dan struktur Miftahul Mubin dibuat sendiri.

## Fitur Utama

### Fase 1 — Public Portal UI
- Homepage editorial/news portal
- Featured news dan berita terkini
- Konten terpopuler
- Pengumuman penting
- Agenda kegiatan
- Struktur kepengurusan
- Konten keislaman dan khutbah
- Dokumentasi foto/video
- Ringkasan transparansi keuangan
- Profil masjid
- Kontak dan lokasi
- Search overlay berbasis dummy content
- Responsive mobile/tablet/desktop
- Mobile navigation
- Accessibility dasar: skip link, focus state, semantic sections, keyboard Escape

### Tahap berikutnya
- Halaman detail berita/kegiatan/keislaman
- Supabase PostgreSQL
- Authentication
- Admin CMS
- Storage media
- Sistem keuangan lengkap
- Audit log dan laporan PDF

## Rencana Teknologi

- Next.js + TypeScript
- Tailwind CSS (direncanakan untuk komponen berikutnya)
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- GitHub Pages untuk preview/static phase
- Vercel dapat digunakan untuk deployment production ketika fitur server/database mulai diperlukan

## Struktur Proyek

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  layout/
    Header.tsx
docs/
  ARCHITECTURE.md
  DATABASE-PLAN.md
  DEVELOPMENT-ROADMAP.md
  FEATURE-FLOW.md
  UI-STRUCTURE.md
lib/
types/
supabase/
.github/workflows/
  deploy.yml
```

## Status Proyek

**Fase 1 — Public Portal UI / Static Preview**

UI homepage sudah diimplementasikan dan dikonfigurasi untuk static export. Data masih berupa dummy content. Database, login, CMS, dan transaksi keuangan nyata belum terhubung.

## Dokumentasi

- `docs/ARCHITECTURE.md` — arsitektur sistem dan modul
- `docs/FEATURE-FLOW.md` — alur fitur publik dan admin
- `docs/UI-STRUCTURE.md` — rancangan halaman dan struktur layout
- `docs/DATABASE-PLAN.md` — rancangan entitas database
- `docs/DEVELOPMENT-ROADMAP.md` — tahapan implementasi
