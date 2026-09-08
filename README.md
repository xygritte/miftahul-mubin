# Miftahul Mubin

Portal informasi dan sistem administrasi Masjid Miftahul Mubin. Repository ini berisi portal publik untuk jamaah/masyarakat dan panel pengelola berbasis Supabase.

## Gambaran Produk

Miftahul Mubin dibangun sebagai **portal informasi masjid berbasis konten**. Domain publik saat ini mencakup berita, keislaman, kegiatan, pengumuman, kepengurusan, dokumentasi, transparansi keuangan, profil, dan kontak.

Arsitektur public memakai boundary `contentRepository`, adapter presentation pada `lib/data/presentation.ts`, dan komponen `Live*` yang dapat memuat ulang data dari Supabase. Sumber data publik saat ini adalah Supabase; static repository lama bukan lagi runtime fallback.

Bahasa visual saat ini menggunakan hijau, emas, putih/off-white, **Playfair Display** untuk heading/editorial, **DM Sans** untuk body/interface, serta semantic design tokens untuk text, surface, border, accent, focus, light mode, dan dark mode.

Referensi editorial untuk redesign berasal dari pola portal berita seperti NU Online, tetapi identitas, struktur data, dan implementasi Miftahul Mubin dibuat sendiri.

---

## Fitur Public Portal

### Header dan navigasi global

Header digunakan bersama pada halaman publik dan menyediakan:

- logo dan link beranda;
- indikator route aktif;
- pencarian global berbentuk overlay;
- toggle light/dark mode dengan penyimpanan `localStorage` (`mm-theme`);
- menu mobile;
- tanggal saat ini dalam bahasa Indonesia;
- skip link ke `#main-content`;
- tombol/overlay yang dapat ditutup dengan `Escape`;
- menu bahasa: Indonesia aktif, English masih bertanda `Segera`.

Navigasi utama:

```text
Beranda
Berita
Keislaman
Kegiatan
Kepengurusan
Keuangan
```

Navigasi sekunder:

```text
Pengumuman
Dokumentasi
```

Utility:

```text
Profil
Kontak
```

### Beranda `/`

Beranda saat ini terdiri dari beberapa kelompok informasi:

```text
Kabar Terkini / Berita Miftahul Mubin
Hero institusional
Highlight Berita
Highlight Agenda
Highlight Transparansi Keuangan
Pengumuman
Terpopuler
Kegiatan Terdekat
Ruang Keislaman
Ruang/Layanan Masjid
Closing navigation
Footer
```

Beranda menggunakan `LiveNews`, `LiveEvents`, `LiveIslamic`, `LiveAnnouncements`, dan `LivePopularNews` melalui data/presentation layer publik.

Beranda **belum menjadi hasil redesign final**. Roadmap baru akan menjadikannya reference implementation dengan hierarki portal editorial:

```text
Featured News
→ Terpopuler
→ Pengumuman
→ Berita Terkini
→ Agenda
→ Ruang Keislaman
→ Transparansi
→ Layanan
```

### Berita `/berita/`

Halaman daftar berita menggunakan `PageIntro` + `LiveNewsList` dan mengambil `NewsRecord` melalui `contentRepository`.

Model berita membawa antara lain:

```text
slug
title
excerpt
content[]
thumbnailUrl
category
authorId
status
publishedAt
viewCount
createdAt
updatedAt
```

### Detail berita `/berita/[slug]/`

Menggunakan route dinamis, `LiveArticleDetail`, `ArticleDetail`, dan `SafeRichContent`.

Yang sudah berjalan:

- lookup berdasarkan slug;
- metadata title/description berdasarkan artikel;
- initial data hasil repository;
- refresh client ke `supabasePublicRepository`;
- realtime refresh untuk tabel `news`;
- state ketika berita tidak tersedia;
- link kembali ke daftar berita;
- category/date kicker;
- title + lead/excerpt;
- hero image;
- caption;
- body artikel;
- penutup artikel dan link ke kontak;
- sidebar navigasi dasar.

Yang **belum** menjadi fitur artikel final:

- author block khusus;
- social share lengkap;
- `Baca Juga` inline;
- sidebar `Terpopuler`/`Terkini`;
- tags;
- `Terkait`/related content.

Elemen tersebut direncanakan melalui redesign berita bertahap.

