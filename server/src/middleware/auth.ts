import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export type JwtUser = { _id: string; role: 'user' | 'admin' }

declare module 'express-serve-static-core' {
	interface Request {
		user?: JwtUser
	}
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const header = req.headers.authorization || ''
	const token = header.startsWith('Bearer ') ? header.slice(7) : null
	if (!token) return res.status(401).json({ message: 'Unauthorized' })
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as JwtUser
		req.user = payload
		return next()
	} catch {
		return res.status(401).json({ message: 'Invalid token' })
	}
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
	if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
	if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
	return next()
}

// Backwards-compatible named export used by new routes
export const authMiddleware = requireAuth

