import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import LiveSiteSettings from '@/components/live/LiveSiteSettings'

export default function ProfilPage(){return <SiteShell><main id="main-content" className="inner-page"><div className="container"><PageIntro eyebrow="Tentang Masjid" title="Profil Miftahul Mubin" description="Informasi profil masjid yang dapat diperbarui oleh pengurus melalui panel admin."/><LiveSiteSettings mode="profile"/></div></main></SiteShell>}
