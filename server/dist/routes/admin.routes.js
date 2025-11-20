import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import Product from '../models/Product';
import User from '../models/User';
import Order from '../models/Order';
import { logActivity } from '../utils/logger';
const router = Router();
router.use(requireAuth, requireAdmin);
// Products CRUD
router.get('/products', async (_req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
});
router.post('/products', async (req, res) => {
    const created = await Product.create(req.body);
    logActivity('admin.product.create', { productId: String(created._id) });
    res.status(201).json(created);
});
router.delete('/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    logActivity('admin.product.delete', { productId: String(req.params.id) });
    res.json({ ok: true });
});
// Users
router.get('/users', async (_req, res) => {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
});
// Orders
router.get('/orders', async (_req, res) => {
    const orders = await Order.find().populate('user', 'name email').populate('items.product');
    res.json(orders);
});
export default router;