### Keislaman `/keislaman/` dan `/keislaman/[slug]/`

Menampilkan artikel, kajian, khutbah, dan materi keislaman melalui `LiveIslamic`. Record dipresentasikan dengan `islamicRecordToLegacy()` dan memiliki route detail dinamis serta metadata berbasis konten.

### Kegiatan `/kegiatan/` dan `/kegiatan/[slug]/`

Daftar kegiatan menggunakan `LiveEvents`; detail menggunakan `LiveEventDetail`.

Informasi kegiatan meliputi:

```text
slug
title
description
eventDate
startTime
endTime
location
speaker
status
coverUrl
category
createdAt
updatedAt
```

Status event:

```text
draft
published
cancelled
completed
```

Presentation adapter juga memformat hari, bulan, tanggal Indonesia, waktu WIB, kategori, lokasi, dan deskripsi.

### Pengumuman `/pengumuman/`

Menampilkan informasi resmi melalui `LiveAnnouncements`.

Data meliputi:

```text
title
content
status
publishedAt
authorId
createdAt
updatedAt
```

### Kepengurusan `/kepengurusan/`

Data berasal dari:

```text
management_periods
management_members
```

UI publik saat ini menampilkan:

- periode aktif;
- tanggal mulai/akhir;
- figur utama/pimpinan;
- foto atau fallback inisial;
- jabatan;
- bio;
- tim/bidang pelayanan;
- jumlah anggota;
- status empty ketika belum ada struktur;
- realtime refresh untuk periode dan anggota.

### Transparansi Keuangan `/keuangan/`

`LiveFinance` menampilkan hanya periode yang sudah dipublikasikan.

Ringkasan:

```text
Saldo Awal
Total Pemasukan
Total Pengeluaran
Saldo Akhir
```

Perhitungan saldo akhir:

```text
Saldo Awal + Pemasukan - Pengeluaran
```

Tabel transaksi:

```text
Tanggal
Keterangan
Jenis
Nominal
Bukti
```

Jenis:

```text
income  → Pemasukan
expense → Pengeluaran
```

Data transaksi publik dibatasi ke status `published`. Perubahan `finance_periods` dan `finance_transactions` dipantau melalui realtime refresh.

Tombol ekspor PDF sudah tersedia sebagai UI, tetapi masih disabled dan berlabel `Segera`.

### Dokumentasi `/dokumentasi/`

Menggunakan:

```text
media_albums
media_items
```

Mendukung:

- gambar;
- video YouTube;
- video Vimeo;
- thumbnail;
- title;
- caption;
- urutan tampil;
- filter kategori.

Filter saat ini:

```text
Semua
Kajian
Sosial
Pendidikan
Pemuda
Pengurus
```

URL YouTube/Vimeo dipetakan menjadi embed URL pada client. YouTube menggunakan domain `youtube-nocookie.com`.

### Profil `/profil/`

`LiveSiteSettings` mode `profile` mengambil data `site_settings`.

Konten yang dikelola:

```text
site_name
profile_image_url
profile_eyebrow
profile_title
profile_description
about_title
about_text
profile_period
profile_agenda_stat
profile_service_stat
profile_vision_title
profile_vision_text
profile_mission_title
profile_mission_text
profile_facilities_title
profile_facilities_text
```

Halaman menampilkan intro, foto/identitas, about, fakta/statistik, visi, misi, dan fasilitas.

### Kontak `/kontak/`

`LiveSiteSettings` mode `contact` menampilkan:

```text
Alamat
Telepon
Email
Jam layanan
Query Google Maps
```

Fungsinya meliputi:

- link alamat ke Google Maps;
- link telepon `tel:`;
- link email `mailto:`;
- embedded Google Maps;
- loading state;
- error state.

---

# Search, Theme, Responsive, Metadata

## Global Search

`buildSearchEntries()` menggabungkan:

```text
Berita
Keislaman
Kegiatan
Pengumuman
Kepengurusan
Profil
Dokumentasi
Keuangan
Kontak
```

Data dinamis berasal dari berita, keislaman, dan kegiatan; halaman lain ditambahkan sebagai entry navigasi.

Pencarian saat ini bersifat sederhana/substring dan belum menggunakan fuzzy/full-text ranking.

## Theme

