import Header from './Header'
import Footer from './Footer'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
