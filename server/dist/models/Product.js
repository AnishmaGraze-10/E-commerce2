import mongoose, { Schema } from 'mongoose';
const ProductSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    category: { type: String },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    ingredients: { type: [String], default: [] },
    story: {
        ingredients: { type: String, default: '' },
        artisan: { type: String, default: '' },
        environmental: { type: String, default: '' }
    }
}, { timestamps: true });
export default mongoose.model('Product', ProductSchema);
