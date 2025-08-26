import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Always force light theme
    setTheme('light')
    setResolvedTheme('light')
    
    // Remove any existing theme from localStorage
    localStorage.removeItem('theme')
    
    // Ensure the root element doesn't have dark class
    const root = window.document.documentElement
    root.classList.remove('dark')
  }, [])

  useEffect(() => {
    // Always keep it light theme
    const root = window.document.documentElement
    setResolvedTheme('light')
    root.classList.remove('dark')
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
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