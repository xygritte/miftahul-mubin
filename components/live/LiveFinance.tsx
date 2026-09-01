'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FileDown } from 'lucide-react'
import { formatIndonesianDate } from '@/lib/data/presentation'
import { supabase } from '@/lib/supabase/client'
import { useRealtimeRefresh } from './useRealtimeRefresh'
import type { FinancePeriod, FinanceTransaction } from '@/types/content'

type FinancePeriodRow = { id: string; year: number; month: number; opening_balance: number; published_at: string | null; created_at: string | null; updated_at: string | null }
type FinanceTransactionRow = { id: string; period_id: string | null; transaction_date: string; description: string; type: 'income' | 'expense'; amount: number; category_id: string | null; proof_url: string | null; created_at: string | null; updated_at: string | null; status: 'draft' | 'published' | 'archived' }
function mapPeriod(row: FinancePeriodRow): FinancePeriod { return { id: row.id, year: row.year, month: row.month, openingBalance: Number(row.opening_balance), publishedAt: row.published_at, createdAt: row.created_at ?? undefined, updatedAt: row.updated_at ?? undefined } }
function mapTransaction(row: FinanceTransactionRow): FinanceTransaction { return { id: row.id, periodId: row.period_id, transactionDate: row.transaction_date, description: row.description, type: row.type, amount: Number(row.amount), categoryId: row.category_id ?? '', proofUrl: row.proof_url, status: row.status, createdAt: row.created_at ?? undefined, updatedAt: row.updated_at ?? undefined } }
const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
const monthName = (month: number) => new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2026, month - 1, 1))

export default function LiveFinance({ initialPeriod, initialTransactions }: { initialPeriod: FinancePeriod | null; initialTransactions: FinanceTransaction[] }) {
  const [period, setPeriod] = useState(initialPeriod)
  const [transactions, setTransactions] = useState(initialTransactions)
  const refresh = useCallback(async () => {
    const { data: periods, error: periodError } = await supabase
      .from('finance_periods')
      .select('id,year,month,opening_balance,published_at,created_at,updated_at')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
    if (periodError) return
    const nextPeriod = (periods ?? []).map((row) => mapPeriod(row as FinancePeriodRow))[0] ?? null
    if (!nextPeriod?.id) { setPeriod(null); setTransactions([]); return }
    const { data, error } = await supabase
      .from('finance_transactions')
      .select('id,period_id,transaction_date,description,type,amount,category_id,proof_url,created_at,updated_at,status')
      .eq('period_id', nextPeriod.id)
      .eq('status', 'published')
      .order('transaction_date', { ascending: false })
    if (!error) { setPeriod(nextPeriod); setTransactions((data ?? []).map((row) => mapTransaction(row as FinanceTransactionRow))) }
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  useRealtimeRefresh('finance_periods', refresh)
  useRealtimeRefresh('finance_transactions', refresh)

  const income = useMemo(() => transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0), [transactions])
  const expense = useMemo(() => transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0), [transactions])
  const closingBalance = period ? period.openingBalance + income - expense : 0

  return <>
    {period ? <>
      <section className="finance-disclosure"><span className="eyebrow">Laporan Publik</span><strong>Periode {monthName(period.month)} {period.year}</strong><p>Data yang ditampilkan hanya mencakup periode yang telah dipublikasikan oleh pengurus.</p></section>
      <div className="finance-summary-page"><div><span>Saldo Awal</span><strong>{rupiah(period.openingBalance)}</strong></div><div><span>Total Pemasukan</span><strong>{rupiah(income)}</strong></div><div><span>Total Pengeluaran</span><strong>{rupiah(expense)}</strong></div><div><span>Saldo Akhir</span><strong>{rupiah(closingBalance)}</strong></div></div>
      <div className="finance-period"><strong>{monthName(period.month)} {period.year}</strong><span>Terakhir dipublikasikan {formatIndonesianDate(period.publishedAt, true)}</span><button type="button" className="report-button" disabled aria-disabled="true" title="Ekspor PDF akan tersedia pada modul laporan"><FileDown size={15}/> PDF <small>Segera</small></button></div>
      {transactions.length ? <div className="finance-table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jenis</th><th>Nominal</th><th>Bukti</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id ?? `${item.transactionDate}-${item.description}`}><td>{formatIndonesianDate(item.transactionDate, false)}</td><td>{item.description}</td><td><span className={item.type === 'income' ? 'finance-in' : 'finance-out'}>{item.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span></td><td className="amount">{item.type === 'income' ? '+' : '−'} {rupiah(item.amount)}</td><td>{item.proofUrl ? <span className="finance-proof-link">Tersedia</span> : <span className="finance-no-proof">—</span>}</td></tr>)}</tbody></table></div> : <div className="empty-state"><strong>Belum ada transaksi terpublikasi</strong><p>Periode ini belum memiliki transaksi yang dapat ditampilkan.</p></div>}
    </> : <section className="finance-disclosure"><span className="eyebrow">Belum tersedia</span><strong>Belum ada laporan keuangan publik</strong><p>Pengurus belum mempublikasikan periode laporan terbaru.</p><Link href="/kontak/">Hubungi pengurus <ArrowRight size={15}/></Link></section>}
    <div className="finance-note"><span className="eyebrow">Prinsip pelaporan</span><p>Laporan publik menggunakan data yang telah dipublikasikan dan tetap mengikuti kebijakan akses serta audit pengurus.</p></div>
  </>
}
