Ya. Untuk fitur sebesar ini, saya tidak menyarankan membaginya berdasarkan "fitur" saja, tetapi berdasarkan **beban perubahan repository dalam satu kali `L`**, risiko regresi, dan ketergantungan antarbagian.

Karena aturan kerja kita adalah `C → L → C → L`, saya akan memetakan setiap fase menjadi:

* **C — Analysis/Preparation:** audit, consumer mapping, dependency check, desain, acceptance criteria.
* **L — Implementation:** satu perubahan teknis yang terukur.
* **V — Validation:** build/typecheck, consumer check, visual/behavior check.
* **Checkpoint:** kondisi repository yang harus stabil sebelum masuk fase berikutnya.

Target akhirnya bukan sekadar "editor Word", tetapi sistem:

```text
DOCX Template
     │
     ▼
DOCX Importer
     │
     ▼
Document Normalizer
     │
     ▼
Canonical Article Document
     │
     ├───────────────┐
     ▼               ▼
Admin Editor     Public Renderer
     │               │
     ▼               ▼
Preview          Article Page
     │
     ▼
Publish
```

---

# MASTER ROADMAP

Saya sarankan totalnya menjadi **15 fase implementasi utama + 5 fase audit/validasi khusus**, dengan sekitar **20–25 unit `L` kecil**.

Urutannya:

```text
PHASE 0  Baseline & Scope Audit
PHASE 1  Current News Data Audit
PHASE 2  Article Document Contract
PHASE 3  Legacy Compatibility Layer
PHASE 4  Rich Editor Foundation
PHASE 5  Editor Formatting
PHASE 6  Image Block System
PHASE 7  Public Article Renderer
PHASE 8  Editor ↔ Public Visual Contract
PHASE 9  Preview System
PHASE 10 Media Management
PHASE 11 Database Migration
PHASE 12 DOCX Import Engine
PHASE 13 DOCX Template
PHASE 14 Publishing Workflow
PHASE 15 Legacy Migration & Cleanup

+ Validation Gates di antaranya
```

Di bawah ini saya pecah sampai level pekerjaan yang bisa benar-benar dikerjakan satu per satu.

---

# PHASE 0 — BASELINE & FREEZE

### Tujuan

Membuat baseline sebelum menyentuh sistem berita.

**Belum ada perubahan repository.**

### C0.1 — Repository baseline

Audit:

```text
HEAD
branch
build status
typecheck
current news behavior
current admin behavior
current public behavior
```

Catat SHA baseline.

### C0.2 — Feature boundary

Tetapkan bahwa perubahan hanya menyangkut:

```text
NEWS
ADMIN NEWS
ARTICLE DETAIL
ARTICLE CONTENT
MEDIA
DOCX IMPORT
```

Jangan menyentuh:

```text
finance
events
islamic
management
profile
contact
auth
database unrelated
```

kecuali ternyata menjadi dependency langsung.

### C0.3 — Acceptance criteria

Tentukan dari awal:

```text
AC-01 editor dapat menulis artikel
AC-02 formatting tersimpan
AC-03 gambar inline tersimpan
AC-04 preview sesuai public
AC-05 artikel lama tetap tampil
AC-06 DOCX dapat diimport
AC-07 image DOCX ikut terimport
AC-08 draft/publish tetap berjalan
```

### L0

**Tidak ada perubahan code.**

Checkpoint:

> Baseline repository terdokumentasi.

---

# PHASE 1 — AUDIT NEWS PIPELINE

Ini fase analisis paling penting.

Saat ini `AdminNewsManager` langsung membaca/menulis Supabase dan isi artikel masih diperlakukan sebagai `string[]`.

Di public side, `ArticleDetail` mengirim `article.content` ke `SafeRichContent`, yang saat ini hanya merender paragraf dan URL/video tertentu.

### C1.1 — Database consumer map

Telusuri:

```text
news.content
news.thumbnail_url
news.excerpt
news.category_id
news.status
news.published_at
```

Cari semua consumer.

Output:

```text
news.content
├── AdminNewsManager
├── NewsRecord
├── presentation.ts
├── LiveArticleDetail
├── ArticleDetail
├── SafeRichContent
├── homepage
├── news list
└── search/presentation
```

### C1.2 — Legacy format audit

Pastikan semua asumsi bahwa:

```ts
content: string[]
```

telah ditemukan.

### C1.3 — CRUD audit

Catat:

```text
create
read list
read detail
update
delete
publish
thumbnail upload
```

