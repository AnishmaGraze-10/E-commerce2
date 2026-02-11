import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';
import { logActivity } from '../utils/logger.js';
const router = Router();
router.post('/', requireAuth, async (req, res) => {
    try {
        const { items, shipping, totalAmount, paymentMethod, paymentDetails } = req.body;
        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }
        if (!shipping) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }
        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ message: 'Invalid total amount' });
        }
        // Validate product ids
        const productIds = items.map(i => i.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        if (products.length !== items.length) {
            return res.status(400).json({ message: 'Some products are invalid or no longer available' });
        }
        // Create order with all fields
        const order = await Order.create({
            user: req.user._id,
            items: items.map(i => ({ product: i.productId, quantity: i.quantity })),
            shipping,
            totalAmount,
            paymentMethod: paymentMethod || 'card',
            paymentDetails: paymentDetails || {},
            status: 'pending'
        });
        // Log the order creation
        logActivity('order.create', {
            orderId: String(order._id),
            userId: String(req.user._id),
            totalAmount: totalAmount
        });
        res.status(201).json({
            message: 'Order created successfully',
            _id: order._id,
            totalAmount: order.totalAmount,
            status: order.status
        });
    }
    catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            message: 'Failed to create order. Please try again.'
        });
    }
});
router.get('/my', requireAuth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('items.product');
        res.json(orders);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            message: 'Failed to fetch orders. Please try again.'
        });
    }
});
export default router;
