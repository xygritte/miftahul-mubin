import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminContentManager from '@/components/admin/AdminContentManager'
import AdminFinanceSetup from '@/components/admin/AdminFinanceSetup'

export default function AdminKeuanganPage(){return <AdminAuthGuard><AdminShell><div className="admin-page-heading"><span className="eyebrow">Keuangan</span><h1>Kelola Keuangan</h1><p>Kelola periode laporan, kategori, transaksi pemasukan dan pengeluaran, bukti, serta status publikasi.</p></div><AdminFinanceSetup /><AdminContentManager mode="finance" /></AdminShell></AdminAuthGuard>}
