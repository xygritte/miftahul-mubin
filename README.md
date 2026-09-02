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

## Rencana Improvement

Dokumen ini menjadi backlog utama pengembangan website setelah fondasi yang ada stabil. Prioritas dapat berubah mengikuti kebutuhan operasional masjid, tetapi pekerjaan sebaiknya mengikuti urutan fase agar perubahan besar tidak dilakukan sebelum fondasi siap.

### Fase A — Foundation & Stability

Fokus: memastikan arsitektur, data, deployment, dan pengalaman dasar stabil sebelum menambah banyak fitur.

- Pisahkan static shell dan live data secara lebih tegas agar tidak terjadi stale-data flash.
- Konsolidasikan seluruh akses data melalui satu data-access/repository layer.
- Generate dan gunakan typed Supabase schema agar kontrak database dan TypeScript selalu sinkron.
- Audit loading, error, empty state, fallback, dan realtime pada seluruh modul publik dan admin.
- Bersihkan dead code, placeholder manager, dan branch lama yang tidak lagi digunakan.
- Perkuat CI/CD: typecheck, build, smoke test, route test, dan validasi konfigurasi environment.
- Tambahkan test dasar untuk repository, auth guard, form validation, dan komponen kritis.

### Fase B — CMS, Category, Content & Media

Fokus: menjadikan admin CMS siap digunakan sebagai sistem editorial harian.

#### Content management

- Pastikan setiap modul konten memiliki CRUD yang konsisten.
- Integrasikan dropdown kategori dari tabel `categories` ke form berita, keislaman, kegiatan, pengumuman, dan galeri.
- Buat category management di admin sehingga kategori dapat dibuat, diubah, dan diarsipkan tanpa menyentuh database secara manual.
- Tambahkan rich text editor untuk artikel dan konten panjang.
- Tambahkan draft, preview, publish, schedule, dan archive.
- Tambahkan autosave untuk draft.
- Tambahkan bulk action: publish, archive, delete, dan perubahan kategori.
- Tambahkan media picker agar gambar yang sudah di-upload dapat digunakan kembali.

#### Media management

- Optimasi ukuran dan dimensi gambar sebelum upload.
- Tambahkan metadata media: alt text, caption, credit, dan focal point.
- Buat thumbnail otomatis untuk kebutuhan card, list, dan detail.
- Rapikan pengelolaan storage berdasarkan jenis konten.
- Tambahkan validasi ukuran, tipe file, dan nama file.

### Fase C — Admin CMS Profesional

Fokus: membuat admin nyaman digunakan di desktop maupun mobile dan siap dipakai lebih dari satu pengelola.

- Dashboard admin dengan ringkasan konten, kegiatan, keuangan, media, dan aktivitas terbaru.
- Perbaiki responsive admin khusus untuk layar HP.
- Buat workflow editorial: `Draft → Review → Approved → Scheduled → Published → Archived`.
- Tambahkan granular permissions berdasarkan role dan modul.
- Tambahkan user management untuk pengguna admin.
- Sempurnakan audit log viewer untuk aktivitas penting.
- Tambahkan filter, search, sorting, pagination, dan bulk actions di tabel admin.
- Tambahkan konfirmasi yang aman untuk operasi destruktif.
- Tambahkan preview sebelum publish.

### Fase D — Public Portal & UX

Fokus: meningkatkan kualitas website yang dilihat jamaah dan masyarakat.

#### Beranda

- Jadikan hero benar-benar CMS-driven.
- Tambahkan featured content yang dapat dipilih admin.
- Tambahkan pengaturan visibility dan urutan section dari admin.
- Tambahkan section agenda terdekat, berita terbaru, kajian, pengumuman, dan dokumentasi.
- Perkuat empty state agar tampilan tetap rapi ketika database belum berisi konten.

#### Profil & kontak

- Tambahkan sejarah masjid.
- Tambahkan timeline perkembangan masjid.
- Tambahkan fasilitas dan galeri fasilitas.
- Tambahkan dokumen profil yang dapat diunduh.
- Tambahkan informasi sosial media.
- Tambahkan tombol WhatsApp.
- Tambahkan koordinat lokasi yang dapat diedit dari admin.
- Tambahkan informasi jam layanan yang dapat dikonfigurasi.

