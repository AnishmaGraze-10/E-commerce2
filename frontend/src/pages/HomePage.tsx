import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
	const { user, isAuthenticated } = useAuth()
	const [currentTime, setCurrentTime] = useState('')
	const heroRef = useRef<HTMLDivElement>(null)
	const productsRef = useRef<HTMLDivElement>(null)
	const featuresRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		// Update time for personalized greeting
		const updateTime = () => {
			const now = new Date()
			const hour = now.getHours()
			let greeting = 'Good morning'
			if (hour >= 12 && hour < 17) greeting = 'Good afternoon'
			else if (hour >= 17) greeting = 'Good evening'
			setCurrentTime(greeting)
		}
		updateTime()
		const interval = setInterval(updateTime, 60000) // Update every minute

		// Scroll animations
		const observerOptions = {
			threshold: 0.1,
			rootMargin: '0px 0px -50px 0px'
		}

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('animate-in')
				}
			})
		}, observerOptions)

		// Observe elements for scroll animations
		const animatedElements = document.querySelectorAll('.scroll-animate')
		animatedElements.forEach(el => observer.observe(el))

		return () => {
			clearInterval(interval)
			observer.disconnect()
		}
	}, [])

	const products = [
		{ id: 1, name: 'Organic Foundation', price: '₹650', image: '/foundation.webp', rotation: 0 },
		{ id: 2, name: 'Hydrating Serum', price: '₹835', image: '/serum.jpg', rotation: 0 },
		{ id: 3, name: 'Natural Lipstick', price: '₹520', image: '/lipstick.jpg', rotation: 0 }
	]

	const [productRotations, setProductRotations] = useState(products.map(() => 0))

	const handleProductRotate = (index: number, direction: 'left' | 'right') => {
		const newRotations = [...productRotations]
		newRotations[index] += direction === 'left' ? -45 : 45
		setProductRotations(newRotations)
	}

	return (
		<div className="homepage">
			{/* Personalized Greeting Banner */}
			{isAuthenticated && (
				<div className="greeting-banner animate-in">
					<div className="container">
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<h4 className="mb-0">
									{currentTime}, {user?.name}! 👋
								</h4>
								<p className="mb-0 text-muted">Welcome back to Cosme Kitchen</p>
							</div>
							<div className="d-flex gap-2">
								<Link to="/wishlist" className="btn btn-outline-primary btn-sm">
									💖 My Wishlist
								</Link>
								<Link to="/orders" className="btn btn-outline-secondary btn-sm">
									📦 My Orders
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Hero Section with Dynamic Video Background */}
			<section ref={heroRef} className="hero-section">
				<div className="video-background">
					{/* Video background - using a gradient overlay instead of external video */}
					<div className="video-placeholder">
						<div className="gradient-overlay"></div>
					</div>
					<div className="video-overlay"></div>
				</div>
				
				<div className="hero-content">
					<div className="container">
						<div className="row align-items-center">
							<div className="col-lg-6">
								<h1 className="hero-title animate-in">
									Glow with Confidence ✨
								</h1>
								<p className="hero-subtitle animate-in">
									Discover our premium organic beauty collection for a radiant, natural look
								</p>
								<div className="hero-buttons animate-in">
									<Link to="/shop" className="btn btn-primary btn-lg me-3">
										🛍️ Shop Now
									</Link>
									<Link to="/brand" className="btn btn-outline-light btn-lg">
										🌟 Our Story
									</Link>
								</div>
							</div>
							<div className="col-lg-6">
								<div className="hero-image-container animate-in">
									<img src="/cosme.jpg" alt="Cosme Kitchen" className="hero-image" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 3D Product Demo Section */}
			<section ref={productsRef} className="product-demo-section py-5">
				<div className="container">
					<h2 className="text-center mb-5 scroll-animate">
						📸 Experience Products in 3D
					</h2>
					<div className="row g-4">
						{products.map((product, index) => (
							<div key={product.id} className="col-md-4">
								<div className="product-3d-card scroll-animate">
									<div className="product-3d-container">
										<div 
											className="product-3d-image"
											style={{ 
												transform: `rotateY(${productRotations[index]}deg)`,
												transition: 'transform 0.5s ease'
											}}
										>
											<img src={product.image} alt={product.name} />
										</div>
										<div className="product-3d-controls">
											<button 
												className="btn btn-sm btn-outline-primary"
												onClick={() => handleProductRotate(index, 'left')}
											>
												⬅️ Rotate Left
											</button>
											<button 
												className="btn btn-sm btn-outline-primary"
												onClick={() => handleProductRotate(index, 'right')}
											>
												Rotate Right ➡️
											</button>
										</div>
									</div>
									<div className="product-3d-info">
										<h5>{product.name}</h5>
										<p className="price">{product.price}</p>
										<Link to="/shop" className="btn btn-primary btn-sm">
											View Details
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section with Scroll Animations */}
			<section ref={featuresRef} className="features-section py-5">
				<div className="container">
					<h2 className="text-center mb-5 scroll-animate">
						✨ Why Choose Cosme Kitchen?
					</h2>
					<div className="row g-4">
						<div className="col-md-3">
							<div className="feature-card scroll-animate">
								<div className="feature-icon">🌱</div>
								<h5>100% Organic</h5>
								<p>Pure, natural ingredients sourced from certified organic farms</p>
							</div>
						</div>
						<div className="col-md-3">
							<div className="feature-card scroll-animate">
								<div className="feature-icon">🧪</div>
								<h5>Cruelty-Free</h5>
								<p>Never tested on animals, certified by PETA</p>
							</div>
						</div>
						<div className="col-md-3">
							<div className="feature-card scroll-animate">
								<div className="feature-icon">♻️</div>
								<h5>Eco-Friendly</h5>
								<p>Sustainable packaging and zero-waste practices</p>
							</div>
						</div>
						<div className="col-md-3">
							<div className="feature-card scroll-animate">
								<div className="feature-icon">🌟</div>
								<h5>Premium Quality</h5>
								<p>Luxury formulations with proven results</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Call to Action */}
			<section className="cta-section py-5">
				<div className="container text-center">
					<div className="cta-content scroll-animate">
						<h2>Ready to Transform Your Beauty Routine?</h2>
						<p>Join thousands of customers who trust Cosme Kitchen for their beauty needs</p>
						<div className="cta-buttons">
							<Link to="/shop" className="btn btn-primary btn-lg me-3">
								🛍️ Start Shopping
							</Link>
							<Link to="/about" className="btn btn-outline-primary btn-lg">
								📖 Learn More
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

