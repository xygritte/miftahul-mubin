import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminModulePlaceholder from '@/components/admin/AdminModulePlaceholder'

export default function AdminBeritaPage(){return <AdminAuthGuard><AdminShell><AdminModulePlaceholder title="Kelola Berita" description="Modul ini akan menangani pembuatan, penyuntingan, draft, publikasi, kategori, dan metadata berita." /></AdminShell></AdminAuthGuard>}
