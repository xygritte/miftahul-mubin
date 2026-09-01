'use client'

import { useEffect, useMemo, useState } from 'react'
import { Edit3, Eye, FilePlus2, Loader2, Search, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { sitePath } from '@/lib/data/presentation'

type Mode = 'islamic' | 'events' | 'announcements' | 'management' | 'documentation' | 'finance'
type StandardMode = Extract<Mode, 'islamic' | 'events' | 'announcements'>
type Row = Record<string, any>
type Category = { id: string; name: string; slug: string }

const configs = {
  islamic: { table: 'islamic_articles', title: 'Artikel Keislaman', publicPath: '/keislaman/' },
  events: { table: 'events', title: 'Kegiatan', publicPath: '/kegiatan/' },
  announcements: { table: 'announcements', title: 'Pengumuman', publicPath: '/pengumuman/' },
  management: { table: 'management_members', title: 'Anggota Kepengurusan', publicPath: '/kepengurusan/' },
  documentation: { table: 'media_items', title: 'Media Dokumentasi', publicPath: '/dokumentasi/' },
  finance: { table: 'finance_transactions', title: 'Transaksi Keuangan', publicPath: '/keuangan/' },
} as const

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') }
function errorMessage(error: any, label: string) { if (!error) return ''; if (error.code === '42501') return `Akun tidak memiliki izin untuk mengubah ${label}.`; if (error.code === '23505') return 'Data dengan nilai unik tersebut sudah ada.'; if (error.code === '23503') return 'Relasi data yang dipilih tidak valid.'; return `${label} gagal diproses.` }

export default function AdminContentManager({ mode }: { mode: Mode }) {
  if (mode === 'management') return <ManagementManager />
  if (mode === 'documentation') return <DocumentationManager />
  if (mode === 'finance') return <FinanceManager />
  return <StandardManager mode={mode as StandardMode} />
}

function StandardManager({ mode }: { mode: StandardMode }) {
  const cfg = configs[mode]
  const isEvent = mode === 'events'
  const isAnnouncement = mode === 'announcements'
  const [rows, setRows] = useState<Row[]>([]), [categories, setCategories] = useState<Category[]>([]), [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState(''), [success, setSuccess] = useState(''), [editing, setEditing] = useState<Row | null | false>(false)
  const [form, setForm] = useState<Row>({})

  async function load() {
    setLoading(true); setError('')
    const select = mode === 'islamic'
      ? 'id,title,slug,excerpt,content,category_id,status,published_at,created_at,updated_at'
      : isEvent
        ? 'id,title,slug,description,event_date,start_time,end_time,location,speaker,status,cover_url,category_id,created_at,updated_at'
        : 'id,title,content,status,published_at,author_id,created_at,updated_at'
    const [dataResult, catResult] = await Promise.all([
      supabase.from(cfg.table).select(select).order('created_at', { ascending: false }),
      isAnnouncement ? Promise.resolve({ data: [], error: null }) : supabase.from('categories').select('id,name,slug').eq('type', mode === 'islamic' ? 'islamic' : 'event').order('name'),
    ])
    if (dataResult.error || catResult.error) setError(errorMessage(dataResult.error || catResult.error, cfg.title))
    else { setRows(dataResult.data ?? []); setCategories(catResult.data ?? []) }
    setLoading(false)
  }
  useEffect(() => { void load() }, [mode])
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); return !q ? rows : rows.filter(r => `${r.title ?? ''} ${r.slug ?? ''} ${r.excerpt ?? ''} ${r.description ?? ''}`.toLowerCase().includes(q)) }, [rows, query])
  function openCreate() { setForm(isEvent ? { title:'', slug:'', description:'', event_date:'', start_time:'', end_time:'', location:'', speaker:'', status:'draft', cover_url:'', category_id:'' } : { title:'', slug:'', excerpt:'', content:'', status:'draft', category_id:'' }); setEditing(null); setError(''); setSuccess('') }
  function openEdit(row: Row) { setForm({ ...row, content: Array.isArray(row.content) ? row.content.join('\n\n') : row.content }); setEditing(row); setError(''); setSuccess('') }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const payload: Row = { ...form }
    if ('slug' in payload) payload.slug = slugify(payload.slug || payload.title)
    if (mode === 'islamic') { payload.content = String(payload.content || '').split(/\n\s*\n/).map((x:string) => x.trim()).filter(Boolean); payload.published_at = payload.status === 'published' ? (payload.published_at || new Date().toISOString()) : null }
    if (isEvent) { payload.slug = slugify(payload.slug || payload.title); payload.category_id = payload.category_id || null }
    if (isAnnouncement) { payload.author_id = payload.author_id || null; payload.published_at = payload.status === 'published' ? (payload.published_at || new Date().toISOString()) : null }
    if (!payload.title?.trim()) { setError('Judul wajib diisi.'); setSaving(false); return }
    const result = editing ? await supabase.from(cfg.table).update(payload).eq('id', editing.id) : await supabase.from(cfg.table).insert(payload)
    if (result.error) setError(errorMessage(result.error, cfg.title))
    else { await load(); setEditing(false); setSuccess(editing ? 'Data berhasil diperbarui.' : 'Data berhasil dibuat.') }
    setSaving(false)
  }
  async function remove(row: Row) { if (!window.confirm(`Hapus “${row.title}”?`)) return; setDeleting(row.id); const { error } = await supabase.from(cfg.table).delete().eq('id', row.id); if (error) setError(errorMessage(error, cfg.title)); else { await load(); setSuccess('Data berhasil dihapus.') } setDeleting(null) }
  return <section className="admin-news-manager">
    <div className="admin-module-toolbar"><div className="admin-search-wrap"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari…"/></div><button className="admin-button primary" onClick={openCreate}><FilePlus2 size={17}/> Tambah</button></div>
    {error && <p className="admin-form-error">{error}</p>}{success && <p className="admin-form-success">{success}</p>}
    {loading ? <div className="admin-table-state"><Loader2 className="spin"/> Memuat…</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Judul</th><th>Status</th><th>Diperbarui</th><th/></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td><div className="admin-table-title"><strong>{r.title}</strong><small>{r.slug ? `/${r.slug}` : ''}</small></div></td><td><span className={`admin-status-pill ${r.status}`}>{r.status}</span></td><td>{r.updated_at ? new Intl.DateTimeFormat('id-ID',{dateStyle:'medium'}).format(new Date(r.updated_at)) : '—'}</td><td><div className="admin-row-actions"><button className="admin-icon-button" onClick={()=>openEdit(r)} aria-label="Edit"><Edit3 size={16}/></button>{r.slug && <button className="admin-icon-button" onClick={()=>window.open(sitePath(`${cfg.publicPath}${r.slug}/`),'_blank','noopener,noreferrer')} aria-label="Lihat"><Eye size={16}/></button>}<button className="admin-icon-button danger" disabled={deleting===r.id} onClick={()=>void remove(r)} aria-label="Hapus">{deleting===r.id?<Loader2 className="spin" size={16}/>:<Trash2 size={16}/>}</button></div></td></tr>)}</tbody></table></div>}
    {editing !== false && <div className="admin-modal-backdrop"><div className="admin-modal" role="dialog" aria-modal="true"><div className="admin-modal-header"><div><span className="eyebrow">CMS</span><h2>{editing ? 'Edit' : 'Tambah'} {cfg.title}</h2></div><button className="admin-icon-button" onClick={()=>setEditing(false)}><X size={18}/></button></div><form className="admin-editor-form" onSubmit={save}>
      <label><span>Judul</span><input required value={form.title||''} onChange={e=>setForm((v:Row)=>({...v,title:e.target.value,slug:v.id?v.slug:slugify(e.target.value)}))}/></label>
      {!isAnnouncement && <label><span>Slug</span><input required value={form.slug||''} onChange={e=>setForm((v:Row)=>({...v,slug:slugify(e.target.value)}))}/></label>}
      {isEvent ? <><div className="admin-form-grid"><label><span>Tanggal</span><input type="date" required value={form.event_date||''} onChange={e=>setForm((v:Row)=>({...v,event_date:e.target.value}))}/></label><label><span>Status</span><select value={form.status||'draft'} onChange={e=>setForm((v:Row)=>({...v,status:e.target.value}))}><option>draft</option><option>published</option><option>cancelled</option><option>completed</option></select></label></div><div className="admin-form-grid"><label><span>Mulai</span><input type="time" value={form.start_time||''} onChange={e=>setForm((v:Row)=>({...v,start_time:e.target.value}))}/></label><label><span>Selesai</span><input type="time" value={form.end_time||''} onChange={e=>setForm((v:Row)=>({...v,end_time:e.target.value}))}/></label></div><label><span>Lokasi</span><input value={form.location||''} onChange={e=>setForm((v:Row)=>({...v,location:e.target.value}))}/></label><label><span>Narasumber</span><input value={form.speaker||''} onChange={e=>setForm((v:Row)=>({...v,speaker:e.target.value}))}/></label><label><span>Deskripsi</span><textarea rows={5} value={form.description||''} onChange={e=>setForm((v:Row)=>({...v,description:e.target.value}))}/></label><label><span>URL cover</span><input type="url" value={form.cover_url||''} onChange={e=>setForm((v:Row)=>({...v,cover_url:e.target.value}))}/></label>
      </> : <><label><span>{isAnnouncement?'Isi pengumuman':'Ringkasan'}</span>{isAnnouncement?<textarea rows={8} required value={form.content||''} onChange={e=>setForm((v:Row)=>({...v,content:e.target.value}))}/>:<><textarea rows={3} required value={form.excerpt||''} onChange={e=>setForm((v:Row)=>({...v,excerpt:e.target.value}))}/><span>Isi artikel</span><textarea rows={12} required value={form.content||''} onChange={e=>setForm((v:Row)=>({...v,content:e.target.value}))}/></>}</label>{!isAnnouncement && <label><span>Kategori</span><select value={form.category_id||''} onChange={e=>setForm((v:Row)=>({...v,category_id:e.target.value}))}><option value="">Tanpa kategori</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
      {!isEvent && <label><span>Status</span><select value={form.status||'draft'} onChange={e=>setForm((v:Row)=>({...v,status:e.target.value}))}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>}
      </>}
      <div className="admin-modal-actions"><button type="button" className="admin-button secondary" onClick={()=>setEditing(false)}>Batal</button><button className="admin-button primary" disabled={saving}>{saving?<><Loader2 className="spin"/> Menyimpan…</>:'Simpan'}</button></div>
    </form></div></div>}
  </section>
}

