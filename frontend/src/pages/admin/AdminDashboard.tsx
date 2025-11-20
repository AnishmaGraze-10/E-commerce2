import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

type Product = {
	_id: string
	name: string
	price: number
	imageUrl: string
	description: string
	category?: string
	stock: number
}

type User = {
	_id: string
	name: string
	email: string
	role: string
	isBlocked?: boolean
}

type Order = {
	_id: string
	status: 'pending' | 'paid' | 'shipped' | 'delivered'
	items: Array<{ product: Product; quantity: number }>
	user: Pick<User, '_id' | 'name' | 'email'>
}

type RevenuePoint = { _id: string; revenue: number }

export default function AdminDashboard() {
    const [active, setActive] = useState<'products' | 'orders' | 'users' | 'analytics' | 'settings' | 'ratings'>('products')
	const [products, setProducts] = useState<Product[]>([])
	const [users, setUsers] = useState<User[]>([])
	const [orders, setOrders] = useState<Order[]>([])
	const [analytics, setAnalytics] = useState<{ totals: { orders: number; revenue: number }; revenueByDay: RevenuePoint[]; topProducts: { name: string; qty: number }[] } | null>(null)

	const [form, setForm] = useState({ name: '', price: '', description: '', category: '', stock: '', imageFile: null as File | null })
	const [editingId, setEditingId] = useState<string | null>(null)
	const [bulkFile, setBulkFile] = useState<File | null>(null)
	const [lowStock, setLowStock] = useState<Product[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [ratingsCsv, setRatingsCsv] = useState<File | null>(null)
  const [importMsg, setImportMsg] = useState<string>('')
	const [profile, setProfile] = useState<{ name: string; email: string; currentPassword?: string; newPassword?: string }>({ name: '', email: '' })
	const [avatarFile, setAvatarFile] = useState<File | null>(null)

	const debugLog = (...args: unknown[]) => {
		if (import.meta.env.DEV) {
			console.debug('[AdminDashboard]', ...args)
		}
	}

	async function loadCore() {
		const [p, u, o] = await Promise.all([
			axios.get('/api/admin/products'),
			axios.get('/api/admin/users'),
			axios.get('/api/admin/orders'),
		])
		setProducts(p.data)
		setUsers(u.data)
		setOrders(o.data)
	}

	async function loadAnalytics() {
		const res = await axios.get('/api/admin/analytics/overview')
		setAnalytics(res.data)
	}

	useEffect(() => {
		loadCore()
		loadAnalytics()
		axios.get('/api/admin/settings').then(r => {
			setSettings(r.data)
			try {
				const stored = localStorage.getItem('user')
				if (stored) {
					const u = JSON.parse(stored)
					setProfile({ name: u.name || '', email: u.email || '' })
				}
			} catch {}
		}).catch(()=>{})
	}, [])

	useEffect(() => {
		setLowStock(products.filter(p => (p.stock ?? 0) < 5))
	}, [products])

	async function uploadImageIfAny(): Promise<string | null> {
		if (!form.imageFile) return null
		try {
			debugLog('Uploading image file:', form.imageFile)
			const data = new FormData()
			data.append('image', form.imageFile)
			const res = await axios.post('/api/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })
			debugLog('Upload response:', res.data)
			return (res.data.fullUrl || res.data.url) as string
		} catch (error: any) {
			console.error('Error uploading image:', error)
			throw error
		}
	}

	async function createOrUpdateProduct(e: React.FormEvent) {
		e.preventDefault()
		try {
			debugLog('Form submitted with data:', form)
			const uploadedUrl = await uploadImageIfAny()
			debugLog('Image uploaded, URL:', uploadedUrl)
			
			const payload = {
				name: form.name,
				description: form.description,
				price: Number(form.price),
				category: form.category || undefined,
				stock: Number(form.stock || 0),
				...(uploadedUrl ? { imageUrl: uploadedUrl } : {}),
			}
			debugLog('Sending payload to backend:', payload)
			
			if (editingId) {
				const response = await axios.put(`/api/admin/products/${editingId}`, payload)
				debugLog('Product updated:', response.data)
			} else {
				if (!uploadedUrl) {
					alert('Please upload an image')
					return
				}
				const response = await axios.post('/api/admin/products', { ...payload, imageUrl: uploadedUrl })
				debugLog('Product created:', response.data)
			}
			
			setForm({ name: '', price: '', description: '', category: '', stock: '', imageFile: null })
			setEditingId(null)
			await loadCore()
		} catch (error: any) {
			console.error('Error creating/updating product:', error)
			alert(`Error: ${error.response?.data?.message || error.message}`)
		}
	}

	async function removeProduct(id: string) {
		await axios.delete(`/api/admin/products/${id}`)
		await loadCore()
	}

	function startEdit(p: Product) {
		setEditingId(p._id)
		setForm({ name: p.name, price: String(p.price), description: p.description, category: p.category || '', stock: String(p.stock ?? 0), imageFile: null })
	}

	async function updateOrderStatus(id: string, status: Order['status']) {
		await axios.patch(`/api/admin/orders/${id}/status`, { status })
		await loadCore()
	}

	async function toggleBlockUser(u: User) {
		const url = `/api/admin/users/${u._id}/${u.isBlocked ? 'unblock' : 'block'}`
		await axios.patch(url)
		await loadCore()
	}

	const revenueSeries = useMemo(() => (analytics?.revenueByDay || []).map(p => p.revenue), [analytics])
	const revenueLabels = useMemo(() => (analytics?.revenueByDay || []).map(p => p._id.slice(5)), [analytics])

	return (
		<div className="row g-3">
			<div className="col-12 col-md-3">
				<div className="card">
					<div className="card-body">
						<h5 className="mb-3">Admin</h5>
						<div className="list-group">
							<button className={`list-group-item list-group-item-action ${active==='products'?'active':''}`} onClick={() => setActive('products')}>Products</button>
							<button className={`list-group-item list-group-item-action ${active==='orders'?'active':''}`} onClick={() => setActive('orders')}>Orders</button>
							<button className={`list-group-item list-group-item-action ${active==='users'?'active':''}`} onClick={() => setActive('users')}>Users</button>
              <button className={`list-group-item list-group-item-action ${active==='analytics'?'active':''}`} onClick={() => setActive('analytics')}>Analytics</button>
              <button className={`list-group-item list-group-item-action ${active==='settings'?'active':''}`} onClick={() => setActive('settings')}>Settings</button>
              <button className={`list-group-item list-group-item-action ${active==='users'?'active':''}`} onClick={() => setActive('users')}>Users</button>
              <button className={`list-group-item list-group-item-action ${active==='orders'?'active':''}`} onClick={() => setActive('orders')}>Orders</button>
              <button className={`list-group-item list-group-item-action ${active==='products'?'active':''}`} onClick={() => setActive('products')}>Products</button>
              <button className={`list-group-item list-group-item-action ${active==='ratings'?'active':''}`} onClick={() => setActive('ratings' as any)}>Ratings CSV</button>
              
						</div>
					</div>
				</div>
			</div>

			<div className="col-12 col-md-9">
				{active === 'products' && (
					<div className="card">
						<div className="card-body">
							<h4 className="mb-3">Product Management</h4>
							<div className="row g-3 mb-4">
								<div className="col-12 col-lg-8">
									<form onSubmit={createOrUpdateProduct} className="row g-2 mb-3">
										<div className="col-md-4"><input aria-label="Product name" className="form-control" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
										<div className="col-md-2"><input aria-label="Product price" type="number" step="0.01" className="form-control" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
										<div className="col-md-2"><input aria-label="Stock quantity" type="number" className="form-control" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required /></div>
										<div className="col-md-4"><input aria-label="Product category" className="form-control" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
										<div className="col-12"><textarea aria-label="Product description" className="form-control" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
										<div className="col-12"><label className="visually-hidden" htmlFor="imageFile">Product image</label><input id="imageFile" aria-label="Product image" type="file" accept="image/*" className="form-control" onChange={e => setForm({ ...form, imageFile: e.target.files?.[0] || null })} /></div>
										<div className="col-12"><button className="btn btn-primary">{editingId ? 'Update' : 'Add'} Product</button>{editingId && <button type="button" className="btn btn-secondary ms-2" onClick={() => { setEditingId(null); setForm({ name: '', price: '', description: '', category: '', stock: '', imageFile: null }) }}>Cancel</button>}</div>
									</form>
								</div>
								<div className="col-12 col-lg-4">
									<h6>Bulk Upload (CSV)</h6>
									<label className="visually-hidden" htmlFor="bulkCsv">Bulk CSV</label>
									<input id="bulkCsv" aria-label="Bulk CSV" type="file" accept=".csv" className="form-control mb-2" onChange={e => setBulkFile(e.target.files?.[0] || null)} />
									<button className="btn btn-outline-primary" disabled={!bulkFile} onClick={async () => {
										if (!bulkFile) return
										try {
											debugLog('Uploading CSV file:', bulkFile.name, bulkFile.type, bulkFile.size)
											const data = new FormData(); data.append('file', bulkFile)
											const res = await axios.post('/api/admin/products/bulk-upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })
											debugLog('Bulk upload response:', res.data)
											alert(`Imported ${res.data?.count ?? 0} products from CSV`)
											setBulkFile(null)
											const input = document.getElementById('bulkCsv') as HTMLInputElement | null
											if (input) input.value = ''
											await loadCore()
										} catch (error: any) {
											console.error('Bulk upload failed:', error)
											alert(`Bulk upload failed: ${error.response?.data?.message || error.message}`)
										}
									}}>Upload CSV</button>
								</div>
							</div>

							<div className="row g-3">
								<div className="col-12 col-lg-8">
									<table className="table table-sm align-middle">
										<thead>
											<tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr>
										</thead>
										<tbody>
											{products.map(p => (
												<tr key={p._id}>
													<td><img src={p.imageUrl} alt={p.name} className="rounded" width={40} height={40} /></td>
													<td>{p.name}</td>
													<td>{p.category || '-'}</td>
													<td>₹{p.price}</td>
													<td aria-label="Stock count">{p.stock ?? 0}</td>
													<td className="text-end">
														<button className="btn btn-sm btn-outline-secondary me-2" onClick={() => startEdit(p)}>Edit</button>
														<button className="btn btn-sm btn-outline-danger" onClick={() => removeProduct(p._id)}>Delete</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								<div className="col-12 col-lg-4">
									<div className="card">
										<div className="card-body">
											<h6 className="mb-2">Low Stock (&lt; 5)</h6>
											<ul className="list-group">
												{lowStock.length === 0 ? <li className="list-group-item">All good ✅</li> : lowStock.map(p => (
													<li key={p._id} className="list-group-item d-flex justify-content-between align-items-center">
														<span>{p.name}</span><span className="badge text-bg-warning">{p.stock}</span>
													</li>
												))}
											</ul>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{active === 'orders' && (
					<div className="card">
						<div className="card-body">
							<h4 className="mb-3">Orders</h4>
							<table className="table table-sm">
								<thead>
									<tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th /></tr>
								</thead>
								<tbody>
									{orders.map(o => (
										<tr key={o._id}>
											<td>#{o._id.slice(-6)}</td>
											<td>{o.user.name} <small className="text-muted">{o.user.email}</small></td>
											<td>{o.items.reduce((a, b) => a + b.quantity, 0)}</td>
											<td>—</td>
											<td>
												<label className="visually-hidden" htmlFor={`status-${o._id}`}>Status</label>
												<select id={`status-${o._id}`} aria-label="Order status" className="form-select form-select-sm" value={o.status} onChange={e => updateOrderStatus(o._id, e.target.value as Order['status'])}>
													<option value="pending">pending</option>
													<option value="paid">paid</option>
													<option value="shipped">shipped</option>
													<option value="delivered">delivered</option>
												</select>
											</td>
											<td />
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

                {active === 'users' && (
					<div className="card">
						<div className="card-body">
							<h4 className="mb-3">Users</h4>
							<table className="table table-sm">
								<thead>
									<tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th /></tr>
								</thead>
								<tbody>
									{users.map(u => (
										<tr key={u._id}>
											<td>{u.name}</td>
											<td>{u.email}</td>
											<td>{u.role}</td>
											<td>{u.isBlocked ? 'Blocked' : 'Active'}</td>
											<td className="text-end"><button className="btn btn-sm btn-outline-warning" onClick={() => toggleBlockUser(u)}>{u.isBlocked ? 'Unblock' : 'Block'}</button></td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

                {active === 'analytics' && (
					<div className="card">
						<div className="card-body">
							<h4 className="mb-3">Analytics</h4>
							<div className="row g-3 mb-3">
								<div className="col-md-4"><div className="card"><div className="card-body"><div className="small text-muted">Total Orders</div><div className="h4 m-0">{analytics?.totals.orders ?? 0}</div></div></div></div>
								<div className="col-md-4"><div className="card"><div className="card-body"><div className="small text-muted">Revenue</div><div className="h4 m-0">₹{analytics?.totals.revenue ?? 0}</div></div></div></div>
								<div className="col-md-4"><div className="card"><div className="card-body"><div className="small text-muted">Top Products</div><div className="m-0">{analytics?.topProducts.map(tp => tp.name).join(', ') || '-'}</div></div></div></div>
							</div>
							<div className="card">
								<div className="card-body">
									<div className="small text-muted mb-2">Revenue Trend</div>
									<div className="revenue-grid">
										{revenueSeries.map((v,i) => (
											<div key={i} title={revenueLabels[i]} className="revenue-bar" style={{height:`${Math.max(5, v)}px`}} />
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
				{active === 'ratings' && (
					<div className="card">
						<div className="card-body">
							<h4 className="mb-3">Ratings CSV</h4>
							{importMsg && <div className="alert alert-info">{importMsg}</div>}
							<div className="row g-2 align-items-end">
								<div className="col-md-6">
									<label className="form-label" htmlFor="ratingsCsv">Import Ratings CSV</label>
									<input id="ratingsCsv" className="form-control" type="file" accept=".csv" onChange={e => setRatingsCsv(e.target.files?.[0] || null)} />
								</div>
								<div className="col-md-3">
									<button className="btn btn-primary w-100" disabled={!ratingsCsv} onClick={async () => {
										if (!ratingsCsv) return
										setImportMsg('')
										try {
											const fd = new FormData(); fd.append('file', ratingsCsv)
											const r = await axios.post('/api/ratings/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
											setImportMsg(`Imported ${r.data?.imported || 0} ratings`)
										} catch (e: any) {
											setImportMsg(e?.response?.data?.message || 'Failed to import CSV')
										}
									}}>Upload</button>
								</div>
								<div className="col-md-3">
									<button className="btn btn-outline-secondary w-100" onClick={async () => {
										const a = document.createElement('a')
										a.href = '/api/ratings/export'
										a.download = 'ratings.csv'
										document.body.appendChild(a)
										a.click()
										document.body.removeChild(a)
									}}>Download CSV</button>
								</div>
							</div>
							<div className="mt-3 small text-muted">CSV columns: userId,itemId,itemType,rating,createdAt</div>
						</div>
					</div>
				)}

                {active === 'settings' && settings && (
					<div className="card">
						<div className="card-body">
							<h4 className="mb-3">Settings</h4>
							<div className="row g-4">
								<div className="col-12 col-lg-6">
									<h6>Account</h6>
									<div className="mb-2"><label className="form-label" htmlFor="profileName">Name</label><input id="profileName" className="form-control" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></div>
									<div className="mb-2"><label className="form-label" htmlFor="profileEmail">Email</label><input id="profileEmail" className="form-control" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} /></div>
									<button className="btn btn-primary me-2" disabled={!profile.name?.trim() || !profile.email?.trim()} onClick={async () => { 
										try {
											await axios.put('/api/admin/settings/profile', { 
												name: profile.name, 
												email: profile.email 
											}); 
											alert('Profile saved successfully!') 
										} catch (error: any) {
											alert(`Error: ${error.response?.data?.message || error.message}`)
										}
									}}>Save Profile</button>
									<div className="mt-3">
										<h6>Avatar</h6>
										<label className="visually-hidden" htmlFor="avatar">Avatar</label>
										<input id="avatar" className="form-control mb-2" type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
										<button className="btn btn-outline-primary" disabled={!avatarFile} onClick={async () => { 
											if (!avatarFile) return; 
											try {
												const fd = new FormData(); 
												fd.append('avatar', avatarFile); 
												await axios.post('/api/admin/settings/avatar', fd, { 
													headers: { 'Content-Type': 'multipart/form-data' } 
												}); 
												alert('Avatar updated successfully!'); 
												setAvatarFile(null) 
											} catch (error: any) {
												alert(`Error: ${error.response?.data?.message || error.message}`)
											}
										}}>Upload Avatar</button>
									</div>
									<div className="mt-3">
										<h6>Password</h6>
										<div className="mb-2"><label className="form-label" htmlFor="currentPwd">Current</label><input id="currentPwd" className="form-control" type="password" value={profile.currentPassword || ''} onChange={e => setProfile({ ...profile, currentPassword: e.target.value })} /></div>
										<div className="mb-2"><label className="form-label" htmlFor="newPwd">New</label><input id="newPwd" className="form-control" type="password" value={profile.newPassword || ''} onChange={e => setProfile({ ...profile, newPassword: e.target.value })} /></div>
										<button className="btn btn-outline-secondary" disabled={!profile.currentPassword?.trim() || !profile.newPassword?.trim() || profile.newPassword.length < 6} onClick={async () => { 
											try {
												await axios.post('/api/admin/settings/change-password', { 
													currentPassword: profile.currentPassword, 
													newPassword: profile.newPassword 
												}); 
												setProfile(p=>({ ...p, currentPassword:'', newPassword:'' })); 
												alert('Password changed successfully!') 
											} catch (error: any) {
												alert(`Error: ${error.response?.data?.message || error.message}`)
											}
										}}>Update Password</button>
										<button className="btn btn-outline-danger ms-2" onClick={async () => { 
											try {
												await axios.post('/api/admin/settings/logout-all'); 
												localStorage.removeItem('token'); 
												alert('Logged out from all devices. Please log in again on this browser.'); 
											} catch (error: any) {
												alert(`Error: ${error.response?.data?.message || error.message}`)
											}
										}}>Logout All Sessions</button>
									</div>
								</div>
								<div className="col-12 col-lg-6">
									<h6>Appearance</h6>
									<div className="row g-2">
										<div className="col-6"><label className="form-label" htmlFor="themeMode">Mode</label><select id="themeMode" className="form-select" value={settings?.theme?.mode || 'system'} onChange={e => setSettings({ ...settings, theme: { ...settings.theme, mode: e.target.value } })}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></div>
										<div className="col-6"><label className="form-label" htmlFor="accent">Accent</label><input id="accent" className="form-control" placeholder="#0ea5e9" value={settings?.theme?.accentColor || ''} onChange={e => setSettings({ ...settings, theme: { ...settings.theme, accentColor: e.target.value } })} /></div>
									</div>
									<div className="mt-2"><label className="form-label" htmlFor="layout">Layout</label><select id="layout" className="form-select" value={settings?.theme?.layout || 'compact'} onChange={e => setSettings({ ...settings, theme: { ...settings.theme, layout: e.target.value } })}><option value="compact">Compact</option><option value="spacious">Spacious</option></select></div>
									<h6 className="mt-4">Notifications</h6>
									<div className="form-check"><input className="form-check-input" type="checkbox" id="n1" checked={settings?.notifications?.emailNewOrder ?? true} onChange={e => setSettings({ ...settings, notifications: { ...settings.notifications, emailNewOrder: e.target.checked } })} /><label className="form-check-label" htmlFor="n1">Email: New Orders</label></div>
									<div className="form-check"><input className="form-check-input" type="checkbox" id="n2" checked={settings?.notifications?.emailLowStock ?? true} onChange={e => setSettings({ ...settings, notifications: { ...settings.notifications, emailLowStock: e.target.checked } })} /><label className="form-check-label" htmlFor="n2">Email: Low Stock</label></div>
									<div className="form-check"><input className="form-check-input" type="checkbox" id="n3" checked={settings?.notifications?.userActivity ?? true} onChange={e => setSettings({ ...settings, notifications: { ...settings.notifications, userActivity: e.target.checked } })} /><label className="form-check-label" htmlFor="n3">Email: User Activity</label></div>
									<div className="form-check"><input className="form-check-input" type="checkbox" id="n4" checked={settings?.notifications?.pushEnabled ?? false} onChange={e => setSettings({ ...settings, notifications: { ...settings.notifications, pushEnabled: e.target.checked } })} /><label className="form-check-label" htmlFor="n4">Enable Push Notifications</label></div>
									<div className="row g-2 mt-2">
										<div className="col-6"><label className="form-label" htmlFor="digest">Digest</label><select id="digest" className="form-select" value={settings?.notifications?.digestFrequency || 'weekly'} onChange={e => setSettings({ ...settings, notifications: { ...settings.notifications, digestFrequency: e.target.value } })}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
										<div className="col-6"><label className="form-label" htmlFor="timezone">Timezone</label><input id="timezone" className="form-control" placeholder="Asia/Kolkata" value={settings?.locale?.timezone || ''} onChange={e => setSettings({ ...settings, locale: { ...settings.locale, timezone: e.target.value } })} /></div>
										<div className="col-6"><label className="form-label" htmlFor="language">Language</label><select id="language" className="form-select" value={settings?.locale?.language || 'en'} onChange={e => setSettings({ ...settings, locale: { ...settings.locale, language: e.target.value } })}><option value="en">English</option><option value="hi">Hindi</option><option value="ta">Tamil</option></select></div>
										<div className="col-6"><label className="form-label" htmlFor="datefmt">Date Format</label><input id="datefmt" className="form-control" placeholder="DD/MM/YYYY" value={settings?.locale?.dateFormat || ''} onChange={e => setSettings({ ...settings, locale: { ...settings.locale, dateFormat: e.target.value } })} /></div>
									</div>
									<h6 className="mt-4">Payments & Tax</h6>
									<div className="row g-2">
										<div className="col-4"><label className="form-label" htmlFor="currency">Currency</label><input id="currency" className="form-control" value={settings?.payment?.currency || 'INR'} onChange={e => setSettings({ ...settings, payment: { ...settings.payment, currency: e.target.value } })} /></div>
										<div className="col-4"><label className="form-label" htmlFor="tax">Tax %</label><input id="tax" className="form-control" type="number" step="0.1" value={settings?.payment?.taxRate || 0} onChange={e => setSettings({ ...settings, payment: { ...settings.payment, taxRate: Number(e.target.value) } })} /></div>
										<div className="col-4"><label className="form-label" htmlFor="gst">GST</label><input id="gst" className="form-control" value={settings?.payment?.gstNumber || ''} onChange={e => setSettings({ ...settings, payment: { ...settings.payment, gstNumber: e.target.value } })} /></div>
									</div>
									<div className="row g-2 mt-2">
										<div className="col-4"><label className="form-label" htmlFor="stripe">Stripe Key</label><input id="stripe" className="form-control" value={settings?.payment?.stripeKey || ''} onChange={e => setSettings({ ...settings, payment: { ...settings.payment, stripeKey: e.target.value } })} /></div>
										<div className="col-4"><label className="form-label" htmlFor="paypal">PayPal Key</label><input id="paypal" className="form-control" value={settings?.payment?.paypalKey || ''} onChange={e => setSettings({ ...settings, payment: { ...settings.payment, paypalKey: e.target.value } })} /></div>
										<div className="col-4"><label className="form-label" htmlFor="razorpay">Razorpay Key</label><input id="razorpay" className="form-control" value={settings?.payment?.razorpayKey || ''} onChange={e => setSettings({ ...settings, payment: { ...settings.payment, razorpayKey: e.target.value } })} /></div>
									</div>
									<div className="mt-3">
										<button className="btn btn-success" onClick={async () => { 
											try {
												await axios.put('/api/admin/settings', settings); 
												alert('Settings saved successfully!') 
											} catch (error: any) {
												alert(`Error: ${error.response?.data?.message || error.message}`)
											}
										}}>Save Settings</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

