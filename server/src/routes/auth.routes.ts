import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { logActivity } from '../utils/logger'
import { requireAuth } from '../middleware/auth'
import crypto from 'crypto'
import User from '../models/User'

const router = Router()

router.post('/register', async (req, res) => {
	try {
		const { name, email, password } = req.body
		
		// Validate input fields
		if (!name || !email || !password) {
			return res.status(400).json({ 
				message: 'All fields are required: name, email, and password' 
			})
		}
		
		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return res.status(400).json({ 
				message: 'Please enter a valid email address' 
			})
		}
		
		// Validate password strength
		if (password.length < 6) {
			return res.status(400).json({ 
				message: 'Password must be at least 6 characters long' 
			})
		}
		
		// Check if user already exists
		const existingUser = await User.findOne({ email: email.toLowerCase() })
		if (existingUser) {
			return res.status(409).json({ 
				message: 'An account with this email already exists. Please use a different email or try logging in.' 
			})
		}
		
		// Hash password and create user
		const passwordHash = await bcrypt.hash(password, 10)
		const user = await User.create({ 
			name: name.trim(), 
			email: email.toLowerCase().trim(), 
			passwordHash 
		})
		

		// Generate JWT and return user + token to auto-login
		const token = jwt.sign(
			{ _id: String(user._id), role: user.role },
			process.env.JWT_SECRET || 'dev_secret',
			{ expiresIn: '7d' }
		)

		// Log the registration
		logActivity('user.register', { userId: String(user._id), email: user.email })
		
		res.status(201).json({ 
			token,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role
			}
		})
		
	} catch (error) {
		console.error('Registration error:', error)
		res.status(500).json({ 
			message: 'Internal server error. Please try again later.' 
		})
	}
})

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body
		
		// Validate input
		if (!email || !password) {
			return res.status(400).json({ 
				message: 'Email and password are required' 
			})
		}
		
		// Find user
		const user = await User.findOne({ email: email.toLowerCase() })
		if (!user) {
			return res.status(401).json({ 
				message: 'Invalid email or password' 
			})
		}
		
		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
		if (!isPasswordValid) {
			return res.status(401).json({ 
				message: 'Invalid email or password' 
			})
		}
		
		// Generate JWT token
		const token = jwt.sign(
			{ _id: String(user._id), role: user.role }, 
			process.env.JWT_SECRET || 'dev_secret', 
			{ expiresIn: '7d' }
		)
		
		// Log the login
		logActivity('user.login', { userId: String(user._id), email: user.email })
		
		res.json({ 
			token, 
			user: { 
				_id: user._id, 
				name: user.name, 
				email: user.email, 
				role: user.role 
			} 
		})
		
	} catch (error) {
		console.error('Login error:', error)
		res.status(500).json({ 
			message: 'Internal server error. Please try again later.' 
		})
	}
})

// Verify admin access code; if valid, upgrade the current user to admin and return a fresh token
router.post('/verify-admin', requireAuth, async (req: any, res) => {
  try {
    const { accessCode } = req.body || {}
    if (!accessCode || typeof accessCode !== 'string') {
      return res.status(400).json({ message: 'Access code is required' })
    }
    const expected = process.env.ADMIN_ACCESS_CODE || 'ADMIN2025'
    if (accessCode.trim() !== expected) {
      return res.status(403).json({ message: 'Invalid admin access code' })
    }
    const user = await User.findById(req.user!._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.role !== 'admin') {
      user.role = 'admin'
      await user.save()
      logActivity('user.promote_to_admin', { userId: String(user._id), email: user.email })
    }

    const token = jwt.sign(
      { _id: String(user._id), role: user.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    )

    return res.json({ ok: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    console.error('verify-admin error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

// Password reset request
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!email) return res.status(400).json({ message: 'Email is required' })
    const user = await User.findOne({ email: String(email).toLowerCase() })
    if (!user) return res.json({ ok: true }) // do not reveal existence
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 15 * 60 * 1000)
    user.resetPasswordToken = token
    user.resetPasswordExpires = expires as any
    await user.save()
    const resetLink = `http://localhost:5173/reset-password?token=${encodeURIComponent(token)}`
    console.log('\n[DEV] Password reset link:', resetLink, '\n')
    return res.json({ ok: true, devResetLink: resetLink })
  } catch (e) {
    console.error('request-password-reset error', e)
    res.status(500).json({ message: 'Failed to start reset' })
  }
})

// Password reset confirm
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body || {}
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required' })
    if (String(newPassword).trim().length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } })
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' })
    user.passwordHash = await (await import('bcryptjs')).hash(String(newPassword).trim(), 10)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()
    logActivity('user.reset_password', { userId: String(user._id), email: user.email })
    return res.json({ ok: true })
  } catch (e) {
    console.error('reset-password error', e)
    res.status(500).json({ message: 'Failed to reset password' })
  }
})

