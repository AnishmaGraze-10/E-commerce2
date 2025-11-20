import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
	name: string
	email: string
	passwordHash: string
	role: 'user' | 'admin'
	phone?: string
	avatarUrl?: string
	profilePic?: string
	bio?: string
	addresses?: Array<{
		line1: string
		line2?: string
		city?: string
		state?: string
		postalCode?: string
		country?: string
	}>
	resetPasswordToken?: string
	resetPasswordExpires?: Date
}

const UserSchema = new Schema<IUser>({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true, lowercase: true },
	passwordHash: { type: String, required: true },
	role: { type: String, enum: ['user', 'admin'], default: 'user' },
	phone: { type: String },
	avatarUrl: { type: String },
	profilePic: { type: String },
	bio: { type: String, maxlength: 500 },
	addresses: [
		{
			line1: { type: String, required: true },
			line2: { type: String },
			city: { type: String },
			state: { type: String },
			postalCode: { type: String },
			country: { type: String }
		}
	],
	resetPasswordToken: { type: String },
	resetPasswordExpires: { type: Date }
}, { timestamps: true })

export default mongoose.model<IUser>('User', UserSchema)

