"use client"

import { useState, useEffect, createContext, useContext } from "react"

// Create a context for the theme mode
const ThemeModeContext = createContext({
  darkMode: true,
  toggleDarkMode: () => {},
})

// Provider component
export function ThemeModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load the theme preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoaded) {
      const storedTheme = localStorage.getItem("pmp-dark-mode")
      if (storedTheme !== null) {
        setDarkMode(storedTheme === "true")
      }
      setIsLoaded(true)
    }
  }, [isLoaded])

  // Save the theme preference to localStorage when it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("pmp-dark-mode", darkMode.toString())
    }
  }, [darkMode, isLoaded])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return <ThemeModeContext.Provider value={{ darkMode, toggleDarkMode }}>{children}</ThemeModeContext.Provider>
}

// Custom hook to use the theme mode
export function useThemeMode() {
  return useContext(ThemeModeContext)
}

