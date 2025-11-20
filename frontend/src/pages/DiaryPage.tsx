import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import StarRating from '../components/StarRating'
import { toast } from 'sonner'
import { validateFaceInImage } from '../utils/faceValidation'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

type Metrics = { acne: number; darkCircles: number; hydration: number; glow: number }

export default function DiaryPage() {
  const [uploading, setUploading] = useState(false)
  const [entries, setEntries] = useState<any[]>([])
  const [deltas, setDeltas] = useState<Partial<Metrics>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadSelfieFile(file: File) {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post('/api/diary/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      
      // Check if face was detected
      if (res.data.status === 'no-face') {
        toast.error(res.data.message || 'No face detected. Please upload a clear photo of your face.')
        return
      }
      
      // Success - show face detection info
      if (res.data.faceValidation) {
        const { faceCount, confidence } = res.data.faceValidation
        toast.success(`Face detected! (${faceCount} face${faceCount > 1 ? 's' : ''}, ${Math.round(confidence * 100)}% confidence)`)
      }
      
      await fetchProgress()
    } catch (error: any) {
      console.error('Upload error:', error)
      
      if (error.response?.data?.status === 'no-face') {
        toast.error(error.response.data.message || 'No face detected. Please upload a clear photo of your face.')
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to upload selfie. Please try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  async function fetchProgress() {
    try {
      const res = await axios.get('/api/diary/progress')
      setEntries(res.data.entries || [])
      setDeltas(res.data.deltas || {})
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        window.location.href = '/login'
      }
    }
  }

  useEffect(() => { fetchProgress() }, [])

  const chartData = useMemo(() => {
    const labels = entries.map(e => new Date(e.date).toLocaleDateString())
    return {
      labels,
      datasets: [
        { label: 'Acne (lower is better)', data: entries.map(e => e.metrics.acne), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.2)', tension: .35 },
        { label: 'Dark Circles (lower is better)', data: entries.map(e => e.metrics.darkCircles), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,.2)', tension: .35 },
        { label: 'Hydration', data: entries.map(e => e.metrics.hydration), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,.2)', tension: .35 },
        { label: 'Glow', data: entries.map(e => e.metrics.glow), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,.2)', tension: .35 }
      ]
    }
  }, [entries])

  const [dist, setDist] = useState<{[k:string]:number}>({})
  const [distMeta, setDistMeta] = useState<{total?:number; avg?:number}>({})

  useEffect(() => {
    // Fetch distribution for user's latest entry, if any
    (async () => {
      if (!entries.length) return
      const latest = entries[entries.length - 1]
      try {
        const r = await axios.get(`/api/ratings/diary/${latest._id}/distribution`)
        setDist(r.data.distribution || {})
        setDistMeta({ total: r.data.totalRatings, avg: r.data.averageRating })
      } catch {}
    })()
  }, [entries])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    
    // Basic type/size check
    
    // Validate file size (max 50MB)
    if (f.size > 50 * 1024 * 1024) {
      toast.error('File is too large. Please select a file smaller than 50MB.')
      return
    }
    
    // Frontend face validation
    // If image, attempt client-side face validation
    if (f.type.startsWith('image/')) {
      const validation = await validateFaceInImage(f)
      if (!validation.isValid) {
        toast.error(validation.message)
        return
      }
      if (validation.confidence) {
        toast.success(`Face detected! (${Math.round(validation.confidence * 100)}% confidence)`)
      }
    }
    
    await uploadSelfieFile(f)
  }

  return (
    <div>
      <h2 className="mb-3">My Skin & Makeup Diary</h2>
      <p className="text-muted">Upload a selfie regularly to track acne, hydration, glow and dark circles. Get weekly insights and suggestions.</p>

      <div className="card mb-3">
        <div className="card-body d-flex align-items-center gap-2">
          <label className="form-label me-2 mb-0" htmlFor="diaryFile">Upload file</label>
          <input id="diaryFile" ref={fileRef} type="file" accept="image/*,video/*,application/pdf,audio/*" className="form-control" onChange={handleFile} />
          <button className="btn btn-primary" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? 'Uploading...' : 'Upload Selfie'}
          </button>
        </div>
      </div>

      {Object.keys(deltas).length > 0 && (
        <div className="alert alert-info">
          <div className="fw-bold mb-1">Progress</div>
          <div className="row">
            <div className="col">Acne Δ: {deltas.acne}</div>
            <div className="col">Dark Circles Δ: {deltas.darkCircles}</div>
            <div className="col">Hydration Δ: {deltas.hydration}</div>
            <div className="col">Glow Δ: {deltas.glow}</div>
          </div>
        </div>
      )}

      {entries.length > 1 && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">Trends</h6>
            <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
          </div>
        </div>
      )}

      <div className="row g-3">
        {entries.map((e) => (
          <div key={e._id} className="col-md-3">
            <div className="card">
              {e.mediaType?.startsWith('image/') ? (
                <img src={e.mediaUrl || e.selfieUrl} className="card-img-top" alt="entry" />
              ) : e.mediaType?.startsWith('video/') ? (
                <video src={e.mediaUrl} className="card-img-top" controls />
              ) : e.mediaType === 'application/pdf' ? (
                <div className="p-3"><a href={e.mediaUrl} target="_blank" rel="noreferrer">View PDF</a></div>
              ) : e.mediaType?.startsWith('audio/') ? (
                <audio src={e.mediaUrl} className="w-100" controls />
              ) : (
                <img src={e.selfieUrl} className="card-img-top" alt="entry" />
              )}
              <div className="card-body">
                <div className="small text-muted">{new Date(e.date).toLocaleString()}</div>
                <div className="mt-2 small">
                  <div>Acne: {e.metrics.acne}</div>
                  <div>Dark Circles: {e.metrics.darkCircles}</div>
                  <div>Hydration: {e.metrics.hydration}</div>
                  <div>Glow: {e.metrics.glow}</div>
                </div>
                <div className="mt-2"><StarRating itemId={e._id} itemType="diary" compact /></div>
                {e.notes && <div className="mt-2 text-wrap">{e.notes}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(dist).length > 0 && (
        <div className="card mt-3">
          <div className="card-body">
            <h6 className="card-title">Latest Entry Rating Distribution {distMeta.avg ? `(avg ${distMeta.avg.toFixed(1)}/5, ${distMeta.total} ratings)` : ''}</h6>
            <div className="row g-2">
              {[5,4,3,2,1].map(s => (
                <div key={s} className="col-12 d-flex align-items-center">
                  <div style={{ width: 60 }}>{s}★</div>
                  <div className="progress flex-grow-1" aria-label={`Rating ${s} stars`}>
                    <div className="progress-bar" role="progressbar" style={{ width: `${((dist[String(s)]||0)/(distMeta.total||1))*100}%`, height: 8 }} title={`${dist[String(s)]||0} ratings`}></div>
                  </div>
                  <div className="ms-2 text-end" style={{ width: 40 }}>{dist[String(s)]||0}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



