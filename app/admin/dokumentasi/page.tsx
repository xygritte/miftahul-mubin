import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminContentManager from '@/components/admin/AdminContentManager'
import AdminDocumentationAlbums from '@/components/admin/AdminDocumentationAlbums'

export default function AdminDokumentasiPage(){return <AdminAuthGuard><AdminShell><div className="admin-page-heading"><span className="eyebrow">Media</span><h1>Kelola Dokumentasi</h1><p>Kelola album dan media foto/video beserta URL, thumbnail, caption, dan urutan tampil.</p></div><AdminDocumentationAlbums /><AdminContentManager mode="documentation" /></AdminShell></AdminAuthGuard>}
