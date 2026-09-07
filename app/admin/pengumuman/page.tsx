import AdminShell from '@/components/admin/AdminShell'
import AdminAnnouncementManager from '@/components/admin/AdminAnnouncementManager'

export default function AdminPengumumanPage() {
  return (
    <AdminShell>
      <div className="admin-page-heading">
        <span className="eyebrow">CMS</span>
        <h1>Kelola Pengumuman</h1>
        <p>Tambah, edit, publikasikan, arsipkan, dan hapus pengumuman resmi.</p>
      </div>
      <AdminAnnouncementManager />
    </AdminShell>
  )
}
