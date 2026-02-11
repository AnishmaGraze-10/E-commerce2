import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import Order from '../models/Order.js'
import { logActivity } from '../utils/logger.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import csv from 'csv-parser'

const router = Router()

router.use(requireAuth, requireAdmin)

// Products CRUD
router.get('/products', async (_req, res) => {
	const products = await Product.find().sort({ createdAt: -1 })
	res.json(products)
})

router.post('/products', async (req, res) => {
	try {
		console.log('Creating product with data:', req.body)
		const created = await Product.create(req.body)
		console.log('Product created successfully:', created)
		logActivity('admin.product.create', { productId: String(created._id) })
		res.status(201).json(created)
	} catch (error) {
		console.error('Error creating product:', error)
		res.status(500).json({ message: 'Failed to create product', error: error.message })
	}
})

router.put('/products/:id', async (req, res) => {
	const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
	logActivity('admin.product.update', { productId: String(req.params.id) })
	res.json(updated)
})

router.delete('/products/:id', async (req, res) => {
	await Product.findByIdAndDelete(req.params.id)
	logActivity('admin.product.delete', { productId: String(req.params.id) })
	res.json({ ok: true })
})

// File upload (image)
const uploadDir = path.resolve('uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadDir),
	filename: (_req, file, cb) => {
		const ext = path.extname(file.originalname)
		cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
	}
})
const upload = multer({ storage })

router.post('/upload', upload.single('image'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No image file provided' })
		}
		const filePath = `/uploads/${req.file.filename}`
		const fullUrl = `${req.protocol}://${req.get('host')}${filePath}`
		console.log('Image uploaded successfully:', { filePath, fullUrl })
		res.status(201).json({ url: filePath, fullUrl })
	} catch (error) {
		console.error('Error uploading image:', error)
		res.status(500).json({ message: 'Failed to upload image', error: error.message })
	}
})

// Bulk CSV upload for products
router.post('/products/bulk-upload', upload.single('file'), async (req, res) => {
	if (!req.file) return res.status(400).json({ message: 'file is required' })
	const rows: any[] = []
	await new Promise<void>((resolve, reject) => {
		fs.createReadStream(req.file!.path)
			.pipe(csv())
			.on('data', (row) => rows.push(row))
			.on('end', () => resolve())
			.on('error', reject)
	})
	const docs = rows.map(r => ({
		name: r.name,
		description: r.description || '',
		price: Number(r.price),
		category: r.category || undefined,
		stock: Number(r.stock || 0),
		imageUrl: r.imageUrl || '',
	}))
	const result = await Product.insertMany(docs, { ordered: false })
	res.json({ success: true, count: result.length })
})

// Users
router.get('/users', async (_req, res) => {
	const users = await User.find().select('-passwordHash').sort({ createdAt: -1 })
	res.json(users)
})

router.patch('/users/:id/block', async (req, res) => {
	const user = await User.findByIdAndUpdate(req.params.id, { $set: { isBlocked: true } }, { new: true })
	logActivity('admin.user.block', { userId: String(req.params.id) })
	res.json({ ok: true, user: user && { _id: user._id, name: user.name, email: user.email, role: user.role, isBlocked: (user as any).isBlocked } })
})

router.patch('/users/:id/unblock', async (req, res) => {
	const user = await User.findByIdAndUpdate(req.params.id, { $set: { isBlocked: false } }, { new: true })
	logActivity('admin.user.unblock', { userId: String(req.params.id) })
	res.json({ ok: true, user: user && { _id: user._id, name: user.name, email: user.email, role: user.role, isBlocked: (user as any).isBlocked } })
})

// Orders
router.get('/orders', async (_req, res) => {
	const orders = await Order.find().populate('user', 'name email').populate('items.product')
	res.json(orders)
})

router.patch('/orders/:id/status', async (req, res) => {
	const { status } = req.body as { status: 'pending' | 'paid' | 'shipped' | 'delivered' }
	const updated = await Order.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true })
	logActivity('admin.order.status', { orderId: String(req.params.id), status })
	res.json(updated)
})

// Analytics
router.get('/analytics/overview', async (_req, res) => {
	const totalOrders = await Order.countDocuments()
	const totalRevenueAgg = await Order.aggregate([
		{ $group: { _id: null, total: { $sum: '$totalAmount' } } }
	])
	const totalRevenue = totalRevenueAgg[0]?.total || 0
	const revenueByDay = await Order.aggregate([
		{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } },
		{ $sort: { _id: 1 } }
	])
	const topProducts = await Order.aggregate([
		{ $unwind: '$items' },
		{ $group: { _id: '$items.product', qty: { $sum: '$items.quantity' } } },
		{ $sort: { qty: -1 } },
		{ $limit: 5 },
		{ $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
		{ $unwind: '$product' },
		{ $project: { _id: 0, productId: '$product._id', name: '$product.name', qty: 1 } }
	])
	res.json({ totals: { orders: totalOrders, revenue: totalRevenue }, revenueByDay, topProducts })
})

// Debug endpoint: quick DB counters without using a DB client
router.get('/debug/db', async (_req, res) => {
    try {
        const [products, users, orders] = await Promise.all([
            Product.countDocuments(),
            User.countDocuments(),
            Order.countDocuments(),
        ])
        const revenueAgg = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }])
        const revenue = revenueAgg[0]?.total || 0
        const latestProduct = await Product.findOne().sort({ createdAt: -1 }).select('name createdAt')
        const latestOrder = await Order.findOne().sort({ createdAt: -1 }).select('createdAt totalAmount status')
        res.json({
            counts: { products, users, orders },
            revenue,
            latest: { product: latestProduct, order: latestOrder },
            serverTime: new Date().toISOString(),
        })
    } catch (err: any) {
        res.status(500).json({ message: 'debug failed', error: err?.message })
    }
})

export default router

