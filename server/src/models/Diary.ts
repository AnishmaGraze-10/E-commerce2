import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IDiary extends Document {
	userId: Types.ObjectId
	date: Date
	selfieUrl: string
	mediaUrl?: string
	mediaType?: string
	metrics: {
		acne: number
		darkCircles: number
		hydration: number
		glow: number
	}
	notes?: string
	faceData?: {
		faceCount: number
		confidence: number
	}
}

const DiarySchema = new Schema<IDiary>({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	date: { type: Date, default: Date.now },
	selfieUrl: { type: String, required: true },
	mediaUrl: { type: String },
	mediaType: { type: String },
	metrics: {
		acne: { type: Number, min: 0, max: 100, default: 0 },
		darkCircles: { type: Number, min: 0, max: 100, default: 0 },
		hydration: { type: Number, min: 0, max: 100, default: 50 },
		glow: { type: Number, min: 0, max: 100, default: 50 }
	},
	notes: { type: String, default: '' },
	faceData: {
		faceCount: { type: Number, default: 0 },
		confidence: { type: Number, min: 0, max: 1, default: 0 }
	}
}, { timestamps: true })

DiarySchema.index({ userId: 1, date: -1 })

export default mongoose.model<IDiary>('Diary', DiarySchema)




