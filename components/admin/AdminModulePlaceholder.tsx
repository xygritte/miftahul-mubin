import Link from 'next/link'
import { ArrowLeft, Construction } from 'lucide-react'

export default function AdminModulePlaceholder({ title, description }: { title: string; description: string }) {
  return <section className="admin-status-card admin-module-placeholder"><div className="admin-login-icon"><Construction size={23} /></div><span className="eyebrow">Modul Pengelola</span><h1>{title}</h1><p>{description}</p><div className="admin-module-placeholder-actions"><span className="admin-coming-soon">CRUD akan diaktifkan pada tahap modul ini.</span><Link className="admin-button secondary" href="/admin/"><ArrowLeft size={16} /> Dashboard</Link></div></section>
}