### C1.4 — Storage audit

Telusuri:

```text
news-media
upload helper
RLS
file type validation
file size validation
existing storage admin
```

### C1.5 — Public rendering audit

Petakan:

```text
database
 ↓
repository
 ↓
presentation
 ↓
LiveArticleDetail
 ↓
ArticleDetail
 ↓
SafeRichContent
```

### L1

Tidak perlu membuat fitur baru.

**L1 dapat berupa audit-only documentation/contract artifact**, atau tidak melakukan commit sama sekali bila dokumentasinya tidak perlu masuk repository.

### Checkpoint

Kita harus memiliki **News Dependency Map**.

---

# PHASE 2 — ARTICLE DOCUMENT CONTRACT

Ini adalah fondasi utama.

Jangan membuat editor terlebih dahulu.

### C2.1 — Tentukan node yang didukung

Versi V1:

```text
doc
paragraph
heading
bulletList
orderedList
listItem
blockquote
link
image
hardBreak
horizontalRule
```

Text marks:

```text
bold
italic
underline
```

### C2.2 — Tentukan atribut node

Contoh:

```text
image
├── src
├── alt
├── caption
└── alignment
```

### C2.3 — Validation contract

Tentukan:

```text
document tidak boleh invalid
image harus punya src
heading punya level
link punya href
```

### C2.4 — Serialization contract

Tentukan:

```text
Editor
  ↓
Document JSON
  ↓
Database
```

dan:

```text
Database
  ↓
Document JSON
  ↓
Renderer
```

### L2

Implementasi **document schema/types/validator**, belum UI.

### Checkpoint

Canonical document model sudah fixed.

---

# PHASE 3 — LEGACY COMPATIBILITY

Ini penting agar berita lama tidak rusak.

Saat ini data lama:

```text
string[]
```

Target:

```text
Document JSON
```

### C3.1 — Legacy adapter

Rancang:

```text
string[]
 ↓
Legacy Converter
 ↓
Document
```

Contoh:

```text
[
 "Paragraf 1",
 "Paragraf 2"
]
```

menjadi:

```text
doc
 ├─ paragraph
 └─ paragraph
```

### C3.2 — Detection strategy

Sistem harus bisa mengetahui:

```text
old content
```

versus:

```text
new document
```

### L3

Implementasi compatibility adapter.

### C3.3 — Consumer audit ulang

Pastikan renderer dapat menerima:

```text
legacy
new
```

### L4

Integrasikan adapter ke presentation layer.

### Checkpoint

> Semua artikel lama masih dapat dirender melalui pipeline baru.

---

# PHASE 4 — RICH EDITOR FOUNDATION

Baru sekarang editor.

### C4.1 — Editor dependency decision

Audit library yang akan digunakan.

Target:

```text
Tiptap / ProseMirror
```

Tetapi sebelum install:

```text
bundle impact
Next.js 16 compatibility
React 19 compatibility
SSR/client boundary
paste behavior
image extension
```

### C4.2 — Editor boundary

Pisahkan:

```text
AdminNewsManager
```

dari:

```text
RichArticleEditor
```

Jangan membuat `AdminNewsManager` semakin besar.

### L5

Buat editor canvas + basic document state.

Target:

```text
type
insert paragraph
read JSON
set initial JSON
```

Belum semua toolbar.

### C4.3 — Editor integration

Hubungkan dengan form berita.

### L6

Editor menggantikan textarea `Isi berita`.

### Checkpoint

Admin dapat membuat artikel dengan editor, tetapi formatting masih minimal.

---

# PHASE 5 — WORD-LIKE FORMATTING

Sekarang toolbar.

### C5.1

Tambahkan:

```text
Paragraph
Heading 1
Heading 2
Heading 3
```

### L7

Formatting heading.

### C5.2

Tambahkan:

```text
Bold
Italic
Underline
```

### L8

Text marks.

### C5.3

Tambahkan:

```text
Bullet list
Numbered list
```

### L9

Lists.

### C5.4

Tambahkan:

```text
Blockquote
Horizontal rule
Link
Undo
Redo
```

### L10

Advanced basic toolbar.

### Checkpoint

Editor sudah secara mental berperilaku seperti Word.

---

# PHASE 6 — INLINE IMAGE SYSTEM

Ini fitur inti pertama.

### C6.1 — Image block contract

Tentukan:

```text
image
├── source
├── alt
├── caption
├── alignment
└── display width
```

### C6.2 — Upload flow

