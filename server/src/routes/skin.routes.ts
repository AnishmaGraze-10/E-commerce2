import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// Detect undertone from image (mock/simple)
router.post('/analyze', authMiddleware, async (req, res) => {
	const { imageUrl } = req.body
	// For now return neutral with suggestions; replace with real ML later
	const undertone = 'neutral'
	const suggestions = {
		undertone,
		shades: ['nude', 'beige', 'balanced']
	}
	return res.json({ ok: true, imageUrl, ...suggestions })
})

export default router




