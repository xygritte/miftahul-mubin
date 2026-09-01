import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminEventManager from '@/components/admin/AdminEventManagerV2'

export default function AdminKegiatanPage(){return <AdminAuthGuard><AdminShell><div className="admin-page-heading"><span className="eyebrow">CMS</span><h1>Kelola Kegiatan</h1><p>Tambah, edit, publikasikan, arsipkan, dan hapus agenda kegiatan.</p></div><AdminEventManager /></AdminShell></AdminAuthGuard>}
