import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function CartPage() {
	const navigate = useNavigate()
	const { isAuthenticated } = useAuth()
	const { cart, loading, error, updateItemQuantity, removeItem, refreshCart } = useCart()
	const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

	// Filter out items with invalid products and calculate total
	const validItems = useMemo(
		() => cart.items.filter(item => item.product !== null),
		[cart.items]
	)

	const total = useMemo(
		() => validItems.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.qty, 0),
		[validItems]
	)

	const handleQuantityChange = async (itemId: string, currentQty: number, delta: number) => {
		const nextQty = currentQty + delta
		setUpdatingItems(prev => new Set(prev).add(itemId))
		try {
			if (nextQty <= 0) {
				await removeItem(itemId)
			} else {
				await updateItemQuantity(itemId, nextQty)
			}
		} catch (err) {
			console.error('Failed to update cart item', err)
		} finally {
			setUpdatingItems(prev => {
				const next = new Set(prev)
				next.delete(itemId)
				return next
			})
		}
	}

	const handleRemove = async (itemId: string) => {
		setUpdatingItems(prev => new Set(prev).add(itemId))
		try {
			await removeItem(itemId)
		} catch (err) {
			console.error('Failed to remove item', err)
		} finally {
			setUpdatingItems(prev => {
				const next = new Set(prev)
				next.delete(itemId)
				return next
			})
		}
	}

	const handleCheckout = () => {
		navigate('/checkout')
	}

	if (!isAuthenticated) {
		return <div className="container py-4">Please login to view your cart.</div>
	}

	if (loading) {
		return <div className="container py-4">Loading cart...</div>
	}

	return (
		<div className="container py-4">
			<h2 className="mb-4">Cart</h2>
			{error && (
				<div className="alert alert-danger d-flex justify-content-between align-items-center">
					<span>{error}</span>
					<button className="btn btn-sm btn-outline-danger" onClick={refreshCart}>
						Retry
					</button>
				</div>
			)}
			{validItems.length === 0 ? (
				<p>Your cart is empty.</p>
			) : (
				<>
					<table className="table">
						<thead>
							<tr>
								<th>Product</th>
								<th>Price</th>
								<th>Qty</th>
								<th>Total</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{validItems.map((item) => {
								const isUpdating = updatingItems.has(item.id)
								const hasProduct = item.product !== null
								return (
									<tr key={item.id} className={isUpdating ? 'opacity-50' : ''}>
										<td>
											<div className="d-flex align-items-center gap-3">
												{item.product?.imageUrl && (
													<img 
														src={item.product.imageUrl} 
														alt={item.product.name}
														style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
													/>
												)}
												<div>
													<div className="fw-bold">{item.product?.name ?? 'Product unavailable'}</div>
													{!hasProduct && (
														<small className="text-danger">This product may have been removed</small>
													)}
												</div>
											</div>
										</td>
										<td>₹{item.product?.price?.toFixed(2) ?? '0.00'}</td>
										<td>
											<button
												className="btn btn-sm btn-secondary"
												onClick={() => handleQuantityChange(item.id, item.qty, -1)}
												disabled={isUpdating}
											>
												-
											</button>
											<span className="mx-2">{item.qty}</span>
											<button
												className="btn btn-sm btn-secondary"
												onClick={() => handleQuantityChange(item.id, item.qty, 1)}
												disabled={isUpdating}
											>
												+
											</button>
										</td>
										<td>₹{((item.product?.price ?? 0) * item.qty).toFixed(2)}</td>
										<td>
											<button 
												className="btn btn-sm btn-danger" 
												onClick={() => handleRemove(item.id)}
												disabled={isUpdating}
											>
												{isUpdating ? '...' : 'Remove'}
											</button>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
					<div className="d-flex justify-content-between align-items-center">
						<h4>Total: ₹{total.toFixed(2)}</h4>
						<button className="btn btn-primary" onClick={handleCheckout}>
							Checkout
						</button>
					</div>
				</>
			)}
		</div>
	)
}

