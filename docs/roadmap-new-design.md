# Roadmap New Design — Miftahul Mubin

> Roadmap resmi untuk redesign besar-besaran secara berkala, bertahap, terkontrol, dan satu arah. Beranda menjadi reference implementation untuk bahasa visual dan pola informasi seluruh public website, kemudian halaman lain dimigrasikan secara bertahap agar konsisten.

---

## 1. Tujuan Dokumen

Dokumen ini menjadi acuan kerja untuk redesign repository `miftahul-mubin` tanpa melakukan rewrite besar dalam satu langkah.

Roadmap memiliki tiga tujuan utama:

1. Mengubah beranda dari pola landing-page/institutional homepage menjadi portal informasi masjid yang editorial, informatif, mudah dipindai, dan tetap mempunyai identitas Miftahul Mubin.
2. Menjadikan beranda sebagai reference implementation untuk typography, warna, spacing, surface, card, list, section heading, responsive behavior, dan dark mode.
3. Memigrasikan halaman public lain secara bertahap agar memakai bahasa visual dan primitive yang sama, lalu menghapus CSS dan abstraction lama yang sudah tidak memiliki consumer.

Roadmap ini berorientasi pada penyederhanaan dan pengurangan penumpukan, bukan penambahan layer baru.

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
- Jangan membuat dark mode sebagai desain kedua yang berbeda; dark mode harus mengikuti struktur dan hierarchy yang sama.
- Perubahan besar harus dipecah menjadi commit kecil yang mempunyai satu tujuan.
- Setiap kelompok perubahan didahului checkpoint `C`.
- Eksekusi dilakukan melalui `L`.
- Perbaikan error konkret menggunakan `R`.
- Pemeriksaan deployment hanya melalui `P` dan tidak menjadi bagian dari `C` kecuali diminta secara eksplisit.

---

## 3. Model Siklus Kerja

Setiap fase mengikuti siklus:

```text
C — Checkpoint / audit / rencana
↓
L — implementasi kecil
↓
L — implementasi lanjutan bila masih dalam scope yang sama
↓
C — evaluasi hasil dan rencana berikutnya
```

Untuk error konkret:

```text
R — Repair
↓
validation
```

Tidak boleh menggabungkan beberapa tujuan yang tidak berhubungan ke dalam satu `L` besar hanya demi mempercepat jumlah commit.

---

# 4. Kondisi Awal

Beranda saat ini sudah mempunyai modul data/presentation yang cukup jelas, termasuk:

- `LiveNews`
- `LiveEvents`
- `LiveIslamic`
- `LiveAnnouncements`
- `LivePopularNews`

`app/page.tsx` saat ini juga sudah memisahkan konten menjadi beberapa section: berita, hero, highlights, pengumuman, populer, agenda, keislaman, services, dan closing. Struktur ini menjadi bahan yang dipertahankan dan diatur ulang, bukan alasan untuk membangun ulang data layer dari awal.

Fondasi design token juga sudah tersedia di `app/design-tokens.css`, termasuk token text semantic dan pasangan light/dark. Beberapa normalisasi typography, mobile readability, header surfaces, dan semantic colors sudah dilakukan sebelum roadmap redesign ini dimulai.

CSS public saat ini masih tersebar dalam beberapa layer seperti:

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

Jangan melakukan konsolidasi massal file-file tersebut di awal roadmap. Konsolidasi dilakukan setelah consumer dan visual contract stabil.

---

# 5. Target Akhir

Target akhir repository:

```text
                    DESIGN TOKENS
                         │
                         ▼
                PUBLIC DESIGN SYSTEM
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
           HOMEPAGE            SHARED UI PRIMITIVES
              │                     │
              └──────────┬──────────┘
                         ▼
        ┌────────────────────────────────┐
        │                                │
      BERITA                         KEGIATAN
        │                                │
      KEISLAMAN                    PENGUMUMAN
        │                                │
      PROFIL                      KEPENGURUSAN
        │                                │
     KEUANGAN                     DOKUMENTASI
        │                                │
      KONTAK                              │
        └────────────────────────────────┘
                         │
                         ▼
                    ADMIN UI
```

Makna target tersebut:

- Beranda menjadi reference implementation.
- Shared primitive dipakai lintas halaman ketika pola benar-benar berulang.
- Halaman tetap boleh memiliki kebutuhan layout khusus jika fungsi informasinya berbeda.
- Admin menyerap token dan primitive dasar public, tetapi tidak dipaksa memiliki density dan information architecture yang sama.

