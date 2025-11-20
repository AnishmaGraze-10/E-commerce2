import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

type Props = {
	itemId: string
	itemType: 'product' | 'diary'
	compact?: boolean
}

export default function StarRating({ itemId, itemType, compact }: Props) {
	const [average, setAverage] = useState<number>(0)
	const [total, setTotal] = useState<number>(0)
	const [userRating, setUserRating] = useState<number | null>(null)
	const [hover, setHover] = useState<number>(0)

	useEffect(() => {
		let mounted = true
		axios.get(`/api/ratings/${itemType}/${itemId}`).then(res => {
			if (!mounted) return
			setAverage(res.data.averageRating || 0)
			setTotal(res.data.totalRatings || 0)
			if (typeof res.data.userRating === 'number') setUserRating(res.data.userRating)
		}).catch(() => {})
		return () => { mounted = false }
	}, [itemId, itemType])

	const label = useMemo(() => `⭐ ${average.toFixed(1)}/5 · ${total} review${total===1?'':'s'}`, [average, total])

	async function rate(value: number) {
		try {
			const wasRated = typeof userRating === 'number'
			const prevAverage = average
			const prevTotal = total
			let nextAverage = average
			let nextTotal = total
			if (wasRated) {
				nextAverage = (average * total - (userRating as number) + value) / Math.max(total, 1)
			} else {
				nextAverage = (average * total + value) / (total + 1)
				nextTotal = total + 1
			}
			setUserRating(value)
			setAverage(nextAverage)
			setTotal(nextTotal)

			const res = await axios.post('/api/ratings', { itemId, itemType, rating: value })
			if (typeof res.data.averageRating === 'number') setAverage(res.data.averageRating)
			if (typeof res.data.totalRatings === 'number') setTotal(res.data.totalRatings)
			toast.success('Thanks for your rating!')
		} catch (e: any) {
			if (e.response?.status === 401) {
				toast.error('Please login to rate')
				return
			}
			toast.error(e.response?.data?.message || 'Failed to save rating')
		}
	}

	return (
		<div className={compact ? 'd-inline-flex align-items-center gap-1' : ''}>
			<div aria-label="Rate this item" className="d-inline-flex align-items-center">
				{[1,2,3,4,5].map(v => {
					const active = hover ? v <= hover : v <= (userRating || Math.round(average))
					return (
						<button key={v} className="btn btn-link p-0 me-1" onMouseEnter={() => setHover(v)} onMouseLeave={() => setHover(0)} onClick={() => rate(v)} title={`${v} star${v>1?'s':''}`}> {active ? '★' : '☆'} </button>
					)
				})}
			</div>
			{!compact && <span className="ms-2 text-muted small">{label}</span>}
		</div>
	)
}
