# Roadmap New Design — Miftahul Mubin

> Roadmap resmi untuk redesign besar-besaran secara berkala, bertahap, terkontrol, dan satu arah. Beranda menjadi reference implementation untuk bahasa visual dan pola informasi seluruh public website, kemudian halaman lain dimigrasikan secara bertahap agar konsisten.

---

## 1. Tujuan Dokumen

Dokumen ini menjadi acuan kerja untuk redesign repository `miftahul-mubin` tanpa rewrite besar dalam satu langkah.

Tujuan utama:

1. Mengubah beranda menjadi portal informasi masjid yang editorial, informatif, mudah dipindai, dan tetap mempunyai identitas Miftahul Mubin.
2. Menjadikan beranda sebagai reference implementation untuk typography, warna, spacing, surface, card, list, section heading, responsive behavior, dan dark mode.
3. Menjadikan halaman berita sebagai reference implementation kedua untuk pola halaman detail/editorial.
4. Memigrasikan halaman public lain secara berkala agar memakai bahasa visual dan primitive yang sama.
5. Menghapus CSS dan abstraction lama setelah consumer lama benar-benar tidak diperlukan.

Roadmap berorientasi pada penyederhanaan dan pengurangan penumpukan, bukan penambahan layer baru.

---

## 2. Prinsip Utama

Urutan prioritas semua perubahan:

```text
REMOVE
→ MERGE
→ SIMPLIFY
→ REFACTOR
→ OPTIMIZE
→ ADD ONLY WHEN NECESSARY
```

Aturan kerja:

- Jangan redesign seluruh website dalam satu perubahan.
- Jangan mengubah data layer hanya karena layout berubah.
- Jangan membuat design system terpisah untuk setiap halaman.
- Jangan menambah CSS ketika selector atau primitive yang sudah ada dapat digunakan.
- Jangan menghapus file atau selector sebelum consumer dipastikan tidak lagi menggunakannya.
- Jangan membuat dark mode sebagai desain kedua yang berbeda; dark mode mengikuti struktur dan hierarchy yang sama.
- Perubahan besar dipecah menjadi commit kecil dengan satu tujuan teknis.
- Setiap kelompok perubahan besar didahului checkpoint `C`.
- Eksekusi dilakukan melalui `L`.
- Perbaikan error konkret menggunakan `R`.
- Pemeriksaan deployment hanya melalui `P`; bukan bagian dari `C` kecuali diminta eksplisit.

---

## 3. Siklus Kerja Berkala

Setiap fase mengikuti pola berikut:

```text
C — audit + checkpoint + rencana tahap berikutnya
↓
L — implementasi subfase kecil
↓
C — evaluasi hasil + checkpoint berikutnya
↓
L — implementasi subfase berikutnya
↓
...
```

Untuk error konkret:

```text
R — repair minimal
↓
validation
```

### Aturan berkala

- Satu `L` tidak boleh menggabungkan banyak tujuan yang tidak berkaitan.
- Setiap `C` menghasilkan satu arah tujuan yang jelas untuk `L` berikutnya.
- Setiap fase besar boleh terdiri dari beberapa `C/L`, bukan satu `L` besar.
- Bila ditemukan scope baru yang tidak direncanakan, pekerjaan berhenti di checkpoint dan tidak langsung diperluas.
- Setelah satu halaman stabil, halaman tersebut menjadi referensi untuk halaman berikutnya.

---

## 4. Kondisi Awal

Beranda telah mempunyai modul data/presentation yang cukup jelas, termasuk:

- `LiveNews`
- `LiveEvents`
- `LiveIslamic`
- `LiveAnnouncements`
- `LivePopularNews`

`app/page.tsx` telah memisahkan konten menjadi beberapa section: berita, hero, highlights, pengumuman, populer, agenda, keislaman, services, dan closing. Struktur tersebut menjadi bahan yang dipertahankan dan diatur ulang, bukan alasan untuk membangun ulang data layer.

Fondasi design token tersedia di `app/design-tokens.css`, termasuk token text semantic dan pasangan light/dark. Normalisasi typography, mobile readability, header surfaces, dan semantic colors juga telah dilakukan sebelum redesign besar dimulai.

