import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function CartPage() {
	const navigate = useNavigate()
	const { isAuthenticated } = useAuth()
	const { cart, loading, updateItemQuantity, removeItem } = useCart()

	const total = useMemo(
		() => cart.items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.qty, 0),
		[cart.items]
	)

	const handleQuantityChange = (itemId: string, currentQty: number, delta: number) => {
		const nextQty = currentQty + delta
		if (nextQty <= 0) {
			removeItem(itemId).catch((err) => console.error('Failed to remove item', err))
		} else {
			updateItemQuantity(itemId, nextQty).catch((err) => console.error('Failed to update item qty', err))
		}
	}

	const handleRemove = (itemId: string) => {
		removeItem(itemId).catch((err) => console.error('Failed to remove item', err))
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
			{cart.items.length === 0 ? (
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
							{cart.items.map((item) => (
								<tr key={item.id}>
									<td>{item.product?.name ?? 'Product unavailable'}</td>
									<td>₹{item.product?.price ?? 0}</td>
									<td>
										<button
											className="btn btn-sm btn-secondary"
											onClick={() => handleQuantityChange(item.id, item.qty, -1)}
										>
											-
										</button>
										<span className="mx-2">{item.qty}</span>
										<button
											className="btn btn-sm btn-secondary"
											onClick={() => handleQuantityChange(item.id, item.qty, 1)}
										>
											+
										</button>
									</td>
									<td>₹{((item.product?.price ?? 0) * item.qty).toFixed(2)}</td>
									<td>
										<button className="btn btn-sm btn-danger" onClick={() => handleRemove(item.id)}>
											Remove
										</button>
									</td>
								</tr>
							))}
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