Root layout melakukan bootstrap theme sebelum aplikasi berjalan dan toggle menyimpan pilihan ke:

```text
localStorage: mm-theme
```

Token semantic yang sudah tersedia antara lain:

```text
--mm-text
--mm-text-strong
--mm-muted
--mm-text-secondary
--mm-text-tertiary
--mm-line
--mm-line-strong
--mm-green
--mm-green-dark
--mm-gold
--mm-accent-soft
--mm-overlay
--mm-focus
```

Baseline readability yang sudah dinormalisasi:

```text
body       15px / 1.65
paragraph        1.7
controls         1.4
```

## Responsive

Public UI mempunyai behavior desktop, tablet, dan mobile. Header memiliki menu mobile dan beberapa module mengubah grid, spacing, typography, serta content density berdasarkan breakpoint.

## Error dan metadata

- `app/not-found.tsx` menggunakan `LiveContentRouteResolver` untuk menangani route dinamis pada static export;
- `app/sitemap.ts` menghasilkan URL halaman statis serta URL berita/kegiatan/keislaman dari repository;
- `app/robots.ts` mengizinkan crawler dan menunjuk ke sitemap GitHub Pages.

---

# Admin Console

Admin tersedia di:

```text
/admin/login/
```

Login menggunakan Supabase Auth dan role database, lalu protected area menggunakan `AdminShell`.

## Dashboard `/admin/`

Modul yang tersedia:

```text
Berita
Kegiatan
Keislaman
Pengumuman
Kepengurusan
Dokumentasi
Keuangan
Profil
Kontak
Storage
```

Shell admin menyediakan theme toggle, link ke website publik, active-route state, status Auth/Storage, dan logout.

## Admin Berita

`AdminNewsManager` mendukung:

- list;
- search title/excerpt/slug;
- create;
- edit;
- delete;
- preview;
- kategori;
- status draft/published/archived;
- published timestamp;
- upload thumbnail ke bucket `news-media`;
- validasi gambar dan ukuran maksimal 8 MB;
- error mapping untuk permission, duplicate, dan relasi.

## Admin Konten Umum

`AdminContentManager` menyediakan framework untuk:

```text
islamic
 events
 announcements
```

Kegiatan mendukung tanggal, waktu, lokasi, narasumber, deskripsi, cover, kategori, dan status. Keislaman mendukung title, slug, excerpt, content, kategori, status, publish timestamp. Pengumuman mendukung title, content, status, publish timestamp, dan author id.

## Admin Kepengurusan

Dapat mengelola:

### Periode

```text
nama
start date
end date
is active
```

### Anggota

```text
nama
jabatan
foto URL
bio
sort order
```

## Admin Dokumentasi

`AdminDocumentationAlbums` mengelola album:

```text
nama album
slug
deskripsi
cover URL
```

Operasi: create/edit/delete. UI memperingatkan bahwa penghapusan album juga menghapus media di dalamnya.

## Admin Keuangan

Manager finance mengelola periode dan transaksi.

Transaksi:

```text
transaction_date
description
type
amount
category_id
proof_url
status
```

Periode:

```text
year
month
opening_balance
published_at
```

## Admin Profil

`AdminSiteSettingsManager` dapat mengubah identitas profil, about, statistik, visi, misi, fasilitas, serta foto profil.

Foto profil:

- upload/replace/delete;
- hanya gambar;
- maksimum 8 MB;
- disimpan di bucket `site-assets`.

## Admin Kontak

Dapat mengubah:

```text
alamat
telepon
email
jam layanan
Google Maps query
```

Perubahan membutuhkan sesi admin yang valid.

---

# Arsitektur Data

Alur public:

```text
Supabase
   ↓
contentRepository / PublicContentRepository
   ↓
presentation adapters
   ↓
Live* / content components
   ↓
Next.js routes
```

Repository contract saat ini mencakup:

```text
News
  listNews()
  getNewsBySlug()

Islamic
  listIslamic()
  getIslamicBySlug()

Events
  listEvents()
  getEventBySlug()

Announcements
  listAnnouncements()

Management
  listManagementPeriods()
  listManagementMembers()

Media
  listMediaAlbums()
  listMediaItems()

Finance
  getLatestPublishedFinancePeriod()
  getPublishedFinancePeriod()
  listPublishedFinanceTransactions()
```

