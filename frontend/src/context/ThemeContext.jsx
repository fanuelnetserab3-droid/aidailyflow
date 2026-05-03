import React, { createContext, useContext } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Always dark — ocean design is the identity of this app
  const theme = 'dark'

  // Force dark on mount, overriding any stale localStorage value
  React.useEffect(() => {
    localStorage.setItem('theme', 'dark')
    document.body.setAttribute('data-theme', 'dark')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}