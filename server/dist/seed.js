import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product';
dotenv.config();
async function main() {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cosme_kitchen';
    await mongoose.connect(uri);
    await Product.deleteMany({});
    await Product.insertMany([
        { name: 'Organic Lipstick', price: 520, imageUrl: '/lipstick.jpg', description: 'Vibrant organic lipstick' },
        { name: 'Organic Foundation', price: 650, imageUrl: '/foundation.webp', description: 'Smooth organic foundation' },
        { name: 'Organic Eyeshadow', price: 425, imageUrl: '/eyeshadow.jpg', description: 'Colorful eyeshadow palette' },
        { name: 'Hydrating Serum', price: 835, imageUrl: '/serum.jpg', description: 'Hydrating face serum' },
        { name: 'Mascara', price: 799, imageUrl: '/mascara.jpg', description: 'Volumizing mascara' },
        { name: 'Perfume', price: 799, imageUrl: '/perfume.jpg', description: 'Refreshing perfume' },
    ]);
    console.log('Seeded products');
    await mongoose.disconnect();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
