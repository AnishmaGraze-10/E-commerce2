import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { useCart } from '../context/CartContext'

export default function CheckoutPage() {
	const { isAuthenticated, user } = useAuth()
	const { cart, loading: cartLoading, clearCart, refreshCart } = useCart()
	const navigate = useNavigate()
	const [shipping, setShipping] = useState({
		fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', zipCode: '', country: ''
	})
	const [payment, setPayment] = useState({
		cardholderName: '', cardNumber: '', expiryDate: '', cvv: ''
	})
	const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card')

	useEffect(() => {
		if (!isAuthenticated) {
			alert('Please login to continue with checkout')
			navigate('/login')
			return
		}

		refreshCart().catch((err) => console.error('Failed to refresh cart for checkout', err))

		if (user?.name) {
			setShipping(prev => ({ ...prev, fullName: user.name }))
		}
	}, [isAuthenticated, user, navigate, refreshCart])

	// Redirect if not authenticated
	if (!isAuthenticated) {
		return <div>Redirecting to login...</div>
	}

	const items = cart.items

	const total = useMemo(() => items.reduce((s, i) => s + (i.product?.price ?? 0) * i.qty, 0), [items])

	async function submitOrder() {
		if (items.length === 0) {
			alert('Your cart is empty')
			return
		}

		// Validate shipping address
		const requiredShippingFields = ['fullName', 'addressLine1', 'city', 'state', 'zipCode', 'country']
		const missingShippingFields = requiredShippingFields.filter(field => !shipping[field as keyof typeof shipping])
		
		if (missingShippingFields.length > 0) {
			alert(`Please fill in all required shipping fields: ${missingShippingFields.join(', ')}`)
			return
		}

		// Validate payment details based on payment method
		if (paymentMethod === 'card') {
			const requiredPaymentFields = ['cardholderName', 'cardNumber', 'expiryDate', 'cvv']
			const missingPaymentFields = requiredPaymentFields.filter(field => !payment[field as keyof typeof payment])
			
			if (missingPaymentFields.length > 0) {
				alert(`Please fill in all required payment fields: ${missingPaymentFields.join(', ')}`)
				return
			}

			// Validate card number format (basic validation)
			if (payment.cardNumber.length < 12 || payment.cardNumber.length > 19) {
				alert('Please enter a valid card number (12-19 digits)')
				return
			}

			// Validate CVV format
			if (payment.cvv.length < 3 || payment.cvv.length > 4) {
				alert('Please enter a valid CVV (3-4 digits)')
				return
			}
		}

		// Show order confirmation
		const paymentInfo = paymentMethod === 'card' 
			? `Payment: Credit/Debit Card (${payment.cardNumber.slice(-4)})`
			: 'Payment: Cash on Delivery'
			
		const confirmOrder = window.confirm(
			`Confirm your order?\n\n` +
			`Total Items: ${items.length}\n` +
			`Total Amount: ₹${total.toFixed(2)}\n` +
			`${paymentInfo}\n\n` +
			`Shipping to: ${shipping.fullName}\n` +
			`${shipping.addressLine1}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}\n` +
			`${shipping.country}\n\n` +
			`Click OK to place your order.`
		)

		if (!confirmOrder) return

		try {
			const payload = {
				items: items.map(i => ({ productId: i.productId, quantity: i.qty })),
				shipping,
				totalAmount: total,
				paymentMethod,
				paymentDetails: paymentMethod === 'card' ? payment : null
			}
			
			// Get the auth token from localStorage
			const token = localStorage.getItem('token')
			if (!token) {
				alert('Authentication token not found. Please login again.')
				navigate('/login')
				return
			}
			
			// Set the authorization header
			const config = {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			}
			
			const res = await axios.post('/api/orders', payload, config)
			await clearCart()
			
			alert(`🎉 Order placed successfully!\n\nOrder ID: ${res.data._id}\nTotal: ₹${total.toFixed(2)}\n\nThank you for your purchase!`)
			
			// Redirect to orders page
			navigate('/orders')
		} catch (error: any) {
			console.error('Order submission error:', error)
			
			if (error.response?.status === 401) {
				alert('Your session has expired. Please login again.')
				navigate('/login')
			} else if (error.response?.data?.message) {
				alert(`Order failed: ${error.response.data.message}`)
			} else {
				alert('Failed to place order. Please try again.')
			}
		}
	}

	function onChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { id, value } = e.target
		
		// Handle payment field formatting
		if (id === 'cardNumber') {
			// Remove non-digits and limit to 19 characters
			const cleaned = value.replace(/\D/g, '').slice(0, 19)
			setPayment({ ...payment, cardNumber: cleaned })
		} else if (id === 'expiryDate') {
			// Format as MM/YY
			const cleaned = value.replace(/\D/g, '').slice(0, 4)
			const formatted = cleaned.length >= 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}` : cleaned
			setPayment({ ...payment, expiryDate: formatted })
		} else if (id === 'cvv') {
			// Limit CVV to 4 digits
			const cleaned = value.replace(/\D/g, '').slice(0, 4)
			setPayment({ ...payment, cvv: cleaned })
		} else if (id.startsWith('payment')) {
			// Handle other payment fields
			const fieldName = id.replace('payment', '').toLowerCase()
			setPayment({ ...payment, [fieldName]: value })
		} else {
			// Handle shipping fields
			setShipping({ ...shipping, [id]: value })
		}
	}

	if (!isAuthenticated) {
		return <div>Redirecting to login...</div>
	}

	if (cartLoading) {
		return <div className="container py-4">Loading checkout details...</div>
	}

	if (!cartLoading && items.length === 0) {
		return (
			<div className="container py-4">
				<p>Your cart is empty. Please add products before checkout.</p>
			</div>
		)
	}

	return (
		<div className="container">
			<h2 className="mb-3">Checkout</h2>
			<div className="row g-4">
				<div className="col-md-4">
					<h4>Order Summary</h4>
					<table className="table">
						<thead>
							<tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th></tr>
						</thead>
						<tbody>
							{items.map(i => (
								<tr key={i._id}><td>{i.name}</td><td>₹{i.price}</td><td>{i.quantity}</td><td>₹{(i.price * i.quantity).toFixed(2)}</td></tr>
							))}
						</tbody>
						<tfoot>
							<tr><th colSpan={3}>Grand Total</th><th>₹{total.toFixed(2)}</th></tr>
						</tfoot>
					</table>
				</div>
				<div className="col-md-4">
					<h4>Shipping Address</h4>
					<div className="mb-2">
						<label className="form-label" htmlFor="fullName">Full Name *</label>
						<input id="fullName" className="form-control" placeholder="Enter your full name" onChange={onChange} required />
					</div>
					<div className="mb-2">
						<label className="form-label" htmlFor="addressLine1">Address Line 1 *</label>
						<input id="addressLine1" className="form-control" placeholder="Street address, P.O. Box" onChange={onChange} required />
					</div>
					<div className="mb-2">
						<label className="form-label" htmlFor="addressLine2">Address Line 2</label>
						<input id="addressLine2" className="form-control" placeholder="Apartment, suite, unit, etc. (optional)" onChange={onChange} />
					</div>
					<div className="row">
						<div className="col-md-6 mb-2">
							<label className="form-label" htmlFor="city">City *</label>
							<input id="city" className="form-control" placeholder="Enter city" onChange={onChange} required />
						</div>
						<div className="col-md-6 mb-2">
							<label className="form-label" htmlFor="state">State *</label>
							<input id="state" className="form-control" placeholder="Enter state" onChange={onChange} required />
						</div>
					</div>
					<div className="row">
						<div className="col-md-6 mb-2">
							<label className="form-label" htmlFor="zipCode">Zip Code *</label>
							<input id="zipCode" className="form-control" placeholder="Enter zip code" onChange={onChange} required />
						</div>
						<div className="col-md-6 mb-2">
							<label className="form-label" htmlFor="country">Country *</label>
							<input id="country" className="form-control" placeholder="Enter country" onChange={onChange} required />
						</div>
					</div>
				</div>
				<div className="col-md-4">
					<h4>Payment Details</h4>
					
					{/* Payment Method Selection */}
					<div className="mb-3">
						<label className="form-label">Payment Method *</label>
						<div className="d-flex gap-3">
							<div className="form-check">
								<input 
									className="form-check-input" 
									type="radio" 
									name="paymentMethod" 
									id="cardPayment" 
									checked={paymentMethod === 'card'} 
									onChange={() => setPaymentMethod('card')} 
								/>
								<label className="form-check-label" htmlFor="cardPayment">
									💳 Credit/Debit Card
								</label>
							</div>
							<div className="form-check">
								<input 
									className="form-check-input" 
									type="radio" 
									name="paymentMethod" 
									id="codPayment" 
									checked={paymentMethod === 'cod'} 
									onChange={() => setPaymentMethod('cod')} 
								/>
								<label className="form-check-label" htmlFor="codPayment">
									💰 Cash on Delivery
								</label>
							</div>
						</div>
					</div>

					{/* Card Payment Fields */}
					{paymentMethod === 'card' && (
						<>
							<div className="mb-2">
								<label className="form-label" htmlFor="paymentCardholderName">Cardholder Name *</label>
								<input 
									id="paymentCardholderName" 
									className="form-control" 
									placeholder="Name on card" 
									onChange={onChange} 
									required 
								/>
							</div>
							<div className="mb-2">
								<label className="form-label" htmlFor="cardNumber">Card Number *</label>
								<input 
									id="cardNumber" 
									className="form-control" 
									placeholder="1234 5678 9012 3456" 
									onChange={onChange} 
									maxLength={19}
									required 
								/>
							</div>
							<div className="row">
								<div className="col-md-6 mb-2">
									<label className="form-label" htmlFor="expiryDate">Expiry Date *</label>
									<input 
										id="expiryDate" 
										className="form-control" 
										placeholder="MM/YY" 
										onChange={onChange} 
										maxLength={5}
										required 
									/>
								</div>
								<div className="col-md-6 mb-2">
									<label className="form-label" htmlFor="cvv">CVV *</label>
									<input 
										id="cvv" 
										className="form-control" 
										placeholder="123" 
										onChange={onChange} 
										maxLength={4}
										required 
									/>
								</div>
							</div>
							<div className="mt-3">
								<small className="text-muted">
									💳 We accept Visa, MasterCard, American Express, and other major cards
								</small>
							</div>
						</>
					)}

					{/* Cash on Delivery Info */}
					{paymentMethod === 'cod' && (
						<div className="alert alert-info">
							<h6>💰 Cash on Delivery</h6>
							<p className="mb-2">Pay with cash when your order is delivered.</p>
							<ul className="mb-0 small">
								<li>No additional charges</li>
								<li>Pay only after receiving your order</li>
								<li>Available for orders up to ₹10,000</li>
							</ul>
						</div>
					)}
				</div>
			</div>
			<div className="row mt-4">
				<div className="col-12 text-center">
					<button className="btn btn-success btn-lg px-5" onClick={submitOrder}>
						🛒 Place Order - ₹{total.toFixed(2)}
					</button>
				</div>
			</div>
		</div>
	)
}