---

# 6. Fase 0 — Baseline & Freeze

## Checkpoint 19-A

### Tujuan

Mendokumentasikan kondisi sebelum redesign besar sehingga perubahan berikutnya dapat dilacak dan tidak menciptakan regresi arsitektur.

### File utama

```text
app/page.tsx
app/design-tokens.css
app/globals.css
app/polish.css
app/mobile-polish.css
app/theme-polish.css
app/dark-mode-fixes.css
```

### Pekerjaan

- petakan section homepage
- petakan class CSS yang dipakai homepage
- petakan token yang sudah tersedia
- petakan dark-mode overrides
- petakan responsive overrides
- tandai selector yang tampak duplikatif
- tandai CSS khusus homepage
- tandai CSS yang berpotensi menjadi shared primitive
- catat dependency antar file

### Output

```text
Homepage component map
Homepage CSS map
Token map
Dark-mode map
Responsive map
Legacy selector candidates
```

### Larangan

Tidak ada redesign visual pada fase ini.

### Selesai bila

Semua perubahan fase berikutnya mempunyai titik acuan yang jelas.

---

# 7. Fase 1 — Homepage Structural Redesign

## Checkpoint 20

### Tujuan

Mengubah homepage dari halaman yang berpusat pada hero institusional menjadi portal informasi masjid yang berpusat pada informasi aktual.

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
POPULAR
↓
ANNOUNCEMENTS
↓
LATEST NEWS
↓
AGENDA
↓
ISLAMIC CONTENT
↓
FINANCIAL SUMMARY
↓
SERVICES
↓
FOOTER
```

### Perubahan utama

- Hero institusional besar tidak lagi menjadi pusat homepage.
- Berita utama menjadi konten paling dominan.
- Pengumuman dan agenda diperlakukan sebagai informasi operasional.
- Finance ditampilkan sebagai summary cepat, bukan section promosi panjang.
- Services dipadatkan menjadi shortcut.
- Copy institutional seperti pengenalan masjid diarahkan ke `/profil/` bila tidak dibutuhkan di homepage.

### Behavior yang harus dipertahankan

- seluruh route yang sudah ada
- pengambilan data dari live/public repository layer
- link antar halaman
- dark mode
- responsive behavior

### Selesai bila

Homepage mempunyai hierarchy informasi yang jelas dan semua modul penting masih dapat diakses.

---

# 8. Fase 2 — Homepage Visual Language

## Checkpoint 21

### Tujuan

Menetapkan bahasa visual homepage yang akan menjadi referensi halaman lain.

### Typography

```text
Display / editorial heading
Playfair Display

