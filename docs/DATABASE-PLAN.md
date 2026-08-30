# Miftahul Mubin — Database Plan

Rancangan awal untuk Supabase PostgreSQL. Nama tabel dan field dapat disesuaikan saat implementasi migration.

## Core Tables

### profiles
- id
- user_id
- full_name
- avatar_url
- phone
- created_at
- updated_at

### roles
- id
- name

### user_roles
- user_id
- role_id

### news
- id
- title
- slug
- excerpt
- content
- thumbnail_url
- category_id
- author_id
- status
- published_at
- view_count
- created_at
- updated_at

### categories
- id
- name
- slug
- type

`type` membedakan kategori berita, keislaman, kegiatan, dan pengumuman.

### events
- id
- title
- slug
- description
- event_date
- start_time
- end_time
- location
- speaker
- status
- cover_url
- created_at
- updated_at

### announcements
- id
- title
- content
- status
- published_at
- author_id
- created_at
- updated_at

### management_periods
- id
- name
- start_date
- end_date
- is_active

### management_members
- id
- period_id
- name
- position
- photo_url
- bio
- sort_order
- created_at

### media_albums
- id
- title
- slug
- description
- cover_url
- created_at

### media_items
- id
- album_id
- type
- title
- url
- thumbnail_url
- caption
- sort_order
- created_at

## Finance Tables

### finance_categories
- id
- name
- type (`income` / `expense`)
- description

### finance_transactions
- id
- transaction_date
- type (`income` / `expense`)
- category_id
- description
- amount
- proof_url
- created_by
- status
- created_at
- updated_at

### finance_periods
- id
- year
- month
- opening_balance
- published_at
- created_at
- updated_at

Saldo publik dihitung dari opening balance + income - expense berdasarkan aturan periode yang ditetapkan aplikasi.

## Future Audit Table

### audit_logs
- id
- actor_id
- entity_type
- entity_id
- action
- old_data
- new_data
- created_at

Audit log diprioritaskan untuk transaksi keuangan dan aksi administratif sensitif.

## Storage Buckets

- `site-assets` — logo, favicon, branding
- `news-media` — thumbnail dan media berita
- `event-media` — poster dan dokumentasi kegiatan
- `management-media` — foto pengurus
- `gallery-media` — album foto/video
- `finance-proofs` — bukti transaksi

Bucket `finance-proofs` harus memiliki policy akses paling ketat.

## Row Level Security Direction

- Public dapat membaca hanya data dengan status `published`/public.
- Role admin dapat membaca dan menulis sesuai permission.
- Treasurer dapat mengelola finance transactions.
- Public tidak boleh mengakses private finance proof files secara langsung.
- User tidak boleh mengubah role dirinya sendiri.
