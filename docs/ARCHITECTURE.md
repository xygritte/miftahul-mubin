# Miftahul Mubin — System Architecture

## 1. Product Vision

Miftahul Mubin adalah portal digital masjid dengan gaya editorial/news portal. Fokusnya adalah membuat informasi masjid mudah ditemukan, rutin diperbarui, dan dapat dipercaya oleh jamaah.

Produk terdiri dari dua area:

1. **Public Portal** — dibaca jamaah dan masyarakat.
2. **Admin Panel** — digunakan pengurus untuk mengelola konten dan administrasi.

## 2. Public Modules

- Home / portal overview
- Berita
- Keislaman
- Kegiatan & agenda
- Pengumuman
- Dokumentasi foto/video
- Profil masjid
- Kepengurusan
- Transparansi keuangan
- Kontak & lokasi

## 3. Admin Modules

- Dashboard
- News / Artikel / Pengumuman
- Kegiatan
- Keislaman / Khutbah
- Dokumentasi
- Kepengurusan
- Keuangan
- User & role
- Pengaturan website

## 4. Architectural Layers

```text
Browser
  |
  v
Next.js App Router
  |
  +-------------------+------------------+
  |                   |                  |
  v                   v                  v
Public Pages      Admin Pages       Shared Components
  |                   |                  |
  +-------------------+------------------+
                      |
                      v
              Server Actions / API
                      |
                      v
                   Supabase
          +-----------+------------+
          |           |            |
       Postgres      Auth        Storage
```

## 5. Technology Plan

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Responsive-first design

### Backend / Data

- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage

### Deployment

- Vercel

## 6. Core Principles

### Editorial-first

Berita dan kegiatan menjadi konten utama homepage. Layout mengambil pola portal editorial, bukan landing page pemasaran.

### Mobile-first

Sebagian besar jamaah kemungkinan mengakses melalui ponsel. Semua layout wajib nyaman pada lebar mobile sebelum dioptimalkan untuk desktop.

### Content managed

Konten tidak ditulis permanen di source code. Berita, agenda, pengumuman, pengurus, galeri, dan transaksi keuangan berasal dari database.

### Permission-aware

Akses admin dibatasi berdasarkan role. Bendahara tidak otomatis memiliki hak mengubah konten berita, dan editor berita tidak otomatis memiliki hak mengubah transaksi keuangan.

### Financial auditability

Transaksi keuangan menyimpan tanggal, tipe, kategori, nominal, keterangan, dan opsional bukti transaksi. Perubahan penting harus dapat dilacak melalui metadata audit pada tahap implementasi.

## 7. Route Map

```text
Public
/                         Home
/berita                    Listing berita
/berita/[slug]             Detail berita
/keislaman                 Listing keislaman
/keislaman/[slug]          Detail konten keislaman
/kegiatan                  Listing kegiatan
/kegiatan/[slug]           Detail kegiatan
/pengumuman                Listing pengumuman
/dokumentasi               Galeri foto/video
/profil                    Profil masjid
/kepengurusan              Struktur pengurus
/keuangan                  Transparansi keuangan
/keuangan/[period]         Laporan periode
/kontak                    Kontak dan lokasi

Admin
/admin                     Dashboard
/admin/berita              Kelola berita
/admin/keislaman           Kelola konten keislaman
/admin/kegiatan            Kelola kegiatan
/admin/pengumuman          Kelola pengumuman
/admin/dokumentasi         Kelola media
/admin/pengurus            Kelola kepengurusan
/admin/keuangan            Kelola transaksi
/admin/pengguna            Kelola pengguna & role
/admin/pengaturan          Pengaturan website
```

## 8. Data Ownership

| Modul | Primary owner |
|---|---|
| Berita | Admin Berita |
| Keislaman/Khutbah | Admin Berita / Editor |
| Kegiatan | Admin Kegiatan |
| Dokumentasi | Admin Kegiatan / Dokumentasi |
| Pengurus | Sekretariat / Super Admin |
| Keuangan | Bendahara |
| User & Role | Super Admin |
| Pengaturan | Super Admin |

## 9. Non-Goals for First Release

- Forum diskusi publik
- Chat real-time
- E-commerce / toko
- Donasi online dengan payment gateway
- Mobile application native

Fitur-fitur tersebut dapat dipertimbangkan setelah portal inti stabil.
