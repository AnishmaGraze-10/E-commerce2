
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import { useAuth } from './context/AuthContext'
import './index.css'
import './legacy/styles.css'
import BrandPage from './pages/BrandPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import WishlistPage from './pages/WishlistPage'
import ProfilePage from './pages/ProfilePage'
import TryOnPage from './pages/TryOnPage'
import ChatbotWidget from './components/ChatbotWidget'
import DiaryPage from './pages/DiaryPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

function PrivateRoute({ children }: { children: React.ReactElement }) {
	const { isAuthenticated } = useAuth()
	return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: React.ReactElement }) {
	const { isAuthenticated, user } = useAuth()
	return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/" replace />
}

export default function App() {
	return (
		<>
			<Navbar />
			<div className="container my-4">
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/shop" element={<ShopPage />} />
					<Route path="/brand" element={<BrandPage />} />
					<Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
					<Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
					<Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
					<Route path="/product/:id" element={<ProductPage />} />
					<Route path="/about" element={<AboutPage />} />
					<Route path="/contact" element={<ContactPage />} />
					<Route path="/wishlist" element={<WishlistPage />} />
					<Route path="/cart" element={<CartPage />} />
                    <Route path="/try-on" element={<TryOnPage />} />
                    <Route path="/diary" element={<PrivateRoute><DiaryPage /></PrivateRoute>} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/forgot-password" element={<ForgotPasswordPage />} />
					<Route path="/reset-password" element={<ResetPasswordPage />} />
					<Route
						path="/admin"
						element={
							<AdminRoute>
								<AdminDashboard />
							</AdminRoute>
						}
					/>
				</Routes>
			</div>
			<ChatbotWidget />
		</>
	)
}
