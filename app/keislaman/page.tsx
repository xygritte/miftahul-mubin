import Link from 'next/link'
import SiteShell from '@/components/layout/SiteShell'
import PageIntro from '@/components/content/PageIntro'
import { ArrowRight } from 'lucide-react'
import { islamicItems } from '@/lib/islamic'

export default function KeislamanPage(){return <SiteShell><main id="main-content" className="inner-page"><div className="container"><PageIntro eyebrow="Ruang Keislaman" title="Keislaman" description="Kumpulan artikel, kajian, khutbah, dan materi keislaman yang dipublikasikan untuk jamaah dan masyarakat."/><div className="filter-row"><span>Semua</span><span>Khutbah</span><span>Kajian</span><span>Al-Qur’an</span><span>Fiqih</span><span>Akhlak</span></div><div className="editorial-list">{islamicItems.map((item,i)=><article className={i===0?'editorial-card lead':'editorial-card'} key={item.slug}><div className="editorial-number">{String(i+1).padStart(2,'0')}</div><div><span>{item.category}</span><h2><Link href={`/keislaman/${item.slug}/`}>{item.title}</Link></h2><small>{item.date}</small><p>{item.excerpt}</p><Link href={`/keislaman/${item.slug}/`}>Baca artikel <ArrowRight size={15}/></Link></div></article>)}</div></div></main></SiteShell>}
