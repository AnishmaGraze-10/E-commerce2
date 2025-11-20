import { Router } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';
import { logActivity } from '../utils/logger';
const router = Router();
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ message: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists)
        return res.status(409).json({ message: 'Email in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    logActivity('user.register', { userId: String(user._id), email });
    res.status(201).json({ _id: user._id });
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
        return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ _id: String(user._id), role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    logActivity('user.login', { userId: String(user._id), email });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});
export default router;
