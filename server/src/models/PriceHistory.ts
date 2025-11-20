import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IPriceHistory extends Document {
	productId: Types.ObjectId
	price: number
	date: Date
}

const PriceHistorySchema = new Schema<IPriceHistory>({
	productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
	price: { type: Number, required: true },
	date: { type: Date, default: Date.now }
})

PriceHistorySchema.index({ productId: 1, date: -1 })

export default mongoose.model<IPriceHistory>('PriceHistory', PriceHistorySchema)




