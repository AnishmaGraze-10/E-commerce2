import { Router } from 'express'
import Wishlist from '../models/Wishlist.js'
import Product from '../models/Product.js'
import PriceHistory from '../models/PriceHistory.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// Toggle add/remove
router.post('/toggle', authMiddleware, async (req: any, res) => {
	const userId = req.user._id
	const { productId, shadeId } = req.body
	let wl = await Wishlist.findOne({ userId })
	if (!wl) wl = await Wishlist.create({ userId, items: [] })
	const idx = wl.items.findIndex(i => i.productId.toString() === productId && i.shadeId === shadeId)
	if (idx >= 0) wl.items.splice(idx, 1)
	else wl.items.push({ productId, shadeId, addedAt: new Date() })
	await wl.save()
	res.json(wl)
})

// List
router.get('/', authMiddleware, async (req: any, res) => {
	const userId = req.user._id
	const wl = await Wishlist.findOne({ userId })
	res.json(wl ?? { userId, items: [] })
})

// Alerts: price drop or restock
router.get('/alerts', authMiddleware, async (req: any, res) => {
	const userId = req.user._id
	const wl = await Wishlist.findOne({ userId })
	if (!wl) return res.json([])
	const productIds = wl.items.map(i => i.productId)
	const products = await Product.find({ _id: { $in: productIds } })
	const alerts: any[] = []
	for (const p of products) {
		// Price drop: compare latest two entries
		const history = await PriceHistory.find({ productId: p._id }).sort({ date: -1 }).limit(2)
		if (history.length === 2 && history[0].price < history[1].price) {
			alerts.push({ type: 'price_drop', productId: p._id, from: history[1].price, to: history[0].price })
		}
		// Restock
		if (p.stock > 0) {
			alerts.push({ type: 'restock', productId: p._id, stock: p.stock })
		}
	}
	res.json(alerts)
})

export default router




