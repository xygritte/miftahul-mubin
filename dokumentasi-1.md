# Dokumentasi-1 — Audit dan Refactor Repository Miftahul Mubin

Dokumen ini mencatat proses audit, refactor, cleanup, repair, dan validasi repository `xygritte/miftahul-mubin` pada branch `main` sampai dengan fase L11.

---

## 1. Tujuan Utama

Tujuan rangkaian pekerjaan ini adalah merapikan repository tanpa mengubah behavior utama aplikasi, sekaligus mengurangi kompleksitas teknis yang tidak perlu.

Urutan prioritas yang digunakan:

> **REMOVE → MERGE → SIMPLIFY → REFACTOR → OPTIMIZE → ADD ONLY WHEN NECESSARY**

Prinsip tersebut digunakan untuk mencegah penambahan abstraksi atau tooling baru sebelum struktur lama benar-benar dibersihkan.

### Sasaran audit dan refactor

- Menghapus file dan kode legacy yang tidak lagi digunakan.
- Mengurangi duplikasi logic, type, style, dan import.
- Memusatkan sumber type dan data yang memiliki fungsi sama.
- Memperjelas batas antara repository data, presentation layer, component, dan CSS global.
- Mempertahankan behavior halaman publik, detail konten, filter, pencarian, static export, dan deployment GitHub Pages.
- Memastikan perubahan tervalidasi melalui GitHub Actions sejauh workflow tersedia.

---

# 2. Protokol Pekerjaan

Pekerjaan menggunakan tiga mode utama dan satu mode observasi:

### C — Check

Audit read-only. Digunakan untuk:

- membaca struktur repository;
- mencari duplikasi;
- menemukan dead code;
- menemukan dependency legacy;
- menilai arsitektur;
- memetakan risiko;
- menyusun checkpoint sebelum perubahan.

**C tidak mengubah repository.**

### L — Launch / Execute

Eksekusi terhadap rencana yang sudah diperiksa. Dapat mencakup:

- delete;
- merge;
- pemindahan logic;
- simplifikasi;
- refactor;
- optimisasi;
- perubahan file yang diperlukan untuk menjaga behavior.

Setelah perubahan dilakukan, repository harus divalidasi melalui GitHub Actions atau pemeriksaan equivalent yang tersedia.

### R — Repair

Perbaikan terarah terhadap regresi/error yang ditemukan setelah perubahan. Prinsipnya:

- perubahan minimal;
- tidak melakukan refactor tambahan yang tidak diperlukan;
- validasi ulang setelah perbaikan.

### P — Preview

Pemeriksaan deployment/preview secara read-only. Tidak mengubah repository.

---

# 3. Ringkasan Alur L1–L11

Secara historis, L1–L11 bergerak dari cleanup data dan CSS menuju pemisahan ownership stylesheet.

Tahapan awal lebih banyak berfokus pada penghapusan dependency legacy. Tahapan berikutnya berfokus pada konsolidasi CSS dan pengurangan aturan yang tumpang tindih.

---

# 4. L1–L5 — Data dan CSS Cleanup Awal

## L1 — Pembersihan awal

Fokus fase awal:

- audit struktur repository;
- memetakan data layer;
- mengidentifikasi static/legacy dataset;
- mencari duplicate type dan duplicate CSS;
- menentukan prinsip refactor utama.

Hasil utama adalah baseline untuk pekerjaan berikutnya dan keputusan bahwa cleanup harus mendahului penambahan abstraksi baru.

## L2 — Penghapusan dependency dataset pada FilterableEvents

Perubahan utama:

- `FilterableEvents` tidak lagi bergantung pada content dataset lama.
- Dependency diarahkan ke struktur data yang lebih sesuai dengan repository/presentation layer.

Commit terkait:

```text
34418ae7bc0b571c43af7fe4e5cee54f28b4a7f7
refactor(types): remove content dataset dependency from FilterableEvents
```

## L3 — Penghapusan static content datasets legacy

Perubahan utama:

- dataset statis lama yang tidak lagi diperlukan dihapus;
- repository dipusatkan pada data source yang lebih canonical.

Commit terkait:

```text
b8a515c61ee1431458f68baed182e10a2f80db2d
refactor(data): remove legacy static content datasets
```

