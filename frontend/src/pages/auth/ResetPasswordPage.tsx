import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'

export default function ResetPasswordPage() {
  const [sp] = useSearchParams()
  const token = sp.get('token') || ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post('/api/auth/reset-password', { token, newPassword: password })
      if (res.data?.ok) {
        setMsg('Password reset successful. Redirecting to login...')
        setTimeout(() => navigate('/login'), 1500)
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to reset password')
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto" style={{ maxWidth: 420 }}>
      <h2>Reset Password</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="mb-3">
        <label className="form-label" htmlFor="rp-pass">New Password</label>
        <input id="rp-pass" type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
      </div>
      <button className="btn btn-primary">Reset Password</button>
    </form>
  )
}


