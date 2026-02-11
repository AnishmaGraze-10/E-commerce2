import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

type UserSession = {
	userId: string
	email: string
	name: string
	role?: 'user' | 'admin'
	token: string
	cart?: any
	orders?: any[]
	preferences?: any
	lastActive: string
}

type UserSessions = {
	[userId: string]: UserSession
}

type UserSessionContextValue = {
	currentUserId: string | null
	sessions: UserSessions
	switchUser: (userId: string) => Promise<void>
	addSession: (user: { _id: string; email: string; name: string }, token: string) => void
	removeSession: (userId: string) => void
	getSession: (userId: string) => UserSession | null
	updateSessionData: (userId: string, data: { cart?: any; orders?: any[]; preferences?: any }) => void
}

const UserSessionContext = createContext<UserSessionContextValue | undefined>(undefined)

const STORAGE_KEY = 'userSessions'
const CURRENT_USER_KEY = 'currentUser'

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
	const { user, token, setAuth, logout } = useAuth()
	const [sessions, setSessions] = useState<UserSessions>({})
	const [currentUserId, setCurrentUserId] = useState<string | null>(null)

	// Load sessions from localStorage on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY)
			const storedCurrentUser = localStorage.getItem(CURRENT_USER_KEY)
			if (stored) {
				const parsed = JSON.parse(stored)
				setSessions(parsed)
			}
			if (storedCurrentUser) {
				setCurrentUserId(storedCurrentUser)
			}
		} catch (error) {
			console.error('Failed to load user sessions:', error)
		}
	}, [])

	// Save sessions to localStorage whenever they change
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
		} catch (error) {
			console.error('Failed to save user sessions:', error)
		}
	}, [sessions])

	// Add or update session when user logs in
	useEffect(() => {
		if (user && token) {
			const userId = user._id
			setSessions((prev) => {
				const existing = prev[userId]
				return {
					...prev,
					[userId]: {
						userId,
						email: user.email,
						name: user.name,
						role: user.role,
						token,
						cart: existing?.cart,
						orders: existing?.orders,
						preferences: existing?.preferences,
						lastActive: new Date().toISOString()
					}
				}
			})
			setCurrentUserId(userId)
			localStorage.setItem(CURRENT_USER_KEY, userId)
		}
	}, [user, token])

	const addSession = useCallback((user: { _id: string; email: string; name: string; role?: 'user' | 'admin' }, token: string) => {
		const userId = user._id
		setSessions((prev) => ({
			...prev,
			[userId]: {
				userId,
				email: user.email,
				name: user.name,
				role: user.role || 'user',
				token,
				lastActive: new Date().toISOString()
			}
		}))
		setCurrentUserId(userId)
		localStorage.setItem(CURRENT_USER_KEY, userId)
	}, [])

	const removeSession = useCallback((userId: string) => {
		setSessions((prev) => {
			const updated = { ...prev }
			delete updated[userId]
			return updated
		})
		if (currentUserId === userId) {
			setCurrentUserId(null)
			localStorage.removeItem(CURRENT_USER_KEY)
		}
	}, [currentUserId])

	const updateSessionData = useCallback((userId: string, data: { cart?: any; orders?: any[]; preferences?: any }) => {
		setSessions((prev) => {
			const existing = prev[userId]
			if (!existing) return prev
			return {
				...prev,
				[userId]: {
					...existing,
					...data,
					lastActive: new Date().toISOString()
				}
			}
		})
	}, [])

	const switchUser = useCallback(async (userId: string) => {
		const session = sessions[userId]
		if (!session) {
			throw new Error('Session not found')
		}

		// Update current user
		setCurrentUserId(userId)
		localStorage.setItem(CURRENT_USER_KEY, userId)

		// Set auth context with the session's token and user
		// This will trigger all contexts to refresh with the new user's data
		setAuth(session.token, {
			_id: session.userId,
			email: session.email,
			name: session.name,
			role: session.role || 'user'
		})

		// Force a page reload or trigger refresh in all contexts
		// The CartContext, OrdersPage, ProfilePage will all refresh due to user dependency
	}, [sessions, setAuth])

	const getSession = useCallback((userId: string): UserSession | null => {
		return sessions[userId] || null
	}, [sessions])

	const value = useMemo(
		() => ({
			currentUserId,
			sessions,
			switchUser,
			addSession,
			removeSession,
			getSession,
			updateSessionData
		}),
		[currentUserId, sessions, switchUser, addSession, removeSession, getSession, updateSessionData]
	)

	return <UserSessionContext.Provider value={value}>{children}</UserSessionContext.Provider>
}

export function useUserSession() {
	const ctx = useContext(UserSessionContext)
	if (!ctx) {
		throw new Error('useUserSession must be used within UserSessionProvider')
	}
	return ctx
}