Body / interface
DM Sans
```

### Hierarchy target

```text
H1
H2
H3
Body
Secondary
Tertiary / Meta
Label
```

### Spacing scale target

```text
4
8
12
16
24
32
48
64
```

Tidak berarti semua ukuran lama wajib diubah sekaligus. Scale dipakai sebagai referensi untuk perubahan baru dan refactor berikutnya.

### Surface vocabulary

```text
canvas
surface
surface-2
surface-3
line
line-strong
```

### Text vocabulary

```text
text-strong
text
text-secondary
text-tertiary
muted
```

### Accent vocabulary

```text
green
green-dark
gold
accent-soft
```

### Selesai bila

Homepage tidak lagi membutuhkan warna dan ukuran typography ad-hoc untuk pola yang sebenarnya sudah semantic.

---

# 9. Fase 3 — Featured News System

## Checkpoint 22

### Tujuan

Membangun satu pola editorial untuk berita utama yang dapat menjadi acuan halaman berita.

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

### Visual primitives

Pola yang harus distandardisasi:

- `CategoryTag`
- `Meta`
- `FeaturedNews`
- `NewsCard`
- `NewsListItem`
- section heading + action
- image ratio

Komponen React baru hanya dibuat bila pola tersebut benar-benar berulang dan mempunyai behavior bersama.

### Selesai bila

Berita mempunyai hierarchy visual yang jelas: featured > secondary > supporting.

---

# 10. Fase 4 — Homepage Information Modules

## Checkpoint 23

### Modul

```text
Popular
Announcements
Latest News
Agenda
Islamic
Finance
Services
```

### Contract setiap modul

Setiap modul harus memiliki definisi yang konsisten untuk:

- section heading
- section spacing
- content density
- typography
- metadata
- action link
- responsive behavior
- dark-mode behavior

### Anti-pattern

Jangan membuat setiap section mempunyai pola berbeda tanpa alasan fungsional.

Contoh yang harus dihindari:

```text
section A = bottom border
section B = decorative underline
section C = card header
section D = heading floating
```

Bila semua menyampaikan fungsi yang sama, gunakan satu pattern.

---

# 11. Fase 5 — Mobile-First Homepage

## Checkpoint 24

### Tujuan

Membuat mobile sebagai layout yang dirancang, bukan desktop yang diperkecil.

### Urutan mobile target

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

### Target usability

- headline tetap mudah dibaca
- metadata tidak terlalu kecil
- tap target cukup besar
- thumbnail mempunyai ratio konsisten
- section spacing tidak terlalu rapat
- horizontal scrolling hanya digunakan jika memang membantu
- tidak membuat konten penting tersembunyi di balik overflow

### Selesai bila

Homepage mobile mempunyai hierarchy dan density yang sengaja dirancang, bukan hasil shrink dari desktop.

---

# 12. Fase 6 — Dark Mode Parity

## Checkpoint 25

### Tujuan

Membuat dark mode menjadi pasangan visual yang setara dengan light mode.

### Aturan

```text
same information hierarchy
same component structure
same interaction model
```

Yang berubah terutama:

```text
surface
text
line
accent contrast
overlay
```

### Target architecture

```text
design-tokens
↓
component styles
↓
responsive styles
```

Hindari rantai:

```text
component
↓
theme-polish
↓
dark-mode-fixes
↓
mobile override
↓
another exception
```

### Selesai bila

Sebagian besar dark-mode behavior dapat dikendalikan melalui semantic token tanpa patch selector yang tidak perlu.

---

# 13. Fase 7 — Homepage Stabilization

## Checkpoint 26

### Tujuan

Menjadikan homepage sebagai reference implementation sebelum mengubah halaman lain.

### Audit

- duplicate selector
- duplicate color
- duplicate typography
- duplicate spacing
- conflicting specificity
- unused homepage selector
- redundant mobile override
- redundant dark override

### Aturan

Jangan melakukan redesign halaman lain sebelum homepage lulus fase stabilisasi.

### Output

```text
Homepage stable
Homepage reference implementation
Homepage design contract
```

---

# 14. Fase 8 — Extract Design System

## Checkpoint 27

### Tujuan

Mengambil pola yang benar-benar terbukti berulang dari homepage dan menjadikannya primitive bersama.

### Candidate primitives

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

### Candidate tokens

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

### Aturan penting

Tidak semua pattern harus menjadi React component.

Jika sebuah pattern hanya berupa 1–2 declaration tanpa behavior bersama, cukup gunakan CSS/token.

---

# 15. Fase 9 — Redesign Berita

## Checkpoint 28

### Target route

```text
/berita
/berita/[slug]
```

### Prinsip

Gunakan contract homepage:

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

### Detail article target

```text
Category
↓
Title
↓
Meta
↓
Lead
↓
Hero image
↓
Article body
↓
Related content
```

### Tidak boleh

Membuat design language kedua khusus halaman berita.

---

# 16. Fase 10 — Redesign Kegiatan

## Checkpoint 29

### Target route

```text
/kegiatan
/kegiatan/[slug]
```

### Pattern

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

### Visual relation

Agenda card homepage menjadi reference untuk event list/detail.

---

# 17. Fase 11 — Redesign Keislaman

## Checkpoint 30

### Target route

```text
/keislaman
/keislaman/[slug]
```

### Pattern

Gunakan editorial system homepage dengan aksen tematik yang tetap berada di dalam token system.

Accent yang diizinkan:

```text
green
gold
cream / accent-soft
```

Tidak membuat palette baru.

---

# 18. Fase 12 — Redesign Pengumuman

## Checkpoint 31

### Target route

```text
/pengumuman
```

### Pattern

```text
Announcement
↓
Date / status
↓
Title
↓
Summary
```

### Target

Compact, mudah dipindai, dan lebih operasional daripada editorial.

---

# 19. Fase 13 — Redesign Profil & Kepengurusan

## Checkpoint 32

### Target route

```text
/profil
/kepengurusan
```

### Prinsip

Halaman institutional boleh berbeda dari portal berita dalam information architecture, tetapi harus tetap memakai:

- typography system
- spacing system
- surface system
- button/link system
- card system
- responsive system
- dark mode

### Target structure

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

# 20. Fase 14 — Redesign Keuangan

## Checkpoint 33

### Target route

```text
/keuangan
```

### Pattern

```text
Summary
↓
Period selector
↓
Transaction table
↓
Disclosure / notes
```

### Catatan

Finance boleh mempunyai information density lebih tinggi karena sifatnya administratif. Konsistensi tidak berarti memaksa semua halaman mempunyai density yang sama.

---

# 21. Fase 15 — Redesign Dokumentasi

## Checkpoint 34

### Target route

```text
/dokumentasi
```

### Pattern

- gallery ratio
- category
- title
- metadata
- card surface
- section heading
- responsive gallery behavior

### Target

Image treatment menjadi konsisten dengan image language homepage.

---

# 22. Fase 16 — Redesign Kontak

## Checkpoint 35

### Target route

```text
/kontak
```

### Pattern

```text
Page Intro
↓
Contact Cards
↓
Location / map
↓
Contact Action
```

Tetap memakai shared primitive dan token yang sama.

---

# 23. Fase 17 — Admin UI Alignment

## Checkpoint 36

Tahap admin dilakukan setelah public website stabil.

### Yang diseragamkan

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

### Yang boleh berbeda

```text
Dashboard density
CRUD controls
Tables
Forms
Permission indicators
Operational layout
```

### Tujuan

Admin terasa bagian dari produk yang sama, tetapi tetap optimal untuk pekerjaan administratif.

---

# 24. Fase 18 — CSS Consolidation

## Checkpoint 37

### Tahap akhir

Baru setelah halaman public bermigrasi dan visual contract stabil, audit seluruh CSS layer:

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

### Klasifikasi

Setiap file/selector masuk salah satu kategori:

```text
KEEP
MERGE
MOVE
DELETE
```

### Target arsitektur

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

Sebuah selector atau file hanya boleh dihapus jika:

1. seluruh consumer sudah ditemukan,
2. tidak ada behavior penting yang bergantung padanya,
3. replacement sudah aktif,
4. tidak ada route yang masih membutuhkan style tersebut,
5. validation dilakukan pada code/build sesuai kebutuhan tahap.

---

# 25. Urutan Commit Berkala yang Direkomendasikan

Perubahan besar harus dibagi menjadi kelompok kecil.

Contoh urutan utama:

```text
C19  Baseline
L19  Baseline cleanup