Setelah cleanup, behavior `FilterableNews` sempat memerlukan repair untuk tetap identik.

## L4 — Preservation behavior FilterableNews

Perubahan dilakukan untuk menjaga behavior filter setelah penghapusan dataset lama.

Commit terkait:

```text
348f45b2d0f045dc7402371ff4cba07e3846eba3
fix(refactor): preserve FilterableNews behavior
```

Behavior yang harus dipertahankan mencakup filter:

- `Semua`;
- `Masjid`;
- `Kegiatan` yang dipetakan ke `Kegiatan Masjid`;
- category lain yang berasal dari data.

Implementasi yang saat ini menjadi referensi:

```ts
function matches(category: string, filter: string) {
  if (filter === 'Semua') return true
  if (filter === 'Masjid') return category === 'Masjid'
  if (filter === 'Kegiatan') return category === 'Kegiatan Masjid'
  return category === filter
}
```

## L5 — Konsolidasi theme token dan focus token

Perubahan utama:

1. Menghapus duplicate root theme tokens.
2. Menggunakan canonical focus token dibanding mendefinisikan token yang sama kembali.

Commit terkait:

```text
dc03c12bf39dffb24750cb3345c687222a9f2502
refactor(css): remove duplicate root theme tokens
```

```text
4b5c0bf80ce865b006c3c357b43a517606bc5e30
refactor(css): reuse canonical focus token
```

---

# 5. L6 — Aggressive Cleanup dan Penghapusan Legacy CSS/Data

L6 merupakan fase cleanup yang lebih agresif.

## Perubahan

### Profile image override

Rule override profile image ditempatkan lebih dekat dengan component yang memiliki ownership terhadap behavior tersebut.

Commit:

```text
dc4a42e4d501d48b242d9b17ab91c41eb7ae8f49
refactor(css): colocate profile image overrides
```

### Penghapusan import stylesheet redundan

Commit:

```text
02cb771cdd1ec60c2a0fa29f433e269bbfb59148
refactor(css): remove redundant stylesheet imports
```

### Penghapusan management photo fix legacy

File dihapus:

```text
app/management-photo-fix.css
```

Commit:

```text
b10292077bf35c1ae7a9fbee6923b219e5e229f1
refactor(css): remove redundant management photo fix
```

### Penghapusan duplicate profile stylesheet

File dihapus:

```text
app/profile-settings.css
```

Commit:

```text
e5f26e2fb7c2660cd393e4d2dabf36ffaa0bef42
refactor(css): remove redundant profile stylesheet
```

### Penghapusan content layer legacy

File dihapus:

```text
lib/content.ts
```

Pada saat penghapusan, beberapa consumer lama masih melakukan import terhadap file tersebut. Hal ini menghasilkan regresi TypeScript yang kemudian diperbaiki pada fase repair.

### Penghapusan duplicate dark-mode table heading rule

Commit:

```text
d519155b652283ee290cf42441d164219e5af479b
refactor: remove duplicate dark mode table heading rule
```

---

# 6. L6 Regression — Penghapusan `lib/content.ts` Terlalu Dini

Setelah `lib/content.ts` dihapus, empat consumer masih menggunakannya:

```text
components/content/ArticleDetail.tsx
components/content/EventDetail.tsx
components/live/LiveArticleDetail.tsx
components/live/LiveEventDetail.tsx
```

GitHub Actions workflow #452 / run `34170534299` gagal pada TypeScript check dengan error:

```text
TS2307 Cannot find module '@/lib/content'
```

Temuan ini menunjukkan risiko penting dalam cleanup agresif:

> File legacy tidak boleh dianggap aman dihapus hanya berdasarkan isi file; seluruh consumer harus dimigrasikan atau diverifikasi terlebih dahulu.

---

# 7. Repair Setelah L6

## Migrasi ArticleDetail

`ArticleDetail.tsx` dipindahkan ke type canonical dari:

```ts
@/lib/data/presentation
```

Menggunakan:

```ts
import type { NewsItem } from '@/lib/data/presentation'
```

Commit:

```text
d20dc4cc16379ee0183ac94c389e1820f9453bf8
fix(typecheck): migrate article detail type import
```

