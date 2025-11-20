import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ICartItem {
	productId: Types.ObjectId
	shadeId?: string
	qty: number
}

export interface ICart extends Document {
	userId: Types.ObjectId
	items: ICartItem[]
}

const CartItemSchema = new Schema<ICartItem>({
	productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
	shadeId: { type: String },
	qty: { type: Number, required: true, min: 1, default: 1 }
})

const CartSchema = new Schema<ICart>({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
	items: { type: [CartItemSchema], default: [] }
}, { timestamps: true })

export default mongoose.model<ICart>('Cart', CartSchema)




