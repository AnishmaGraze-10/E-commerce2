import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000'

type User = {
	_id: string
	email: string
	name: string
	role: 'user' | 'admin'
}

type AuthContextValue = {
	user: User | null
	token: string | null
	isAuthenticated: boolean
	login: (email: string, password: string) => Promise<void>
	register: (name: string, email: string, password: string) => Promise<void>
	logout: () => void
	setAuth: (token: string, user: User) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [token, setToken] = useState<string | null>(null)

	useEffect(() => {
		const storedToken = localStorage.getItem('token')
		const storedUser = localStorage.getItem('user')
		if (storedToken && storedUser) {
			const user = JSON.parse(storedUser)
			setToken(storedToken)
			setUser(user)
			// Ensure currentUser is set
			if (user?._id) {
				localStorage.setItem('currentUser', user._id)
			}
			axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
		}

		// Add axios interceptor for 401 handling
		const interceptor = axios.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response?.status === 401) {
					// Token expired or invalid - clear auth state
					setToken(null)
					setUser(null)
					localStorage.removeItem('token')
					localStorage.removeItem('user')
					localStorage.removeItem('currentUser')
					delete axios.defaults.headers.common['Authorization']
					toast.error('Session expired. Please login again.')
				}
				return Promise.reject(error)
			}
		)

		return () => {
			axios.interceptors.response.eject(interceptor)
		}
	}, [])

	const setAuth = (jwt: string, u: User) => {
		setToken(jwt)
		setUser(u)
		localStorage.setItem('token', jwt)
		localStorage.setItem('user', JSON.stringify(u))
		// Store userId for user-specific data fetching
		localStorage.setItem('currentUser', u._id)
		axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`
		// UserSessionContext will automatically pick up the user and token via useEffect
	}

	const login = async (email: string, password: string) => {
		try {
			const res = await axios.post('/api/auth/login', { email, password })
			const { token: jwt, user: loggedInUser } = res.data
			setAuth(jwt, loggedInUser)
			toast.success('Login successful!')
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Login failed')
			throw error
		}
	}

	const register = async (name: string, email: string, password: string) => {
		try {
			const res = await axios.post('/api/auth/register', { name, email, password })
			const { token: jwt, user: registeredUser } = res.data || {}
			if (jwt && registeredUser) {
				setAuth(jwt, registeredUser)
			} else {
				// Fallback: if backend returns no token, attempt login
				await login(email, password)
			}
			toast.success('Registration successful!')
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Registration failed')
			throw error
		}
	}

	const logout = () => {
		setToken(null)
		setUser(null)
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		localStorage.removeItem('currentUser')
		delete axios.defaults.headers.common['Authorization']
	}

	const value = useMemo(
		() => ({ user, token, isAuthenticated: Boolean(token), login, register, logout, setAuth }),
		[user, token]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}

