import { useState } from 'react'
import axios from 'axios'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState<string>('')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post('/api/auth/request-password-reset', { email })
      setSent('If an account exists, a reset link was sent. In dev, see server logs for the link.')
      if (res.data?.devResetLink) setSent(`Dev reset link: ${res.data.devResetLink}`)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to request reset')
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto" style={{ maxWidth: 420 }}>
      <h2>Forgot Password</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {sent && <div className="alert alert-info">{sent}</div>}
      <div className="mb-3">
        <label className="form-label" htmlFor="fp-email">Email</label>
        <input id="fp-email" type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <button className="btn btn-primary">Send Reset Link</button>
    </form>
  )
}


