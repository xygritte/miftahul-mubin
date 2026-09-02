'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type Mode = 'profile' | 'contact'

type Settings = {
  id: boolean
  site_name: string
  profile_eyebrow: string
  profile_title: string
  profile_description: string
  about_title: string
  about_text: string
  profile_period: string
  profile_agenda_stat: string
  profile_service_stat: string
  profile_vision_title: string
  profile_vision_text: string
  profile_mission_title: string
  profile_mission_text: string
  profile_facilities_title: string
  profile_facilities_text: string
  contact_address: string
  contact_phone: string
  contact_email: string
  contact_hours: string
  contact_maps_query: string
}

const empty: Settings = {
  id: true, site_name: 'Miftahul Mubin', profile_eyebrow: '', profile_title: '', profile_description: '',
  about_title: '', about_text: '', profile_period: '', profile_agenda_stat: '', profile_service_stat: '',
  profile_vision_title: '', profile_vision_text: '', profile_mission_title: '', profile_mission_text: '',
  profile_facilities_title: '', profile_facilities_text: '', contact_address: '', contact_phone: '',
  contact_email: '', contact_hours: '', contact_maps_query: 'Masjid Miftahul Mubin, Ponorogo, Jawa Timur',
}

export default function AdminSiteSettingsManager({ mode }: { mode: Mode }) {
  const [form, setForm] = useState<Settings>(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true); setError('')
    const { data, error: queryError } = await supabase.from('site_settings').select('*').eq('id', true).maybeSingle()
    if (queryError) setError('Pengaturan gagal dimuat.')
    else if (data) setForm({ ...empty, ...(data as Partial<Settings>) })
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    setSaving(true); setError(''); setMessage('')
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { setError('Sesi admin tidak tersedia. Silakan masuk kembali.'); setSaving(false); return }

    const payload = {
      site_name: form.site_name.trim(), profile_eyebrow: form.profile_eyebrow.trim(), profile_title: form.profile_title.trim(),
      profile_description: form.profile_description.trim(), about_title: form.about_title.trim(), about_text: form.about_text.trim(),
      profile_period: form.profile_period.trim(), profile_agenda_stat: form.profile_agenda_stat.trim(), profile_service_stat: form.profile_service_stat.trim(),
      profile_vision_title: form.profile_vision_title.trim(), profile_vision_text: form.profile_vision_text.trim(),
      profile_mission_title: form.profile_mission_title.trim(), profile_mission_text: form.profile_mission_text.trim(),
      profile_facilities_title: form.profile_facilities_title.trim(), profile_facilities_text: form.profile_facilities_text.trim(),
      contact_address: form.contact_address.trim(), contact_phone: form.contact_phone.trim(), contact_email: form.contact_email.trim(),
      contact_hours: form.contact_hours.trim(), contact_maps_query: form.contact_maps_query.trim(), updated_by: userData.user.id,
    }
    const { error: saveError } = await supabase.from('site_settings').update(payload).eq('id', true)
    if (saveError) setError(saveError.code === '42501' ? 'Akun tidak memiliki izin mengubah pengaturan situs.' : 'Pengaturan gagal disimpan.')
    else setMessage(mode === 'profile' ? 'Profil berhasil diperbarui.' : 'Kontak berhasil diperbarui.')
    setSaving(false)
  }

  if (loading) return <div className="admin-table-state"><Loader2 className="spin" size={20} /> Memuat pengaturan…</div>

  const profile = mode === 'profile'
  return <form className="admin-editor-form" onSubmit={save}>
    <div className="admin-form-grid">
      {profile ? <>
        <label><span>Nama situs</span><input value={form.site_name} onChange={(e) => update('site_name', e.target.value)} /></label>
        <label><span>Eyebrow</span><input value={form.profile_eyebrow} onChange={(e) => update('profile_eyebrow', e.target.value)} /></label>
        <label className="full"><span>Judul profil</span><input value={form.profile_title} onChange={(e) => update('profile_title', e.target.value)} /></label>
        <label className="full"><span>Deskripsi profil</span><textarea rows={4} value={form.profile_description} onChange={(e) => update('profile_description', e.target.value)} /></label>
        <label className="full"><span>Judul tentang</span><input value={form.about_title} onChange={(e) => update('about_title', e.target.value)} /></label>
        <label className="full"><span>Isi tentang</span><textarea rows={5} value={form.about_text} onChange={(e) => update('about_text', e.target.value)} /></label>
        <label><span>Periode informasi</span><input value={form.profile_period} onChange={(e) => update('profile_period', e.target.value)} /></label>
        <label><span>Statistik agenda</span><input value={form.profile_agenda_stat} placeholder="24+" onChange={(e) => update('profile_agenda_stat', e.target.value)} /></label>
        <label><span>Statistik bidang</span><input value={form.profile_service_stat} placeholder="5" onChange={(e) => update('profile_service_stat', e.target.value)} /></label>
        <label><span>Judul visi</span><input value={form.profile_vision_title} onChange={(e) => update('profile_vision_title', e.target.value)} /></label>
        <label className="full"><span>Isi visi</span><textarea rows={4} value={form.profile_vision_text} onChange={(e) => update('profile_vision_text', e.target.value)} /></label>
        <label><span>Judul misi</span><input value={form.profile_mission_title} onChange={(e) => update('profile_mission_title', e.target.value)} /></label>
        <label className="full"><span>Isi misi</span><textarea rows={4} value={form.profile_mission_text} onChange={(e) => update('profile_mission_text', e.target.value)} /></label>
        <label><span>Judul fasilitas</span><input value={form.profile_facilities_title} onChange={(e) => update('profile_facilities_title', e.target.value)} /></label>
        <label className="full"><span>Isi fasilitas</span><textarea rows={4} value={form.profile_facilities_text} onChange={(e) => update('profile_facilities_text', e.target.value)} /></label>
      </> : <>
        <label className="full"><span>Alamat</span><textarea rows={4} value={form.contact_address} onChange={(e) => update('contact_address', e.target.value)} /></label>
        <label><span>Nomor telepon</span><input value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} /></label>
        <label><span>Email</span><input type="email" value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} /></label>
        <label><span>Jam layanan</span><input value={form.contact_hours} onChange={(e) => update('contact_hours', e.target.value)} /></label>
        <label className="full"><span>Pencarian Google Maps</span><input value={form.contact_maps_query} onChange={(e) => update('contact_maps_query', e.target.value)} /></label>
      </>}
    </div>
    {error && <p className="admin-form-error" role="alert">{error}</p>}
    {message && <p className="admin-form-success" role="status">{message}</p>}
    <div className="admin-modal-actions"><button type="submit" className="admin-button primary" disabled={saving}>{saving ? <><Loader2 className="spin" size={16} /> Menyimpan…</> : <><Save size={16} /> Simpan perubahan</>}</button></div>
  </form>
}