## Migrasi EventDetail

Menggunakan:

```ts
import type { EventItem } from '@/lib/data/presentation'
```

Commit:

```text
d84195208ec70683246c4df2c95ae84ccabc450f
fix(typecheck): migrate event detail type import
```

## Migrasi LiveArticleDetail

Menggunakan type dan converter dari presentation layer:

```ts
import { newsRecordToLegacy, type NewsItem } from '@/lib/data/presentation'
```

Commit:

```text
4b2293ff0a10a147a97750c16974ce53b8a68116
fix(typecheck): migrate live article type import
```

## Migrasi LiveEventDetail

Menggunakan:

```ts
import { eventRecordToLegacy, type EventItem } from '@/lib/data/presentation'
```

Commit:

```text
1ea3423b72000f50a2e518e013936f39e6d1cf53
fix(typecheck): migrate live event type import
```

---

# 8. Repair Typecheck Tambahan

## Nullable news timestamps

`LiveNewsList.tsx` memiliki field timestamp yang nullable sementara consumer mengharapkan bentuk non-null/undefined.

Perbaikan dilakukan dengan normalisasi:

```ts
row.created_at ?? undefined
row.updated_at ?? undefined
```

Commit:

```text
c0f722baeab2fbb35fcc9fb20ad7dfcba798b2e4
fix(typecheck): normalize nullable news timestamps
```

## Unsupported `categoryId`

Property `categoryId` yang tidak tersedia pada `NewsRecord` dihapus dari penggunaan yang tidak valid.

Commit:

```text
3b0e6cd48f6c810757047a232a2802d3c84e1a75
fix(typecheck): remove unsupported news categoryId
```

## Legacy content types

Type legacy yang sudah tidak memiliki consumer dihapus.

Commit:

```text
5b782d100c8cc23f9b0caed8cf9bb66fe40b2776
refactor: remove unused legacy content types
```

---

# 9. L7–L8 — Konsolidasi Header dan CSS Ownership

## Penghapusan duplicate header dark-mode layer

Duplicate dark-mode block dihapus dari:

```text
app/header-portal.css
```

Structure dan responsive header tetap berada di stylesheet tersebut. Theme-specific override dipertahankan di:

```text
app/theme-polish.css
```

Commit:

```text
df8112f0e703f72e1c0334d97748de421e0d959b
refactor(css): remove duplicate header dark mode layer
```

Prinsip yang digunakan:

- structural CSS → stylesheet component/feature;
- theme CSS → theme stylesheet;
- jangan menaruh dua definisi aktif untuk selector dan behavior yang sama.

---

# 10. L9–L10 — Pemindahan Global Interaction Rules

## L10 tahap 1 — Pemindahan global interaction rules

Aturan global berikut dipindahkan dari:

```text
app/polish.css
```

ke:

```text
app/design-tokens.css
```

Aturan yang dipusatkan mencakup:

- `:focus-visible`;
- `::selection`;
- transition pada link/button aktif;
- cursor disabled pada button;
- `prefers-reduced-motion`.

Commit:

```text
02f93884f110d28043e6a9f93402b012b26f2016
refactor(css): move global interaction rules out of polish layer
```

## L10 tahap 2 — Centralization baseline

Dilanjutkan dengan konsolidasi global interaction baseline.

Commit HEAD saat dokumentasi ini dibuat:

```text
eda310f94e83863212775e185f6f4d9a519d37b9
refactor(css): centralize global interaction baseline
```

Parent:

```text
02f93884f110d28043e6a9f93402b012b26f2016
```

---

# 11. Checkpoint C11 — Kondisi CSS Saat Ini

C11 menemukan bahwa `app/design-tokens.css` mulai memikul beberapa ownership yang berbeda sekaligus.

Saat ini file tersebut berisi kombinasi:

1. design token variables;
2. compatibility aliases;
3. global base rules;
4. global interaction baseline;
5. dark-mode homepage normalization.

Masalah strukturalnya:

> **token source ≠ global base CSS ≠ theme normalization**

Artinya, walaupun aturan sudah lebih terpusat, ownership stylesheet belum sepenuhnya bersih.

### Kesimpulan C11

Belum disarankan melakukan refactor CSS besar sebelum baseline CI untuk HEAD dikonfirmasi.

