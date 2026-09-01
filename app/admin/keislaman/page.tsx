import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminIslamicManager from '@/components/admin/AdminIslamicManager'

export default function AdminKeislamanPage() {
  return (
    <AdminAuthGuard>
      <AdminShell>
        <div className="admin-page-heading">
          <span className="eyebrow">CMS</span>
          <h1>Kelola Keislaman</h1>
          <p>Kelola artikel, kategori, konten, dan status publikasi materi keislaman.</p>
        </div>
        <AdminIslamicManager />
      </AdminShell>
    </AdminAuthGuard>
  )
}
