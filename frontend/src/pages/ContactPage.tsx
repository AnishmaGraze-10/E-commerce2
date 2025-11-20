import { useState, useEffect } from 'react'


type SupportCategory = 'general' | 'orders' | 'feedback' | 'careers'

interface SocialStats {
	instagram: number
	twitter: number
	linkedin: number
}

export default function ContactPage() {

	const [activeTab, setActiveTab] = useState<SupportCategory>('general')
	const [form, setForm] = useState({ 
		name: '', 
		email: '', 
		subject: '', 
		message: '', 
		category: 'general' 
	})
	const [socialStats, setSocialStats] = useState<SocialStats>({
		instagram: 15420,
		twitter: 8920,
		linkedin: 3450
	})
	const [responseTime] = useState('2 hours')

	// Simulate live stats updates
	useEffect(() => {
		const interval = setInterval(() => {
			setSocialStats(prev => ({
				instagram: prev.instagram + Math.floor(Math.random() * 3) - 1,
				twitter: prev.twitter + Math.floor(Math.random() * 3) - 1,
				linkedin: prev.linkedin + Math.floor(Math.random() * 2)
			}))
		}, 30000) // Update every 30 seconds

		return () => clearInterval(interval)
	}, [])

	function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	function submit(e: React.FormEvent) {
		e.preventDefault()
		alert(`Thanks for contacting us! We'll get back to you within ${responseTime}.`)
		setForm({ name: '', email: '', subject: '', message: '', category: 'general' })
	}

	function handleTabChange(category: SupportCategory) {
		setActiveTab(category)
		setForm(prev => ({ ...prev, category }))
	}

	function formatNumber(num: number): string {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
		return num.toString()
	}

	const supportCategories = [
		{ id: 'general', label: 'General', icon: '💬' },
		{ id: 'orders', label: 'Orders', icon: '📦' },
		{ id: 'feedback', label: 'Feedback', icon: '⭐' },
		{ id: 'careers', label: 'Careers', icon: '💼' }
	]

	const ctaCards = [
		{
			title: 'Need Support?',
			description: 'Get instant help from our team',
			action: 'Chat Now',
			icon: '💬',
			link: 'https://wa.me/919876543210',
			color: 'primary'
		},
		{
			title: 'Partnership?',
			description: 'Let\'s grow together',
			action: 'Email Us',
			icon: '🤝',
			link: 'mailto:partnerships@cosmekitchen.com',
			color: 'success'
		},
		{
			title: 'Bulk Orders?',
			description: 'Special pricing for large orders',
			action: 'Get Quote',
			icon: '📋',
			link: 'mailto:bulk@cosmekitchen.com',
			color: 'warning'
		}
	]

	return (
		<div className="contact-page">
			{/* Hero Section */}
			<section className="contact-hero py-5">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-lg-6">
							<h1 className="contact-title">Get in Touch 📞</h1>
							<p className="contact-subtitle">
								We'd love to hear from you! Our team is here to help with any questions, 
								support, or feedback you might have.
							</p>
							<div className="response-time-badge">
								⏱️ We usually reply in under {responseTime}
							</div>
						</div>
						<div className="col-lg-6">
							<div className="qr-contact-card">
								<div className="qr-code">
									<div className="qr-placeholder">
										📱 Scan to save contact
									</div>
								</div>
								<div className="qr-info">
									<h5>Quick Contact</h5>
									<p>📧 hello@cosmekitchen.com</p>
									<p>📞 +91 98765 43210</p>
									<p>💬 WhatsApp available</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Social Media Stats */}
			<section className="social-stats-section py-4">
				<div className="container">
					<h3 className="text-center mb-4">Follow Us for Updates</h3>
					<div className="row justify-content-center">
						<div className="col-md-4">
							<a href="https://instagram.com/cosmekitchen" className="social-stat-card instagram">
								<div className="social-icon">📸</div>
								<div className="social-info">
									<h5>Instagram</h5>
									<div className="follower-count">{formatNumber(socialStats.instagram)} followers</div>
								</div>
							</a>
						</div>
						<div className="col-md-4">
							<a href="https://twitter.com/cosmekitchen" className="social-stat-card twitter">
								<div className="social-icon">🐦</div>
								<div className="social-info">
									<h5>Twitter</h5>
									<div className="follower-count">{formatNumber(socialStats.twitter)} followers</div>
								</div>
							</a>
						</div>
						<div className="col-md-4">
							<a href="https://linkedin.com/company/cosmekitchen" className="social-stat-card linkedin">
								<div className="social-icon">💼</div>
								<div className="social-info">
									<h5>LinkedIn</h5>
									<div className="follower-count">{formatNumber(socialStats.linkedin)} followers</div>
								</div>
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Cards */}
			<section className="cta-cards-section py-4">
				<div className="container">
					<div className="row g-4">
						{ctaCards.map((card, index) => (
							<div key={index} className="col-md-4">
								<div className={`cta-card cta-${card.color}`}>
									<div className="cta-icon">{card.icon}</div>
									<h5>{card.title}</h5>
									<p>{card.description}</p>
									<a href={card.link} className={`btn btn-${card.color}`}>
										{card.action}
									</a>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Support Category Tabs */}
			<section className="support-tabs-section py-5">
				<div className="container">
					<div className="support-tabs">
						{supportCategories.map((category) => (
							<button
								key={category.id}
								className={`support-tab ${activeTab === category.id ? 'active' : ''}`}
								onClick={() => handleTabChange(category.id as SupportCategory)}
							>
								<span className="tab-icon">{category.icon}</span>
								{category.label}
							</button>
						))}
					</div>

					{/* Contact Form */}
					<div className="contact-form-container">
						<form onSubmit={submit} className="contact-form">
							<div className="row g-3">
								<div className="col-md-6">
									<label className="form-label">Name *</label>
									<input
										name="name"
										className="form-control"
										value={form.name}
										onChange={onChange}
										placeholder="Your full name"
										required
									/>
								</div>
								<div className="col-md-6">
									<label className="form-label">Email *</label>
									<input
										name="email"
										type="email"
										className="form-control"
										value={form.email}
										onChange={onChange}
										placeholder="your.email@example.com"
										required
									/>
								</div>
								<div className="col-12">
									<label className="form-label">Subject *</label>
									<input
										name="subject"
										className="form-control"
										value={form.subject}
										onChange={onChange}
										placeholder="Brief description of your inquiry"
										required
									/>
								</div>
								<div className="col-12">
									<label className="form-label">Message *</label>
									<textarea
										name="message"
										className="form-control"
										rows={5}
										value={form.message}
										onChange={onChange}
										placeholder="Tell us more about your inquiry..."
										required
									></textarea>
								</div>
								<div className="col-12">
									<button type="submit" className="btn btn-primary btn-lg">
										📤 Send Message
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</section>

			{/* Contact Information */}
			<section className="contact-info-section py-5">
				<div className="container">
					<div className="row g-4">
						<div className="col-md-4">
							<div className="contact-info-card">
								<div className="info-icon">📍</div>
								<h5>Visit Us</h5>
								<p>123 Beauty Street<br />Mumbai, Maharashtra 400001<br />India</p>
							</div>
						</div>
						<div className="col-md-4">
							<div className="contact-info-card">
								<div className="info-icon">📞</div>
								<h5>Call Us</h5>
								<p>+91 98765 43210<br />+91 98765 43211<br />Mon-Sat: 9AM-6PM</p>
							</div>
						</div>
						<div className="col-md-4">
							<div className="contact-info-card">
								<div className="info-icon">📧</div>
								<h5>Email Us</h5>
								<p>hello@cosmekitchen.com<br />support@cosmekitchen.com<br />We reply within 2 hours</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

