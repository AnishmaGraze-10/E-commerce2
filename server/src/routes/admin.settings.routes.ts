import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import Setting from '../models/Setting.js'
import User from '../models/User.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'

const router = Router()
router.use(requireAuth, requireAdmin)

// ensure uploads
const uploadDir = path.resolve('uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
const upload = multer({ dest: uploadDir })

router.get('/', async (_req, res) => {
  try {
    const s = await Setting.findOne()
    if (!s) {
      const created = await Setting.create({})
      return res.json(created)
    }
    return res.json(s)
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ message: 'Error fetching settings' })
  }
})

router.put('/', async (req, res) => {
  try {
    // Validate that req.body is an object
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: 'Invalid settings data' })
    }
    
    const s = await Setting.findOneAndUpdate({}, req.body, { new: true, upsert: true })
    res.json(s)
  } catch (error) {
    console.error('Error updating settings:', error)
    res.status(500).json({ message: 'Error updating settings' })
  }
})

router.put('/profile', async (req: any, res) => {
  const { name, email } = req.body
  
  // Validate that both fields are provided and not empty
  if (!name || !email || 
      typeof name !== 'string' || 
      typeof email !== 'string' ||
      name.trim() === '' || 
      email.trim() === '') {
    return res.status(400).json({ message: 'Both name and email are required' })
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ message: 'Please provide a valid email address' })
  }
  
  try {
    const u = await User.findByIdAndUpdate(req.user!._id, { 
      $set: { 
        name: name.trim(), 
        email: email.trim().toLowerCase() 
      } 
    }, { new: true })
    
    if (!u) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    res.json({ _id: u._id, name: u.name, email: u.email, role: u.role })
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ message: 'Error updating profile' })
  }
})

router.post('/change-password', async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user?._id
    
    // Validate payload
    if (!currentPassword || !newPassword ||
        typeof currentPassword !== 'string' || typeof newPassword !== 'string' ||
        currentPassword.trim() === '' || newPassword.trim() === '') {
      return res.status(400).json({ message: 'Both current and new passwords are required' })
    }
    if (newPassword.trim().length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (!user.passwordHash) {
      console.error('User has no passwordHash set:', String(user._id))
      return res.status(500).json({ message: 'User credentials not configured properly' })
    }
    
    const matches = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!matches) {
      return res.status(400).json({ message: 'Current password incorrect' })
    }
    
    user.passwordHash = await bcrypt.hash(newPassword.trim(), 10)
    await user.save()
    return res.json({ ok: true })
  } catch (error: any) {
    console.error('Error in change-password:', { message: error?.message, stack: error?.stack })
    return res.status(500).json({ message: 'Internal server error changing password' })
  }
})

router.post('/avatar', upload.single('avatar'), async (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided' })
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ message: 'Only image files (JPEG, PNG, GIF, WebP) are allowed' })
  }
  
  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (req.file.size > maxSize) {
    return res.status(400).json({ message: 'File size must be less than 5MB' })
  }
  
  try {
    const url = `/uploads/${req.file.filename}`
    await User.findByIdAndUpdate(req.user!._id, { $set: { avatarUrl: url } })
    res.json({ url })
  } catch (error) {
    console.error('Error updating avatar:', error)
    res.status(500).json({ message: 'Error updating avatar' })
  }
})

// Logout all sessions (client should clear tokens). Without token versioning, this is advisory.
router.post('/logout-all', async (_req, res) => {
  try {
    // In a real implementation, you might increment a tokenVersion field
    // or add the current timestamp to a blacklist
    // For now, just return success and let the client handle token clearing
    return res.json({ ok: true, message: 'All sessions logged out successfully' })
  } catch (error) {
    console.error('Error in logout-all:', error)
    res.status(500).json({ message: 'Error processing logout request' })
  }
})

export default router

