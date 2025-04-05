"use client"

import { useState, useEffect, useRef } from "react"

export function useLocalStorage(key, initialValue) {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // State to track if this is the first render
  const [isFirstRender, setIsFirstRender] = useState(true)
  const [prevKey, setPrevKey] = useState(key)

  // Añadir un ref para controlar las actualizaciones
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Añadir un ref para el valor actual en localStorage
  const currentStoredValueRef = useRef(storedValue)

  // Effect to update state when the key changes (e.g., when switching exams)
  useEffect(() => {
    if (typeof window === "undefined") return

    // Cancelar cualquier actualización pendiente
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = null
    }

    // Omitir el primer renderizado ya que ya inicializamos el estado
    if (isFirstRender) {
      setIsFirstRender(false)
      return
    }

    // Solo actualizar si la clave ha cambiado realmente
    if (prevKey !== key) {
      console.log(`[useLocalStorage] Key changed from ${prevKey} to ${key}, updating state`)

      // Usar un timeout para evitar múltiples actualizaciones
      updateTimeoutRef.current = setTimeout(() => {
        try {
          // Obtener de localStorage por clave
          const item = window.localStorage.getItem(key)
          // Analizar el JSON almacenado o si no hay ninguno, devolver el valor inicial
          const value = item ? JSON.parse(item) : initialValue

          console.log(`[useLocalStorage] New value for ${key}:`, value)

          setStoredValue(value)
          currentStoredValueRef.current = value
          setPrevKey(key)
        } catch (error) {
          console.error(`Error reading localStorage key "${key}" after key change:`, error)
          setStoredValue(initialValue)
          currentStoredValueRef.current = initialValue
        }

        updateTimeoutRef.current = null
      }, 100)
    }

    // Limpiar el timeout al desmontar
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [key, initialValue, isFirstRender, prevKey])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Permitir que el valor sea una función para tener la misma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Verificar si el valor ha cambiado realmente
      const currentValueStr = JSON.stringify(currentStoredValueRef.current)
      const newValueStr = JSON.stringify(valueToStore)

      if (currentValueStr === newValueStr) {
        // Si el valor no ha cambiado, no hacer nada
        return
      }

      // Save state
      setStoredValue(valueToStore)
      currentStoredValueRef.current = valueToStore

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
        console.log(`[useLocalStorage] Saved to localStorage: ${key}`, valueToStore)
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue)
          setStoredValue(newValue)
          currentStoredValueRef.current = newValue
          console.log(`[useLocalStorage] Updated from storage event: ${key}`, newValue)
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [key])

  return [storedValue, setValue]
}

