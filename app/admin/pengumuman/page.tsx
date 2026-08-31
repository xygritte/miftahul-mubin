import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminContentManager from '@/components/admin/AdminContentManager'

export default function AdminPengumumanPage(){return <AdminAuthGuard><AdminShell><div className="admin-page-heading"><span className="eyebrow">CMS</span><h1>Kelola Pengumuman</h1><p>Tambah, edit, publikasikan, arsipkan, dan hapus pengumuman resmi.</p></div><AdminContentManager mode="announcements" /></AdminShell></AdminAuthGuard>}
