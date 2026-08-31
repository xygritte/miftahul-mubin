import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminModulePlaceholder from '@/components/admin/AdminModulePlaceholder'

export default function AdminKeuanganPage(){return <AdminAuthGuard><AdminShell><AdminModulePlaceholder title="Kelola Keuangan" description="Modul ini akan menangani periode laporan, transaksi pemasukan dan pengeluaran, bukti transaksi, publikasi, serta audit." /></AdminShell></AdminAuthGuard>}