Sequence yang direncanakan setelah verifikasi:

1. Verifikasi CI HEAD.
2. Pisahkan token dari global CSS.
3. Kurangi hard-coded theme color.
4. Kurangi overlap antar stylesheet.
5. Audit ulang dead styles.
6. Lakukan optimisasi final.

---

# 12. Arsitektur Data Saat Ini

Struktur data yang menjadi target utama setelah cleanup:

```text
Supabase
   ↓
Public Repository Layer
   ↓
Presentation Layer
   ↓
Components
```

Implementasi:

```text
lib/data/index.ts
lib/data/repository.ts
lib/data/supabasePublicRepository.ts
lib/data/presentation.ts
```

### `lib/data/index.ts`

Mengekspor canonical repository:

```ts
contentRepository = supabasePublicRepository
```

### `lib/data/repository.ts`

Mendefinisikan contract public content repository.

### `lib/data/supabasePublicRepository.ts`

Menjadi canonical implementation untuk public content repository.

### `lib/data/presentation.ts`

Menjadi sumber type/presentation helper untuk consumer.

Type utama:

```text
NewsItem
EventItem
IslamicItem
```

Helper penting:

```text
sitePath
formatIndonesianDate
formatIndonesianDateTime
formatEventTime
newsRecordToLegacy
eventRecordToLegacy
islamicRecordToLegacy
buildSearchEntries
```

File legacy yang sudah dihapus:

```text
lib/content.ts
lib/islamic.ts
```

`IslamicItem` sudah dipindahkan ke presentation layer.

---

# 13. Behavior yang Harus Dipertahankan

Setiap refactor berikutnya harus menjaga behavior berikut:

### Data

- data publik tetap berasal dari Supabase/public repository;
- presentation layer tetap menjadi adapter untuk kebutuhan component;
- tidak mengembalikan dependency ke static legacy dataset.

### Filtering

`FilterableNews` harus mempertahankan mapping:

```text
Semua        → semua item
Masjid       → Masjid
Kegiatan     → Kegiatan Masjid
kategori lain → exact category match
```

### Detail page

- Article detail tetap menerima `NewsItem` yang ekuivalen;
- Event detail tetap menerima `EventItem` yang ekuivalen;
- Live article/event detail tetap menggunakan converter canonical jika diperlukan.

### Deployment

Konfigurasi berikut harus tetap dipertahankan:

```ts
output: 'export'
images: { unoptimized: true }
trailingSlash: true
```

GitHub Pages tetap menggunakan:

```text
NEXT_PUBLIC_BASE_PATH
```

atau fallback:

```text
/miftahul-mubin
```

ketika `GITHUB_ACTIONS === 'true'`.

---

# 14. Status CI dan Validasi

Workflow penuh yang telah terkonfirmasi berhasil setelah repair antara lain:

### Baseline success

Workflow run:

```text
34170169283
```

Memvalidasi:

- install dependencies ✅
- Supabase config ✅
- REST smoke ✅
- typecheck ✅
- build ✅
- Pages output ✅
- deployment ✅
- public smoke ✅
- dynamic route ✅

### Repair-chain success

Workflow run:

```text
34173556164
```

Juga berhasil melalui build, TypeScript, deployment, public smoke, dan dynamic-route fallback.

### Known failed run

Workflow:

```text
#452
run 34170534299
```

Gagal pada TypeScript check karena import yang masih menunjuk ke `@/lib/content` setelah file tersebut dihapus.

### Current HEAD validation caveat

Pada saat dokumentasi ini dibuat, endpoint workflow-by-commit tidak memberikan run langsung yang dapat dipastikan untuk:

```text
eda310f94e83863212775e185f6f4d9a519d37b9
02f93884f110d28043e6a9f93402b012b26f2016
```

Karena itu, status tersebut **tidak boleh dinyatakan CI green secara langsung** hanya berdasarkan workflow sebelumnya.

Last confirmed full CI baseline tetap:

```text
34173556164
```

---

# 15. Kondisi CSS Repository Saat Ini

`app/layout.tsx` masih mengimpor sejumlah stylesheet global:

