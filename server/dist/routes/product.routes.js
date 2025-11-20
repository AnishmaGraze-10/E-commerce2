import { Router } from 'express';
import Product from '../models/Product';
const router = Router();
router.get('/', async (req, res) => {
    const { q, category, minPrice, maxPrice, sort } = req.query;
    const filter = {};
    if (q)
        filter.name = { $regex: q, $options: 'i' };
    if (category)
        filter.category = category;
    if (minPrice || maxPrice)
        filter.price = { ...(minPrice ? { $gte: Number(minPrice) } : {}), ...(maxPrice ? { $lte: Number(maxPrice) } : {}) };
    let query = Product.find(filter);
    if (sort === 'price_asc')
        query = query.sort({ price: 1 });
    else if (sort === 'price_desc')
        query = query.sort({ price: -1 });
    else
        query = query.sort({ createdAt: -1 });
    const products = await query;
    res.json(products);
});
router.get('/:id', async (req, res) => {
    const p = await Product.findById(req.params.id);
    if (!p)
        return res.status(404).json({ message: 'Not found' });
    res.json(p);
});
export default router;