CSS public masih tersebar dalam beberapa layer, antara lain:

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

Konsolidasi massal tidak dilakukan di awal. Konsolidasi dilakukan setelah consumer dan visual contract stabil.

---

# 5. Target Akhir

```text
DESIGN TOKENS
      ↓
PUBLIC DESIGN SYSTEM
      ↓
HOMEPAGE — reference implementation
      ↓
BERITA — editorial/detail reference
      ↓
KEGIATAN / KEISLAMAN / PENGUMUMAN
      ↓
PROFIL / KEPENGURUSAN / KEUANGAN / DOKUMENTASI / KONTAK
      ↓
ADMIN UI alignment
      ↓
CSS + abstraction consolidation
```

Target akhir bukan membuat semua halaman identik. Targetnya adalah semua halaman terasa berasal dari sistem yang sama, sementara information architecture dan density boleh berbeda sesuai fungsi.

---

# 6. FASE 0 — Baseline & Freeze

## C19 — Baseline

### Tujuan

Mendokumentasikan kondisi awal sebelum redesign besar.

### Audit

- section homepage
- consumer CSS homepage
- token yang tersedia
- dark-mode overrides
- responsive overrides
- selector yang duplikatif
- CSS khusus homepage
- pola yang berpotensi menjadi shared primitive
- dependency antar file

### Output

```text
Homepage component map
Homepage CSS map
Token map
Dark-mode map
Responsive map
Legacy selector candidates
```

Tidak ada redesign visual pada tahap ini.

---

# 7. FASE 1 — Homepage Structural Redesign

## C20 — Struktur Beranda

### Struktur target

```text
HEADER
↓
PRIMARY NAVIGATION
↓
CONTEXT / DATE
↓
BANNER / IMPORTANT INFO
↓
FEATURED NEWS
↓
TERPOPULER
↓
PENGUMUMAN
↓
BERITA TERKINI
↓
AGENDA MIFTAHUL MUBIN
↓
RUANG KEISLAMAN
↓
TRANSPARANSI / FINANCIAL SUMMARY
↓
LAYANAN MASJID
↓
FOOTER
```

### Arah

- berita utama menjadi titik fokus informasi
- hero institusional besar tidak lagi menjadi pusat homepage
- pengumuman dan agenda diperlakukan sebagai informasi operasional
- finance ditampilkan sebagai ringkasan
- services dipadatkan sebagai shortcut
- informasi profil yang tidak penting untuk konsumsi cepat diarahkan ke `/profil/`

## L20 — Implementasi struktur

Hanya mengubah urutan, grouping, dan wrapper yang diperlukan. Data/presentation layer tetap dipertahankan.

## C20.1 — Evaluasi

Pastikan hierarchy informasi baru jelas sebelum masuk ke visual redesign.

## L20.1 — Penyempurnaan struktur

Perbaiki hasil C20.1 hanya pada temuan yang berhubungan dengan struktur.

---

# 8. FASE 2 — Homepage Visual Language

## C21 — Bahasa Visual

Reference yang ditetapkan:

```text
Display / editorial heading — Playfair Display
Body / interface           — DM Sans
```

Hierarchy:

```text
H1
H2
H3
Body
Secondary
Tertiary / Meta
Label
```

Spacing reference:

```text
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
```

Surface vocabulary:

```text
canvas
surface
surface-2
surface-3
line
line-strong
```

Text vocabulary:

```text
text-strong
text
text-secondary
text-tertiary
muted
```

Accent vocabulary:

```text
green
green-dark
gold
accent-soft
```

## L21 — Typography dan spacing

## C21.1 — Evaluasi typography

## L21.1 — Surface dan semantic token alignment

## C21.2 — Evaluasi visual language

Homepage harus berhenti menghasilkan warna, type size, dan spacing ad-hoc untuk pola yang sebenarnya semantic.

---

# 9. FASE 3 — Featured News System

## C22 — Sistem berita utama

### Struktur target

