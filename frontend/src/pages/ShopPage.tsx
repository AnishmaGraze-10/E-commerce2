import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import axios from 'axios'
import StarRating from '../components/StarRating'

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

const curatedProducts: Product[] = [
	{
		_id: 'curated-luminous-serum',
		name: 'Luminous Dew Serum',
		price: 890,
		imageUrl: '/serum.jpg',
		description: 'A daily brightening serum with niacinamide and snow mushroom.',
		rating: 4.8,
		ingredients: ['Niacinamide', 'Snow Mushroom', 'Hyaluronic Acid'],
		story: {
			ingredients: 'Inspired by alpine botanicals for instant luminosity.',
			artisan: 'Crafted in small batches by Cosme Lab.',
			environmental: 'Housed in fully recyclable glass.'
		}
	},
	{
		_id: 'curated-rosewood-oil',
		name: 'Rosewood Body Oil',
		price: 760,
		imageUrl: '/skincare.jpg',
		description: 'Lightweight botanical oil that locks in moisture post-shower.',
		rating: 4.6,
		ingredients: ['Rosewood', 'Squalane', 'Vitamin E']
	},
	{
		_id: 'curated-cocoa-balm',
		name: 'Cocoa Butter Balm',
		price: 420,
		imageUrl: '/makeup.jpg',
		description: 'Multi-use balm that melts on contact for cheeks and lips.',
		rating: 4.5
	},
	{
		_id: 'curated-citrus-gloss',
		name: 'Citrus Hair Gloss',
		price: 540,
		imageUrl: '/conditioner.jpg',
		description: 'Leave-in glossing milk with cold-pressed citrus oils.',
		rating: 4.7
	},
	{
		_id: 'curated-moonlit-palette',
		name: 'Moonlit Eye Palette',
		price: 610,
		imageUrl: '/eyeshadow.jpg',
		description: 'Eight-piece palette of soft metallic night hues.',
		rating: 4.4
	},
	{
		_id: 'curated-peach-tint',
		name: 'Peach Glow Tint',
		price: 480,
		imageUrl: '/blush.jpg',
		description: 'Weightless tint for a flushed, peachy finish.',
		rating: 4.6
	}
]

interface FilterState {
	query: string
	category: string
	minPrice: string
	maxPrice: string
	rating: string
	color: string
	size: string
	sort: string
}

export default function ShopPage() {
	const { theme, setTheme } = useTheme()
	const { isAuthenticated, user } = useAuth()
	const { addItem } = useCart()
	const [products, setProducts] = useState<Product[]>(curatedProducts)
	const [filters, setFilters] = useState<FilterState>({
		query: '',
		category: '',
		minPrice: '',
		maxPrice: '',
		rating: '',
		color: '',
		size: '',
		sort: ''
	})
	const [wishlist, setWishlist] = useState<string[]>([])
	const [compare, setCompare] = useState<string[]>([])
	const [showCompareModal, setShowCompareModal] = useState(false)
	const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

	const [showARPreview, setShowARPreview] = useState<string | null>(null)
	const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
	const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

	useEffect(() => {
		if (!user) {
			setWishlist([])
			return
		}
		// Use user-specific wishlist key
		const wishlistKey = `wishlist_${user._id}`
		const savedWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]')
		setWishlist(savedWishlist)
		
		// Cleanup function to clear search timeout
		return () => {
			if (searchTimeout.current) {
				clearTimeout(searchTimeout.current)
			}
		}
	}, [user])

	// Initial product fetch
	useEffect(() => {
		axios.get('/api/products')
			.then(r => {
				setProducts(r.data.length ? r.data : curatedProducts)
			})
			.catch((error) => {
				console.error('Failed to fetch initial products:', error)
				setProducts(curatedProducts)
			})
	}, [])

	// Filter-based product fetch
	useEffect(() => {
		// Skip if no filters are applied
		const hasFilters = Object.values(filters).some(value => value !== '')
		if (!hasFilters) return
		
        const params: any = {}
        Object.entries(filters).forEach(([key, value]) => {
            if (!value) return
            if (key === 'rating') params.rating = value
            else params[key] = value
        })
		
		// Fetch products from API
		axios.get('/api/products', { params })
			.then(r => {
				setProducts(r.data.length ? r.data : curatedProducts)
			})
			.catch((error) => {
				console.error('Failed to fetch filtered products:', error)
				setProducts(curatedProducts)
			})
	}, [filters.category, filters.minPrice, filters.maxPrice, filters.rating, filters.sort])

	// Search-specific product fetch (debounced)
	useEffect(() => {
		if (!filters.query.trim()) {
			// If search is empty, fetch all products
			axios.get('/api/products')
				.then(r => {
					setProducts(r.data.length ? r.data : curatedProducts)
				})
				.catch((error) => {
					console.error('Failed to fetch all products after search clear:', error)
				})
			return
		}
		
		// Search with query
		axios.get('/api/products', { params: { query: filters.query } })
			.then(r => {
				setProducts(r.data.length ? r.data : curatedProducts)
			})
			.catch((error) => {
				console.error('Failed to fetch search results:', error)
				setProducts(curatedProducts)
			})
		
		// Cleanup function to clear search timeout
		return () => {
			if (searchTimeout.current) {
				clearTimeout(searchTimeout.current)
			}
		}
	}, [filters.query])

	const filtered = useMemo(() => products, [products])

	const categories = ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Tools']

