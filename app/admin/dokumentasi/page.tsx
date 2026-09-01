import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminDocumentationManager from '@/components/admin/AdminDocumentationManager'

export default function AdminDokumentasiPage(){return <AdminAuthGuard><AdminShell><div className="admin-page-heading"><span className="eyebrow">Media</span><h1>Kelola Dokumentasi</h1><p>Kelola album dan media foto/video beserta upload lokal, caption, dan urutan tampil.</p></div><AdminDocumentationManager /></AdminShell></AdminAuthGuard>}
