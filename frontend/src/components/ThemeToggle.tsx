import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const [isOpen, setIsOpen] = useState(false)

	const themes = [
		{ id: 'dark', name: '🌙 Dark', icon: '🌙' },
		{ id: 'pastel', name: '🌸 Pastel', icon: '🌸' },
		{ id: 'floral', name: '🌺 Floral', icon: '🌺' },
		{ id: 'minimalist', name: '⚪ Minimalist', icon: '⚪' }
	]

	return (
		<div className="dropdown position-relative">
			<button 
				className="btn btn-outline-secondary dropdown-toggle" 
				type="button" 
				onClick={() => setIsOpen(!isOpen)}
			>
				🎨 Theme
			</button>
			{isOpen && (
				<ul className="dropdown-menu show position-absolute" style={{ zIndex: 1000, minWidth: '150px' }}>
					{themes.map((t) => (
						<li key={t.id}>
							<button 
								className={`dropdown-item ${theme === t.id ? 'active bg-primary text-white' : ''}`} 
								onClick={() => {
									setTheme(t.id as any)
									setIsOpen(false)
								}}
							>
								{t.name}
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	)
} 