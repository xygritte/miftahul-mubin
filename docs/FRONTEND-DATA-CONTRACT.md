# Frontend Data Contract

Frontend publik tidak boleh bergantung langsung pada detail Supabase.

## Boundary

```text
Next.js pages/components
        |
        v
PublicContentRepository
        |
   +----+----+
   |         |
Static     Supabase
adapter    adapter
```

## Rules

1. Komponen UI menerima props berbentuk record domain.
2. Query database tidak ditulis di komponen presentasional.
3. Transformasi field database → field UI dilakukan di data/repository layer.
4. Status publik selalu dibatasi pada record yang memang boleh ditampilkan.
5. Slug adalah identifier URL, sedangkan UUID menjadi identifier database.
6. Media menggunakan URL abstrak; storage provider tidak diketahui oleh UI.
7. Data keuangan menggunakan `number` di boundary UI dan `numeric` di database.
8. Finance proof tidak boleh dianggap public URL; UI harus siap menerima signed URL.
9. Server pages mengambil data melalui `contentRepository`; client components hanya menerima data yang sudah siap presentasi.
10. Filter dan interaksi client tidak boleh melakukan query database langsung.

## Current implementation

`lib/data/index.ts` menjadi satu entry point repository.

`lib/data/staticRepository.ts` menyediakan fallback dummy untuk local development tanpa environment Supabase.

`lib/data/supabaseRepository.ts` menyediakan implementasi publik berbasis Supabase.

`lib/data/presentation.ts` menjadi adapter presentasi untuk mengubah domain record menjadi bentuk yang dibutuhkan komponen UI.

`components/layout/SiteShell.tsx` menyediakan search index ke Header tanpa membocorkan detail query Supabase ke komponen client.

## Static export note

GitHub Pages menggunakan static export. Data dari Supabase untuk halaman publik diambil pada saat proses build. Perubahan konten setelah deployment tidak muncul sampai deployment/build berikutnya.

Ketika aplikasi pindah ke hosting dengan runtime server, repository layer dapat dipertahankan dan implementasi data dapat dikembangkan menjadi SSR/ISR tanpa membongkar komponen presentasional.

## Future implementation

Admin CMS akan menggunakan Supabase Auth + RLS dan tidak boleh menggunakan `service_role` di browser.

Query write, signed media URL, audit log, dan operasi administratif ditempatkan di boundary server/admin, bukan di komponen publik.