```text
Insert image
 ↓
file picker
 ↓
upload
 ↓
storage URL
 ↓
image node
```

### L11

Implement upload + image insertion.

### C6.3 — Image editing

Saat gambar dipilih:

```text
Edit image
Delete
Alt
Caption
Alignment
```

### L12

Implement image controls.

### C6.4 — Paste image

Audit apakah clipboard image dapat didukung.

### Checkpoint

Artikel dapat mempunyai:

```text
paragraph
image
paragraph
image
paragraph
```

dalam urutan bebas.

---

# PHASE 7 — PUBLIC ARTICLE RENDERER

Jangan membuat HTML renderer baru secara sembarangan.

### C7.1 — Renderer architecture

Refactor konsep:

```text
SafeRichContent
```

menjadi renderer document.

Mungkin akhirnya:

```text
ArticleContentRenderer
```

dengan node renderer.

### C7.2 — Rendering matrix

Buat mapping:

```text
paragraph → p
heading → h2/h3
bullet → ul
ordered → ol
blockquote → blockquote
image → figure/img/figcaption
link → a
```

### L13

Implement renderer V1.

### Checkpoint

Artikel lama + baru bisa tampil.

---

# PHASE 8 — EDITOR/PUBLIC VISUAL CONTRACT

Ini fase untuk memenuhi bagian Anda:

> apa yang diedit admin harus terlihat sama di user.

### C8.1 — Typography mapping

Editor:

```text
H1
H2
H3
body
quote
caption
```

Public:

```text
H1
H2
H3
body
quote
caption
```

### C8.2 — Spacing mapping

Tetapkan satu kontrak:

```text
paragraph spacing
heading spacing
list spacing
image spacing
caption spacing
quote spacing
```

### C8.3 — Responsive mapping

Mobile harus tetap konsisten.

### L14

Implement visual content contract.

### Checkpoint

Admin Preview dan Public renderer secara struktural sama.

---

# PHASE 9 — PREVIEW SYSTEM

Sekarang baru preview.

### C9.1 — Preview mode

```text
Edit
Preview
```

### C9.2 — Split mode

Desktop:

```text
Editor | Preview
```

Mobile:

```text
Editor
Preview
```

### L15

Implement preview.

### C9.3 — Public preview isolation

Preview artikel belum published tidak boleh:

```text
masuk public list
masuk homepage
masuk search public
```

### L16

Implement preview data flow.

### Checkpoint

Admin dapat memeriksa hasil akhir sebelum publish.

---

# PHASE 10 — MEDIA MANAGEMENT

Sekarang baru optimasi media, karena image block sudah stabil.

### C10.1 — Media selection

Sediakan:

```text
Upload baru
Pilih dari media
```

### C10.2 — Media metadata

```text
filename
url
type
size
createdAt
```

### C10.3 — Image reuse

Admin tidak perlu upload ulang gambar yang sudah tersedia.

### L17

Implement media picker minimum.

### Checkpoint

Editor memiliki dua sumber gambar:

```text
upload
existing media
```

---

# PHASE 11 — DATABASE MIGRATION

Ini fase dengan risiko terbesar.

### C11.1 — Migration design

Tentukan:

```text
old content field
new content representation
```

Apakah:

```text
content jsonb
```

atau field baru sementara:

```text
content
content_document
```

Pilihan final harus mengikuti schema aktual setelah audit.

### C11.2 — Migration strategy

Saya lebih menyarankan:

```text
existing data
     ↓
new field
     ↓
convert
     ↓
validate
     ↓
switch readers
     ↓
remove legacy later
```

daripada langsung menimpa data lama.

### L18

Schema/data migration tahap pertama.

### C11.3 — Backfill

Konversi artikel lama:

```text
string[]
 ↓
document JSON
```

### L19

Backfill.

### C11.4 — Verification

Bandingkan:

```text
old article
vs
new article
```

untuk semua artikel.

### Checkpoint

100% artikel existing berhasil dibaca oleh sistem baru.

---

# PHASE 12 — DOCX IMPORT ENGINE

Baru sekarang.

Kenapa tidak lebih awal?

Karena kita sudah mempunyai target output:

```text
Document JSON
```

jadi parser DOCX tidak perlu menentukan format internal.

### C12.1 — DOCX parser research

Tentukan library dan lokasi eksekusi:

```text
browser?
server?
API route?
server action?
worker?
```

Untuk DOCX parsing, saya lebih menyarankan server-side.

### C12.2 — Supported feature matrix

