import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import adminSettingsRoutes from './routes/admin.settings.routes.js';
import userRoutes from './routes/user.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import makeupRoutes from './routes/makeup.routes.js';
import skinRoutes from './routes/skin.routes.js';
import diaryRoutes from './routes/diary.routes.js';
import categoryRoutes from './routes/category.routes.js';
import ratingsRoutes from './routes/ratings.routes.js';
import path from 'path';
import fs from 'fs';
dotenv.config();
const app = express();
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
// Increase payload limits for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));
// Static serving for uploads
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir))
    fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/makeup', makeupRoutes);
app.use('/api/skin', skinRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ratings', ratingsRoutes);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cosme_kitchen';
const PORT = Number(process.env.PORT || 5000);
async function startServer() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
    }
    catch (err) {
        console.error('Mongo connection error:', err?.code || err?.message);
        console.log('Starting in-memory MongoDB for development...');
        const mem = await MongoMemoryServer.create();
        const uri = mem.getUri('cosme_kitchen');
        await mongoose.connect(uri);
        console.log('Connected to in-memory MongoDB');
    }
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}
startServer().catch((e) => {
    console.error('Fatal start error', e);
    process.exit(1);
});
