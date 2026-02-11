import mongoose, { Schema } from 'mongoose';
const OrderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, min: 1, required: true },
        },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered'], default: 'pending' },
    paymentMethod: { type: String, enum: ['card', 'cod'], default: 'card' },
    paymentDetails: { type: Schema.Types.Mixed },
    shipping: {
        fullName: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
    },
}, { timestamps: true });
export default mongoose.model('Order', OrderSchema);
