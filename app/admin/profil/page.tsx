import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminSiteSettingsManager from '@/components/admin/AdminSiteSettingsManager'

export default function AdminProfilPage(){return <AdminAuthGuard><AdminShell><div className="admin-page-heading"><span className="eyebrow">Pengaturan Situs</span><h1>Kelola Profil</h1><p>Ubah identitas, deskripsi, visi, misi, fasilitas, dan informasi statistik pada halaman profil.</p></div><AdminSiteSettingsManager mode="profile" /></AdminShell></AdminAuthGuard>}
