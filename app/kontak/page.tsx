import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import LiveSiteSettings from '@/components/live/LiveSiteSettings'

export default function KontakPage(){return <SiteShell><main id="main-content" className="inner-page"><div className="container"><PageIntro eyebrow="Hubungi Kami" title="Kontak Miftahul Mubin" description="Informasi kontak, jam layanan, dan lokasi yang dapat diperbarui oleh pengurus melalui panel admin."/><LiveSiteSettings mode="contact"/></div></main></SiteShell>}
