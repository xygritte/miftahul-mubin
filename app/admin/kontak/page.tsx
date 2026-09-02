import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminSiteSettingsManager from '@/components/admin/AdminSiteSettingsManager'

export default function AdminKontakPage(){return <AdminAuthGuard><AdminShell><div className="admin-page-heading"><span className="eyebrow">Pengaturan Situs</span><h1>Kelola Kontak</h1><p>Ubah alamat, telepon, email, jam layanan, dan lokasi Google Maps yang tampil pada halaman kontak.</p></div><AdminSiteSettingsManager mode="contact" /></AdminShell></AdminAuthGuard>}
