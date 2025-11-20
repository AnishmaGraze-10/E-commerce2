import { useEffect, useRef, useState } from 'react'
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision'
import axios from 'axios'
import { useCategorySynonyms } from '../hooks/useCategorySynonyms'

type Shade = { name: string; color: string; alpha?: number }

type CosmeticSelection = {
	lipstick?: Shade | null
	eyeshadow?: Shade | null
	foundation?: Shade | null
}

export default function TryOnPage() {
	const videoRef = useRef<HTMLVideoElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [isReady, setIsReady] = useState(false)
	const [isRunning, setIsRunning] = useState(false)
	const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null)
	const [selection, setSelection] = useState<CosmeticSelection>({})
    const [message, setMessage] = useState<string>('')
    const [catalog, setCatalog] = useState<any[]>([])
    const [undertone, setUndertone] = useState<string>('')
    const [undertoneShades, setUndertoneShades] = useState<string[]>([])
    const { synonyms } = useCategorySynonyms()

	useEffect(() => {
		let stream: MediaStream | null = null

		async function setup() {
			try {
				// Camera
				stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
				if (videoRef.current) {
					videoRef.current.srcObject = stream
					await videoRef.current.play()
				}

				// MediaPipe Face Landmarker init
				const filesetResolver = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
				)
				const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
					baseOptions: {
						modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task'
					},
					numFaces: 1,
					outputFaceBlendshapes: false,
					runningMode: 'VIDEO'
				})
				setFaceLandmarker(landmarker)
				setIsReady(true)
				setIsRunning(true)
				setMessage('')
			} catch (err: any) {
				console.error(err)
				setMessage('Camera permission denied or initialization failed.')
			}
		}

		setup()

		return () => {
			setIsRunning(false)
			if (stream) stream.getTracks().forEach(t => t.stop())
			if (faceLandmarker) faceLandmarker.close()
		}
	}, [])

    // Load products once to support dynamic mapping for Try + Add
    useEffect(() => {
        axios.get('/api/products').then(res => setCatalog(res.data || [])).catch(() => {})
    }, [])

	useEffect(() => {
		let raf = 0
		function loop() {
			if (!isRunning || !faceLandmarker || !videoRef.current || !canvasRef.current) {
				raf = requestAnimationFrame(loop)
				return
			}
			const video = videoRef.current
			const canvas = canvasRef.current
			const ctx = canvas.getContext('2d')!
			if (!ctx) {
				raf = requestAnimationFrame(loop)
				return
			}
			// Fit canvas to video
			if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
				canvas.width = video.videoWidth
				canvas.height = video.videoHeight
			}

			// Draw video
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

			// Detect landmarks
			const nowMs = performance.now()
			const result = faceLandmarker.detectForVideo(video, nowMs)
			if (result.faceLandmarks && result.faceLandmarks.length > 0) {
				const landmarks = result.faceLandmarks[0]
				// Render cosmetics
				if (selection.foundation) applyFoundation(ctx, landmarks, canvas.width, canvas.height, selection.foundation)
				if (selection.eyeshadow) applyEyeshadow(ctx, landmarks, canvas.width, canvas.height, selection.eyeshadow)
				if (selection.lipstick) applyLipstick(ctx, landmarks, canvas.width, canvas.height, selection.lipstick)
			}

			raf = requestAnimationFrame(loop)
		}
		raf = requestAnimationFrame(loop)
		return () => cancelAnimationFrame(raf)
	}, [isRunning, faceLandmarker, selection])

	function handleSnapshot() {
		if (!canvasRef.current) return
		const url = canvasRef.current.toDataURL('image/png')
		const link = document.createElement('a')
		link.href = url
		link.download = 'try-on.png'
		link.click()
	}

    async function analyzeUndertone() {
        if (!canvasRef.current) return
        const imageUrl = canvasRef.current.toDataURL('image/png')
        try {
            const res = await axios.post('/api/skin/analyze', { imageUrl })
            setUndertone(res.data.undertone)
            setUndertoneShades(res.data.shades || [])
        } catch {
            setUndertone('')
            setUndertoneShades([])
        }
    }

    function resolveProductForSelection(): { productId: string | null, shadeId?: string } {
        // Synonyms for categories and fuzzy shade matching
        const synonymMap: Record<string, string[]> = {
            lipstick: ['lipstick', 'lip', 'lip-colour', 'lip color', 'tint', 'balm'],
            eyeshadow: ['eyeshadow', 'eye shadow', 'shadow', 'palette'],
            foundation: ['foundation', 'bb cream', 'base', 'skin tint']
        }
        // Merge backend synonyms if present
        Object.keys(synonyms || {}).forEach(c => {
            const key = c as keyof typeof synonymMap
            const arr = Array.isArray((synonyms as any)[c]) ? (synonyms as any)[c] : []
            if (synonymMap[key]) synonymMap[key] = Array.from(new Set([...synonymMap[key], ...arr]))
            else synonymMap[key] = arr
        })
        const picks: Array<{ sel?: Shade | null, key: keyof typeof synonymMap }> = [
            { sel: selection.lipstick, key: 'lipstick' },
            { sel: selection.eyeshadow, key: 'eyeshadow' },
            { sel: selection.foundation, key: 'foundation' }
        ]
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
        for (const { sel, key } of picks) {
            if (!sel) continue
            const keys = synonymMap[key]
            const pool = catalog.filter((p: any) => {
                const c = norm(String(p.category || ''))
                const n = norm(String(p.name || ''))
                return keys.some(k => c.includes(k) || n.includes(k))
            })
            if (pool.length === 0) continue
            // Fuzzy shade match by name token overlap
            const target = norm(sel.name)
            const score = (p: any) => {
                const n = norm(String(p.name || ''))
                let s = 0
                if (n.includes(target)) s += 2
                if (target.split(' ').some(t => t && n.includes(t))) s += 1
                return s
            }
            const chosen = pool.sort((a: any, b: any) => score(b) - score(a))[0]
            return { productId: chosen._id, shadeId: sel.name }
        }
        return { productId: null }
    }

	function ShadeButton({ label, onClick, color }: { label: string; onClick: () => void; color?: string }) {
		return (
			<button className="btn btn-sm btn-outline-primary me-2 mb-2" onClick={onClick} style={{ background: color ?? undefined, color: color ? '#fff' : undefined }}>
				{label}
			</button>
		)
	}

	return (
		<div>
			<h2 className="mb-3">Virtual Try-On</h2>
			<p className="text-muted">Grant camera access to try lipstick, eyeshadow, and foundation in real-time.</p>
			{message && <div className="alert alert-warning">{message}</div>}
			<div className="row g-3">
				<div className="col-lg-8">
					<div style={{ position: 'relative', width: '100%' }}>
						<video ref={videoRef} playsInline muted style={{ width: '100%', display: 'none' }} />
						<canvas ref={canvasRef} style={{ width: '100%', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
						{!isReady && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
							<div className="text-center">
								<div className="spinner-border" role="status" />
								<p className="mt-2 mb-0">Initializing camera...</p>
							</div>
						</div>}
					</div>
				</div>
				<div className="col-lg-4">
					<div className="card">
						<div className="card-body">
							<h5 className="card-title">Lipstick</h5>
							<div>
								<ShadeButton label="Rose" color="#d14b6a" onClick={() => setSelection(s => ({ ...s, lipstick: { name: 'Rose', color: '#d14b6a', alpha: 0.55 } }))} />
								<ShadeButton label="Coral" color="#ff6f61" onClick={() => setSelection(s => ({ ...s, lipstick: { name: 'Coral', color: '#ff6f61', alpha: 0.55 } }))} />
								<ShadeButton label="Nude" color="#b8876b" onClick={() => setSelection(s => ({ ...s, lipstick: { name: 'Nude', color: '#b8876b', alpha: 0.45 } }))} />
								<ShadeButton label="Bright Red" color="#ff2a2a" onClick={() => setSelection(s => ({ ...s, lipstick: { name: 'Bright Red', color: '#ff2a2a', alpha: 0.65 } }))} />
								<ShadeButton label="Deep Plum" color="#6d214f" onClick={() => setSelection(s => ({ ...s, lipstick: { name: 'Deep Plum', color: '#6d214f', alpha: 0.6 } }))} />
								<ShadeButton label="Berry" color="#9b2242" onClick={() => setSelection(s => ({ ...s, lipstick: { name: 'Berry', color: '#9b2242', alpha: 0.6 } }))} />
								<ShadeButton label="Soft Pink" color="#f5a6b1" onClick={() => setSelection(s => ({ ...s, lipstick: { name: 'Soft Pink', color: '#f5a6b1', alpha: 0.5 } }))} />
								<ShadeButton label="Mauve" color="#a25a6f" onClick={() => setSelection(s => ({ ...s, lipstick: { name: 'Mauve', color: '#a25a6f', alpha: 0.55 } }))} />
								<ShadeButton label="Brown" color="#5a3a2e" onClick={() => setSelection(s => ({ ...s, lipstick: { name: 'Brown', color: '#5a3a2e', alpha: 0.55 } }))} />
								<ShadeButton label="Clear" onClick={() => setSelection(s => ({ ...s, lipstick: null }))} />
							</div>

							<h5 className="card-title mt-3">Eyeshadow</h5>
							<div>
								<ShadeButton label="Smoky" color="#695f75" onClick={() => setSelection(s => ({ ...s, eyeshadow: { name: 'Smoky', color: '#695f75', alpha: 0.35 } }))} />
								<ShadeButton label="Charcoal" color="#3b3b3b" onClick={() => setSelection(s => ({ ...s, eyeshadow: { name: 'Charcoal', color: '#3b3b3b', alpha: 0.35 } }))} />
								<ShadeButton label="Deep Plum" color="#5a3d66" onClick={() => setSelection(s => ({ ...s, eyeshadow: { name: 'Deep Plum', color: '#5a3d66', alpha: 0.33 } }))} />
								<ShadeButton label="Gold" color="#c2a14a" onClick={() => setSelection(s => ({ ...s, eyeshadow: { name: 'Gold', color: '#c2a14a', alpha: 0.3 } }))} />
								<ShadeButton label="Bronze" color="#b2753b" onClick={() => setSelection(s => ({ ...s, eyeshadow: { name: 'Bronze', color: '#b2753b', alpha: 0.3 } }))} />
								<ShadeButton label="Champagne" color="#e4d1a9" onClick={() => setSelection(s => ({ ...s, eyeshadow: { name: 'Champagne', color: '#e4d1a9', alpha: 0.28 } }))} />
								<ShadeButton label="Peach" color="#f2a07e" onClick={() => setSelection(s => ({ ...s, eyeshadow: { name: 'Peach', color: '#f2a07e', alpha: 0.28 } }))} />
								<ShadeButton label="Teal" color="#3a9e9e" onClick={() => setSelection(s => ({ ...s, eyeshadow: { name: 'Teal', color: '#3a9e9e', alpha: 0.3 } }))} />
								<ShadeButton label="Taupe" color="#8d7f73" onClick={() => setSelection(s => ({ ...s, eyeshadow: { name: 'Taupe', color: '#8d7f73', alpha: 0.3 } }))} />
								<ShadeButton label="Clear" onClick={() => setSelection(s => ({ ...s, eyeshadow: null }))} />
							</div>

							<h5 className="card-title mt-3">Foundation</h5>
							<div>
								<ShadeButton label="Extra Fair" onClick={() => setSelection(s => ({ ...s, foundation: { name: 'Extra Fair', color: 'rgba(242,221,200,1)', alpha: 0.16 } }))} />
								<ShadeButton label="Fair" onClick={() => setSelection(s => ({ ...s, foundation: { name: 'Fair', color: 'rgba(233,206,180,1)', alpha: 0.18 } }))} />
								<ShadeButton label="Light" onClick={() => setSelection(s => ({ ...s, foundation: { name: 'Light', color: 'rgba(224,190,164,1)', alpha: 0.18 } }))} />
								<ShadeButton label="Medium" onClick={() => setSelection(s => ({ ...s, foundation: { name: 'Medium', color: 'rgba(205,164,126,1)', alpha: 0.18 } }))} />
								<ShadeButton label="Tan" onClick={() => setSelection(s => ({ ...s, foundation: { name: 'Tan', color: 'rgba(160,120,90,1)', alpha: 0.16 } }))} />
								<ShadeButton label="Deep" onClick={() => setSelection(s => ({ ...s, foundation: { name: 'Deep', color: 'rgba(110,80,60,1)', alpha: 0.14 } }))} />
								<ShadeButton label="Clear" onClick={() => setSelection(s => ({ ...s, foundation: null }))} />
							</div>

                            <div className="d-grid mt-3">
                                <button className="btn btn-primary" onClick={handleSnapshot}>📸 Capture Snapshot</button>
                                {(selection.lipstick || selection.eyeshadow || selection.foundation) && (
                                    <button
                                        className="btn btn-success mt-2"
                                        onClick={async () => {
                                            const { productId, shadeId } = resolveProductForSelection()
                                            if (!productId) { alert('No matching product found in catalog.'); return }
                                            await axios.post('/api/cart/add', { productId, shadeId, qty: 1 })
                                            alert('Added to cart from Try-On')
                                        }}
                                    >
                                        ✅ Try + Add to Cart
                                    </button>
                                )}
                                <button className="btn btn-outline-primary mt-2" onClick={analyzeUndertone}>✨ Analyze Undertone</button>
                            </div>
						</div>
					</div>
				</div>
			</div>
            {!!undertone && (
                <div className="alert alert-info mt-3">
                    <div className="fw-bold">Detected undertone: {undertone}</div>
                    <div className="mt-2">Suggested shades: {undertoneShades.join(', ')}</div>
                </div>
            )}
		</div>
	)
}

// Helpers: indices and drawing utilities
type Landmark = { x: number; y: number; z: number }

function pathFromPoints(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) {
	ctx.beginPath()
	points.forEach((p, i) => {
		const px = p.x
		const py = p.y
		if (i === 0) ctx.moveTo(px, py)
		else ctx.lineTo(px, py)
	})
	ctx.closePath()
}

function applyLipstick(ctx: CanvasRenderingContext2D, landmarks: Landmark[], w: number, h: number, shade: Shade) {
	// Full lip region using MediaPipe FaceMesh indices
	// Full outer/inner lip contours (MediaPipe FaceMesh 468 indices, 20 each)
	// Outer (clockwise): includes both upper and lower lip border
	const OUTER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]
	// Inner (mouth opening):
	const INNER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]

	const outerPts = OUTER.map(i => ({ x: landmarks[i].x * w, y: landmarks[i].y * h }))
	const innerPts = INNER.map(i => ({ x: landmarks[i].x * w, y: landmarks[i].y * h }))

	// Draw to offscreen for reliable masking across browsers
	const off = document.createElement('canvas')
	off.width = w
	off.height = h
	const offCtx = off.getContext('2d')!

	// 1) Paint solid color on offscreen
	offCtx.clearRect(0, 0, w, h)
	offCtx.globalCompositeOperation = 'source-over'
	offCtx.fillStyle = shade.color
	offCtx.globalAlpha = 1
	offCtx.fillRect(0, 0, w, h)

	// 2) Keep only the outer lip area (destination-in)
	offCtx.globalCompositeOperation = 'destination-in'
	offCtx.beginPath()
	offCtx.moveTo(outerPts[0].x, outerPts[0].y)
	for (let i = 1; i < outerPts.length; i++) offCtx.lineTo(outerPts[i].x, outerPts[i].y)
	offCtx.closePath()
	offCtx.fill()

	// 3) Cut out the inner mouth opening (destination-out)
	offCtx.globalCompositeOperation = 'destination-out'
	offCtx.beginPath()
	offCtx.moveTo(innerPts[0].x, innerPts[0].y)
	for (let i = 1; i < innerPts.length; i++) offCtx.lineTo(innerPts[i].x, innerPts[i].y)
	offCtx.closePath()
	offCtx.fill()

	// 4) Blend back onto main canvas
	ctx.save()
	ctx.globalCompositeOperation = 'multiply'
	ctx.globalAlpha = shade.alpha ?? 0.6
	ctx.drawImage(off, 0, 0)
	ctx.restore()
}

