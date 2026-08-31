import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import LiveFinance from '@/components/live/LiveFinance'
import { contentRepository } from '@/lib/data'

export default async function KeuanganPage() {
  const period = await contentRepository.getLatestPublishedFinancePeriod()
  const transactions = period ? await contentRepository.listPublishedFinanceTransactions(period.id ?? '') : []

  return <SiteShell><main id="main-content" className="inner-page"><div className="container">
    <PageIntro eyebrow="Akuntabilitas Publik" title="Transparansi Keuangan" description="Ringkasan pemasukan dan pengeluaran Masjid Miftahul Mubin sebagai bentuk keterbukaan kepada jamaah dan masyarakat." />
    <LiveFinance initialPeriod={period} initialTransactions={transactions} />
  </div></main></SiteShell>
}
