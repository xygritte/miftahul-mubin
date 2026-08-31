import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminNewsManager from '@/components/admin/AdminNewsManager'

export default function AdminBeritaPage(){return <AdminAuthGuard><AdminShell><div className="admin-page-heading"><span className="eyebrow">CMS</span><h1>Kelola Berita</h1><p>Tambah, edit, publikasikan, dan kelola berita Masjid Miftahul Mubin.</p></div><AdminNewsManager /></AdminShell></AdminAuthGuard>}
