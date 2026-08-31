import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminModulePlaceholder from '@/components/admin/AdminModulePlaceholder'

export default function AdminKegiatanPage(){return <AdminAuthGuard><AdminShell><AdminModulePlaceholder title="Kelola Kegiatan" description="Modul ini akan menangani agenda, waktu, lokasi, kategori, narahubung, dan status publikasi kegiatan." /></AdminShell></AdminAuthGuard>}