```text
globals.css
polish.css
header-portal.css
theme-polish.css
assets-polish.css
quality-polish.css
mobile-polish.css
popular-polish.css
embed-polish.css
admin.css
admin-settings.css
dark-mode-fixes.css
design-tokens.css
```

Beberapa file masih memiliki ownership yang beririsan.

### `app/polish.css`

Masih memuat banyak styling home/page/component dan responsive rules. Global interaction baseline sudah dipindahkan keluar.

### `app/header-portal.css`

Memegang struktur header dan responsive CSS, tetapi masih mengandung hard-coded light colors seperti:

```text
#9aa0a9
#eceef2
#686e78
#dfe1e7
#767c85
#4f5661
```

### `app/theme-polish.css`

Memegang theme-specific overrides dan sebagian dark-mode behavior.

### `app/dark-mode-fixes.css`

Merupakan completion layer besar yang mencakup public layout, management, finance, filters, tables, article, header control consistency, dan admin.

Masih terdapat kombinasi antara tokenized color dan hard-coded color.

### `app/design-tokens.css`

Saat ini mencakup:

- light tokens;
- dark tokens;
- compatibility aliases seperti `--green`, `--green-dark`, `--gold`, `--ink`, `--muted`, `--line`, `--canvas`, `--white`;
- typography;
- radius;
- spacing;
- transition tokens;
- body/container base styles;
- tap-highlight;
- focus-visible;
- selection;
- global transition;
- disabled cursor;
- reduced motion;
- dark-mode homepage normalization.

Ini adalah kandidat utama untuk pemisahan ownership berikutnya.

---

# 16. Supabase — Temuan yang Belum Diubah

Tidak ada schema/RLS change yang dilakukan dalam rangkaian L1–L11.

Project:

```text
Miftahul Mubin
ref: xzcwmplikcavrbiuuxcc
region: ap-northeast-2
PostgreSQL: 17.6.1.166
```

Production memiliki 36 migrations.

Repository memiliki dua initial schema SQL dengan histori yang berbeda:

```text
supabase/migrations/0001_initial_schema.sql
supabase/migrations/20260831_000001_initial_schema.sql
```

Migrations lama tidak boleh dihapus, diubah, atau di-reorder hanya untuk cleanup repository.

### Security advisor findings

- mutable `search_path` pada `public.set_site_settings_updated_at`;
- execute exposure pada sejumlah `SECURITY DEFINER` functions;
- leaked password protection disabled.

### Performance advisor findings

- missing covering index untuk `site_settings_updated_by_fkey`;
- beberapa unused indexes terdeteksi;
- beberapa permissive RLS policies.

Temuan tersebut belum disentuh karena perubahan schema/RLS harus masuk workflow audit terpisah dengan C checkpoint tersendiri.

---

# 17. Daftar Commit Historis Utama

```text
34418ae7bc0b571c43af7fe4e5cee54f28b4a7f7
refactor(types): remove content dataset dependency from FilterableEvents

b8a515c61ee1431458f68baed182e10a2f80db2d
refactor(data): remove legacy static content datasets

348f45b2d0f045dc7402371ff4cba07e3846eba3
fix(refactor): preserve FilterableNews behavior

dc03c12bf39dffb24750cb3345c687222a9f2502
refactor(css): remove duplicate root theme tokens

4b5c0bf80ce865b006c3c357b43a517606bc5e30
refactor(css): reuse canonical focus token

dc4a42e4d501d48b242d9b17ab91c41eb7ae8f49
refactor(css): colocate profile image overrides

02cb771cdd1ec60c2a0fa29f433e269bbfb59148
refactor(css): remove redundant stylesheet imports

b10292077bf35c1ae7a9fbee6923b219e5e229f1
refactor(css): remove redundant management photo fix

e5f26e2fb7c2660cd393e4d2dabf36ffaa0bef42
refactor(css): remove redundant profile stylesheet

c0f722baeab2fbb35fcc9fb20ad7dfcba798b2e4
fix(typecheck): normalize nullable news timestamps

3b0e6cd48f6c810757047a232a2802d3c84e1a75
fix(typecheck): remove unsupported news categoryId

5b782d100c8cc23f9b0caed8cf9bb66fe40b2776
refactor: remove unused legacy content types

d519155b652283ee290cf42441d164219e5af479b
refactor: remove duplicate dark mode table heading rule

d20dc4cc16379ee0183ac94c389e1820f9453bf8
fix(typecheck): migrate article detail type import

d84195208ec70683246c4df2c95ae84ccabc450f
fix(typecheck): migrate event detail type import

4b2293ff0a10a147a97750c16974ce53b8a68116
fix(typecheck): migrate live article type import

1ea3423b72000f50a2e518e013936f39e6d1cf53
fix(typecheck): migrate live event type import

df8112f0e703f72e1c0334d97748de421e0d959b
refactor(css): remove duplicate header dark mode layer

02f93884f110d28043e6a9f93402b012b26f2016
refactor(css): move global interaction rules out of polish layer

eda310f94e83863212775e185f6f4d9a519d37b9
refactor(css): centralize global interaction baseline
```

