'use client'

import { useCallback, useEffect, useState } from 'react'
import { Mail, MapPin, Phone, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import PageIntro from '@/components/content/PageIntro'

type Settings = {
  site_name: string
  profile_image_url: string
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
  site_name: '', profile_image_url: '', profile_eyebrow: '', profile_title: '', profile_description: '', about_title: '', about_text: '',
  profile_period: '', profile_agenda_stat: '', profile_service_stat: '', profile_vision_title: '', profile_vision_text: '',
  profile_mission_title: '', profile_mission_text: '', profile_facilities_title: '', profile_facilities_text: '',
  contact_address: '', contact_phone: '', contact_email: '', contact_hours: '', contact_maps_query: '',
}

export default function LiveSiteSettings({ mode }: { mode: 'profile' | 'contact' }) {
  const [settings, setSettings] = useState<Settings>(empty)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    const { data, error: queryError } = await supabase.from('site_settings').select('*').eq('id', true).maybeSingle()
    setError(!!queryError)
    if (!queryError && data) setSettings({ ...empty, ...(data as Partial<Settings>) })
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  if (loading) return <div className="empty-state"><strong>Memuat informasi…</strong><p>Informasi halaman sedang dimuat.</p></div>
  if (error) return <div className="empty-state"><strong>Informasi belum tersedia</strong><p>Pengaturan halaman gagal dimuat.</p></div>

  if (mode === 'profile') return <>
    <PageIntro eyebrow={settings.profile_eyebrow || 'Tentang Masjid'} title={settings.profile_title || settings.site_name} description={settings.profile_description} />
    <PageProfile s={settings} />
  </>

  const mapQuery = settings.contact_maps_query || settings.contact_address
  const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
  const phoneHref = settings.contact_phone.replace(/\s+/g, '')
  return <>
    <div className="contact-grid-page">
      <a className="contact-card-page" href={mapLinkUrl} target="_blank" rel="noopener noreferrer"><MapPin size={24}/><span>Alamat</span><h2>{settings.site_name || 'Miftahul Mubin'}</h2><p>{settings.contact_address || '—'}</p><strong>Buka di Google Maps <ExternalLink size={14}/></strong></a>
      <a className="contact-card-page" href={phoneHref ? `tel:${phoneHref}` : undefined}><Phone size={24}/><span>Telepon Pengurus</span><h2>Kontak Masjid</h2><p>{settings.contact_phone || '—'}<br/>{settings.contact_hours || '—'}</p><strong>Hubungi melalui telepon <ExternalLink size={14}/></strong></a>
      <a className="contact-card-page" href={settings.contact_email ? `mailto:${settings.contact_email}` : undefined}><Mail size={24}/><span>Email</span><h2>{settings.contact_email || '—'}</h2><p>Untuk pertanyaan, informasi kegiatan, dan komunikasi resmi masjid.</p><strong>Kirim email <ExternalLink size={14}/></strong></a>
    </div>
    <section className="map-embed-card" aria-label="Peta lokasi Masjid Miftahul Mubin"><div className="map-embed-head"><div><span className="eyebrow">Lokasi</span><h2>Temukan Masjid di Peta</h2></div><a href={mapLinkUrl} target="_blank" rel="noopener noreferrer">Buka peta <ExternalLink size={14}/></a></div><div className="map-embed-frame"><iframe title="Lokasi Masjid Miftahul Mubin" src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div><p className="map-embed-note">Lokasi mengikuti pengaturan yang ditentukan pengurus melalui panel admin.</p></section>
  </>
}

function PageProfile({ s }: { s: Settings }) {
  const facts = [s.profile_period && [s.profile_period, 'Periode informasi'], s.profile_agenda_stat && [s.profile_agenda_stat, 'Agenda tahun berjalan'], s.profile_service_stat && [s.profile_service_stat, 'Bidang pelayanan']].filter(Boolean) as string[][]
  return <>
    <div className="profile-feature"><div className="profile-visual" aria-hidden="true">{s.profile_image_url ? <img src={s.profile_image_url} alt={s.site_name ? `Foto ${s.site_name}` : 'Foto Miftahul Mubin'} /> : <><span>MM</span><small>{s.site_name}</small></>}</div><div><span className="eyebrow">{s.profile_eyebrow}</span><h2>{s.about_title}</h2><p>{s.about_text}</p>{facts.length > 0 && <div className="profile-facts">{facts.map(([value,label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>}</div></div>
    <section className="profile-columns"><article><span className="eyebrow">Visi</span><h2>{s.profile_vision_title}</h2><p>{s.profile_vision_text}</p></article><article><span className="eyebrow">Misi</span><h2>{s.profile_mission_title}</h2><p>{s.profile_mission_text}</p></article><article><span className="eyebrow">Fasilitas</span><h2>{s.profile_facilities_title}</h2><p>{s.profile_facilities_text}</p></article></section>
  </>
}
