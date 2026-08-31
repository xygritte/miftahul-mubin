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

## Current implementation

`lib/data/staticRepository.ts` menyediakan implementasi dummy sehingga frontend dapat menggunakan kontrak yang sama sebelum Supabase aktif.

`lib/data/index.ts` menjadi satu entry point repository.

## Future implementation

Buat `lib/data/supabaseRepository.ts` yang mengimplementasikan `PublicContentRepository`.
Ganti hanya binding pada `lib/data/index.ts` setelah environment Supabase tersedia.

Tidak perlu mengubah komponen presentasional untuk migrasi tersebut.
