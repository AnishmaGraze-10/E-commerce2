import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import StarRating from '../components/StarRating'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

type Product = {
	_id: string
	name: string
	price: number
	imageUrl: string
	description: string
	rating?: number
	ingredients?: string[]
	story?: {
		ingredients: string
		artisan: string
		environmental: string
	}
}

export default function ProductPage() {
	const { id } = useParams()
	const [product, setProduct] = useState<Product | null>(null)
	const { isAuthenticated } = useAuth()
	const { addItem } = useCart()

	useEffect(() => {
		axios.get(`/api/products/${id}`).then(r => setProduct(r.data))
	}, [id])

	function addToCart() {
		if (!product) return
		if (!isAuthenticated) {
			alert('Please login to add this product to your cart.')
			return
		}

		addItem({ productId: product._id })
			.then(() => {
				alert('Added to cart')
			})
			.catch((error) => {
				console.error('Failed to add product to cart', error)
				alert('Unable to add to cart. Please try again.')
			})
	}

	if (!product) return <p>Loading...</p>

	return (
		<div>
			<div className="mb-3">
				<Link to="/shop" className="btn btn-outline-secondary">
					← Back to Shop
				</Link>
			</div>
			<div className="row g-4">
			<div className="col-md-6 text-center">
				<img src={product.imageUrl} alt={product.name} className="img-fluid" />
			</div>
			<div className="col-md-6">
				<h2>{product.name}</h2>
				<h4 className="text-primary">₹{product.price}</h4>
				<p>{product.description || 'A mindful blend of organic botanicals designed to nourish skin and enhance natural radiance.'}</p>
                <div className="mb-2"><StarRating itemId={product._id} itemType="product" /></div>
				{product.ingredients && product.ingredients.length > 0 && (
					<div className="mt-2">
						<h6>Ingredients</h6>
						<ul>
							{product.ingredients.map((ing, idx) => <li key={idx}>{ing}</li>)}
						</ul>
					</div>
				)}
				{product.story && (
					<div className="mt-4">
						<h5>📖 Story Behind the Product</h5>
						<div className="card">
							<div className="card-body">
								<p><strong>🌱 Where ingredients come from:</strong> {product.story.ingredients || 'Sourced from certified organic farms and sustainable suppliers.'}</p>
								<p><strong>🧑‍🌾 Who made it:</strong> {product.story.artisan || 'Crafted by skilled artisans and farmers committed to quality.'}</p>
								<p><strong>🌍 Environmental impact:</strong> {product.story.environmental || 'Minimal carbon footprint with eco-friendly packaging and sustainable practices.'}</p>
							</div>
						</div>
					</div>
				)}
				<div className="d-flex gap-2 mt-3">
					<button className="btn btn-primary" onClick={addToCart}>Add to Cart</button>
					<Link to="/shop" className="btn btn-outline-secondary">Continue Shopping</Link>
				</div>
			</div>
			</div>
		</div>
	)
}

