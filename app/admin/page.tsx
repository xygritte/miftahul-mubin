import Link from 'next/link'
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
  return <AdminAuthGuard><AdminShell><section className="admin-page-heading"><span className="eyebrow">Dashboard</span><h1>Selamat datang di panel pengelola.</h1><p>Panel pengelola Miftahul Mubin terhubung langsung ke Supabase dengan permission sesuai role.</p></section><section className="admin-overview-grid" aria-label="Modul pengelolaan">{modules.map(([title, description, href], index) => <Link className="admin-module-card" key={title} href={href}><span>0{index + 1}</span><strong>{title}</strong><p>{description}</p><small>Kelola data →</small></Link>)}</section><section className="admin-note"><strong>Status CMS</strong><p>Semua modul pengelola utama telah memiliki operasi create, read, update, dan delete. Hak perubahan tetap dibatasi oleh Row Level Security Supabase dan role pengelola.</p></section></AdminShell></AdminAuthGuard>
}
