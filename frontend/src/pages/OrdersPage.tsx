import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

type Order = {
	_id: string
	status: string
	items: Array<{ product: { name: string; price: number }; quantity: number }>
}

export default function OrdersPage() {
	const { user } = useAuth()
	const [orders, setOrders] = useState<Order[]>([])

	useEffect(() => {
		if (!user) {
			setOrders([])
			return
		}
		axios.get('/api/orders/my').then(r => setOrders(r.data)).catch(() => setOrders([]))
	}, [user])

	return (
		<div className="container">
			<h2>My Orders</h2>
			{orders.length === 0 ? <p>No orders yet.</p> : (
				<ul className="list-group">
					{orders.map(o => (
						<li key={o._id} className="list-group-item">
							<div className="d-flex justify-content-between"><strong>Order {o._id.slice(-6)}</strong><span>{o.status}</span></div>
							<ul>
								{o.items.map((i, idx) => (
									<li key={idx}>{i.product.name} x {i.quantity} = ₹{(i.product.price * i.quantity).toFixed(2)}</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

