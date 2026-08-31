import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminStorageManager from '@/components/admin/AdminStorageManager'

export default function AdminStoragePage() {
  return <AdminAuthGuard><AdminShell><div className="admin-page-heading"><span className="eyebrow">Media Storage</span><h1>Kelola Storage</h1><p>Upload, lihat, buka, salin path, dan hapus file di Supabase Storage sesuai role pengelola.</p></div><AdminStorageManager /></AdminShell></AdminAuthGuard>
}