#### Kepengurusan

- Tambahkan struktur organisasi yang lebih jelas.
- Kelompokkan pengurus berdasarkan jabatan/departemen.
- Tambahkan periode kepengurusan aktif dan arsip periode lama.
- Dukungan foto, bio singkat, dan informasi kontak sesuai kebutuhan.

#### Keuangan

- Dashboard pemasukan dan pengeluaran.
- Filter periode, kategori, dan jenis transaksi.
- Grafik ringkas untuk transparansi publik.
- Rekonsiliasi dan validasi transaksi di admin.
- Bukti transaksi yang aman melalui private storage.
- Audit perubahan transaksi.

#### Search

- Tingkatkan pencarian menjadi fuzzy/full-text search.
- Ranking hasil berdasarkan relevansi dan tanggal.
- Filter berdasarkan tipe konten, kategori, dan periode.
- Pastikan hasil pencarian konsisten dengan data live Supabase.

### Fase E — SEO, Accessibility, Performance & Reliability

Fokus: membuat portal cepat, mudah ditemukan, dan lebih mudah digunakan oleh semua pengguna.

- Metadata dinamis untuk halaman dan detail konten.
- Open Graph dan social sharing image.
- Structured data/schema.org untuk artikel, event, organisasi, dan lokasi bila relevan.
- Sitemap dinamis dan RSS/feed bila diperlukan.
- Canonical URL dan penanganan metadata untuk static export.
- Audit accessibility menuju standar WCAG yang relevan.
- Keyboard navigation dan focus state yang konsisten.
- Perbaikan contrast dan typography.
- Optimasi font, image loading, bundle, dan caching.
- Pagination/infinite loading untuk dataset besar.
- Optimasi query Supabase dan index berdasarkan pola penggunaan nyata.
- Monitoring error dan performa.
- Smoke test publik setelah deployment.

### Fase F — Fitur Operasional Masjid

Fokus: mengubah portal dari sekadar CMS menjadi sistem informasi yang lebih berguna untuk jamaah.

- Jadwal salat.
- Countdown menuju waktu salat berikutnya.
- Kalender hijriah dan kalender kegiatan masjid.
- Pengumuman penting yang dapat diprioritaskan.
- Donasi dan informasi rekening resmi.
- Form permintaan layanan masjid.
- Sistem notifikasi untuk pengumuman/kegiatan penting.
- Integrasi sosial media bila dibutuhkan.
- PWA/installable web untuk akses cepat dari perangkat mobile.

### Fase G — Security, Backup & Production Readiness

Fokus: memastikan aplikasi siap dipelihara dalam jangka panjang.

- Audit berkala RLS, grants, policy, dan SECURITY DEFINER function.
- Granular role/permission tanpa memberikan akses database berlebih.
- Review bucket policy dan private/public storage.
- Rate limiting dan proteksi abuse pada endpoint yang relevan.
- Backup database dan prosedur restore yang terdokumentasi.
- Audit dependency dan update package secara berkala.
- Dokumentasi incident recovery.
- Review apakah GitHub Pages masih sesuai atau perlu pindah ke Vercel/runtime server ketika membutuhkan ISR, server-side logic, preview deployment, atau fitur backend tambahan.

## Prioritas Implementasi

Urutan prioritas yang disarankan:

```text
1. Foundation & stability
2. Category + CMS + media
3. Admin workflow + roles + audit
4. Homepage + profile/contact + management + finance UX
5. Search + SEO + accessibility + performance
6. Fitur operasional masjid
7. Security hardening + backup + production runtime
```

## Improvement Berikutnya

Item pertama yang paling tepat setelah fondasi stabil adalah **integrasi kategori ke seluruh form CMS**. Data kategori sudah tersedia di Supabase; langkah berikutnya adalah memastikan setiap form konten mengambil kategori secara dinamis, menyimpan `category_id`, menampilkan nama kategori secara konsisten, dan menangani kondisi kategori kosong/nonaktif dengan aman.

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