function applyEyeshadow(ctx: CanvasRenderingContext2D, landmarks: Landmark[], w: number, h: number, shade: Shade) {
	// Build an eyelid band between the upper eyelid curve and the lower eyebrow curve
	// Left upper eyelid (9 points)
	const L_UPPER_EYELID = [33, 246, 161, 160, 159, 158, 157, 173, 133]
	// Left lower eyebrow (9 points approx aligned)
	const L_LOWER_BROW =   [70, 63, 105, 66, 107, 55, 65, 52, 53]
	// Right upper eyelid (9 points)
	const R_UPPER_EYELID = [362, 466, 388, 387, 386, 385, 384, 398, 263]
	// Right lower eyebrow (9 points approx aligned)
	const R_LOWER_BROW =   [300, 293, 334, 296, 336, 285, 295, 282, 283]

	function eyelidBandPath(upperIdx: number[], browIdx: number[]): Path2D {
		const upper = upperIdx.map(i => ({ x: landmarks[i].x * w, y: landmarks[i].y * h }))
		const brow = browIdx.map(i => ({ x: landmarks[i].x * w, y: landmarks[i].y * h }))
		// Interpolate a band top curve between eyelid and brow (toward brow by t)
		const t = 0.25
		const top = upper.map((p, i) => ({ x: p.x + (brow[i].x - p.x) * t, y: p.y + (brow[i].y - p.y) * t }))
		const path = new Path2D()
		// Bottom edge: along the eyelid (upper curve)
		path.moveTo(upper[0].x, upper[0].y)
		for (let i = 1; i < upper.length; i++) path.lineTo(upper[i].x, upper[i].y)
		// Top edge: return along interpolated curve in reverse to form a closed band
		for (let i = top.length - 1; i >= 0; i--) path.lineTo(top[i].x, top[i].y)
		path.closePath()
		return path
	}

	// Render via offscreen mask to avoid bleeding into eyeball
	const off = document.createElement('canvas')
	off.width = w
	off.height = h
	const offCtx = off.getContext('2d')!
	// Paint shade first
	offCtx.clearRect(0, 0, w, h)
	offCtx.globalCompositeOperation = 'source-over'
	offCtx.fillStyle = shade.color
	offCtx.globalAlpha = 1
	offCtx.fillRect(0, 0, w, h)
	// Keep only eyelid bands (destination-in) — combine both eyes in one fill to create union
	offCtx.globalCompositeOperation = 'destination-in'
	const lPath = eyelidBandPath(L_UPPER_EYELID, L_LOWER_BROW)
	const rPath = eyelidBandPath(R_UPPER_EYELID, R_LOWER_BROW)
	const bandsPath = new Path2D()
	bandsPath.addPath(lPath)
	bandsPath.addPath(rPath)
	offCtx.fill(bandsPath)

	// Composite softly on main canvas
	ctx.save()
	ctx.globalCompositeOperation = 'soft-light'
	ctx.globalAlpha = shade.alpha ?? 0.4
	ctx.drawImage(off, 0, 0)
	ctx.restore()
}

function applyFoundation(ctx: CanvasRenderingContext2D, landmarks: Landmark[], w: number, h: number, shade: Shade) {
	// Use convex hull of key face outline points for a face mask (jaw line + forehead region approximated)
	const faceOutline = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
	const pts = faceOutline.map(i => ({ x: landmarks[i].x * w, y: landmarks[i].y * h }))
	ctx.save()
	ctx.globalCompositeOperation = 'soft-light'
	ctx.globalAlpha = shade.alpha ?? 0.18
	ctx.fillStyle = shade.color
	ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
	ctx.fill()
	ctx.restore()
}


