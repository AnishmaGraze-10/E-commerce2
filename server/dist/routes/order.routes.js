import { Router } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { requireAuth } from '../middleware/auth';
import { logActivity } from '../utils/logger';
const router = Router();
router.post('/', requireAuth, async (req, res) => {
    const { items, shipping } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ message: 'No items' });
    // validate product ids
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== items.length)
        return res.status(400).json({ message: 'Invalid items' });
    const order = await Order.create({ user: req.user._id, items: items.map(i => ({ product: i.productId, quantity: i.quantity })), shipping });
    logActivity('order.create', { orderId: String(order._id), userId: req.user._id });
    res.status(201).json(order);
});
router.get('/my', requireAuth, async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    res.json(orders);
});
export default router;
