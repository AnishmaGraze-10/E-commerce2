import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IWishlistItem {
	productId: Types.ObjectId
	shadeId?: string
	addedAt: Date
}

export interface IWishlist extends Document {
	userId: Types.ObjectId
	items: IWishlistItem[]
	notify: {
		priceDrop: boolean
		restock: boolean
	}
}

const WishlistItemSchema = new Schema<IWishlistItem>({
	productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
	shadeId: { type: String },
	addedAt: { type: Date, default: Date.now }
})

const WishlistSchema = new Schema<IWishlist>({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
	items: { type: [WishlistItemSchema], default: [] },
	notify: {
		priceDrop: { type: Boolean, default: true },
		restock: { type: Boolean, default: true }
	}
}, { timestamps: true })

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema)




