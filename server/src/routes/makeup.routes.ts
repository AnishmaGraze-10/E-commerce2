import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// Apply filters (mock): returns the same url and a list of applied layers
router.post('/try', authMiddleware, async (req, res) => {
	const { imageUrl, layers } = req.body // layers: [{ type: 'lipstick'|'eyeshadow'|'foundation', shade: '#hex' }]
	// In a real impl, we would process server-side or return settings for client-side rendering
	return res.json({ ok: true, imageUrl, applied: layers })
})

// Recommend full look based on mood (mock rules)
router.post('/mood', authMiddleware, async (req, res) => {
	const { mood = 'party', undertone = 'neutral' } = req.body
	const looks: any = {
		party: {
			lipstick: undertone === 'warm' ? 'coral' : undertone === 'cool' ? 'berry' : 'red',
			eyeshadow: undertone === 'warm' ? 'gold' : undertone === 'cool' ? 'silver' : 'bronze',
			foundation: 'long-wear',
			liner: 'winged',
			blush: undertone === 'warm' ? 'peach' : undertone === 'cool' ? 'pink' : 'nude'
		},
		office: {
			lipstick: 'nude', eyeshadow: 'taupe', foundation: 'matte', liner: 'thin', blush: 'soft pink'
		},
		wedding: {
			lipstick: 'red', eyeshadow: 'smokey', foundation: 'long-wear', liner: 'classic', blush: 'rose'
		}
	}
	return res.json(looks[mood] ?? looks.party)
})

export default router