const ratings = ['3.0', '3.5', '4.0', '4.5', '5.0']

	const updateFilter = (key: keyof FilterState, value: string) => {
		// Debounce search queries to prevent multiple API calls
		if (key === 'query') {
			clearTimeout(searchTimeout.current)
			searchTimeout.current = setTimeout(() => {
				setFilters(prev => ({ ...prev, [key]: value }))
			}, 500)
		} else {
			setFilters(prev => ({ ...prev, [key]: value }))
		}
	}

	const toggleWishlist = (productId: string) => {
		if (!user) return
		setWishlist(prev => {
			const newWishlist = prev.includes(productId) 
				? prev.filter(id => id !== productId)
				: [...prev, productId]
			const wishlistKey = `wishlist_${user._id}`
			localStorage.setItem(wishlistKey, JSON.stringify(newWishlist))
			return newWishlist
		})
	}

	const toggleCompare = (productId: string) => {
		setCompare(prev => {
			if (prev.includes(productId)) {
				return prev.filter(id => id !== productId)
			} else if (prev.length < 3) {
				return [...prev, productId]
			} else {
				alert('You can only compare up to 3 products at a time')
				return prev
			}
		})
	}

	const addToCart = (product: Product) => {
		if (!isAuthenticated) {
			alert('Please login to add items to your cart.')
			return
		}

		addItem({ productId: product._id })
			.then(() => {
				alert('Product added to cart!')
			})
			.catch((error) => {
				console.error('Failed to add product to cart', error)
				alert('Unable to add to cart. Please try again.')
			})
	}



	return (
		<div className="shop-page">
			{/* Clean Header with Search Bar on Same Line */}
			<div className="shop-header">
				<div className="container">
					<div className="shop-header-content">
						<div className="shop-title-section">
							<h1 className="shop-title">Shop</h1>
							<div className="search-container">
								<input 
									type="text" 
									className="search-input" 
									placeholder="Search products..."
									value={filters.query}
									onChange={(e) => updateFilter('query', e.target.value)}
								/>
								<button className="search-btn">
									🔍
								</button>
							</div>
						</div>
                        <div className="shop-actions">
							<button 
								className="btn btn-outline-primary filters-btn"
								onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
							>
								🔍 Filters
							</button>
                            <select className="form-select ms-2" style={{ width: 180 }} value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                                <option value="">Sort by</option>
                                <option value="rating_desc">Top Rated</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
							<button 
								className="btn btn-outline-secondary"
								onClick={() => setTheme(theme === 'dark' ? 'pastel' : 'dark')}
							>
								{theme === 'dark' ? '☀️' : '🌙'}
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="container">
				<div className="row">
					{/* Clean Filter Panel */}
					<div className={`col-lg-3 ${isFilterPanelOpen ? 'd-block' : 'd-none d-lg-block'}`}>
						<div className="filter-panel">
							<h4>Filters</h4>
							
							{/* Category Filter */}
							<div className="filter-section">
								<label>Category</label>
								<div className="category-buttons">
									<button
										className={`category-btn ${filters.category === '' ? 'active' : ''}`}
										onClick={() => updateFilter('category', '')}
									>
										All
									</button>
									{categories.map(cat => (
										<button
											key={cat}
											className={`category-btn ${filters.category === cat ? 'active' : ''}`}
											onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
										>
											{cat}
										</button>
									))}
								</div>
							</div>

							{/* Price Range */}
							<div className="filter-section">
								<label>Price: ₹{filters.minPrice || 0} - ₹{filters.maxPrice || 2000}</label>
								<div className="price-range">
									<input
										type="range"
										min="0"
										max="2000"
										value={filters.minPrice || 0}
										onChange={(e) => updateFilter('minPrice', e.target.value)}
										className="price-slider"
									/>
									<input
										type="range"
										min="0"
										max="2000"
										value={filters.maxPrice || 2000}
										onChange={(e) => updateFilter('maxPrice', e.target.value)}
										className="price-slider"
									/>
								</div>
							</div>

							{/* Rating Filter */}
							<div className="filter-section">
								<label>Rating</label>
								<div className="rating-buttons">
									{ratings.map(rating => (
										<button
											key={rating}
											className={`rating-btn ${filters.rating === rating ? 'active' : ''}`}
											onClick={() => updateFilter('rating', filters.rating === rating ? '' : rating)}
										>
											⭐⭐⭐⭐⭐ {rating}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Products Grid */}
					<div className="col-lg-9">
						{/* Compare Bar */}
						{compare.length > 0 && (
							<div className="compare-bar mb-3">
								<div className="d-flex justify-content-between align-items-center">
									<span>📊 Compare {compare.length} products</span>
									<button 
										className="btn btn-primary"
										onClick={() => setShowCompareModal(true)}
									>
										View Comparison
									</button>
								</div>
							</div>
						)}

						<div className="products-grid">
							{filtered.length === 0 ? (
								<div className="no-products">
									<h4>No products found</h4>
									<p>Try adjusting your search or filter criteria</p>
								</div>
							) : (
								filtered.map(p => (
									<div className="product-item" key={p._id}>
										<div className="product-card">
											<div className="product-image">
												<img src={p.imageUrl} alt={p.name} />
												<div className="product-overlay">
													<button 
														className="overlay-btn"
														onClick={() => setQuickViewProduct(p)}
													>
														Quick View
													</button>
												</div>
											</div>
											<div className="product-details">
												<h5 className="product-name">{p.name}</h5>
												<div className="product-price">₹{p.price}</div>
                                                <div className="product-rating"><StarRating itemId={p._id} itemType="product" compact /></div>
												<div className="product-actions">
													<button 
														className={`wishlist-btn ${wishlist.includes(p._id) ? 'active' : ''}`}
														onClick={() => toggleWishlist(p._id)}
													>
														{wishlist.includes(p._id) ? '💖' : '🤍'}
													</button>
													<button 
														className={`compare-btn ${compare.includes(p._id) ? 'active' : ''}`}
														onClick={() => toggleCompare(p._id)}
													>
														{compare.includes(p._id) ? '✓' : '⚖️'}
													</button>
													<button 
														className="add-to-cart-btn"
														onClick={() => addToCart(p)}
													>
														Add to Cart
													</button>
												</div>
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Quick View Modal */}
			{quickViewProduct && (
				<div className="modal-overlay" onClick={() => setQuickViewProduct(null)}>
					<div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h4>{quickViewProduct.name}</h4>
							<button className="close-btn" onClick={() => setQuickViewProduct(null)}>✕</button>
						</div>
						<div className="modal-body">
							<div className="row">
								<div className="col-md-6">
									<img src={quickViewProduct.imageUrl} alt={quickViewProduct.name} className="modal-image" />
								</div>
								<div className="col-md-6">
									<p>{quickViewProduct.description}</p>
									<div className="product-meta">
										<span className="price">₹{quickViewProduct.price}</span>
										<span className="rating">⭐ {quickViewProduct.rating ?? 4.5}</span>
									</div>
									<div className="modal-actions">
										<button className="btn btn-primary" onClick={() => addToCart(quickViewProduct)}>
											🛒 Add to Cart
										</button>
										<Link to={`/product/${quickViewProduct._id}`} className="btn btn-outline-primary">
											View Details
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Compare Modal */}
			{showCompareModal && (
				<div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
					<div className="compare-modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h4>📊 Product Comparison</h4>
							<button className="close-btn" onClick={() => setShowCompareModal(false)}>✕</button>
						</div>
						<div className="modal-body">
							<div className="compare-table">
								<table className="table">
									<thead>
										<tr>
											<th>Feature</th>
											{products.filter(p => compare.includes(p._id)).map(p => (
												<th key={p._id}>{p.name}</th>
											))}
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>Price</td>
											{products.filter(p => compare.includes(p._id)).map(p => (
												<td key={p._id}>₹{p.price}</td>
											))}
										</tr>
										<tr>
											<td>Rating</td>
											{products.filter(p => compare.includes(p._id)).map(p => (
												<td key={p._id}>⭐ {p.rating ?? 4.5}</td>
											))}
										</tr>
										<tr>
											<td>Description</td>
											{products.filter(p => compare.includes(p._id)).map(p => (
												<td key={p._id}>{p.description?.substring(0, 50)}...</td>
											))}
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* AR Preview Modal */}
			{showARPreview && (
				<div className="modal-overlay" onClick={() => setShowARPreview(null)}>
					<div className="ar-modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h4>💄 Try-On Simulation</h4>
							<button className="close-btn" onClick={() => setShowARPreview(null)}>✕</button>
						</div>
						<div className="modal-body">
							<div className="ar-preview">
								<div className="ar-placeholder">
									<div className="ar-content">
										<h5>AR Preview Coming Soon!</h5>
										<p>Experience virtual try-on for lipstick shades, foundation colors, and more.</p>
										<div className="ar-features">
											<div className="ar-feature">💄 Lipstick Shades</div>
											<div className="ar-feature">🎨 Foundation Matching</div>
											<div className="ar-feature">👁️ Eyeshadow Preview</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