```text
┌───────────────────────────────┬──────────────────────┐
│                               │ Secondary News       │
│        FEATURED NEWS          ├──────────────────────┤
│        Large Image            │ Secondary News       │
│        Category               │                      │
│        Headline               │                      │
│        Summary                │                      │
└───────────────────────────────┴──────────────────────┘
```

### Pola yang distandardisasi

```text
CategoryTag
Meta
FeaturedNews
NewsCard
NewsListItem
SectionHeading
ImageFrame
```

Komponen baru hanya dibuat bila pattern memiliki reuse dan behavior bersama.

## L22 — Featured layout

## C22.1 — Evaluasi hierarchy

## L22.1 — Card/list consistency

---

# 10. FASE 4 — Homepage Information Modules

## C23 — Modul informasi

Modul:

```text
Popular
Announcements
Latest News
Agenda
Islamic
Finance
Services
```

Contract setiap modul:

- heading
- spacing
- density
- typography
- metadata
- action link
- responsive behavior
- dark mode

Jangan membuat pola visual berbeda untuk fungsi yang sama tanpa alasan.

## L23 — Popular + announcements

## C23.1 — Evaluasi

## L23.1 — Latest news + agenda

## C23.2 — Evaluasi

## L23.2 — Islamic + finance + services

---

# 11. FASE 5 — Homepage Mobile

## C24 — Mobile-first

Target mobile:

```text
HEADER
↓
NAVIGATION SCROLL
↓
FEATURED NEWS
↓
POPULAR
↓
ANNOUNCEMENTS
↓
LATEST NEWS
↓
AGENDA
↓
ISLAMIC
↓
FINANCE
↓
SERVICES
↓
FOOTER
```

Target usability:

- headline mudah dibaca
- metadata tidak terlalu kecil
- tap target cukup besar
- image ratio konsisten
- spacing tidak terlalu padat
- horizontal scrolling hanya bila membantu
- konten penting tidak tersembunyi oleh overflow

## L24 — Mobile hierarchy

## C24.1 — Evaluasi

## L24.1 — Mobile spacing dan typography

---

# 12. FASE 6 — Homepage Dark Mode

## C25 — Dark parity

Aturan:

```text
same information hierarchy
same component structure
same interaction model
```

Perubahan utama:

```text
surface
text
line
accent contrast
overlay
```

Target architecture:

```text
design-tokens
↓
component styles
↓
responsive styles
```

Hindari patch bertingkat yang tidak perlu.

## L25 — Dark surface parity

## C25.1 — Evaluasi contrast

## L25.1 — Dark text / border parity

---

# 13. FASE 7 — Homepage Stabilization

## C26 — Homepage reference lock

Audit:

- duplicate selector
- duplicate color
- duplicate typography
- duplicate spacing
- conflicting specificity
- unused homepage selector
- redundant mobile override
- redundant dark override

Output:

```text
Homepage stable
Homepage reference implementation
Homepage design contract
```

Tidak ada redesign halaman lain sebelum fase ini dinyatakan selesai.

## L26 — Cleanup homepage

---

# 14. FASE 8 — Extract Design System

## C27 — Primitive yang terbukti berulang

Candidate:

```text
Container
SectionHeading
Button
TextLink
CategoryTag
Meta
Card
ListItem
ImageFrame
Surface
Divider
Status
```

Candidate tokens:

```text
colors
font families
font sizes
line heights
spacing
radius
borders
shadows
breakpoints
focus states
```

Tidak semua pattern harus menjadi React component.

## L27 — Shared primitives

## C27.1 — Evaluasi reuse

## L27.1 — Shared token cleanup

---

# 15. FASE 9 — Redesign Halaman Berita

> Halaman berita menjadi reference implementation kedua setelah homepage. Struktur editorial diambil dari pola artikel yang telah dipelajari: header artikel, hero media, author/share, reading column, rekomendasi inline, sidebar desktop, related content, dan responsive reordering.

## C28 — Audit dan contract halaman berita

### Target route

```text
/berita
/berita/[slug]
```

### Tujuan

Memetakan halaman berita saat ini sebelum perubahan visual, lalu menyelaraskannya dengan contract homepage.

### Contract wajib dari homepage