`lib/data/presentation.ts` menangani URL basePath, format tanggal/waktu Indonesia, adapter record, dan search entries.

---

# Realtime Content

Modul publik yang saat ini menggunakan `useRealtimeRefresh` mencakup:

```text
news
events
islamic_articles
announcements
management_periods
management_members
media_items
finance_periods
finance_transactions
```

Dengan pola ini, komponen publik dapat mengambil ulang data Supabase ketika konten berubah tanpa menempatkan akses database secara acak di setiap page.

---

# Supabase, Storage, dan Security

Repository memiliki migration SQL untuk schema dan authorization, termasuk migration untuk akses admin, CRUD, finance authorization, documentation, events, announcements, dan Islamic articles.

Domain database yang direpresentasikan di TypeScript meliputi:

```text
NewsRecord
IslamicItemRecord
EventRecord
AnnouncementRecord
ManagementPeriod
ManagementMember
MediaAlbum
MediaItem
FinanceCategory
FinanceTransaction
FinancePeriod
AuditLog
```

Status umum:

```text
draft
published
archived
```

Status event:

```text
draft
published
cancelled
completed
```

Jenis finance:

```text
income
expense
```

Public storage yang dipakai modul utama antara lain:

```text
news-media
site-assets
```

Prinsip akses:

```text
Public read
→ Supabase public access + RLS

Admin write
→ Supabase Auth
→ role/database permission
→ RLS/policies
```

`.env.example` mendokumentasikan:

```text
NEXT_PUBLIC_BASE_PATH
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Service-role/secret key tidak ditempatkan pada client-side configuration.

---

# Deployment

Next.js memakai static export:

```text
output: 'export'
trailingSlash: true
images.unoptimized: true
```

Di GitHub Actions, base path menjadi:

```text
/miftahul-mubin
```

Workflow `deploy.yml` melakukan build validation, REST smoke test Supabase, TypeScript check, static build, pemeriksaan output/basePath, upload artifact, deploy GitHub Pages, lalu smoke test publik.

Karena target saat ini adalah static export GitHub Pages, perubahan database baru tidak otomatis menghasilkan HTML pre-render baru. Build/deployment berikutnya tetap diperlukan untuk memperbarui output statis.

---

# Environment dan Development

Contoh `.env.local`:

```env
NEXT_PUBLIC_BASE_PATH=
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

Perintah utama:

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run start
```

Dependency utama saat ini:

```text
Next.js 16.3.3
React 19.2.0
TypeScript 5.7.0
@supabase/supabase-js 2.57.0
lucide-react 0.468.0
```

Repository saat ini belum memiliki script khusus untuk lint, test runner, atau formatter.

---

# Struktur Repository

```text
.
├── app/
│   ├── admin/
│   │   ├── login/
│   │   └── (protected)/
│   │       ├── berita/
│   │       ├── kegiatan/
│   │       ├── keislaman/
│   │       ├── pengumuman/
│   │       ├── kepengurusan/
│   │       ├── dokumentasi/
│   │       ├── keuangan/
│   │       ├── profil/
│   │       ├── kontak/
│   │       ├── storage/
│   │       └── page.tsx
│   ├── berita/[slug]/
│   ├── kegiatan/[slug]/
│   ├── keislaman/[slug]/
│   ├── kepengurusan/
│   ├── keuangan/
│   ├── profil/
│   ├── dokumentasi/
│   ├── pengumuman/
│   ├── kontak/
│   ├── globals.css
│   ├── design-tokens.css
│   ├── not-found.tsx
│   ├── robots.ts
│   └── sitemap.ts
│
├── components/
│   ├── admin/
│   ├── content/
│   ├── layout/
│   └── live/
│
├── lib/
│   ├── data/
│   │   ├── index.ts
│   │   ├── repository.ts
│   │   ├── presentation.ts
│   │   └── supabasePublicRepository.ts
│   ├── admin/
│   └── supabase/
│
├── supabase/migrations/
├── types/
├── public/
├── docs/
├── .github/workflows/
├── next.config.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

CSS publik masih tersusun dalam beberapa layer karena refactor sebelumnya dilakukan bertahap:

