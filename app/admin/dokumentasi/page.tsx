import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminShell from '@/components/admin/AdminShell'
import AdminModulePlaceholder from '@/components/admin/AdminModulePlaceholder'

export default function AdminDokumentasiPage(){return <AdminAuthGuard><AdminShell><AdminModulePlaceholder title="Kelola Dokumentasi" description="Modul ini akan menangani album, foto, video, urutan media, caption, dan penyimpanan Supabase Storage." /></AdminShell></AdminAuthGuard>}