```text
same typography
same category tag
same metadata
same section heading
same container
same surface language
same responsive logic
same dark mode
```

### Pattern target

```text
GLOBAL HEADER
↓
PRIMARY NAVIGATION
↓
CONTEXT / DATE
↓
ARTICLE CATEGORY
↓
ARTICLE TITLE
↓
EXCERPT / LEAD
↓
AUTHOR + DATE
↓
HERO IMAGE
↓
CAPTION
↓
AUTHOR BLOCK + SHARE
↓
ARTICLE BODY
  ├ BACA JUGA
  └ PARAGRAPHS
↓
TAGS
↓
RELATED / TERKAIT
↓
SECONDARY CONTENT
↓
FOOTER
```

### Desktop target

```text
┌──────────────────────────────────┬─────────────────────┐
│                                  │ TERPOPULER          │
│             ARTICLE              │                     │
│                                  ├─────────────────────┤
│                                  │ TERKINI             │
│                                  │                     │
│                                  ├─────────────────────┤
│                                  │ PENGUMUMAN / EXTRA  │
└──────────────────────────────────┴─────────────────────┘
```

Sidebar adalah secondary content rail dan dapat sticky pada desktop.

### Mobile target

```text
ARTICLE
↓
TAGS
↓
TERKAIT
↓
TERPOPULER
↓
TERKINI
↓
PENGUMUMAN
```

## L28 — Audit structure / article shell

Hanya struktur/wrapper yang diubah. Belum melakukan polish besar.

## C28.1 — Checkpoint artikel shell

Validasi:

- hierarchy artikel jelas
- data lama tetap mengalir
- tidak ada duplication data layer
- tidak ada scope visual baru yang belum diperlukan

---

## C29 — Article Header + Hero

### Pola

```text
R01 Header system
R02 Category label
R03 Article header
R04 Hero media
```

### Requirement

- category jelas
- title menjadi elemen dominan
- metadata mudah dibaca
- lead/excerpt tidak mengalahkan title
- hero image mempunyai ratio konsisten dengan homepage
- caption tetap tersedia bila ada

## L29 — Implementasi header dan hero

## C29.1 — Evaluasi type hierarchy dan media ratio

Tidak melakukan perubahan pada body artikel sebelum hierarchy header stabil.

---

## C30 — Author + Share

### Pola

```text
R05 Author block
R06 Share actions
```

### Target

Author dan tanggal tetap terlihat tetapi tidak mengambil hierarchy lebih besar dari title/lead.

Share actions mengikuti interaction language yang sama dengan homepage.

## L30 — Author + share

## C30.1 — Evaluasi spacing, icon, dan tap target

---

## C31 — Reading Experience

### Pola

```text
R07 Reading column
```

### Target

- column artikel nyaman dibaca
- line-height konsisten dengan readability baseline
- paragraph spacing konsisten
- heading artikel mempunyai hierarchy jelas
- inline media tidak merusak reading flow
- block quote/list/code bila ada mengikuti primitive yang sama

## L31 — Article body typography

## C31.1 — Evaluasi readability

## L31.1 — Penyempurnaan article body

---

## C32 — Baca Juga / Inline Recommendation

### Pola

```text
R08 Inline recommendation
```

### Tujuan

Menyediakan rekomendasi kontekstual di tengah artikel tanpa membuatnya terlihat seperti iklan.

### Contract

```text
contextual
compact
visually distinct
same surface language
same link language
```

### Aturan

- tidak menambahkan infrastruktur iklan
- tidak membuat pattern baru bila `Card`/`ListItem` yang ada sudah cukup
- recommendation tetap sekunder terhadap paragraph utama

## L32 — Inline recommendation

## C32.1 — Evaluasi placement dan hierarchy

---

## C33 — Secondary Content Rail

### Pola

```text
R09 Sticky secondary rail
R10 Popular list
R11 Latest list
```

### Terpopuler

Gunakan numbered list yang mudah dipindai:

```text
01
02
03
04
05
06
```

### Terkini

Gunakan:

```text
category
headline
meta/date
separator
```

### Aturan desktop