C20  Homepage structure
L20  Homepage structure pass
L21  Homepage editorial hierarchy

C21  Homepage visual language
L22  Typography / spacing normalization
L23  Surface / token alignment

C22  Featured news system
L24  Featured layout
L25  News card/list consistency

C23  Information modules
L26  Popular + announcements
L27  Latest news + agenda

C24  Mobile
L28  Mobile homepage hierarchy
L29  Mobile spacing / type cleanup

C25  Dark mode
L30  Dark surface parity
L31  Dark text / border parity

C26  Stabilization
L32  Homepage cleanup

C27  Design system extraction
L33  Shared primitives
L34  Shared token cleanup

C28–C35  Public page migration

C36  Admin alignment

C37  CSS consolidation
```

Nomor `L` dapat bertambah bila suatu fase membutuhkan beberapa commit, tetapi satu commit tetap harus memiliki satu tujuan teknis yang mudah dijelaskan.

---

# 26. Acceptance Criteria Homepage

Homepage dianggap selesai pada tahap redesign utama jika semua kondisi berikut terpenuhi.

## Information Architecture

- Berita utama menjadi titik fokus informasi.
- Navigation mudah ditemukan.
- Pengumuman dan agenda mudah dipindai.
- Populer dan berita terkini mempunyai hierarchy yang berbeda.
- Finance dan services tidak mengambil porsi visual berlebihan.
- Footer tetap sederhana.

## Visual

- Typography hierarchy konsisten.
- Semantic color digunakan untuk teks dan surface yang memang bersifat semantic.
- Accent tidak bertambah tanpa alasan.
- Image ratio konsisten.
- Section heading konsisten.
- Card/list mempunyai bahasa visual yang sama.

## Responsive

- Desktop, tablet, dan mobile mempunyai hierarchy yang sengaja dirancang.
- Supporting text tidak kembali terlalu kecil.
- Tap target cukup besar.
- Tidak ada horizontal overflow yang tidak disengaja.

## Dark Mode

- Tidak ada teks yang hilang karena kontras.
- Surface tetap dapat dibedakan.
- Border tetap terlihat seperlunya.
- Accent mempunyai kontras yang cukup.
- Tidak membutuhkan patch selector berlebihan.

## Maintainability

- Tidak ada data duplication hanya untuk memenuhi layout baru.
- Tidak ada stylesheet baru tanpa alasan kuat.
- Selector baru mempunyai scope yang jelas.
- Legacy selector yang sudah tidak diperlukan ditandai untuk fase cleanup.

---

# 27. Acceptance Criteria Konsistensi Seluruh Public Website

Setelah fase migrasi selesai, halaman berikut harus terasa berasal dari sistem yang sama:

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

Yang harus konsisten:

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

# 28. Risiko dan Mitigasi

## Risiko 1 — Redesign terlalu besar dalam satu commit

Mitigasi:

- pecah berdasarkan section/fungsi
- gunakan checkpoint sebelum fase baru
- jangan mencampur structural dan cleanup besar tanpa alasan

## Risiko 2 — Regresi karena CSS lama

Mitigasi:

- jangan hapus CSS terlebih dahulu
- migrasikan consumer
- verifikasi bahwa selector benar-benar orphaned

## Risiko 3 — Dark mode rusak setelah tokenisasi

Mitigasi:

- setiap token semantic harus memiliki pasangan dark
- jangan ganti warna khusus menjadi semantic token secara membabi buta

## Risiko 4 — Homepage konsisten tetapi halaman lain kembali membuat pattern baru

Mitigasi:

- homepage dijadikan reference implementation resmi
- setiap redesign page baru wajib membandingkan component/pattern dengan homepage

## Risiko 5 — Shared component terlalu dini

Mitigasi:

- ekstrak primitive setelah pattern terbukti berulang
- jangan membuat abstraction hanya untuk mengurangi beberapa baris JSX

---

# 29. Definition of Done per Phase

Setiap fase hanya dianggap selesai jika:

1. scope fase terpenuhi,
2. behavior existing yang harus dipertahankan tidak sengaja dihapus,
3. perubahan tidak memperluas scope tanpa keputusan checkpoint baru,
4. dark mode tetap diperhitungkan untuk public UI,
5. responsive behavior diperhitungkan bila selector terkait public layout,
6. tidak ada file atau selector yang dihapus tanpa alasan yang terdokumentasi,
7. commit message menjelaskan satu tujuan utama fase.

---

# 30. Definition of Done Program Redesign

Program redesign keseluruhan selesai ketika:

```text
Homepage stable
        ↓
