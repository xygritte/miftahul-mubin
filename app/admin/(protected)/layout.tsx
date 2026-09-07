import AdminAuthGuard from '@/components/admin/AdminAuthGuard'

export default function AdminProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>
}
