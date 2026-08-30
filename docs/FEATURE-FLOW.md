# Miftahul Mubin — Feature Flow

## 1. Public User Flow

```text
Visitor
  |
  v
Home
  |
  +--> Berita --> Detail Berita --> Berita Terkait
  |
  +--> Keislaman --> Detail --> Related Content
  |
  +--> Kegiatan --> Detail Kegiatan
  |
  +--> Pengumuman --> Detail Pengumuman
  |
  +--> Dokumentasi --> Album --> Foto/Video
  |
  +--> Kepengurusan --> Profil Pengurus
  |
  +--> Keuangan --> Pilih Periode --> Ringkasan --> Detail Transaksi
  |
  +--> Profil / Kontak
```

## 2. Homepage Flow

Homepage disusun sebagai portal editorial:

```text
Header
  -> Navigation
  -> Search

Hero / Featured Story
  -> Berita utama
  -> Berita pendamping

Terpopuler
  -> Ranking berdasarkan views

Berita Terkini
  -> Artikel terbaru

Agenda Terdekat
  -> Upcoming events

Keislaman
  -> Artikel, kajian, khutbah

Video / Dokumentasi
  -> Media terbaru

Kegiatan Sosial
  -> Highlight kegiatan masyarakat

Transparansi Keuangan
  -> Total pemasukan
  -> Total pengeluaran
  -> Saldo
  -> Link laporan lengkap

Footer
```

## 3. Authentication Flow

```text
/admin
  |
  v
Login
  |
  +-- gagal --> pesan error
  |
  +-- berhasil --> cek role
                     |
                     +-- super_admin --> full dashboard
                     +-- editor       --> content modules
                     +-- event_admin  --> kegiatan & media
                     +-- treasurer    --> keuangan
                     +-- secretary    --> pengurus/pengumuman
```

## 4. News Flow

```text
Admin Berita
  -> Buat Draft
  -> Isi judul, kategori, thumbnail, isi
  -> Simpan Draft
  -> Review
  -> Publish
  -> Tampil di Public Portal
  -> Hit view bertambah saat dibaca
  -> Masuk ranking Terpopuler sesuai aturan ranking
```

Status content:

`draft -> published -> archived`

## 5. Event Flow

```text
Admin Kegiatan
  -> Buat agenda
  -> Judul + tanggal + waktu + lokasi
  -> Pemateri / penanggung jawab
  -> Deskripsi + poster/foto
  -> Publish
  -> Muncul di Agenda Terdekat
  -> Setelah tanggal lewat -> status Selesai
```

## 6. Financial Flow

```text
Bendahara
  -> Tambah transaksi
       |
       +-- Pemasukan
       |     -> kategori
       |     -> nominal
       |     -> tanggal
       |     -> keterangan
       |     -> bukti
       |
       +-- Pengeluaran
             -> kategori
             -> nominal
             -> tanggal
             -> keterangan
             -> bukti

                |
                v
        Database transaksi
                |
                v
      Perhitungan periode
        /      |       \
       v       v        v
   pemasukan pengeluaran saldo
                |
                v
       Public transparency
```

Saldo akhir periode mengikuti prinsip:

`saldo_awal + total_pemasukan - total_pengeluaran`

## 7. Management / Pengurus Flow

```text
Sekretariat / Super Admin
  -> Tambah periode kepengurusan
  -> Tambah anggota
  -> Tentukan jabatan
  -> Upload foto
  -> Publish
  -> Struktur tampil di halaman Kepengurusan
```

## 8. Media Flow

```text
Admin
  -> Upload image/video
  -> Storage
  -> Metadata media disimpan di database
  -> Hubungkan media ke berita/kegiatan/album
  -> Public page menampilkan media teroptimasi
```

## 9. Search Flow

```text
User
  -> Search keyword
  -> Search berita + keislaman + kegiatan + pengumuman
  -> Filter kategori
  -> Filter tanggal (opsional)
  -> Hasil relevan
```

## 10. Permission Matrix

| Feature | Super Admin | Editor | Event Admin | Treasurer | Secretary |
|---|---:|---:|---:|---:|---:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Berita | ✓ | ✓ | — | — | — |
| Keislaman | ✓ | ✓ | — | — | — |
| Kegiatan | ✓ | — | ✓ | — | ✓ |
| Dokumentasi | ✓ | ✓ | ✓ | — | ✓ |
| Pengumuman | ✓ | ✓ | ✓ | — | ✓ |
| Pengurus | ✓ | — | — | — | ✓ |
| Keuangan | ✓ | — | — | ✓ | read-only |
| Users & Roles | ✓ | — | — | — | — |
| Pengaturan | ✓ | — | — | — | — |

## 11. Financial Publishing Rule

Perubahan transaksi dilakukan oleh Bendahara. Data yang sudah dipublish ke laporan publik tidak boleh diam-diam diubah tanpa metadata audit. Mekanisme final untuk correction/reversal akan ditentukan saat schema database dibuat.
