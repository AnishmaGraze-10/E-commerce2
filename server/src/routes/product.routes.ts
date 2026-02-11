import { Router } from 'express'
import Product from '../models/Product.js'

const router = Router()

router.get('/', async (req, res) => {
    const { q, category, minPrice, maxPrice, sort, rating } = req.query as Record<string, string>
	const filter: any = {}
    const queryKey = q || (req.query as any).query // support both q and query
    if (queryKey) filter.name = { $regex: queryKey, $options: 'i' }
	if (category) filter.category = category
	if (minPrice || maxPrice) filter.price = { ...(minPrice ? { $gte: Number(minPrice) } : {}), ...(maxPrice ? { $lte: Number(maxPrice) } : {}) }
    if (rating) filter.averageRating = { $gte: Number(rating) }
	let query = Product.find(filter)
    if (sort === 'price_asc') query = query.sort({ price: 1 })
    else if (sort === 'price_desc') query = query.sort({ price: -1 })
    else if (sort === 'rating_desc') query = query.sort({ averageRating: -1, totalRatings: -1 })
    else query = query.sort({ createdAt: -1 })
	const products = await query
	res.json(products)
})

router.get('/:id', async (req, res) => {
	const p = await Product.findById(req.params.id)
	if (!p) return res.status(404).json({ message: 'Not found' })
	res.json(p)
})

export default router

