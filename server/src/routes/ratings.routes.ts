import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import Rating from '../models/Rating'
import Product from '../models/Product'
import Diary from '../models/Diary'
import mongoose from 'mongoose'
import multer from 'multer'
import fs from 'fs'
import { parse } from 'fast-csv'

const router = Router()
const upload = multer({ dest: 'uploads' })

async function updateAggregates(itemType: 'product' | 'diary', itemId: string | mongoose.Types.ObjectId) {
  const filter: any = { itemType, itemId: String(itemId) }
  const agg = await Rating.aggregate([
    { $match: filter },
    { $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } }
  ])
  const average = agg[0]?.avg || 0
  const total = agg[0]?.total || 0
  if (itemType === 'product') {
    await Product.findByIdAndUpdate(itemId, { averageRating: average, totalRatings: total })
  } else {
    await Diary.findByIdAndUpdate(itemId, { $set: { }, $setOnInsert: { } }) // keep for type consistency
  }
  return { averageRating: average, totalRatings: total }
}

router.post('/', requireAuth, async (req: any, res) => {
  try {
    const { itemId, itemType, rating, reviewText } = req.body || {}
    if (!itemId || (itemType !== 'product' && itemType !== 'diary')) return res.status(400).json({ message: 'Invalid payload' })
    const r = Number(rating)
    if (!Number.isFinite(r) || r < 1 || r > 5) return res.status(400).json({ message: 'Rating must be 1-5' })

    const key = { userId: req.user._id, itemId: String(itemId), itemType }
    const update = { $set: { rating: r, reviewText: reviewText || '' } }
    await Rating.updateOne(key, update, { upsert: true })

    const aggregates = await updateAggregates(itemType, itemId)
    return res.json({ ok: true, userRating: r, ...aggregates })
  } catch (e) {
    console.error('ratings POST error', e)
    res.status(500).json({ message: 'Failed to save rating' })
  }
})

router.get('/:itemType/:itemId', async (req: any, res) => {
  try {
    const { itemType, itemId } = req.params
    if (itemType !== 'product' && itemType !== 'diary') return res.status(400).json({ message: 'Invalid type' })
    const filter: any = { itemType, itemId: String(itemId) }
    const agg = await Rating.aggregate([
      { $match: filter },
      { $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } }
    ])
    const averageRating = agg[0]?.avg || 0
    const totalRatings = agg[0]?.total || 0
    let userRating: number | null = null
    const authHeader = req.headers.authorization || ''
    if (authHeader.startsWith('Bearer ')) {
      const userId = (req as any).user?._id // may be unset if no auth middleware; we just skip
      if (userId) {
        const existing = await Rating.findOne({ ...filter, userId })
        userRating = existing?.rating ?? null
      }
    }
    return res.json({ averageRating, totalRatings, userRating })
  } catch (e) {
    console.error('ratings GET error', e)
    res.status(500).json({ message: 'Failed to fetch ratings' })
  }
})

router.get('/:itemType/:itemId/distribution', async (req: any, res) => {
  try {
    const { itemType, itemId } = req.params
    if (itemType !== 'product' && itemType !== 'diary') return res.status(400).json({ message: 'Invalid type' })
    const filter: any = { itemType, itemId: String(itemId) }
    const buckets = await Rating.aggregate([
      { $match: filter },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ])
    const dist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    for (const b of buckets) dist[String(b._id)] = b.count
    const total = Object.values(dist).reduce((a, b) => a + b, 0)
    const average = total ? (1*dist['1']+2*dist['2']+3*dist['3']+4*dist['4']+5*dist['5'])/total : 0
    res.json({ distribution: dist, totalRatings: total, averageRating: average })
  } catch (e) {
    console.error('ratings distribution error', e)
    res.status(500).json({ message: 'Failed to fetch distribution' })
  }
})

export default router

// CSV upload for ratings
router.post('/upload', requireAuth, upload.single('file'), async (req: any, res) => {
  if (!req.file) return res.status(400).json({ message: 'CSV file is required' })
  const results: Array<{ userId: string; itemId: string; rating: number; itemType: 'product'|'diary'; createdAt?: string }> = []
  try {
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(parse({ headers: true, ignoreEmpty: true, trim: true }))
        .on('error', reject)
        .on('data', (row: any) => {
          // Columns: userId, itemId, rating, createdAt, [itemType]
          const ratingNum = Number(row.rating)
          if (!row.userId || !row.itemId || !Number.isFinite(ratingNum)) return
          const itemType = (row.itemType === 'diary') ? 'diary' : 'product'
          results.push({ userId: String(row.userId), itemId: String(row.itemId), rating: Math.max(1, Math.min(5, Math.round(ratingNum))), itemType, createdAt: row.createdAt })
        })
        .on('end', () => resolve())
    })

    let upserts = 0
    // Upsert each rating
    for (const r of results) {
      const key: any = { userId: new mongoose.Types.ObjectId(r.userId), itemId: String(r.itemId), itemType: r.itemType }
      const update: any = { $set: { rating: r.rating } }
      if (r.createdAt) update.$set.createdAt = new Date(r.createdAt)
      await Rating.updateOne(key, update, { upsert: true })
      await updateAggregates(r.itemType, r.itemId)
      upserts += 1
    }

    // Cleanup temp file
    fs.unlink(req.file.path, () => {})
    return res.json({ ok: true, imported: upserts })
  } catch (e) {
    console.error('ratings CSV upload error', e)
    return res.status(500).json({ message: 'Failed to import CSV' })
  }
})

// CSV export for ratings
router.get('/export', async (_req, res) => {
  try {
    const rows = await Rating.find({}).lean()
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="ratings.csv"')
    // Write header
    res.write('userId,itemId,itemType,rating,createdAt\n')
    for (const r of rows) {
      const line = `${r.userId},${r.itemId},${r.itemType},${r.rating},${(r.createdAt as any)?.toISOString?.() || ''}\n`
      res.write(line)
    }
    res.end()
  } catch (e) {
    console.error('ratings CSV export error', e)
    res.status(500).json({ message: 'Failed to export CSV' })
  }
})