- sidebar menjadi secondary content rail
- sticky hanya bila menguntungkan pembacaan
- tidak boleh mengalahkan article column

## L33 — Sidebar / popular / latest

## C33.1 — Evaluasi desktop balance

Tidak mengubah mobile order sebelum desktop rail stabil.

---

## C34 — Tags + Related Content

### Pola

```text
R12 Tags
R13 Related content
```

### Target

Tags berada dekat akhir artikel.

Related/terkait menjadi koleksi konten setelah article body, bukan bercampur dengan isi utama.

### Desktop

Related content dapat memakai 2-column list/grid bila ruang memungkinkan.

### Mobile

Related content menjadi satu alur setelah tags.

## L34 — Tags + related

## C34.1 — Evaluasi hierarchy dan spacing

---

## C35 — Responsive Article

### Pola

```text
R14 Responsive content reordering
```

### Desktop

```text
main article + secondary rail
```

### Mobile

```text
main article
↓
tags
↓
related
↓
popular
↓
latest
↓
announcement
```

### Target usability

- title tetap dominan
- reading column tidak terlalu sempit
- share buttons cukup besar
- sidebar tidak dipaksa tetap berada di samping
- tidak ada horizontal overflow

## L35 — Mobile article

## C35.1 — Evaluasi responsive

---

## C36 — Dark Mode Berita

### Tujuan

Halaman berita memakai dark mode yang sama dengan homepage, bukan sistem kedua.

### Yang berubah

```text
article surface
text
muted text
border
image caption
inline recommendation surface
sidebar surface
```

## L36 — Dark article parity

## C36.1 — Evaluasi contrast

---

## C37 — Berita Stabilization

### Audit

- duplicate article selector
- duplicate card pattern
- duplicate metadata
- duplicate spacing
- unnecessary sidebar patches
- redundant mobile overrides
- redundant dark overrides

### Output

```text
News listing stable
News detail stable
News design contract
```

Homepage + berita menjadi dua reference point resmi untuk migrasi halaman berikutnya.

## L37 — Cleanup berita

---

# 16. Urutan Berkala Setelah Berita

Setelah berita stabil, setiap halaman lain mengikuti pola yang sama. Tidak ada perpindahan massal.

```text
C38 → L38  Kegiatan structure
C39 → L39  Kegiatan visual
C40 → L40  Kegiatan responsive
C41 → L41  Kegiatan dark mode + cleanup

C42 → L42  Keislaman structure
C43 → L43  Keislaman visual
C44 → L44  Keislaman responsive
C45 → L45  Keislaman dark mode + cleanup

C46 → L46  Pengumuman structure
C47 → L47  Pengumuman visual
C48 → L48  Pengumuman responsive
C49 → L49  Pengumuman dark mode + cleanup
```

Pola yang sama diteruskan untuk halaman berikutnya.

---

# 17. FASE 10 — Redesign Kegiatan

Target:

```text
/kegiatan
/kegiatan/[slug]
```

Reference: agenda homepage.

Pattern:

```text
Date
↓
Event title
↓
Metadata
↓
Location
↓
Description
↓
Action
```

Gunakan primitive homepage/news bila pola benar-benar sama.

---

# 18. FASE 11 — Redesign Keislaman

Target:

```text
/keislaman
/keislaman/[slug]
```

Gunakan editorial system homepage/berita dengan aksen tematik yang tetap berada dalam token system.

Accent yang diizinkan:

```text
green
gold
cream / accent-soft
```

Tidak membuat palette baru.

---

# 19. FASE 12 — Redesign Pengumuman

Target:

```text
/pengumuman
```

Pattern:

```text
Announcement
↓
Date / status
↓
Title
↓
Summary
```

Compact dan lebih operasional daripada editorial.

---

# 20. FASE 13 — Redesign Profil & Kepengurusan

Target:

```text
/profil
/kepengurusan
```

Information architecture boleh lebih institutional, tetapi tetap memakai:

- typography system
- spacing system
- surface system
- button/link system
- card system
- responsive system
- dark mode

Target structure:

```text
Page Intro
↓
Feature / Identity
↓
Information Blocks
↓
Structured Content
```

---

