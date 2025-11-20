import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

type CartProduct = {
	_id: string
	name: string
	price: number
	imageUrl: string
	description?: string
	category?: string
	stock?: number
}

export type CartItem = {
	id: string
	productId: string
	qty: number
	shadeId?: string | null
	product: CartProduct | null
}

type CartState = {
	items: CartItem[]
	totalItems: number
}

const emptyCart: CartState = {
	items: [],
	totalItems: 0
}

type AddPayload = {
	productId: string
	quantity?: number
	shadeId?: string
}

type CartContextValue = {
	cart: CartState
	loading: boolean
	error: string | null
	addItem: (payload: AddPayload) => Promise<void>
	updateItemQuantity: (itemId: string, qty: number) => Promise<void>
	removeItem: (itemId: string) => Promise<void>
	clearCart: () => Promise<void>
	refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function normalizeCartState(data: Partial<CartState> | undefined | null): CartState {
	if (!data) return emptyCart
	const items = Array.isArray(data.items) ? data.items : []
	const totalItems =
		typeof data.totalItems === 'number'
			? data.totalItems
			: items.reduce((sum, item) => sum + (item?.qty ?? 0), 0)

	return { items, totalItems }
}

export function CartProvider({ children }: { children: ReactNode }) {
	const { token } = useAuth()
	const [cart, setCart] = useState<CartState>(emptyCart)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const updateCartState = useCallback((payload: any) => {
		setCart(normalizeCartState(payload))
	}, [])

	const refreshCart = useCallback(async () => {
		if (!token) {
			setCart(emptyCart)
			return
		}

		setLoading(true)
		try {
			const { data } = await axios.get('/api/cart')
			updateCartState(data)
			setError(null)
		} catch (err) {
			console.error('Failed to load cart', err)
			setError('Failed to load cart')
		} finally {
			setLoading(false)
		}
	}, [token, updateCartState])

	const addItem = useCallback(
		async ({ productId, quantity = 1, shadeId }: AddPayload) => {
			if (!token) {
				throw new Error('AUTH_REQUIRED')
			}
			try {
				const { data } = await axios.post('/api/cart/add', {
					productId,
					qty: quantity,
					shadeId
				})
				updateCartState(data)
				setError(null)
			} catch (err) {
				console.error('Failed to add item to cart', err)
				throw err
			}
		},
		[token, updateCartState]
	)

	const updateItemQuantity = useCallback(
		async (itemId: string, qty: number) => {
			if (!token) {
				throw new Error('AUTH_REQUIRED')
			}
			try {
				const { data } = await axios.patch(`/api/cart/item/${itemId}`, { qty })
				updateCartState(data)
				setError(null)
			} catch (err) {
				console.error('Failed to update cart item', err)
				throw err
			}
		},
		[token, updateCartState]
	)

	const removeItem = useCallback(
		async (itemId: string) => {
			if (!token) {
				throw new Error('AUTH_REQUIRED')
			}
			try {
				const { data } = await axios.delete(`/api/cart/item/${itemId}`)
				updateCartState(data)
				setError(null)
			} catch (err) {
				console.error('Failed to remove cart item', err)
				throw err
			}
		},
		[token, updateCartState]
	)

	const clearCart = useCallback(async () => {
		if (!token) {
			throw new Error('AUTH_REQUIRED')
		}
		try {
			const { data } = await axios.delete('/api/cart')
			updateCartState(data)
			setError(null)
		} catch (err) {
			console.error('Failed to clear cart', err)
			throw err
		}
	}, [token, updateCartState])

	useEffect(() => {
		if (token) {
			refreshCart()
		} else {
			setCart(emptyCart)
		}
	}, [token, refreshCart])

	const value = useMemo(
		() => ({
			cart,
			loading,
			error,
			addItem,
			updateItemQuantity,
			removeItem,
			clearCart,
			refreshCart
		}),
		[cart, loading, error, addItem, updateItemQuantity, removeItem, clearCart, refreshCart]
	)

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
	const ctx = useContext(CartContext)
	if (!ctx) {
		throw new Error('useCart must be used within CartProvider')
	}
	return ctx
}


