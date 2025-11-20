import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

export default function RegisterPage() {
	const { register, setAuth } = useAuth()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [roleChoice, setRoleChoice] = useState<'user'|'admin'>('user')
	const [adminCode, setAdminCode] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const navigate = useNavigate()

	const ADMIN_ACCESS_CODE = 'ADMIN2025'

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError('')
		
		try {
			await register(name, email, password)
			if (roleChoice === 'admin') {
				const verifyRes = await axios.post('/api/auth/verify-admin', { accessCode: adminCode.trim() })
				if (verifyRes?.data?.token && verifyRes?.data?.user) {
					setAuth(verifyRes.data.token, verifyRes.data.user)
				}
				navigate('/admin')
			} else {
				navigate('/')
			}
		} catch (err: any) {
			if (err.response?.status === 409) {
				setError('This email is already registered. Please use a different email or try logging in.')
			} else if (err.response?.data?.message) {
				setError(err.response.data.message)
			} else {
				setError('Registration failed. Please try again.')
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: 400 }}>
			<h2>Register</h2>
			
			{error && (
				<div className="alert alert-danger" role="alert">
					{error}
				</div>
			)}
			
			<div className="mb-3">
				<label className="form-label">Name</label>
				<input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
			</div>
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
						<input className="form-check-input" type="radio" id="regRoleUser" name="regRoleChoice" checked={roleChoice==='user'} onChange={() => setRoleChoice('user')} />
						<label className="form-check-label" htmlFor="regRoleUser">User</label>
					</div>
					<div className="form-check">
						<input className="form-check-input" type="radio" id="regRoleAdmin" name="regRoleChoice" checked={roleChoice==='admin'} onChange={() => setRoleChoice('admin')} />
						<label className="form-check-label" htmlFor="regRoleAdmin">Admin</label>
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
				{loading ? 'Registering...' : 'Register'}
			</button>
			
			<div className="mt-3 text-center">
				<p>Already have an account? <a href="/login">Login here</a></p>
			</div>
		</form>
	)
}

