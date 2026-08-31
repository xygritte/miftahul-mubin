import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import AdminLoginForm from '@/components/admin/AdminLoginForm'

export default function AdminLoginPage() {
  return <main className="admin-login-page">
    <div className="admin-login-shell">
      <Link className="admin-back-link" href="/"><ArrowLeft size={16} /> Kembali ke website</Link>
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-heading"><div className="admin-login-icon"><ShieldCheck size={25} /></div><span className="eyebrow">Miftahul Mubin</span><h1 id="admin-login-title">Masuk ke panel pengelola</h1><p>Kelola berita, kegiatan, dokumentasi, kepengurusan, dan informasi masjid dari satu tempat.</p></div>
        <AdminLoginForm />
      </section>
      <p className="admin-login-footer">Akses pengelola dilindungi Supabase Auth dan role database.</p>
    </div>
  </main>
}