Homepage becomes design reference
        ↓
Shared primitives extracted
        ↓
Public pages migrated
        ↓
Admin aligned
        ↓
Legacy CSS removed
        ↓
Repository simplified
```

Target akhirnya bukan jumlah perubahan terbesar.

Target akhirnya adalah repository yang:

- lebih konsisten,
- lebih mudah dibaca,
- lebih mudah dipelihara,
- memiliki lebih sedikit duplication,
- memiliki lebih sedikit CSS conflict,
- mempunyai dark mode yang lebih terstruktur,
- memiliki responsive behavior yang lebih dapat diprediksi,
- dan tetap mempertahankan behavior serta data flow yang sudah berjalan.

---

# 31. Command Protocol untuk Roadmap Ini

Dokumen ini mengikuti protokol kerja berikut.

### `C`

Gunakan untuk:

- audit
- checkpoint
- pemetaan dependency
- rencana tahap berikutnya
- keputusan file yang akan disentuh

`C` tidak mengubah repository dan tidak melakukan deployment checking kecuali diminta.

### `L`

Gunakan untuk:

- implementasi scope checkpoint
- perubahan kecil yang dapat divalidasi
- commit ke repository
- laporan diff

### `R`

Gunakan hanya untuk memperbaiki error konkret yang sudah dilaporkan.

### `P`

Gunakan untuk preview/deployment inspection secara read-only.

---

# 32. Status Roadmap

Current planning milestone:

```text
CHECKPOINT 19
Homepage + whole-site progressive redesign roadmap
```

Current direction:

```text
Homepage redesign first
↓
Homepage stabilization
↓
Design system extraction
↓
Public page migration
↓
Admin alignment
↓
CSS consolidation
```

No redesign implementation is implied by this document alone. Implementation harus dilakukan melalui checkpoint dan commit bertahap sesuai urutan roadmap.
