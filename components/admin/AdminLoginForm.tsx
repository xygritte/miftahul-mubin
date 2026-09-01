'use client'

import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { sitePath } from '@/lib/data/presentation'

export default function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError || !authData.session || !authData.user) {
      setError('Email atau kata sandi tidak valid.')
      setBusy(false)
      return
    }

    const { data: hasAdminAccess, error: accessError } = await supabase.rpc('has_admin_access')
    if (accessError) {
      console.error('Admin access check failed after login:', accessError)
      await supabase.auth.signOut()
      setError('Sesi berhasil dibuat, tetapi akses panel gagal diverifikasi. Coba lagi.')
      setBusy(false)
      return
    }

    if (hasAdminAccess !== true) {
      await supabase.auth.signOut()
      setError('Akun berhasil masuk, tetapi belum memiliki role pengelola.')
      setBusy(false)
      return
    }

    window.location.assign(sitePath('/admin/'))
  }

  return <form className="admin-login-form" onSubmit={submit}>
    <label><span>Email pengelola</span><div className="admin-input-wrap"><Mail size={17} aria-hidden="true" /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="nama@masjid.id" required /></div></label>
    <label><span>Kata sandi</span><div className="admin-input-wrap"><LockKeyhole size={17} aria-hidden="true" /><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Masukkan kata sandi" minLength={6} required /><button type="button" className="admin-password-toggle" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
    {error && <p className="admin-form-error" role="alert">{error}</p>}
    <button className="admin-button primary admin-login-submit" disabled={busy} type="submit">{busy ? 'Memproses…' : 'Masuk ke panel'}</button>
    <p className="admin-form-note">Akses hanya untuk akun yang telah diberi role pengelola di database.</p>
  </form>
}
