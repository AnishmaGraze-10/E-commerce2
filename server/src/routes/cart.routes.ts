import { Router } from 'express'
import Cart from '../models/Cart'
import Product from '../models/Product'
import { authMiddleware } from '../middleware/auth'

const router = Router()

function buildCartResponse(cart: any, userId: string) {
	if (!cart) {
		return { userId, items: [], totalItems: 0 }
	}

	const items = cart.items.map((item: any) => {
		const productDoc = item.productId && typeof item.productId === 'object' && 'name' in item.productId
			? item.productId
			: null
		const rawProductId = productDoc?._id ?? item.productId
		const productId = rawProductId?.toString?.() ?? String(rawProductId)

		return {
			id: item._id.toString(),
			productId,
			qty: item.qty,
			shadeId: item.shadeId ?? null,
			product: productDoc
				? {
					_id: productDoc._id,
					name: productDoc.name,
					price: productDoc.price,
					imageUrl: productDoc.imageUrl,
					description: productDoc.description,
					category: productDoc.category,
					stock: productDoc.stock
				}
				: null
		}
	})

	return {
		userId,
		items,
		totalItems: items.reduce((sum: number, item: any) => sum + item.qty, 0)
	}
}

async function getOrCreateCart(userId: string) {
	let cart = await Cart.findOne({ userId })
	if (!cart) {
		cart = await Cart.create({ userId, items: [] })
	}
	return cart
}

// Get cart
router.get('/', authMiddleware, async (req: any, res) => {
	const userId = req.user._id
	try {
		const cart = await Cart.findOne({ userId }).populate('items.productId')
		res.json(buildCartResponse(cart, userId))
	} catch (error) {
		console.error('Cart fetch failed', error)
		res.status(500).json({ message: 'Failed to load cart' })
	}
})

// Add to cart
router.post('/add', authMiddleware, async (req: any, res) => {
	const userId = req.user._id
	const { productId, shadeId, qty = 1 } = req.body

	if (!productId) {
		return res.status(400).json({ message: 'productId is required' })
	}

	try {
		const product = await Product.findById(productId)
		if (!product) return res.status(404).json({ message: 'Product not found' })

		const quantity = Math.max(1, Number(qty) || 1)
		const cart = await getOrCreateCart(userId)
		const existing = cart.items.find(
			(i) => i.productId.toString() === productId && (i.shadeId ?? null) === (shadeId ?? null)
		)

		if (existing) {
			existing.qty += quantity
		} else {
			cart.items.push({ productId, shadeId, qty: quantity })
		}

		await cart.save()
		await cart.populate('items.productId')
		res.json(buildCartResponse(cart, userId))
	} catch (error) {
		console.error('Add to cart failed', error)
		res.status(500).json({ message: 'Unable to add to cart' })
	}
})

// Update quantity for a specific cart item
router.patch('/item/:itemId', authMiddleware, async (req: any, res) => {
	const userId = req.user._id
	const { itemId } = req.params
	const { qty } = req.body

	const nextQty = Number(qty)
	if (Number.isNaN(nextQty) || nextQty < 0) {
		return res.status(400).json({ message: 'qty must be a non-negative number' })
	}

	try {
		const cart = await getOrCreateCart(userId)
		const item = cart.items.id(itemId)
		if (!item) return res.status(404).json({ message: 'Cart item not found' })

		if (nextQty === 0) {
			item.deleteOne()
		} else {
			item.qty = nextQty
		}

		await cart.save()
		await cart.populate('items.productId')
		res.json(buildCartResponse(cart, userId))
	} catch (error) {
		console.error('Update cart item failed', error)
		res.status(500).json({ message: 'Unable to update cart item' })
	}
})

// Remove a specific cart item
router.delete('/item/:itemId', authMiddleware, async (req: any, res) => {
	const userId = req.user._id
	const { itemId } = req.params

	try {
		const cart = await getOrCreateCart(userId)
		const item = cart.items.id(itemId)
		if (!item) return res.status(404).json({ message: 'Cart item not found' })

		item.deleteOne()
		await cart.save()
		await cart.populate('items.productId')
		res.json(buildCartResponse(cart, userId))
	} catch (error) {
		console.error('Remove cart item failed', error)
		res.status(500).json({ message: 'Unable to remove item' })
	}
})

// Clear cart
router.delete('/', authMiddleware, async (req: any, res) => {
	const userId = req.user._id
	try {
		await Cart.findOneAndUpdate({ userId }, { items: [] }, { upsert: true })
		res.json({ userId, items: [], totalItems: 0 })
	} catch (error) {
		console.error('Clear cart failed', error)
		res.status(500).json({ message: 'Unable to clear cart' })
	}
})

// Recommend bundles based on cart
router.get('/recommend', authMiddleware, async (req: any, res) => {
	const userId = req.user._id
	try {
		const cart = await Cart.findOne({ userId })
		if (!cart || cart.items.length === 0) return res.json([])
		const productIds = cart.items.map(i => i.productId)
		const products = await Product.find({ _id: { $in: productIds } })

		// Simple rule: if cart has foundation → suggest setting spray/primer/loose powder
		const categories = new Set(products.map(p => p.category))
		const recs: any[] = []
		if (categories.has('foundation')) {
			const suggestions = await Product.find({ category: { $in: ['setting_spray', 'primer', 'loose_powder'] } }).limit(6)
			recs.push(...suggestions.map(s => ({ productId: s._id, reason: 'pairs_with_foundation', confidence: 0.8 })))
		}
		res.json(recs)
	} catch (error) {
		console.error('Cart recommendation failed', error)
		res.status(500).json({ message: 'Unable to generate recommendations' })
	}
})

export default router