```text
paragraph     YES
heading       YES
bold          YES
italic        YES
underline     YES
bullet        YES
numbering     YES
image         YES
caption       YES/limited
table         V1.1
```

### L20

Parser core.

### C12.3 — DOCX → intermediate format

Jangan langsung:

```text
DOCX → DB
```

Gunakan:

```text
DOCX
 ↓
Intermediate representation
 ↓
Normalizer
 ↓
Document JSON
```

### L21

Normalization layer.

### C12.4 — Import preview

Tampilkan:

```text
DOCX berhasil dibaca.

12 paragraf
3 heading
2 image
1 numbered list
```

### L22

Import UI.

### Checkpoint

DOCX bisa masuk ke editor sebagai document yang bisa diedit lagi.

---

# PHASE 13 — OFFICIAL DOCX TEMPLATE

Setelah importer stabil.

### C13.1 — Template specification

Tentukan style Word:

```text
Title
Subtitle/Excerpt
Heading 1
Heading 2
Normal
List Bullet
List Number
Caption
```

### C13.2 — Template file

Buat:

```text
Miftahul Mubin - Template Berita.docx
```

### C13.3 — Template documentation

Buat panduan singkat:

```text
Gunakan Heading 1 untuk...
Gunakan Normal untuk...
Masukkan gambar melalui...
```

### L23

Masukkan template + dokumentasi.

### C13.4 — Template validation

Upload template nyata.

Pastikan:

```text
format
list
gambar
caption
heading
```

semuanya terkonversi.

### Checkpoint

Admin memiliki dua jalur:

```text
Tulis langsung
Import DOCX
```

---

# PHASE 14 — PUBLISHING WORKFLOW

Sekarang editor sudah lengkap.

### C14.1 — Draft state audit

Sudah ada:

```text
draft
published
archived
```

sehingga tidak perlu membuat model status baru tanpa alasan. `AdminNewsManager` saat ini sudah menggunakan status tersebut pada level form/data.

### C14.2 — Save semantics

Bedakan:

```text
Simpan draft
Publish
Update published
```

### L24

Implement publishing UX.

### C14.3 — Unsaved changes

Admin harus mendapat peringatan:

```text
Ada perubahan yang belum disimpan.
```

### C14.4 — Autosave

Autosave opsional.

Saya justru menyarankan:

**Jangan implement autosave dulu.**

Stabilkan manual save dahulu.

---

# PHASE 15 — LEGACY MIGRATION & CLEANUP

Fase terakhir.

### C15.1 — Find dead code

Audit:

```text
textarea content logic
string[] assumptions
old paragraph split logic
old SafeRichContent assumptions
unused helper
legacy converter
duplicate image upload logic
```

### C15.2 — Consumer audit

Sebelum menghapus sesuatu:

```text
search references
```

### C15.3 — Legacy removal plan

Urutan:

```text
verify
 ↓
replace consumer
 ↓
verify
 ↓
remove legacy
 ↓
build
 ↓
verify
```

### L25

Cleanup.

### Checkpoint akhir

Tidak boleh terdapat:

```text
old editor path
new editor path
old renderer path
new renderer path
```

yang berjalan bersamaan tanpa alasan.

---

# PEMBAGIAN BEBAN KERJA PER `L`

Ini bagian yang paling penting untuk workflow kita.

Saya tidak ingin satu `L` berbobot:

> "Buat seluruh rich editor."

Itu terlalu besar.

Pembagiannya:

| L   | Fokus                    | Beban        |
| --- | ------------------------ | ------------ |
| L1  | baseline/document audit  | sangat kecil |
| L2  | document schema          | kecil        |
| L3  | legacy adapter           | kecil        |
| L4  | presentation integration | kecil        |
| L5  | editor foundation        | sedang       |
| L6  | editor form integration  | sedang       |
| L7  | headings                 | kecil        |
| L8  | text formatting          | kecil        |
| L9  | lists                    | kecil        |
| L10 | link/quote/undo          | sedang       |
| L11 | image insertion          | sedang       |
| L12 | image controls           | sedang       |
| L13 | public renderer          | sedang       |
| L14 | visual contract          | sedang       |
| L15 | preview UI               | sedang       |
| L16 | preview data flow        | kecil        |
| L17 | media picker             | sedang       |
| L18 | DB migration foundation  | besar        |
| L19 | data backfill            | besar        |
| L20 | DOCX parser              | besar        |
| L21 | DOCX normalizer          | besar        |
| L22 | DOCX import UI           | sedang       |
| L23 | official template        | kecil        |
| L24 | publish workflow         | sedang       |
| L25 | legacy cleanup           | sedang       |

