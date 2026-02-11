import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import User from '../models/User.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'

const router = Router()
router.use(requireAuth)

// ensure uploads
const uploadDir = path.resolve('uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
const upload = multer({ dest: uploadDir })

router.get('/profile', async (req: any, res) => {
  try {
    const u = await User.findById(req.user!._id).select('-passwordHash')
    if (!u) return res.status(404).json({ message: 'User not found' })
    return res.json(u)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return res.status(500).json({ message: 'Error fetching profile' })
  }
})

router.put('/profile', async (req: any, res) => {
  try {
    const { name, phone, bio, email } = req.body || {}
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Name is required' })
    }
    if (email && typeof email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: 'Invalid email' })
      }
    }
    const u = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: { name: name.trim(), email: email?.trim?.()?.toLowerCase?.(), phone: phone?.trim?.(), bio: typeof bio === 'string' ? bio.trim().slice(0, 500) : undefined } },
      { new: true }
    ).select('-passwordHash')
    if (!u) return res.status(404).json({ message: 'User not found' })
    return res.json(u)
  } catch (error) {
    console.error('Error updating profile:', error)
    return res.status(500).json({ message: 'Error updating profile' })
  }
})

router.post('/change-password', async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' })
    }
    if (String(newPassword).trim().length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }
    const user = await User.findById(req.user!._id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    const ok = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!ok) return res.status(400).json({ message: 'Current password incorrect' })
    user.passwordHash = await bcrypt.hash(String(newPassword).trim(), 10)
    await user.save()
    return res.json({ ok: true })
  } catch (error) {
    console.error('Error changing password:', error)
    return res.status(500).json({ message: 'Error changing password' })
  }
})

router.post('/avatar', upload.single('avatar'), async (req: any, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' })
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only image files allowed' })
    }
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size must be less than 5MB' })
    }
    const url = `/uploads/${req.file.filename}`
    const u = await User.findByIdAndUpdate(req.user!._id, { $set: { avatarUrl: url, profilePic: url } }, { new: true }).select('-passwordHash')
    return res.json({ url, user: u })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return res.status(500).json({ message: 'Error uploading avatar' })
  }
})

router.post('/addresses', async (req: any, res) => {
  try {
    const { line1, line2, city, state, postalCode, country } = req.body || {}
    if (!line1 || typeof line1 !== 'string') {
      return res.status(400).json({ message: 'line1 is required' })
    }
    const update = await User.findByIdAndUpdate(
      req.user!._id,
      { $push: { addresses: { line1: line1.trim(), line2, city, state, postalCode, country } } },
      { new: true }
    ).select('-passwordHash')
    if (!update) return res.status(404).json({ message: 'User not found' })
    return res.json(update)
  } catch (error) {
    console.error('Error adding address:', error)
    return res.status(500).json({ message: 'Error adding address' })
  }
})

export default router


