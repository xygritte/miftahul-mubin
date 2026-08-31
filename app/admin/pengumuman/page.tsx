import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminModulePlaceholder from '@/components/admin/AdminModulePlaceholder'

export default function AdminPengumumanPage(){return <AdminAuthGuard><AdminShell><AdminModulePlaceholder title="Kelola Pengumuman" description="Modul ini akan menangani informasi resmi, status publikasi, jadwal tayang, dan arsip pengumuman." /></AdminShell></AdminAuthGuard>}
