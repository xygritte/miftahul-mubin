import Link from 'next/link'
import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import { ArrowRight, FileDown } from 'lucide-react'
import { contentRepository } from '@/lib/data'
import { formatIndonesianDate } from '@/lib/data/presentation'

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
const monthName = (month: number) => new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2026, month - 1, 1))

export default async function KeuanganPage() {
  const period = await contentRepository.getLatestPublishedFinancePeriod()
  const transactions = period ? await contentRepository.listPublishedFinanceTransactions(period.id ?? '') : []
  const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
  const expense = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const closingBalance = period ? period.openingBalance + income - expense : 0

  return <SiteShell><main id="main-content" className="inner-page"><div className="container">
    <PageIntro eyebrow="Akuntabilitas Publik" title="Transparansi Keuangan" description="Ringkasan pemasukan dan pengeluaran Masjid Miftahul Mubin sebagai bentuk keterbukaan kepada jamaah dan masyarakat." />
    {period ? <>
      <section className="finance-disclosure"><span className="eyebrow">Laporan Publik</span><strong>Periode {monthName(period.month)} {period.year}</strong><p>Data yang ditampilkan hanya mencakup periode yang telah dipublikasikan oleh pengurus.</p></section>
      <div className="finance-summary-page"><div><span>Saldo Awal</span><strong>{rupiah(period.openingBalance)}</strong></div><div><span>Total Pemasukan</span><strong>{rupiah(income)}</strong></div><div><span>Total Pengeluaran</span><strong>{rupiah(expense)}</strong></div><div><span>Saldo Akhir</span><strong>{rupiah(closingBalance)}</strong></div></div>
      <div className="finance-period"><strong>{monthName(period.month)} {period.year}</strong><span>Terakhir dipublikasikan {formatIndonesianDate(period.publishedAt, true)}</span><button type="button" className="report-button" disabled aria-disabled="true" title="Ekspor PDF akan tersedia pada modul laporan"><FileDown size={15}/> PDF <small>Segera</small></button></div>
      {transactions.length > 0 ? <div className="finance-table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jenis</th><th>Nominal</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id ?? `${item.transactionDate}-${item.description}`}><td>{formatIndonesianDate(item.transactionDate, false)}</td><td>{item.description}</td><td><span className={item.type === 'income' ? 'finance-in' : 'finance-out'}>{item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></td><td className="amount">{item.type === 'income' ? '+' : '−'} {rupiah(item.amount)}</td></tr>)}</tbody></table></div> : <div className="empty-state"><strong>Belum ada transaksi terpublikasi</strong><p>Periode ini belum memiliki transaksi yang dapat ditampilkan.</p></div>}
    </> : <section className="finance-disclosure"><span className="eyebrow">Belum tersedia</span><strong>Belum ada laporan keuangan publik</strong><p>Pengurus belum mempublikasikan periode laporan terbaru. Laporan akan muncul di sini setelah periode dinyatakan tersedia untuk publik.</p><Link href="/kontak/">Hubungi pengurus <ArrowRight size={15}/></Link></section>}
    <div className="finance-note"><span className="eyebrow">Prinsip pelaporan</span><p>Laporan publik menggunakan data yang telah dipublikasikan dan tetap mengikuti kebijakan akses serta audit pengurus.</p></div>
  </div></main></SiteShell>
}
