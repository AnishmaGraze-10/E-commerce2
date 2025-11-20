import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'dark' | 'pastel' | 'floral' | 'minimalist'

interface ThemeContextType {
	theme: Theme
	setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>('dark')

	function setTheme(newTheme: Theme) {
		setThemeState(newTheme)
		localStorage.setItem('theme', newTheme)
		document.body.className = `theme-${newTheme}`
	}

	useEffect(() => {
		const savedTheme = localStorage.getItem('theme') as Theme || 'dark'
		setTheme(savedTheme)
	}, [])

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme() {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
} 