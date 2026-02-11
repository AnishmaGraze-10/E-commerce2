
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import SwitchUser from './SwitchUser'

export default function Navbar() {
	const { isAuthenticated, user, logout } = useAuth()
	const navigate = useNavigate()
    const [wlAlerts, setWlAlerts] = useState<number>(0)

    useEffect(() => {
        if (!isAuthenticated) { setWlAlerts(0); return }
        axios.get('/api/wishlist/alerts').then(res => setWlAlerts((res.data || []).length)).catch(() => setWlAlerts(0))
    }, [isAuthenticated])

	function handleLogout() {
		logout()
		navigate('/')
	}

	return (
		<header className="navbar p-3">
			<div className="container d-flex justify-content-between align-items-center">
				<Link to="/brand" className="navbar-brand text-decoration-none d-flex align-items-center">
					<img src="/cosme.jpg" alt="Cosme" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%', marginRight: 8 }} />
					<span>Cosme Kitchen</span>
				</Link>
				<nav>
					<ul className="nav">
						<li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
						<li className="nav-item"><NavLink className="nav-link" to="/shop">Products</NavLink></li>
                            <li className="nav-item"><NavLink className="nav-link" to="/try-on">Try-On</NavLink></li>
                            <li className="nav-item"><NavLink className="nav-link" to="/diary">Diary</NavLink></li>
						<li className="nav-item"><NavLink className="nav-link" to="/about">About</NavLink></li>
						<li className="nav-item"><NavLink className="nav-link" to="/contact">Contact</NavLink></li>
							<li className="nav-item"><NavLink className="nav-link" to="/wishlist">💖 Wishlist{wlAlerts>0 && <span className="badge bg-danger ms-1">{wlAlerts}</span>}</NavLink></li>
						<li className="nav-item"><NavLink className="nav-link" to="/cart">🛒 Cart</NavLink></li>
						{isAuthenticated ? (
							<>
								<li className="nav-item"><NavLink className="nav-link" to="/profile">Hi, {user?.name}</NavLink></li>
								{user?.role === 'admin' && (
									<li className="nav-item"><NavLink className="nav-link" to="/admin">Admin</NavLink></li>
								)}
								<li className="nav-item"><SwitchUser /></li>
								<li className="nav-item"><button className="btn btn-sm btn-outline-dark ms-2" onClick={handleLogout}>Logout</button></li>
							</>
						) : (
							<>
								<li className="nav-item"><NavLink className="nav-link" to="/login">Login</NavLink></li>
								<li className="nav-item"><NavLink className="nav-link" to="/register">Register</NavLink></li>
							</>
						)}
					</ul>
				</nav>
			</div>
		</header>
	)
}

