'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Edit3, Eye, FilePlus2, Loader2, Search, Trash2, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { privateStorageUrl, uploadPublicStorageFile } from '@/lib/supabase/storage'

type FinanceType = 'income' | 'expense'
type PublishStatus = 'draft' | 'published' | 'archived'
type Period = { id: string; year: number; month: number; opening_balance: number; published_at: string | null }
type Category = { id: string; name: string; type: FinanceType; description: string | null }
type Transaction = { id: string; period_id: string; transaction_date: string; type: FinanceType; category_id: string | null; description: string; amount: number; proof_url: string | null; created_by: string | null; status: PublishStatus; created_at: string; updated_at: string }
type TransactionForm = { id?: string; periodId: string; date: string; type: FinanceType; categoryId: string; description: string; amount: string; proofPath: string; status: PublishStatus }

const emptyTransaction = (periodId = ''): TransactionForm => ({ id: undefined, periodId, date: new Date().toISOString().slice(0, 10), type: 'income', categoryId: '', description: '', amount: '', proofPath: '', status: 'draft' })
const monthName = (m: number) => new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2026, m - 1, 1))
const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) : '—'

function errorMessage(error: { code?: string; message?: string } | null, label: string) {
  if (!error) return ''
  if (error.code === '42501') return `Akun tidak memiliki izin untuk mengelola ${label}.`
  if (error.code === '23505') return 'Data dengan nilai unik tersebut sudah ada.'
  if (error.code === '23503') return 'Relasi data yang dipilih tidak valid.'
  if (error.code === '23514') return 'Data tidak memenuhi aturan keuangan.'
  return `${label} gagal diproses.`
}

