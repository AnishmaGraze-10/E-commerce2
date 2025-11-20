import mongoose, { Schema, Document, Types } from 'mongoose'

export type RateableType = 'product' | 'diary'

export interface IRating extends Document {
  userId: Types.ObjectId
  itemId: Types.ObjectId | string
  itemType: RateableType
  rating: number
  reviewText?: string
}

const RatingSchema = new Schema<IRating>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: Schema.Types.Mixed, required: true },
  itemType: { type: String, enum: ['product', 'diary'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  reviewText: { type: String, default: '' }
}, { timestamps: true })

RatingSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true })

export default mongoose.model<IRating>('Rating', RatingSchema)


