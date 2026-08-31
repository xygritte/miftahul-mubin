import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminModulePlaceholder from '@/components/admin/AdminModulePlaceholder'

export default function AdminKeislamanPage(){return <AdminAuthGuard><AdminShell><AdminModulePlaceholder title="Kelola Keislaman" description="Modul ini akan menangani artikel, materi kajian, kategori, konten, dan publikasi materi keislaman." /></AdminShell></AdminAuthGuard>}