```text
app/globals.css
app/design-tokens.css
app/polish.css
app/theme-polish.css
app/dark-mode-fixes.css
app/mobile-polish.css
app/quality-polish.css
app/assets-polish.css
app/embed-polish.css
app/popular-polish.css
app/header-portal.css
```

Admin memiliki tambahan:

```text
app/admin.css
app/admin-settings.css
```

Konsolidasi CSS akan dilakukan setelah consumer dan visual contract stabil.

---

# Current Status dan Batasan

## Sudah berjalan

- portal publik multi-halaman;
- live/public repository berbasis Supabase;
- presentation adapter;
- realtime refresh modul utama;
- authentication admin;
- CRUD berbagai domain konten;
- role/RLS/policies;
- public storage untuk media tertentu;
- finance publication flow;
- profile/contact settings;
- dark mode;
- responsive public UI;
- search overlay;
- sitemap/robots;
- static deployment GitHub Pages.

## Belum menjadi fitur penuh

- rich text editor profesional;
- workflow editorial Review/Approved/Scheduled;
- autosave draft;
- bulk CMS actions lengkap;
- category management mandiri;
- media picker/library lengkap;
- export PDF keuangan;
- fuzzy/full-text search;
- grafik finance publik;
- user management admin penuh;
- audit log viewer lengkap;
- jadwal salat/countdown;
- kalender hijriah;
- notifikasi;
- donasi/form layanan;
- PWA;
- runtime server/ISR production.

---

# Roadmap Redesign Berkala

Redesign menggunakan siklus checkpoint kecil, bukan rewrite besar:

```text
C — Audit + checkpoint + arah berikutnya
↓
L — Implementasi subfase kecil
↓
C — Evaluasi
↓
L — Subfase berikutnya
↓
...
```

Reference implementation ditetapkan secara berurutan:

```text
Homepage
   ↓
Halaman Berita
   ↓
Kegiatan
   ↓
Keislaman
   ↓
Pengumuman
   ↓
Profil
   ↓
Kepengurusan
   ↓
Keuangan
   ↓
Dokumentasi
   ↓
Kontak
   ↓
Admin UI
   ↓
CSS consolidation
```

Prioritas teknis setiap perubahan:

```text
REMOVE
→ MERGE
→ SIMPLIFY
→ REFACTOR
→ OPTIMIZE
→ ADD ONLY WHEN NECESSARY
```

## Homepage sebagai reference

Beranda akan menjadi acuan untuk:

```text
typography
color token
spacing
surface
card/list
section heading
image treatment
responsive behavior
dark mode
```

## Berita sebagai reference editorial kedua

Detail berita akan dikembangkan bertahap:

```text
Article Shell
→ Header + Hero
→ Author + Share
→ Reading Experience
→ Baca Juga
→ Secondary Rail
→ Tags + Related
→ Responsive Reordering
→ Dark Mode
→ Stabilization
```

Setelah halaman stabil, pola yang benar-benar berulang dapat diekstrak menjadi shared primitive. Selector/file lama hanya dihapus setelah consumer lama tidak lagi diperlukan.

Roadmap lengkap:

[`docs/roadmap-new-design.md`](docs/roadmap-new-design.md)

---

# Prinsip Pemeliharaan

1. Jangan mengubah data layer hanya karena layout berubah.
2. Jangan membuat design language terpisah untuk setiap halaman.
3. Jangan menambah CSS ketika primitive/token yang ada masih dapat digunakan.
4. Jangan menghapus selector/file sebelum consumer diverifikasi.
5. Satu commit sebaiknya memiliki satu tujuan teknis.
6. Dark mode mengikuti hierarchy light mode.
7. Halaman baru memakai reference implementation yang sudah stabil.
8. Scope baru berhenti pada checkpoint dan tidak diperluas diam-diam.

---

# Referensi Utama

```text
README.md
  → inventaris fitur, route, arsitektur, dan batasan saat ini

docs/roadmap-new-design.md
  → roadmap redesign berkala dan checkpoint implementasi

lib/data/repository.ts
  → contract akses data publik

lib/data/presentation.ts
  → adapter data → UI dan URL basePath

components/layout/
  → shell/header/footer publik

components/live/
  → modul public yang terhubung ke data live

components/content/
  → komponen presentasi dan filter/content behavior

components/admin/
  → CMS dan operasi pengelola

supabase/migrations/
  → schema, RLS, grants, dan authorization
```