---

# 18. Pelajaran Teknis dari L1–L11

## 18.1 Delete harus mengikuti consumer graph

Menghapus file legacy sebelum seluruh consumer dipindahkan menghasilkan regresi yang sebenarnya dapat diprediksi dari dependency graph.

Workflow yang lebih aman:

```text
Search consumers
    ↓
Migrate consumers
    ↓
Typecheck/build
    ↓
Delete legacy file
    ↓
Validate
```

Bukan:

```text
Delete
    ↓
Discover consumers
    ↓
Repair
```

## 18.2 CSS harus memiliki ownership yang jelas

Satu selector/behavior idealnya memiliki satu lokasi canonical. Jika behavior yang sama muncul di beberapa stylesheet, perubahan kecil dapat menghasilkan cascade yang sulit diprediksi.

## 18.3 Token dan base styles sebaiknya dipisahkan

Design tokens sebaiknya berfungsi sebagai sumber nilai. Global base rules dan theme normalization sebaiknya tidak ikut bercampur secara berlebihan.

## 18.4 Refactor tidak sama dengan perubahan behavior

Target utama refactor adalah mengubah struktur internal dengan behavior eksternal tetap ekuivalen.

## 18.5 CI adalah checkpoint teknis

Audit dapat menyatakan suatu dependency tampak aman untuk dihapus, tetapi validasi build/typecheck/deployment tetap menjadi gate penting sebelum perubahan dianggap selesai.

---

# 19. Next Phase yang Direkomendasikan

Urutan lanjutan yang konsisten dengan C11:

### C12 — Verifikasi HEAD

Tujuan:

- memastikan commit `eda310f...` benar-benar tervalidasi;
- memperoleh baseline CI terkini sebelum refactor CSS berikutnya.

### L12 — Pisahkan design tokens dari global base CSS

Target kandidat:

```text
app/design-tokens.css
```

Pemisahan harus menjaga:

- token value;
- compatibility aliases jika masih dibutuhkan;
- theme tokens;
- global base rules;
- interaction rules.

### C13 — Audit hard-coded colors

Identifikasi:

- warna yang sudah memiliki token;
- warna yang benar-benar unik dan perlu dipertahankan;
- duplicate semantic color.

### L13 — Theme color consolidation

Mengurangi hard-coded color tanpa memaksa semua warna menjadi token apabila memang tidak memiliki semantic reuse.

### C14 — Audit stylesheet overlap

Mencari selector yang:

- didefinisikan lebih dari satu kali;
- hanya berbeda karena cascade;
- mempunyai owner yang tidak jelas;
- sudah tidak memiliki consumer.

### L14 — Dead CSS cleanup

Hanya menghapus rule yang sudah diverifikasi tidak digunakan.

### Final optimization

Setelah struktur stabil:

- kurangi import global yang tidak perlu;
- kurangi cascade depth;
- pertahankan static export;
- pastikan build dan deployment tetap valid.

---

# 20. Current HEAD

Pada saat dokumentasi dibuat:

```text
HEAD: eda310f94e83863212775e185f6f4d9a519d37b9
Commit: refactor(css): centralize global interaction baseline
Branch: main
```

Dokumen ini merupakan snapshot historis sampai fase L11. Setiap perubahan berikutnya sebaiknya diperbarui melalui checkpoint baru agar riwayat keputusan, risiko, dan validasi tetap terlacak.