# 21. FASE 14 — Redesign Keuangan

Target:

```text
/keuangan
```

Pattern:

```text
Summary
↓
Period selector
↓
Transaction table
↓
Disclosure / notes
```

Finance boleh mempunyai information density lebih tinggi karena sifat administratif.

---

# 22. FASE 15 — Redesign Dokumentasi

Target:

```text
/dokumentasi
```

Pattern:

- gallery ratio
- category
- title
- metadata
- card surface
- section heading
- responsive gallery behavior

Image treatment mengikuti image language homepage.

---

# 23. FASE 16 — Redesign Kontak

Target:

```text
/kontak
```

Pattern:

```text
Page Intro
↓
Contact Cards
↓
Location / map
↓
Contact Action
```

---

# 24. FASE 17 — Admin UI Alignment

Admin dikerjakan setelah public website stabil.

Yang diseragamkan:

```text
Design tokens
Typography
Buttons
Inputs
Selects
Status
Surface
Spacing
Focus
Dark mode
```

Yang boleh berbeda:

```text
Dashboard density
CRUD controls
Tables
Forms
Permission indicators
Operational layout
```

Admin harus terasa bagian dari produk yang sama, tetapi tetap optimal untuk pekerjaan administratif.

---

# 25. FASE 18 — CSS Consolidation

Tahap akhir baru mengaudit seluruh CSS layer:

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

Setiap selector/file masuk:

```text
KEEP
MERGE
MOVE
DELETE
```

Target architecture:

```text
design-tokens.css
        ↓
globals.css / shared public primitives
        ↓
page and component styles
        ↓
responsive adjustments
        ↓
minimal theme overrides
```

### Syarat penghapusan

Sebuah selector/file hanya boleh dihapus jika:

1. seluruh consumer ditemukan,
2. behavior penting tidak bergantung padanya,
3. replacement aktif,
4. tidak ada route yang masih membutuhkan style tersebut,
5. validation code/build dilakukan sesuai kebutuhan tahap.

---

# 26. Commit Cadence

Contoh cadence resmi:

```text
C19  Baseline
L19  Baseline cleanup

C20  Homepage structure
L20  Structure pass
C20.1 Evaluation
L20.1 Structural refinement

C21  Homepage visual language
L21  Typography / spacing
C21.1 Evaluation
L21.1 Token / surface alignment

C22  Featured news
L22  Featured layout
C22.1 Evaluation
L22.1 Card/list consistency

C23  Information modules
L23  Module group A
C23.1 Evaluation
L23.1 Module group B
C23.2 Evaluation
L23.2 Module group C

C24  Mobile
L24  Mobile hierarchy
C24.1 Evaluation
L24.1 Mobile type/spacing

C25  Dark mode
L25  Dark surfaces
C25.1 Evaluation
L25.1 Dark text/border

C26  Stabilization
L26  Homepage cleanup

C27  Design system extraction
L27  Shared primitives
C27.1 Evaluation
L27.1 Token cleanup

C28–C37  Berita detail, satu subfase per checkpoint

C38+  Halaman berikutnya, satu kelompok kecil per checkpoint

Final  CSS consolidation
```

Nomor `L` boleh bertambah. Satu commit tetap memiliki satu tujuan teknis.

---

# 27. Acceptance Criteria Homepage

## Information Architecture

- Berita utama menjadi fokus informasi.
- Navigation mudah ditemukan.
- Pengumuman dan agenda mudah dipindai.
- Populer dan berita terkini memiliki hierarchy berbeda.
- Finance dan services tidak mengambil porsi visual berlebihan.
- Footer sederhana.

## Visual

- Typography hierarchy konsisten.
- Semantic color digunakan untuk peran semantic.
- Accent tidak bertambah tanpa alasan.
- Image ratio konsisten.
- Section heading konsisten.
- Card/list mempunyai bahasa visual yang sama.

## Responsive

- Desktop, tablet, mobile mempunyai hierarchy yang dirancang.
- Supporting text tidak kembali terlalu kecil.
- Tap target cukup besar.
- Tidak ada overflow horizontal yang tidak disengaja.

## Dark Mode

