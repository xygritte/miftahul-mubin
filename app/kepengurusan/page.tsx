import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import { contentRepository } from '@/lib/data'

export default async function KepengurusanPage() {
  const periods = await contentRepository.listManagementPeriods()
  const activePeriod = periods.find((period) => period.isActive) ?? periods[0]
  const members = activePeriod ? await contentRepository.listManagementMembers(activePeriod.id) : []
  const lead = members[0]

  return <SiteShell><main id="main-content" className="inner-page"><div className="container">
    <PageIntro eyebrow="Profil Organisasi" title="Kepengurusan Miftahul Mubin" description="Informasi struktur pengurus dan bidang pelayanan yang menjalankan kegiatan Masjid Miftahul Mubin." />
    {activePeriod && members.length > 0 ? <section className="org-tree-page">
      <article className="management-lead page-lead"><span className="management-avatar">{initials(lead?.name ?? '')}</span><div><span>{lead?.position}</span><strong>{lead?.name}</strong></div></article>
      <div className="org-connector"/>
      <div className="org-grid">{members.slice(1).map((member) => <article className="management-card" key={member.id ?? member.name}><span className="management-avatar small">{initials(member.name)}</span><div><span>{member.position}</span><strong>{member.name}</strong></div></article>)}</div>
    </section> : <div className="empty-state"><strong>Data kepengurusan belum tersedia</strong><p>Struktur pengurus aktif belum dipublikasikan.</p></div>}
    {activePeriod && <section className="role-note"><span className="eyebrow">Periode Aktif</span><h2>{activePeriod.name}</h2><p>Periode kepengurusan aktif digunakan sebagai acuan struktur pelayanan jamaah pada portal Miftahul Mubin.</p></section>}
  </div></main></SiteShell>
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'MM'
}
