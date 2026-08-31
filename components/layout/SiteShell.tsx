import Header from './Header'
import Footer from './Footer'
import { contentRepository } from '@/lib/data'
import { buildSearchEntries } from '@/lib/data/presentation'

export default async function SiteShell({ children }: { children: React.ReactNode }) {
  const [news, islamic, events] = await Promise.all([
    contentRepository.listNews(),
    contentRepository.listIslamic(),
    contentRepository.listEvents(),
  ])

  return (
    <>
      <Header searchItems={buildSearchEntries(news, islamic, events)} />
      {children}
      <Footer />
    </>
  )
}
