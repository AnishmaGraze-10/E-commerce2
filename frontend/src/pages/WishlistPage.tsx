import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'

type Product = {
	_id: string
	name: string
	price: number
	imageUrl: string
	description: string
	rating?: number
}

export default function WishlistPage() {
	const { user } = useAuth()
	const [wishlist, setWishlist] = useState<string[]>([])
	const [products, setProducts] = useState<Product[]>([])
	const [alerts, setAlerts] = useState<any[]>([])

	useEffect(() => {
		if (!user) {
			setWishlist([])
			setProducts([])
			return
		}
		
		// Use user-specific wishlist key
		const wishlistKey = `wishlist_${user._id}`
		const savedWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]')
		setWishlist(savedWishlist)

		axios.get('/api/products').then(response => {
			const all = response.data as Product[]
			const wishlistProducts = savedWishlist.length > 0 ? all.filter((p: Product) => savedWishlist.includes(p._id)) : all
			setProducts(wishlistProducts)
		}).catch(()=>{})

		// If logged-in user uses server wishlist, show server-side alerts panel
		axios.get('/api/wishlist/alerts').then(res => {
			const list = res.data || []
			setAlerts(list)
			if (list.length > 0) {
				toast.success(`${list.length} wishlist alert${list.length>1?'s':''} available`)
			}
		}).catch(() => setAlerts([]))
	}, [user])

	const productById = useMemo(() => {
		const map: Record<string, Product> = {}
		products.forEach(p => { map[p._id] = p })
		return map
	}, [products])

	function removeFromWishlist(productId: string) {
		if (!user) return
		const newWishlist = wishlist.filter(id => id !== productId)
		setWishlist(newWishlist)
		const wishlistKey = `wishlist_${user._id}`
		localStorage.setItem(wishlistKey, JSON.stringify(newWishlist))
		setProducts(products.filter(p => p._id !== productId))
	}

	if (products.length === 0) {
		return (
			<div className="container my-4 text-center">
				<h2>My Wishlist</h2>
				{alerts.length > 0 && (
					<div className="alert alert-warning text-start" style={{ maxWidth: 720, margin: '0 auto 1rem' }}>
						<div className="fw-bold mb-2">Alerts</div>
						{alerts.map((a, i) => (
							<div key={i} className="d-flex justify-content-between align-items-center border-bottom py-1">
								<div>
									<span className={`badge me-2 ${a.type === 'price_drop' ? 'bg-success' : 'bg-info'}`}>{a.type === 'price_drop' ? 'Price Drop' : 'Restock'}</span>
									<Link to={`/product/${a.productId}`}>{productById[a.productId]?.name || 'View product'}</Link>
									{a.type === 'price_drop' && (
										<span className="ms-2 small">₹{a.from} → ₹{a.to}</span>
									)}
								</div>
								<Link className="btn btn-sm btn-outline-primary" to={`/product/${a.productId}`}>View</Link>
							</div>
						))}
					</div>
				)}
				<p>Your wishlist is empty. Start adding products you love!</p>
				<Link to="/shop" className="btn btn-primary">Browse Products</Link>
			</div>
		)
	}

	return (
		<div className="container my-4">
			<h2>My Wishlist</h2>
			{alerts.length > 0 && (
				<div className="alert alert-warning mb-3">
					<div className="fw-bold mb-2">Alerts</div>
					{alerts.map((a, i) => (
						<div key={i} className="d-flex justify-content-between align-items-center border-bottom py-1">
							<div>
								<span className={`badge me-2 ${a.type === 'price_drop' ? 'bg-success' : 'bg-info'}`}>{a.type === 'price_drop' ? 'Price Drop' : 'Restock'}</span>
								<Link to={`/product/${a.productId}`}>{productById[a.productId]?.name || 'View product'}</Link>
								{a.type === 'price_drop' && (
									<span className="ms-2 small">₹{a.from} → ₹{a.to}</span>
								)}
							</div>
							<Link className="btn btn-sm btn-outline-primary" to={`/product/${a.productId}`}>View</Link>
						</div>
					))}
				</div>
			)}
			<div className="row g-4">
				{products.map(product => (
					<div className="col-md-3" key={product._id}>
						<div className="card h-100">
							<img src={product.imageUrl} alt={product.name} className="card-img-top" style={{ height: 250, objectFit: 'cover' }} />
							<div className="card-body text-center d-flex flex-column">
								<h5>{product.name}</h5>
								<p>₹{product.price}</p>
								<small>⭐ {product.rating ?? 4.5}</small>
								<div className="d-flex justify-content-center gap-2 mt-2">
									<Link className="btn btn-sm btn-primary" to={`/product/${product._id}`}>View Details</Link>
									<button className="btn btn-sm btn-outline-danger" onClick={() => removeFromWishlist(product._id)}>Remove</button>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
} 