export default function AdminFinanceManager() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [rows, setRows] = useState<Transaction[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [periodFormOpen, setPeriodFormOpen] = useState(false)
  const [periodEditing, setPeriodEditing] = useState<Period | null>(null)
  const [periodForm, setPeriodForm] = useState({ year: String(new Date().getFullYear()), month: String(new Date().getMonth() + 1), openingBalance: '0', publishedAt: '' })
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [categoryEditing, setCategoryEditing] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', type: 'income' as FinanceType, description: '' })
  const [transactionEditing, setTransactionEditing] = useState<Transaction | null>(null)
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)
  const [form, setForm] = useState<TransactionForm>(emptyTransaction())

  async function loadPeriodsAndCategories() {
    const [p, c] = await Promise.all([
      supabase.from('finance_periods').select('id,year,month,opening_balance,published_at').order('year', { ascending: false }).order('month', { ascending: false }),
      supabase.from('finance_categories').select('id,name,type,description').order('name'),
    ])
    if (p.error || c.error) { setError(errorMessage(p.error ?? c.error, 'pengaturan keuangan')); return false }
    setPeriods((p.data ?? []) as Period[])
    setCategories((c.data ?? []) as Category[])
    if (!selectedPeriod && p.data?.[0]?.id) setSelectedPeriod(p.data[0].id)
    return true
  }

  async function loadTransactions(periodId = selectedPeriod) {
    setLoading(true)
    const q = supabase.from('finance_transactions').select('id,period_id,transaction_date,type,category_id,description,amount,proof_url,created_by,status,created_at,updated_at').order('transaction_date', { ascending: false }).order('created_at', { ascending: false })
    const { data, error: queryError } = periodId ? await q.eq('period_id', periodId) : await q
    if (queryError) setError(errorMessage(queryError, 'transaksi'))
    else setRows((data ?? []) as Transaction[])
    setLoading(false)
  }

  useEffect(() => { void (async () => { const ok = await loadPeriodsAndCategories(); if (ok) await loadTransactions() })() }, [])
  useEffect(() => { if (selectedPeriod) void loadTransactions(selectedPeriod) }, [selectedPeriod])

  const filteredRows = useMemo(() => { const n = query.trim().toLowerCase(); return !n ? rows : rows.filter(r => `${r.description} ${r.status} ${r.type}`.toLowerCase().includes(n)) }, [rows, query])
  const period = periods.find((p) => p.id === selectedPeriod) ?? null
  const visibleCategories = categories.filter((c) => c.type === form.type)

  function openPeriodCreate() { setPeriodEditing(null); setPeriodForm({ year: String(new Date().getFullYear()), month: String(new Date().getMonth() + 1), openingBalance: '0', publishedAt: '' }); setPeriodFormOpen(true); setError(''); setSuccess('') }
  function openPeriodEdit(p: Period) { setPeriodEditing(p); setPeriodForm({ year: String(p.year), month: String(p.month), openingBalance: String(p.opening_balance), publishedAt: p.published_at ? new Date(p.published_at).toISOString().slice(0, 16) : '' }); setPeriodFormOpen(true); setError(''); setSuccess('') }
  function openCategoryCreate() { setCategoryEditing(null); setCategoryForm({ name: '', type: 'income', description: '' }); setCategoryFormOpen(true); setError(''); setSuccess('') }
  function openCategoryEdit(c: Category) { setCategoryEditing(c); setCategoryForm({ name: c.name, type: c.type, description: c.description ?? '' }); setCategoryFormOpen(true); setError(''); setSuccess('') }
  function openTransactionCreate() { setTransactionEditing(null); setForm(emptyTransaction(selectedPeriod)); setTransactionFormOpen(true); setError(''); setSuccess('') }
  function openTransactionEdit(row: Transaction) { setTransactionEditing(row); setForm({ id: row.id, periodId: row.period_id, date: row.transaction_date, type: row.type, categoryId: row.category_id ?? '', description: row.description, amount: String(row.amount), proofPath: row.proof_url ?? '', status: row.status }); setTransactionFormOpen(true); setError(''); setSuccess('') }

  async function savePeriod(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    const year = Number(periodForm.year), month = Number(periodForm.month), opening = Number(periodForm.openingBalance)
    if (!Number.isInteger(year) || year < 2000 || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isFinite(opening) || opening < 0) { setError('Tahun, bulan, dan saldo awal tidak valid.'); setSaving(false); return }
    const payload = { year, month, opening_balance: opening, published_at: periodForm.publishedAt ? new Date(periodForm.publishedAt).toISOString() : null }
    const result = periodEditing ? await supabase.from('finance_periods').update(payload).eq('id', periodEditing.id) : await supabase.from('finance_periods').insert(payload)
    if (result.error) setError(errorMessage(result.error, 'periode'))
    else { setPeriodFormOpen(false); setSuccess(periodEditing ? 'Periode berhasil diperbarui.' : 'Periode berhasil dibuat.'); await loadPeriodsAndCategories() }
    setSaving(false)
  }

  async function saveCategory(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    if (!categoryForm.name.trim()) { setError('Nama kategori wajib diisi.'); setSaving(false); return }
    const payload = { name: categoryForm.name.trim(), type: categoryForm.type, description: categoryForm.description.trim() || null }
    const result = categoryEditing ? await supabase.from('finance_categories').update(payload).eq('id', categoryEditing.id) : await supabase.from('finance_categories').insert(payload)
    if (result.error) setError(errorMessage(result.error, 'kategori'))
    else { setCategoryFormOpen(false); setSuccess(categoryEditing ? 'Kategori berhasil diperbarui.' : 'Kategori berhasil dibuat.'); await loadPeriodsAndCategories() }
    setSaving(false)
  }

  async function handleProofChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file || uploading || saving) return
    setUploading(true); setError(''); setSuccess('')
    try {
      // Stored proof uses the private finance bucket. The existing upload helper is public-only,
      // so use the Supabase client directly after validating against the configured bucket limits.
      const max = 8 * 1024 * 1024
      if (!(file.type.startsWith('image/') || file.type === 'application/pdf')) throw new Error('Tipe file bukti tidak didukung.')
      if (file.size > max) throw new Error('Ukuran file terlalu besar. Maksimal 8 MB.')
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]+/g, '-')}`
      const { error: uploadError } = await supabase.storage.from('finance-proofs').upload(path, file, { upsert: false, contentType: file.type, cacheControl: '3600' })
      if (uploadError) throw uploadError
      setForm((v) => ({ ...v, proofPath: path }))
      setSuccess('Bukti berhasil diunggah.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Bukti gagal diunggah.') }
    finally { setUploading(false) }
  }

  async function saveTransaction(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    const amount = Number(form.amount)
    if (!form.periodId || !form.date || !form.description.trim() || !Number.isFinite(amount) || amount <= 0) { setError('Periode, tanggal, deskripsi, dan nominal wajib valid.'); setSaving(false); return }
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { setError('Sesi admin tidak tersedia. Silakan masuk kembali.'); setSaving(false); return }
    const payload = { period_id: form.periodId, transaction_date: form.date, type: form.type, category_id: form.categoryId || null, description: form.description.trim(), amount, proof_url: form.proofPath || null, created_by: userData.user.id, status: form.status }
    const result = transactionEditing ? await supabase.from('finance_transactions').update(payload).eq('id', transactionEditing.id) : await supabase.from('finance_transactions').insert(payload)
    if (result.error) { setError(errorMessage(result.error, 'transaksi')); setSaving(false); return }
    await loadTransactions(form.periodId); setTransactionFormOpen(false); setSuccess(transactionEditing ? 'Transaksi berhasil diperbarui.' : 'Transaksi berhasil dibuat.'); setSaving(false)
  }

  async function remove(table: 'finance_periods' | 'finance_categories' | 'finance_transactions', id: string, label: string) {
    if (!window.confirm(`Hapus ${label}? Tindakan ini tidak dapat dibatalkan.`)) return
    setDeletingId(id); setError(''); setSuccess('')
    const { error: deleteError } = await supabase.from(table).delete().eq('id', id)
    if (deleteError) setError(errorMessage(deleteError, label))
    else { setSuccess(`${label[0].toUpperCase()}${label.slice(1)} berhasil dihapus.`); if (table === 'finance_transactions') await loadTransactions(selectedPeriod); else await loadPeriodsAndCategories() }
    setDeletingId(null)
  }

  async function openProof(path: string) {
    try { const url = await privateStorageUrl('finance-proofs', path); window.open(url, '_blank', 'noopener,noreferrer') } catch { setError('Bukti tidak dapat dibuka.') }
  }

  return <section className="admin-finance-manager" aria-label="Pengelolaan keuangan">
    <section className="admin-news-manager"><div className="admin-module-toolbar"><strong>Periode Laporan</strong><button className="admin-button primary" onClick={openPeriodCreate}><FilePlus2 size={17}/> Tambah periode</button></div>{periods.length===0?<div className="admin-table-state"><strong>Belum ada periode</strong><span>Buat periode laporan terlebih dahulu.</span></div>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Periode</th><th>Saldo awal</th><th>Publikasi</th><th/></tr></thead><tbody>{periods.map(p=><tr key={p.id}><td><button className="admin-button secondary" onClick={()=>setSelectedPeriod(p.id)}>{monthName(p.month)} {p.year}</button></td><td>{formatCurrency(Number(p.opening_balance))}</td><td>{p.published_at ? formatDate(p.published_at) : 'Draft'}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={()=>openPeriodEdit(p)} aria-label="Edit periode"><Edit3 size={16}/></button><button className="admin-icon-button danger" disabled={deletingId===p.id} onClick={()=>void remove('finance_periods',p.id,'periode')} aria-label="Hapus periode"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>}</section>

    <section className="admin-news-manager"><div className="admin-module-toolbar"><strong>Kategori</strong><button className="admin-button primary" onClick={openCategoryCreate}><FilePlus2 size={17}/> Tambah kategori</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Nama</th><th>Jenis</th><th/></tr></thead><tbody>{categories.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.type==='income'?'Pemasukan':'Pengeluaran'}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={()=>openCategoryEdit(c)} aria-label="Edit kategori"><Edit3 size={16}/></button><button className="admin-icon-button danger" disabled={deletingId===c.id} onClick={()=>void remove('finance_categories',c.id,'kategori')} aria-label="Hapus kategori"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div></section>

    <section className="admin-news-manager"><div className="admin-module-toolbar"><div><strong>Transaksi</strong><span className="admin-module-subtitle">{period ? `${monthName(period.month)} ${period.year}` : 'Pilih periode'}</span></div><div className="admin-search-wrap"><Search size={17}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari transaksi…" aria-label="Cari transaksi"/></div><button className="admin-button primary" disabled={!selectedPeriod} onClick={openTransactionCreate}><FilePlus2 size={17}/> Tambah transaksi</button></div>{error&&<p className="admin-form-error" role="alert">{error}</p>}{success&&<p className="admin-form-success" role="status">{success}</p>}{loading?<div className="admin-table-state"><Loader2 className="spin" size={20}/> Memuat transaksi…</div>:filteredRows.length===0?<div className="admin-table-state"><strong>Tidak ada transaksi</strong><span>{selectedPeriod?'Belum ada transaksi pada periode ini.':'Pilih periode laporan.'}</span></div>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tanggal</th><th>Deskripsi</th><th>Jenis</th><th>Nominal</th><th>Status</th><th/></tr></thead><tbody>{filteredRows.map(r=><tr key={r.id}><td>{formatDate(r.transaction_date)}</td><td><div className="admin-table-title"><strong>{r.description}</strong><small>{categories.find(c=>c.id===r.category_id)?.name??'Tanpa kategori'}</small></div></td><td>{r.type==='income'?'Pemasukan':'Pengeluaran'}</td><td>{formatCurrency(Number(r.amount))}</td><td><span className={`admin-status-pill ${r.status}`}>{r.status}</span></td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={()=>openTransactionEdit(r)} aria-label="Edit transaksi"><Edit3 size={16}/></button>{r.proof_url&&<button className="admin-icon-button" onClick={()=>void openProof(r.proof_url!)} aria-label="Buka bukti"><Eye size={16}/></button>}<button className="admin-icon-button danger" disabled={deletingId===r.id} onClick={()=>void remove('finance_transactions',r.id,'transaksi')} aria-label="Hapus transaksi">{deletingId===r.id?<Loader2 className="spin" size={16}/>:<Trash2 size={16}/>}</button></div></td></tr>)}</tbody></table></div>}</section>

    {periodFormOpen&&<div className="admin-modal-backdrop"><div className="admin-modal" role="dialog" aria-modal="true"><div className="admin-modal-header"><div><span className="eyebrow">Keuangan</span><h2>{periodEditing?'Edit':'Tambah'} periode</h2></div><button className="admin-icon-button" onClick={()=>setPeriodFormOpen(false)} disabled={saving} aria-label="Tutup"><X size={18}/></button></div><form className="admin-editor-form" onSubmit={savePeriod}><div className="admin-form-grid"><label><span>Tahun</span><input type="number" min="2000" required value={periodForm.year} onChange={e=>setPeriodForm(v=>({...v,year:e.target.value}))}/></label><label><span>Bulan</span><input type="number" min="1" max="12" required value={periodForm.month} onChange={e=>setPeriodForm(v=>({...v,month:e.target.value}))}/></label></div><label><span>Saldo awal</span><input type="number" min="0" step="0.01" required value={periodForm.openingBalance} onChange={e=>setPeriodForm(v=>({...v,openingBalance:e.target.value}))}/></label><label><span>Publikasikan pada (kosong = draft)</span><input type="datetime-local" value={periodForm.publishedAt} onChange={e=>setPeriodForm(v=>({...v,publishedAt:e.target.value}))}/></label><div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={()=>setPeriodFormOpen(false)} disabled={saving}>Batal</button><button className="admin-button primary" disabled={saving}>{saving?<><Loader2 className="spin" size={16}/> Menyimpan…</>:'Simpan periode'}</button></div></form></div></div>}

    {categoryFormOpen&&<div className="admin-modal-backdrop"><div className="admin-modal" role="dialog" aria-modal="true"><div className="admin-modal-header"><div><span className="eyebrow">Keuangan</span><h2>{categoryEditing?'Edit':'Tambah'} kategori</h2></div><button className="admin-icon-button" onClick={()=>setCategoryFormOpen(false)} disabled={saving} aria-label="Tutup"><X size={18}/></button></div><form className="admin-editor-form" onSubmit={saveCategory}><label><span>Nama</span><input required value={categoryForm.name} onChange={e=>setCategoryForm(v=>({...v,name:e.target.value}))}/></label><label><span>Jenis</span><select value={categoryForm.type} onChange={e=>setCategoryForm(v=>({...v,type:e.target.value as FinanceType}))}><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select></label><label><span>Deskripsi</span><textarea rows={3} value={categoryForm.description} onChange={e=>setCategoryForm(v=>({...v,description:e.target.value}))}/></label><div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={()=>setCategoryFormOpen(false)} disabled={saving}>Batal</button><button className="admin-button primary" disabled={saving}>{saving?<><Loader2 className="spin" size={16}/> Menyimpan…</>:'Simpan kategori'}</button></div></form></div></div>}

    {transactionFormOpen&&<div className="admin-modal-backdrop"><div className="admin-modal" role="dialog" aria-modal="true"><div className="admin-modal-header"><div><span className="eyebrow">Keuangan</span><h2>{transactionEditing?'Edit':'Tambah'} transaksi</h2></div><button className="admin-icon-button" onClick={()=>setTransactionFormOpen(false)} disabled={saving||uploading} aria-label="Tutup"><X size={18}/></button></div><form className="admin-editor-form" onSubmit={saveTransaction}><div className="admin-form-grid"><label><span>Periode</span><select required value={form.periodId} onChange={e=>setForm(v=>({...v,periodId:e.target.value}))}>{periods.map(p=><option key={p.id} value={p.id}>{monthName(p.month)} {p.year}</option>)}</select></label><label><span>Tanggal</span><input type="date" required value={form.date} onChange={e=>setForm(v=>({...v,date:e.target.value}))}/></label></div><div className="admin-form-grid"><label><span>Jenis</span><select value={form.type} onChange={e=>setForm(v=>({...v,type:e.target.value as FinanceType,categoryId:''}))}><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select></label><label><span>Kategori</span><select value={form.categoryId} onChange={e=>setForm(v=>({...v,categoryId:e.target.value}))}><option value="">Tanpa kategori</option>{visibleCategories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div><label><span>Deskripsi</span><textarea rows={4} required value={form.description} onChange={e=>setForm(v=>({...v,description:e.target.value}))}/></label><label><span>Nominal</span><input type="number" min="0.01" step="0.01" required value={form.amount} onChange={e=>setForm(v=>({...v,amount:e.target.value}))}/></label><label><span>Status</span><select value={form.status} onChange={e=>setForm(v=>({...v,status:e.target.value as PublishStatus}))}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><div className="admin-upload-field"><div className="admin-upload-label"><span>Bukti transaksi</span><small>Gambar atau PDF · maksimal 8 MB · disimpan privat</small></div>{form.proofPath&&<p className="admin-form-hint">Bukti tersimpan: {form.proofPath}</p>}<label className="admin-file-picker"><Upload size={17}/><span>{uploading?'Mengunggah…':form.proofPath?'Ganti bukti':'Pilih bukti dari perangkat'}</span><input type="file" accept="image/*,application/pdf" onChange={e=>void handleProofChange(e)} disabled={saving||uploading}/></label></div><div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={()=>setTransactionFormOpen(false)} disabled={saving||uploading}>Batal</button><button className="admin-button primary" disabled={saving||uploading}>{saving?<><Loader2 className="spin" size={16}/> Menyimpan…</>:'Simpan transaksi'}</button></div></form></div></div>}
  </section>
}
