"use client"

import { useState, useEffect } from "react"
import { useExamSelection } from "./use-exam-selection"

export interface TestResult {
  id: string
  date: string
  score: number
  totalQuestions: number
  correctAnswers: number
  testType: string
  tags: string[]
  examType: string // Añadido para identificar a qué examen pertenece el resultado
}

export function useTestHistory() {
  const { selectedExam } = useExamSelection()
  const [testHistory, setTestHistory] = useState<TestResult[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load test history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoaded) {
      try {
        // First, check if we need to reset the history (for development/testing)
        const needsReset = localStorage.getItem("pmp-reset-history")
        if (needsReset === "true") {
          localStorage.removeItem("pmp-test-history")
          localStorage.removeItem("pmp-reset-history")
        }

        const storedHistory = localStorage.getItem("pmp-test-history")
        if (storedHistory) {
          try {
            const parsedHistory = JSON.parse(storedHistory)

            // Validate the data structure
            if (Array.isArray(parsedHistory)) {
              // Filter out any invalid entries
              const validHistory = parsedHistory.filter(
                (entry) =>
                  typeof entry === "object" &&
                  entry !== null &&
                  typeof entry.id === "string" &&
                  typeof entry.date === "string" &&
                  typeof entry.score === "number" &&
                  typeof entry.totalQuestions === "number" &&
                  typeof entry.correctAnswers === "number" &&
                  typeof entry.testType === "string" &&
                  Array.isArray(entry.tags),
              )

              setTestHistory(validHistory)
            } else {
              // If not an array, reset it
              localStorage.removeItem("pmp-test-history")
              setTestHistory([])
            }
          } catch (error) {
            console.error("Error parsing test history:", error)
            localStorage.removeItem("pmp-test-history")
            setTestHistory([])
          }
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error)
      }

      setIsLoaded(true)
    }
  }, [isLoaded])

  // Reload history when selectedExam changes
  useEffect(() => {
    if (isLoaded && selectedExam) {
      // Force a reload of the history when the exam type changes
      setIsLoaded(false)
    }
  }, [selectedExam])

  // Save a new test result
  const saveTestResult = (result: Omit<TestResult, "id" | "date" | "examType">) => {
    // Create the new result with the current exam type
    const newResult: TestResult = {
      ...result,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      examType: selectedExam || "pmp", // Guardar el tipo de examen actual
    }

    // Log for debugging
    console.log("Saving test result:", newResult)

    // Get the current history directly from localStorage to ensure we have the latest data
    let currentHistory: TestResult[] = []
    try {
      const storedHistory = localStorage.getItem("pmp-test-history")
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory)
        if (Array.isArray(parsedHistory)) {
          currentHistory = parsedHistory
        }
      }
    } catch (error) {
      console.error("Error reading test history:", error)
    }

    // Add the new result to the history
    const updatedHistory = [...currentHistory, newResult]

    // Update state and localStorage
    setTestHistory(updatedHistory)

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("pmp-test-history", JSON.stringify(updatedHistory))

        // Dispatch a custom event to notify other components about the new test result
        window.dispatchEvent(new CustomEvent("testResultSaved", { detail: newResult }))
      } catch (error) {
        console.error("Error saving test history:", error)
      }
    }

    return newResult
  }

  // Get filtered history based on the selected exam
  const getFilteredHistory = (): TestResult[] => {
    if (!selectedExam) return testHistory

    return testHistory.filter((result) => {
      // Si el resultado tiene examType, filtrar por ese valor
      // Si no tiene examType (resultados antiguos), asumir que son de tipo "pmp"
      const resultExamType = result.examType || "pmp"
      return resultExamType === selectedExam
    })
  }

  // Clear all test history
  const clearTestHistory = () => {
    if (selectedExam) {
      // Si hay un examen seleccionado, solo eliminar los resultados de ese examen
      const updatedHistory = testHistory.filter((result) => {
        const resultExamType = result.examType || "pmp"
        return resultExamType !== selectedExam
      })
      setTestHistory(updatedHistory)

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("pmp-test-history", JSON.stringify(updatedHistory))
        } catch (error) {
          console.error("Error updating test history:", error)
        }
      }
    } else {
      // Si no hay examen seleccionado, eliminar todo el historial
      setTestHistory([])
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("pmp-test-history")
        } catch (error) {
          console.error("Error clearing test history:", error)
        }
      }
    }
  }

  // Force a reset of the history (for development/testing)
  const resetTestHistory = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("pmp-reset-history", "true")
        window.location.reload()
      } catch (error) {
        console.error("Error setting reset flag:", error)
      }
    }
  }

  // Obtener el historial filtrado por el examen seleccionado
  const filteredHistory = getFilteredHistory()

  return {
    testHistory: filteredHistory, // Devolver solo el historial del examen seleccionado
    allTestHistory: testHistory, // Mantener acceso al historial completo si es necesario
    saveTestResult,
    clearTestHistory,
    resetTestHistory,
    isLoaded,
  }
}