function ManagementManager() {
  const [periods,setPeriods]=useState<Row[]>([]),[members,setMembers]=useState<Row[]>([]),[selected,setSelected]=useState(''),[editing,setEditing]=useState<Row|null|false>(false),[periodEdit,setPeriodEdit]=useState<Row|null|false>(false),[form,setForm]=useState<Row>({}),[periodForm,setPeriodForm]=useState<Row>({}),[error,setError]=useState(''),[success,setSuccess]=useState('')
  async function load(){const {data,error}=await supabase.from('management_periods').select('*').order('start_date',{ascending:false}); if(error){setError(errorMessage(error,'periode'));return} setPeriods(data??[]); const p=selected||data?.[0]?.id||''; setSelected(p); if(p){const r=await supabase.from('management_members').select('*').eq('period_id',p).order('sort_order'); if(!r.error)setMembers(r.data??[])}}
  useEffect(()=>{void load()},[selected])
  async function savePeriod(e:React.FormEvent){e.preventDefault(); const p={name:periodForm.name,start_date:periodForm.start_date,end_date:periodForm.end_date||null,is_active:Boolean(periodForm.is_active)}; const r=periodEdit?await supabase.from('management_periods').update(p).eq('id',periodEdit.id):await supabase.from('management_periods').insert(p); if(r.error)setError(errorMessage(r.error,'periode')); else{setPeriodEdit(false);setSuccess('Periode tersimpan.');await load()}}
  async function saveMember(e:React.FormEvent){e.preventDefault(); const p={period_id:selected,name:form.name,position:form.position,photo_url:form.photo_url||null,bio:form.bio||null,sort_order:Number(form.sort_order||0)}; const r=editing?await supabase.from('management_members').update(p).eq('id',editing.id):await supabase.from('management_members').insert(p); if(r.error)setError(errorMessage(r.error,'anggota')); else{setEditing(false);setSuccess('Anggota tersimpan.');await load()}}
  async function del(table:string,id:string){if(!window.confirm('Hapus data ini?'))return;const r=await supabase.from(table).delete().eq('id',id);if(r.error)setError(errorMessage(r.error,'data'));else{setSuccess('Data dihapus.');await load()}}
  return <section className="admin-news-manager"><div className="admin-module-toolbar"><strong>Periode</strong><button className="admin-button primary" onClick={()=>{setPeriodForm({name:'',start_date:'',end_date:'',is_active:false});setPeriodEdit(null)}}><FilePlus2 size={17}/> Tambah periode</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Periode</th><th>Aktif</th><th/></tr></thead><tbody>{periods.map(p=><tr key={p.id}><td><button className="admin-button secondary" onClick={()=>setSelected(p.id)}>{p.name}</button></td><td>{p.is_active?'Aktif':'—'}</td><td><button className="admin-icon-button" onClick={()=>{setPeriodForm(p);setPeriodEdit(p)}}><Edit3 size={16}/></button><button className="admin-icon-button danger" onClick={()=>void del('management_periods',p.id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div><div className="admin-module-toolbar"><strong>Anggota · {periods.find(p=>p.id===selected)?.name||'pilih periode'}</strong><button className="admin-button primary" disabled={!selected} onClick={()=>{setForm({name:'',position:'',photo_url:'',bio:'',sort_order:0});setEditing(null)}}><FilePlus2 size={17}/> Tambah anggota</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Nama</th><th>Jabatan</th><th>Urutan</th><th/></tr></thead><tbody>{members.map(m=><tr key={m.id}><td>{m.name}</td><td>{m.position}</td><td>{m.sort_order}</td><td><button className="admin-icon-button" onClick={()=>{setForm(m);setEditing(m)}}><Edit3 size={16}/></button><button className="admin-icon-button danger" onClick={()=>void del('management_members',m.id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div></section>
}

function DocumentationManager() {
  const [albums,setAlbums]=useState<Row[]>([]),[items,setItems]=useState<Row[]>([]),[album,setAlbum]=useState(''),[error,setError]=useState(''),[success,setSuccess]=useState('')
  async function load(){const a=await supabase.from('media_albums').select('*').order('created_at',{ascending:false}); if(a.error){setError(errorMessage(a.error,'album'));return} setAlbums(a.data??[]); const current=album||a.data?.[0]?.id||''; setAlbum(current); if(current){const i=await supabase.from('media_items').select('*').eq('album_id',current).order('created_at',{ascending:false}); if(!i.error)setItems(i.data??[])}}
  useEffect(()=>{void load()},[album])
  async function saveAlbum(e:React.FormEvent){e.preventDefault();const name=window.prompt('Nama album');if(!name)return;const r=await supabase.from('media_albums').insert({name,slug:slugify(name)});if(r.error)setError(errorMessage(r.error,'album'));else{setSuccess('Album dibuat.');await load()}}
  async function del(table:string,id:string){if(!window.confirm('Hapus data ini?'))return;const r=await supabase.from(table).delete().eq('id',id);if(r.error)setError(errorMessage(r.error,'data'));else{setSuccess('Data dihapus.');await load()}}
  return <section className="admin-news-manager"><div className="admin-module-toolbar"><strong>Album</strong><button className="admin-button primary" onClick={(e)=>void saveAlbum(e as any)}><FilePlus2 size={17}/> Tambah album</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Album</th><th>Slug</th><th/></tr></thead><tbody>{albums.map(a=><tr key={a.id}><td><button className="admin-button secondary" onClick={()=>setAlbum(a.id)}>{a.name}</button></td><td>{a.slug}</td><td><button className="admin-icon-button danger" onClick={()=>void del('media_albums',a.id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div><div className="admin-module-toolbar"><strong>Media</strong></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Judul</th><th>Path</th><th/></tr></thead><tbody>{items.map(i=><tr key={i.id}><td>{i.title}</td><td>{i.storage_path}</td><td><button className="admin-icon-button danger" onClick={()=>void del('media_items',i.id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div><p className="admin-form-note">Gunakan halaman Storage untuk mengunggah file ke bucket media dan menyalin path yang akan disimpan sebagai media item.</p>{error&&<p className="admin-form-error">{error}</p>}{success&&<p className="admin-form-success">{success}</p>}</section>
}

function FinanceManager() {
  const [rows,setRows]=useState<Row[]>([]),[error,setError]=useState(''),[success,setSuccess]=useState('')
  async function load(){const r=await supabase.from('finance_transactions').select('*,finance_categories(name)').order('transaction_date',{ascending:false});if(r.error)setError(errorMessage(r.error,'transaksi'));else setRows(r.data??[])}
  useEffect(()=>{void load()},[])
  async function save(){const description=window.prompt('Deskripsi transaksi');if(!description)return;const amount=Number(window.prompt('Nominal (positif)')||0);if(!amount)return;const category_id=window.prompt('ID kategori');if(!category_id)return;const r=await supabase.from('finance_transactions').insert({description,amount,transaction_type:'income',category_id,transaction_date:new Date().toISOString().slice(0,10),status:'draft'});if(r.error)setError(errorMessage(r.error,'transaksi'));else{setSuccess('Transaksi dibuat.');await load()}}
  async function del(id:string){if(!window.confirm('Hapus transaksi ini?'))return;const r=await supabase.from('finance_transactions').delete().eq('id',id);if(r.error)setError(errorMessage(r.error,'transaksi'));else{setSuccess('Transaksi dihapus.');await load()}}
  return <section className="admin-news-manager"><div className="admin-module-toolbar"><strong>Transaksi</strong><button className="admin-button primary" onClick={()=>void save()}><FilePlus2 size={17}/> Tambah transaksi</button></div>{error&&<p className="admin-form-error">{error}</p>}{success&&<p className="admin-form-success">{success}</p>}<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tanggal</th><th>Deskripsi</th><th>Jenis</th><th>Nominal</th><th/></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.transaction_date}</td><td>{r.description}</td><td>{r.transaction_type}</td><td>{new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(r.amount)}</td><td><button className="admin-icon-button danger" onClick={()=>void del(r.id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div></section>
}
