import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminContentManager from '@/components/admin/AdminContentManager'

export default function AdminKepengurusanPage(){return <AdminAuthGuard><AdminShell><div className="admin-page-heading"><span className="eyebrow">Organisasi</span><h1>Kelola Kepengurusan</h1><p>Kelola periode kepengurusan dan anggota, jabatan, urutan, foto, serta status aktif.</p></div><AdminContentManager mode="management" /></AdminShell></AdminAuthGuard>}
