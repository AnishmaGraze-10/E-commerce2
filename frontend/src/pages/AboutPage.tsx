import { useState, useEffect, useRef } from 'react'

interface TeamMember {
	id: number
	name: string
	role: string
	image: string
	funFact: string
	favoriteProduct: string
}

interface ImpactStat {
	label: string
	value: number
	suffix: string
	icon: string
}

interface TimelineEvent {
	year: string
	title: string
	description: string
	icon: string
}

interface MissionValue {
	title: string
	description: string
	icon: string
}

export default function AboutPage() {
	const [impactStats] = useState<ImpactStat[]>([
		{ label: 'Happy Customers', value: 5000, suffix: '+', icon: '😊' },
		{ label: 'Eco Products Saved', value: 1000, suffix: '+', icon: '🌱' },
		{ label: 'Organic Ingredients', value: 150, suffix: '+', icon: '🌿' },
		{ label: 'Trees Planted', value: 2500, suffix: '+', icon: '🌳' }
	])

	const timelineRef = useRef<HTMLDivElement>(null)

	// Animate impact counters
	useEffect(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('animate-in')
				}
			})
		}, { threshold: 0.1 })

		const animatedElements = document.querySelectorAll('.scroll-animate')
		animatedElements.forEach(el => observer.observe(el))

		return () => observer.disconnect()
	}, [])

	const teamMembers: TeamMember[] = [
		{
			id: 1,
			name: 'Priya Sharma',
			role: 'Founder & CEO',
			image: '/cosme.jpg',
			funFact: 'Started making DIY face masks in her kitchen!',
			favoriteProduct: 'Hydrating Serum'
		},
		{
			id: 2,
			name: 'Rajesh Kumar',
			role: 'Head of Formulation',
			image: '/serum.jpg',
			funFact: 'Has a degree in Ayurvedic Medicine',
			favoriteProduct: 'Organic Foundation'
		},
		{
			id: 3,
			name: 'Anjali Patel',
			role: 'Sustainability Lead',
			image: '/lipstick.jpg',
			funFact: 'Grows her own herbs in the office garden',
			favoriteProduct: 'Natural Lipstick'
		},
		{
			id: 4,
			name: 'Vikram Singh',
			role: 'Creative Director',
			image: '/mascara.jpg',
			funFact: 'Former fashion photographer',
			favoriteProduct: 'Volumizing Mascara'
		}
	]

	const timelineEvents: TimelineEvent[] = [
		{
			year: '2018',
			title: 'The Beginning',
			description: 'Founded in a small kitchen with a dream to create organic beauty products',
			icon: '🌱'
		},
		{
			year: '2019',
			title: 'First Product Launch',
			description: 'Introduced our signature Hydrating Serum with 100% organic ingredients',
			icon: '✨'
		},
		{
			year: '2020',
			title: 'Eco-Certification',
			description: 'Achieved PETA cruelty-free certification and expanded product line',
			icon: '🏆'
		},
		{
			year: '2021',
			title: 'National Expansion',
			description: 'Launched across 50+ cities with 1000+ happy customers',
			icon: '🚀'
		},
		{
			year: '2022',
			title: 'Sustainability Milestone',
			description: 'Saved 1000+ products from waste and planted 2500+ trees',
			icon: '🌍'
		},
		{
			year: '2023',
			title: 'Today',
			description: 'Leading the organic beauty revolution with 5000+ loyal customers',
			icon: '👑'
		}
	]

	const missionValues: MissionValue[] = [
		{
			title: 'Organic Purity',
			description: '100% natural ingredients sourced from certified organic farms',
			icon: '🌿'
		},
		{
			title: 'Cruelty-Free',
			description: 'Never tested on animals, certified by PETA',
			icon: '🐰'
		},
		{
			title: 'Sustainability',
			description: 'Zero-waste packaging and eco-friendly practices',
			icon: '♻️'
		},
		{
			title: 'Transparency',
			description: 'Full ingredient disclosure and traceable sourcing',
			icon: '🔍'
		},
		{
			title: 'Community',
			description: 'Supporting local artisans and fair trade practices',
			icon: '🤝'
		},
		{
			title: 'Innovation',
			description: 'Cutting-edge formulations with proven results',
			icon: '💡'
		}
	]

	const sourcingLocations = [
		{ name: 'Kerala', product: 'Coconut Oil', lat: 10.8505, lng: 76.2711 },
		{ name: 'Himachal Pradesh', product: 'Himalayan Salt', lat: 31.1048, lng: 77.1734 },
		{ name: 'Karnataka', product: 'Sandalwood', lat: 12.9716, lng: 77.5946 },
		{ name: 'Rajasthan', product: 'Rose Petals', lat: 26.9124, lng: 75.7873 },
		{ name: 'Assam', product: 'Tea Extracts', lat: 26.2006, lng: 92.9376 }
	]

	return (
		<div className="about-page">
			{/* Hero Section */}
			<section className="about-hero py-5">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-lg-6">
							<h1 className="about-title scroll-animate">
								Our Story of Conscious Beauty 🌟
							</h1>
							<p className="about-subtitle scroll-animate">
								From a small kitchen experiment to a revolution in organic beauty, 
								we're committed to creating products that are as kind to your skin 
								as they are to our planet.
							</p>
						</div>
						<div className="col-lg-6">
							<div className="hero-image-container scroll-animate">
								<img src="/cosme.jpg" alt="Cosme Kitchen Team" className="hero-image" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Impact Counter */}
			<section className="impact-section py-5">
				<div className="container">
					<h2 className="text-center mb-5 scroll-animate">Our Impact 🌱</h2>
					<div className="row g-4">
						{impactStats.map((stat, index) => (
							<div key={index} className="col-md-3">
								<div className="impact-card scroll-animate">
									<div className="impact-icon">{stat.icon}</div>
									<div className="impact-number">
										{stat.value.toLocaleString()}{stat.suffix}
									</div>
									<div className="impact-label">{stat.label}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Company Timeline */}
			<section className="timeline-section py-5">
				<div className="container">
					<h2 className="text-center mb-5 scroll-animate">Our Journey ⏳</h2>
					<div className="timeline-container" ref={timelineRef}>
						{timelineEvents.map((event, index) => (
							<div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'} scroll-animate`}>
								<div className="timeline-content">
									<div className="timeline-icon">{event.icon}</div>
									<div className="timeline-year">{event.year}</div>
									<h4>{event.title}</h4>
									<p>{event.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Mission & Values */}
			<section className="values-section py-5">
				<div className="container">
					<h2 className="text-center mb-5 scroll-animate">Our Mission & Values 🎯</h2>
					<div className="row g-4">
						{missionValues.map((value, index) => (
							<div key={index} className="col-md-4">
								<div className="value-card scroll-animate">
									<div className="value-icon">{value.icon}</div>
									<h4>{value.title}</h4>
									<p>{value.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Team Members */}
			<section className="team-section py-5">
				<div className="container">
					<h2 className="text-center mb-5 scroll-animate">Meet Our Team 👩‍💻👨‍💻</h2>
					<div className="row g-4">
						{teamMembers.map((member) => (
							<div key={member.id} className="col-md-6 col-lg-3">
								<div className="team-card scroll-animate">
									<div className="team-image">
										<img src={member.image} alt={member.name} />
									</div>
									<div className="team-info">
										<h5>{member.name}</h5>
										<p className="team-role">{member.role}</p>
									</div>
									<div className="team-hover">
										<div className="hover-content">
											<p><strong>Fun Fact:</strong> {member.funFact}</p>
											<p><strong>Favorite Product:</strong> {member.favoriteProduct}</p>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Behind-the-Scenes Video */}
			<section className="video-section py-5">
				<div className="container">
					<h2 className="text-center mb-5 scroll-animate">Behind the Scenes 🎥</h2>
					<div className="video-container scroll-animate">
						<div className="video-wrapper">
							<div className="video-placeholder">
								<div className="video-content">
									<img src="/cosme.jpg" alt="Behind the Scenes" className="video-poster" />
									<div className="play-button">▶️</div>
									<div className="video-text">
										<h4>Behind the Scenes</h4>
										<p>Experience our organic beauty creation process</p>
									</div>
								</div>
							</div>
							<div className="video-overlay">
								<div className="video-info">
									<h4>See How We Create</h4>
									<p>Watch our team craft organic beauty products with love and care</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Interactive Map */}
			<section className="map-section py-5">
				<div className="container">
					<h2 className="text-center mb-5 scroll-animate">Our Sourcing Journey 🗺️</h2>
					<div className="map-container scroll-animate">
						<div className="map-placeholder">
							<div className="map-content">
								<h4>India - Our Sourcing Network</h4>
								<div className="sourcing-locations">
									{sourcingLocations.map((location, index) => (
										<div key={index} className="location-pin">
											<div className="pin-icon">📍</div>
											<div className="pin-info">
												<strong>{location.name}</strong>
												<p>{location.product}</p>
											</div>
										</div>
									))}
								</div>
								<p className="map-description">
									We source our organic ingredients from certified farms across India, 
									supporting local communities and ensuring the highest quality.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Call to Action */}
			<section className="about-cta py-5">
				<div className="container text-center">
					<div className="cta-content scroll-animate">
						<h2>Join Our Beauty Revolution</h2>
						<p>Be part of a community that values conscious beauty and sustainable practices</p>
						<div className="cta-buttons">
							<a href="/shop" className="btn btn-primary btn-lg me-3">
								🛍️ Shop Now
							</a>
							<a href="/contact" className="btn btn-outline-primary btn-lg">
								💬 Get in Touch
							</a>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

