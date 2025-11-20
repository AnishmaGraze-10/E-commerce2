import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Profile = {
  _id: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  bio?: string
  addresses?: Array<{ line1: string; line2?: string; city?: string; state?: string; postalCode?: string; country?: string }>
  address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

type Order = {
  _id: string
  status: string
  createdAt?: string
  total?: number
  items: Array<{ product: { name: string; price: number }; quantity: number }>
}

type Product = { _id: string; name: string; price: number; imageUrl: string }

export default function ProfilePage() {
  const { user, setAuth } = useAuth() as any
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'wishlist' | 'settings'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>('')
  const [bio, setBio] = useState('')
  const [toast, setToast] = useState<string>('')
  const [email, setEmail] = useState('')
  const [addresses, setAddresses] = useState<Profile['addresses']>([])
  const [addr, setAddr] = useState<{ line1: string; line2?: string; city?: string; state?: string; postalCode?: string; country?: string }>({ line1: '' })

  const [orders, setOrders] = useState<Order[]>([])
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')

  const hasProfileChanged = useMemo(() => {
    if (!profile) return false
    return profile.name !== name || (profile.phone || '') !== phone
  }, [profile, name, phone])

  useEffect(() => {
    // Load profile
    async function load() {
      try {
        setLoading(true)
        setError('')
        const res = await axios.get('/api/user/profile')
        setProfile(res.data)
        setName(res.data?.name || '')
        setEmail(res.data?.email || '')
        setPhone(res.data?.phone || '')
        setAvatarPreview(res.data?.profilePic || res.data?.avatarUrl)
        setBio(res.data?.bio || '')
        setAddresses(res.data?.addresses || [])
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    // Load orders
    async function loadOrders() {
      try {
        const or = await axios.get('/api/orders/my')
        setOrders(or.data || [])
      } catch {}
    }

    // Load wishlist from localStorage and map to products
    function loadWishlist() {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      setWishlistIds(savedWishlist)
      if (savedWishlist.length > 0) {
        axios.get('/api/products').then(r => {
          const products = (r.data || []) as Product[]
          setWishlistProducts(products.filter(p => savedWishlist.includes(p._id)))
        })
      } else {
        setWishlistProducts([])
      }
    }

    load()
    loadOrders()
    loadWishlist()
  }, [])

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    try {
      setLoading(true)
      setError('')
      const res = await axios.put('/api/user/profile', { name, phone, bio, email })
      setProfile(prev => prev ? { ...prev, name: res.data?.name ?? name, phone, bio, email } : prev)
      setToast('Profile updated successfully')
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('avatar', file)
    try {
      setLoading(true)
      setError('')
      const res = await axios.post('/api/user/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setAvatarPreview(res.data?.url)
      setProfile(prev => prev ? { ...prev, avatarUrl: res.data?.url, profilePic: res.data?.url } : prev)
      setToast('Avatar updated')
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to upload avatar')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setPasswordMsg('')
    const trimmedCurrent = String(currentPassword || '').trim()
    const trimmedNew = String(newPassword || '').trim()
    if (!trimmedCurrent || !trimmedNew) {
      setPasswordMsg('Both current and new passwords are required')
      return
    }
    if (trimmedNew.length < 6) {
      setPasswordMsg('New password must be at least 6 characters')
      return
    }
    if (trimmedNew === trimmedCurrent) {
      setPasswordMsg('New password must be different from current password')
      return
    }
    try {
      setLoading(true)
      const res = await axios.post('/api/user/change-password', { currentPassword: trimmedCurrent, newPassword: trimmedNew })
      if (res.data?.ok) setPasswordMsg('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
    } catch (e: any) {
      setPasswordMsg(e?.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  function removeFromWishlist(productId: string) {
    const newIds = wishlistIds.filter(id => id !== productId)
    setWishlistIds(newIds)
    localStorage.setItem('wishlist', JSON.stringify(newIds))
    setWishlistProducts(wishlistProducts.filter(p => p._id !== productId))
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault()
    if (!addr.line1?.trim()) return
    try {
      setLoading(true)
      const r = await axios.post('/api/user/addresses', addr)
      setAddresses(r.data?.addresses || [])
      setProfile(prev => prev ? { ...prev, addresses: r.data?.addresses || [] } : prev)
      setAddr({ line1: '' })
      setToast('Address added')
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to add address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center mb-4">
        <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', background: '#f3f4f6' }}>
          {avatarPreview ? (
            <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="d-flex h-100 w-100 align-items-center justify-content-center">👤</div>
          )}
        </div>
        <div className="ms-3">
          <h3 className="mb-0">{profile?.name || user?.name || 'Your Profile'}</h3>
          <small className="text-muted">{profile?.email}</small>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${activeTab==='info'?'active':''}`} onClick={() => setActiveTab('info')}>Profile Info</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab==='orders'?'active':''}`} onClick={() => setActiveTab('orders')}>Orders</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab==='wishlist'?'active':''}`} onClick={() => setActiveTab('wishlist')}>Wishlist</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab==='settings'?'active':''}`} onClick={() => setActiveTab('settings')}>Settings</button></li>
      </ul>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      {toast && (
        <div className="alert alert-success" role="alert">{toast}</div>
      )}

      {activeTab === 'info' && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card p-3">
              <h5 className="mb-3">Your Information</h5>
              <form onSubmit={handleProfileUpdate} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label" htmlFor="profile-name">Name</label>
                  <input id="profile-name" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className="form-label" htmlFor="profile-email">Email</label>
                  <input id="profile-email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="form-label" htmlFor="profile-phone">Phone</label>
                  <input id="profile-phone" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" />
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div>
                    <label className="form-label" htmlFor="profile-avatar">Avatar</label>
                    <input id="profile-avatar" className="form-control" type="file" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                </div>
                <div>
                  <label className="form-label" htmlFor="profile-bio">Bio</label>
                  <textarea id="profile-bio" className="form-control" rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell something about yourself" />
                  <small className="text-muted">Max 500 characters</small>
                </div>
                <div>
                  <button className="btn btn-primary" disabled={loading || !hasProfileChanged}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card p-3">
              <h5 className="mb-3">Addresses</h5>
              <form onSubmit={handleAddAddress} className="d-flex flex-column gap-2 mb-3">
                <input className="form-control" placeholder="Address line 1" value={addr.line1} onChange={e => setAddr({ ...addr, line1: e.target.value })} required />
                <input className="form-control" placeholder="Address line 2 (optional)" value={addr.line2 || ''} onChange={e => setAddr({ ...addr, line2: e.target.value })} />
                <div className="d-flex gap-2">
                  <input className="form-control" placeholder="City" value={addr.city || ''} onChange={e => setAddr({ ...addr, city: e.target.value })} />
                  <input className="form-control" placeholder="State" value={addr.state || ''} onChange={e => setAddr({ ...addr, state: e.target.value })} />
                </div>
                <div className="d-flex gap-2">
                  <input className="form-control" placeholder="Postal Code" value={addr.postalCode || ''} onChange={e => setAddr({ ...addr, postalCode: e.target.value })} />
                  <input className="form-control" placeholder="Country" value={addr.country || ''} onChange={e => setAddr({ ...addr, country: e.target.value })} />
                </div>
                <button className="btn btn-outline-secondary" disabled={loading || !addr.line1.trim()}>+ Add Address</button>
              </form>
              {addresses && addresses.length > 0 ? (
                <ul className="list-group">
                  {addresses.map((a, idx) => (
                    <li key={idx} className="list-group-item">
                      <div><strong>{a.line1}</strong>{a.line2 ? `, ${a.line2}` : ''}</div>
                      <small className="text-muted">{[a.city, a.state, a.postalCode, a.country].filter(Boolean).join(', ')}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">No addresses added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card p-3">
          <h5 className="mb-3">Order History</h5>
          {orders.length === 0 ? (
            <p className="text-muted">No orders yet. <Link to="/shop">Continue shopping</Link></p>
          ) : (
            <ul className="list-group">
              {orders.map(o => (
                <li key={o._id} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <strong>Order #{o._id.slice(-6)}</strong>
                    <span className="badge bg-secondary">{o.status}</span>
                  </div>
                  <small className="text-muted">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</small>
                  <ul className="mt-2">
                    {o.items.map((i, idx) => (
                      <li key={idx}>{i.product.name} x {i.quantity} = ₹{(i.product.price * i.quantity).toFixed(2)}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="card p-3">
          <h5 className="mb-3">Wishlist</h5>
          {wishlistProducts.length === 0 ? (
            <p className="text-muted">Your wishlist is empty. <Link to="/shop">Browse products</Link></p>
          ) : (
            <div className="row g-3">
              {wishlistProducts.map(p => (
                <div className="col-sm-6 col-md-4 col-lg-3" key={p._id}>
                  <div className="card h-100">
                    <img src={p.imageUrl} alt={p.name} className="card-img-top" style={{ height: 180, objectFit: 'cover' }} />
                    <div className="card-body d-flex flex-column text-center">
                      <h6 className="mb-1">{p.name}</h6>
                      <div className="mb-2">₹{p.price}</div>
                      <div className="mt-auto d-flex gap-2 justify-content-center">
                        <Link className="btn btn-sm btn-primary" to={`/product/${p._id}`}>View</Link>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromWishlist(p._id)}>Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card p-3">
              <h5 className="mb-3">Change Password</h5>
              <form onSubmit={handlePasswordChange} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label" htmlFor="current-password">Current Password</label>
                  <input id="current-password" type="password" className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label" htmlFor="new-password">New Password</label>
                  <input id="new-password" type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                </div>
                <div>
                  <button className="btn btn-primary" disabled={loading || !currentPassword || !newPassword || newPassword.length < 6 || newPassword === currentPassword}>Update Password</button>
                </div>
                {passwordMsg && <div className="alert alert-info py-2 mb-0">{passwordMsg}</div>}
              </form>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card p-3">
              <h5 className="mb-2">Preferences</h5>
              <p className="text-muted mb-3">Toggle theme and notifications.</p>
              <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" id="notifSwitch" />
                <label className="form-check-label" htmlFor="notifSwitch">Email notifications</label>
              </div>
              <div className="form-text">Use the header toggle for Dark/Light theme.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


