import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'

const modules = [
  ['Berita', 'Terbitkan dan kelola informasi terbaru masjid.', '/admin/berita/'],
  ['Kegiatan', 'Atur agenda kajian, sosial, pendidikan, dan pemuda.', '/admin/kegiatan/'],
  ['Keislaman', 'Kelola materi, kajian, dan artikel keislaman.', '/admin/keislaman/'],
  ['Pengumuman', 'Sampaikan informasi resmi kepada jamaah.', '/admin/pengumuman/'],
  ['Kepengurusan', 'Atur periode dan anggota pengurus aktif.', '/admin/kepengurusan/'],
  ['Dokumentasi', 'Kelola album dan arsip visual kegiatan.', '/admin/dokumentasi/'],
  ['Keuangan', 'Kelola periode dan transaksi transparansi masjid.', '/admin/keuangan/'],
] as const

export default function AdminDashboardPage() {
  return <AdminAuthGuard><AdminShell><section className="admin-page-heading"><span className="eyebrow">Dashboard</span><h1>Selamat datang di panel pengelola.</h1><p>Fondasi administrasi Miftahul Mubin sudah terhubung dengan Supabase. Pilih modul yang ingin dikelola.</p></section><section className="admin-overview-grid" aria-label="Modul pengelolaan">{modules.map(([title, description, href], index) => <a className="admin-module-card" key={title} href={href}><span>0{index + 1}</span><strong>{title}</strong><p>{description}</p><small>Buka modul →</small></a>)}</section><section className="admin-note"><strong>Catatan tahap ini</strong><p>CRUD belum diaktifkan pada modul publik. Tahap berikutnya akan menambahkan formulir, validasi, upload media, draft/publish workflow, dan audit log dengan permission sesuai role.</p></section></AdminShell></AdminAuthGuard>
}
