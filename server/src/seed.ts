import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from './models/Product.js'

dotenv.config()

const curatedProducts = [
	{ name: 'Organic Lipstick', price: 520, imageUrl: '/lipstick.jpg', description: 'Vibrant organic lipstick with nourishing seed oils', stock: 50, category: 'Makeup', rating: 4.6, averageRating: 4.6, totalRatings: 142 },
	{ name: 'Rose Pink Lipstick', price: 540, imageUrl: '/lipstick.jpg', description: 'Creamy satin lipstick in a rose pink hue', stock: 55, category: 'Makeup', rating: 4.7, averageRating: 4.7, totalRatings: 167 },
	{ name: 'Organic Foundation', price: 650, imageUrl: '/foundation.webp', description: 'Featherlight foundation for seamless coverage', stock: 40, category: 'Makeup', rating: 4.7, averageRating: 4.7, totalRatings: 119 },
	{ name: 'Organic Eyeshadow', price: 425, imageUrl: '/eyeshadow.jpg', description: 'Colorful eyeshadow palette infused with vitamin E', stock: 35, category: 'Makeup', rating: 4.5, averageRating: 4.5, totalRatings: 98 },
	{ name: 'Hydrating Serum', price: 835, imageUrl: '/serum.jpg', description: 'Hydrating face serum for daily glow', stock: 60, category: 'Skincare', rating: 4.8, averageRating: 4.8, totalRatings: 201 },
	{ name: 'Mascara', price: 799, imageUrl: '/mascara.jpg', description: 'Volumizing mascara that lifts every lash', stock: 30, category: 'Makeup', rating: 4.4, averageRating: 4.4, totalRatings: 87 },
	{ name: 'Perfume', price: 799, imageUrl: '/perfume.jpg', description: 'Refreshing perfume inspired by citrus orchards', stock: 25, category: 'Fragrance', rating: 4.3, averageRating: 4.3, totalRatings: 62 },
	{ name: 'Velvet Blush Stain', price: 560, imageUrl: '/blush.jpg', description: 'Creamy blush that blends like skincare', stock: 48, category: 'Makeup', rating: 4.7, averageRating: 4.7, totalRatings: 153 },
	{ name: 'Botanical Moisturizer', price: 720, imageUrl: '/moisturizer.jpg', description: 'Daily moisturizer with ceramides and aloe', stock: 70, category: 'Skincare', rating: 4.9, averageRating: 4.9, totalRatings: 233, ingredients: ['Aloe Leaf Juice', 'Ceramides', 'Green Tea'] },
	{ name: 'Matcha Scalp Cleanser', price: 610, imageUrl: '/shampoo.jpg', description: 'Foaming scalp cleanser with matcha and mint', stock: 55, category: 'Hair Care', rating: 4.5, averageRating: 4.5, totalRatings: 134, ingredients: ['Matcha', 'Peppermint', 'Rice Protein'] },
	{ name: 'Midnight Jasmine Mist', price: 880, imageUrl: '/fragnance.jpg', description: 'Body mist with jasmine, neroli, and cedarwood', stock: 32, category: 'Fragrance', rating: 4.6, averageRating: 4.6, totalRatings: 101 },
	{ name: 'Precision Eyeliner Pen', price: 490, imageUrl: '/eyeliner.jpg', description: 'Smudge-proof liner with flexible felt tip', stock: 65, category: 'Makeup', rating: 4.4, averageRating: 4.4, totalRatings: 177 },
	{ name: 'Cooling Sunscreen Mist', price: 940, imageUrl: '/sunscreen.jpg', description: 'SPF 50 body mist with cucumber water', stock: 45, category: 'Skincare', rating: 4.8, averageRating: 4.8, totalRatings: 159 },
	{ name: 'Nourishing Nail Elixir', price: 410, imageUrl: '/cosme.jpg', description: 'Cuticle oil with jojoba and rosehip extracts', stock: 80, category: 'Body Care', rating: 4.3, averageRating: 4.3, totalRatings: 73 },
	{ name: 'Rose Quartz Face Roller', price: 1050, imageUrl: '/skincare.jpg', description: 'Dual-ended roller for lymphatic drainage', stock: 20, category: 'Tools', rating: 4.6, averageRating: 4.6, totalRatings: 58 },
	{ name: 'Hydra Glow Primer', price: 690, imageUrl: '/makeup.jpg', description: 'Illuminating primer with micro-pearls', stock: 52, category: 'Makeup', rating: 4.5, averageRating: 4.5, totalRatings: 141 },
	{ name: 'Ayurvedic Conditioner', price: 640, imageUrl: '/conditioner.jpg', description: 'Conditioner with amla and coconut milk', stock: 57, category: 'Hair Care', rating: 4.6, averageRating: 4.6, totalRatings: 165 },
]

async function main() {
	const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cosme_kitchen'
	await mongoose.connect(uri)

	const results = await Promise.all(
		curatedProducts.map((product) =>
			Product.findOneAndUpdate(
				{ name: product.name },
				{ $set: product },
				{ upsert: true, new: true, setDefaultsOnInsert: true }
			)
		)
	)

	console.log(`Seeded or updated ${results.length} curated products`)
	await mongoose.disconnect()
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})

