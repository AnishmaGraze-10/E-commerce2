import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

export default function LoginPage() {
	const { login, setAuth } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [roleChoice, setRoleChoice] = useState<'user'|'admin'>('user')
	const [adminCode, setAdminCode] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const navigate = useNavigate()

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError('')
		
		try {
			await login(email, password)
			// Decide destination based on role selection and server role
			const storedUser = localStorage.getItem('user')
			const u = storedUser ? JSON.parse(storedUser) : null
			if (roleChoice === 'admin') {
				// Verify access code on server; server will promote if valid and return token
				const verifyRes = await axios.post('/api/auth/verify-admin', { accessCode: adminCode.trim() })
				if (verifyRes?.data?.token && verifyRes?.data?.user) {
					setAuth(verifyRes.data.token, verifyRes.data.user)
				}
				navigate('/admin')
			} else {
				navigate('/')
			}
		} catch (err: any) {
			if (err.response?.status === 401) {
				setError('Invalid email or password. Please check your credentials and try again.')
			} else if (err.response?.data?.message) {
				setError(err.response.data.message)
			} else {
				setError(err.response?.data?.message || 'Login failed. Please try again.')
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: 400 }}>
			<h2>Login</h2>
			
			{error && (
				<div className="alert alert-danger" role="alert">
					{error}
				</div>
			)}
			
			<div className="mb-3">
				<label className="form-label">Email</label>
				<input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
			</div>
			<div className="mb-3">
				<label className="form-label">Password</label>
				<input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
			</div>
			<div className="mb-3">
				<label className="form-label">Continue as</label>
				<div className="d-flex gap-3">
					<div className="form-check">
						<input className="form-check-input" type="radio" id="roleUser" name="roleChoice" checked={roleChoice==='user'} onChange={() => setRoleChoice('user')} />
						<label className="form-check-label" htmlFor="roleUser">User</label>
					</div>
					<div className="form-check">
						<input className="form-check-input" type="radio" id="roleAdmin" name="roleChoice" checked={roleChoice==='admin'} onChange={() => setRoleChoice('admin')} />
						<label className="form-check-label" htmlFor="roleAdmin">Admin</label>
					</div>
				</div>
			</div>
			{roleChoice === 'admin' && (
				<div className="mb-3">
					<label className="form-label">Admin access code</label>
					<input className="form-control" type="password" value={adminCode} onChange={e => setAdminCode(e.target.value)} placeholder="Enter access code" required />
					<small className="text-muted">Only admins can proceed to the dashboard.</small>
				</div>
			)}
			<button className="btn btn-primary" disabled={loading}>
				{loading ? 'Logging in...' : 'Login'}
			</button>
			
			<div className="mt-3 text-center">
				<p>Don't have an account? <a href="/register">Register here</a></p>
				<p className="mt-2"><a href="/forgot-password">Forgot password?</a></p>
			</div>
		</form>
	)
}