Dengan ini tidak ada satu commit yang melakukan:

```text
database
+
editor
+
renderer
+
CSS
+
DOCX
```

sekaligus.

---

# PEMBAGIAN RISIKO

Saya membaginya menjadi lima kelompok.

## Risiko Rendah

```text
L1
L2
L3
L4
L7
L8
L9
L16
L23
```

## Risiko Sedang

```text
L5
L6
L10
L11
L12
L13
L14
L15
L17
L22
L24
L25
```

## Risiko Tinggi

```text
L18 — database migration
L19 — backfill
L20 — DOCX parser
L21 — DOCX normalization
```

Keempat area ini harus memiliki checkpoint terpisah.

---

# VALIDATION GATE

Setiap fase tidak langsung lanjut ke fase berikut.

Setelah setiap `L`:

### Gate 1 — Type safety

```text
npm run typecheck
```

### Gate 2 — Build

```text
npm run build
```

### Gate 3 — Consumer audit

Cari:

```text
changed API
changed type
changed component
changed database field
```

### Gate 4 — Runtime

Minimal:

```text
create
edit
save
reload
public view
```

### Gate 5 — Regression

Periksa:

```text
homepage
berita list
article detail
admin berita
```

---

# KHUSUS DATABASE

Untuk database, jangan menggabungkannya ke `L` biasa.

Gunakan pola:

```text
C Database
↓
L Migration
↓
C Verification
↓
L Backfill
↓
C Verification
↓
L Consumer Switch
↓
C
```

Karena ini menyentuh data produksi.

---

# KHUSUS DOCX

DOCX juga jangan diperlakukan sebagai fitur UI biasa.

Gunakan:

```text
C Parser research
↓
L Parser core
↓
C test corpus
↓
L Normalizer
↓
C validation
↓
L Import UI
↓
C real DOCX testing
```

Bahkan sebaiknya kita membuat **kumpulan DOCX test cases**:

```text
01-basic.docx
02-heading.docx
03-list.docx
04-numbering.docx
05-images.docx
06-caption.docx
07-mixed.docx
08-invalid.docx
```

Sehingga setiap perubahan parser bisa dibandingkan dengan hasil sebelumnya.

---

# TARGET AKHIR

Pada akhirnya workflow admin menjadi:

```text
                    ┌─────────────────────┐
                    │     Kelola Berita   │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
           Tulis Manual                Import DOCX
                 │                           │
                 ▼                           ▼
          Rich Editor                 DOCX Parser
                 │                           │
                 │                    Normalization
                 │                           │
                 └─────────────┬─────────────┘
                               ▼
                       Article Document
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
             Edit           Preview         Save
                │              │              │
                └──────────────┼──────────────┘
                               ▼
                            Publish
                               │
                               ▼
                         Public Article
```

Dan isi artikel dapat menjadi:

```text
Judul

Lead paragraph

Paragraf

• Bullet
• Bullet
• Bullet

Paragraf

[IMAGE]

Caption

Paragraf

1. Step
2. Step
3. Step

Quote

Paragraf

[IMAGE]

Paragraf terakhir
```

sementara artikel lama tetap aman selama fase migrasi.

---

# URUTAN EKSEKUSI YANG SAYA SARANKAN

Jangan mulai dari UI.

Urutan yang paling aman:

```text
01. Audit
02. Document contract
03. Legacy compatibility
04. Editor foundation
05. Formatting
06. Image blocks
07. Public renderer
08. Visual contract
09. Preview
10. Media
11. Database migration
12. DOCX parser
13. DOCX template
14. Publish workflow
15. Legacy cleanup
```

Secara praktis, **fase 1–4 adalah fondasi**, **fase 5–10 adalah produk editor**, dan **fase 11–15 adalah integrasi/migrasi/penyelesaian**.

Untuk repository `miftahul-mubin`, saya menyarankan **jangan langsung menuju `L2`**. Langkah berikutnya seharusnya `C` khusus untuk **PHASE 1 — Audit News Pipeline**, karena kita perlu memperoleh consumer map yang benar sebelum menetapkan schema rich document dan daftar file yang benar-benar akan disentuh. Saat ini `AdminNewsManager`, `ArticleDetail`, `SafeRichContent`, dan presentation layer sudah menunjukkan dengan jelas bahwa format artikel lama tersebar di beberapa lapisan.
