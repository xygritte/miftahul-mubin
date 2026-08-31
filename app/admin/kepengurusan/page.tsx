import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminModulePlaceholder from '@/components/admin/AdminModulePlaceholder'

export default function AdminKepengurusanPage(){return <AdminAuthGuard><AdminShell><AdminModulePlaceholder title="Kelola Kepengurusan" description="Modul ini akan menangani periode kepengurusan, anggota, jabatan, urutan struktur, foto, dan status aktif." /></AdminShell></AdminAuthGuard>}
