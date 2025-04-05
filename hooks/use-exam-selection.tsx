"use client"

import { useState, useEffect } from "react"

export type ExamType = "pmp" | "fce"

export function useExamSelection() {
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar la selección de examen guardada
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoaded) {
      try {
        const storedExam = localStorage.getItem("selected-exam") as ExamType
        if (storedExam) {
          setSelectedExam(storedExam)
        }
        setIsLoaded(true)
      } catch (error) {
        console.error("Error loading exam selection:", error)
        setIsLoaded(true)
      }
    }
  }, [isLoaded])

  // Guardar la selección de examen
  const selectExam = (exam: ExamType) => {
    setSelectedExam(exam)
    if (typeof window !== "undefined") {
      localStorage.setItem("selected-exam", exam)
    }
  }

  return {
    selectedExam,
    selectExam,
    isLoaded,
  }
}