- Tidak ada teks yang hilang karena kontras.
- Surface dapat dibedakan.
- Border terlihat seperlunya.
- Accent mempunyai kontras yang cukup.
- Patch selector tidak berlebihan.

---

# 28. Acceptance Criteria Halaman Berita

## Structural

- listing dan detail memakai contract homepage
- article shell jelas
- main article menjadi konten dominan
- secondary rail tetap sekunder

## Editorial

- category mudah ditemukan
- title dominan
- lead dan metadata terbaca
- hero media konsisten
- article body nyaman dibaca
- inline recommendation tidak mengganggu reading flow

## Navigation

- popular mudah dipindai
- latest mempunyai separator/category/date yang konsisten
- tags berada di akhir artikel
- related content jelas terpisah dari body

## Responsive

- mobile menjadi alur linear
- sidebar berpindah ke bawah konten utama
- tap target cukup besar
- tidak ada horizontal overflow

## Dark Mode

- article surface, text, border, caption, sidebar, dan inline recommendation mempunyai contrast yang tepat
- tidak ada secondary dark-mode design

---

# 29. Acceptance Criteria Konsistensi Public Website

Halaman berikut harus terasa berasal dari sistem yang sama:

```text
/
/berita
/berita/[slug]
/kegiatan
/kegiatan/[slug]
/keislaman
/keislaman/[slug]
/pengumuman
/profil
/kepengurusan
/keuangan
/dokumentasi
/kontak
```

Yang konsisten:

```text
header language
container width
font pairing
heading hierarchy
metadata
category tag
button
link
surface
border
spacing
responsive behavior
dark mode
```

Yang tidak wajib identik:

```text
information density
content structure
specialized module
editorial vs administrative layout
```

---

# 30. Risiko dan Mitigasi

## Redesign terlalu besar

Mitigasi: pecah berdasarkan section/fungsi dan berhenti di checkpoint sebelum scope baru.

## Regresi CSS lama

Mitigasi: migrate consumer dahulu, hapus orphan selector kemudian.

## Dark mode rusak

Mitigasi: semantic token harus memiliki pasangan dark dan setiap fase mempertahankan parity.

## Pattern baru kembali muncul di halaman berikutnya

Mitigasi: homepage + berita menjadi reference resmi dan wajib dibandingkan pada setiap checkpoint halaman baru.

## Shared component terlalu dini

Mitigasi: ekstrak primitive setelah reuse dan behavior bersama terbukti.

---

# 31. Definition of Done per Phase

Setiap fase hanya dianggap selesai jika:

1. scope fase terpenuhi,
2. behavior existing yang harus dipertahankan tidak sengaja dihapus,
3. perubahan tidak memperluas scope tanpa checkpoint baru,
4. dark mode diperhitungkan untuk public UI,
5. responsive behavior diperhitungkan bila layout terkait,
6. tidak ada file/selector dihapus tanpa alasan terdokumentasi,
7. commit message menjelaskan satu tujuan utama.

---

# 32. Definition of Done Program Redesign

```text
Homepage stable
        ↓
Homepage reference
        ↓
Shared primitives extracted
        ↓
News detail reference stable
        ↓
Public pages migrated periodically
        ↓
Admin aligned
        ↓
Legacy CSS removed
        ↓
Repository simplified
```

Target akhirnya adalah repository yang:

- lebih konsisten,
- lebih mudah dibaca,
- lebih mudah dirawat,
- lebih sedikit duplikasi,
- lebih sedikit exception CSS,
- tetap mempertahankan behavior dan data layer yang diperlukan.

---

## 33. Change Log

### 2026-09-08

- Menetapkan redesign dilakukan secara berkala dengan pola `C → L → C → L`.
- Menjadikan homepage sebagai reference implementation utama.
- Menambahkan halaman berita sebagai reference implementation kedua.
- Menambahkan checkpoint bertahap untuk article shell, header/hero, author/share, reading experience, Baca Juga, sidebar, tags/related, responsive, dark mode, dan stabilization.
- Menegaskan bahwa halaman lain dimigrasikan satu per satu setelah halaman berita stabil.
