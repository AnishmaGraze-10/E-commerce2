import mongoose, { Schema } from 'mongoose';
const ProductSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    category: { type: String },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalRatings: { type: Number, min: 0, default: 0 },
    ingredients: { type: [String], default: [] },
    story: {
        ingredients: { type: String, default: '' },
        artisan: { type: String, default: '' },
        environmental: { type: String, default: '' }
    }
}, { timestamps: true });
export default mongoose.model('Product', ProductSchema);
