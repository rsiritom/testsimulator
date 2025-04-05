"use client"

import { useState, useEffect, useRef } from "react"
import { useExamSelection } from "./use-exam-selection"

interface DailyQuestionHistory {
  date: string // formato YYYY-MM-DD
  questionId: string
  question: any // Guardar la pregunta completa
  answered: boolean
  correct: boolean
}

interface DailyQuestionState {
  question: any | null
  loading: boolean
  error: string | null
  history: DailyQuestionHistory[]
  streak: number
  todayAnswered: boolean
  todayCorrect: boolean | null
}

export function useDailyQuestion() {
  const { selectedExam } = useExamSelection()
  const [state, setState] = useState<DailyQuestionState>({
    question: null,
    loading: true,
    error: null,
    history: [],
    streak: 0,
    todayAnswered: false,
    todayCorrect: null,
  })
  const previousRequestRef = useRef(null)

  // Cargar el historial y la pregunta diaria
  useEffect(() => {
    // Crear un controlador de aborto para cancelar solicitudes anteriores
    const abortController = new AbortController()
    const signal = abortController.signal

    // Cancelar la solicitud anterior si existe
    if (previousRequestRef.current) {
      previousRequestRef.current.abort()
    }

    // Guardar el controlador actual para posible cancelación futura
    previousRequestRef.current = abortController

    // Reiniciar completamente el estado cuando cambia el examen
    setState({
      question: null,
      loading: true,
      error: null,
      history: [],
      streak: 0,
      todayAnswered: false,
      todayCorrect: null,
    })

    console.log(`[useDailyQuestion] Exam changed to ${selectedExam}, resetting state and loading new data`)

    const loadHistoryAndQuestion = async () => {
      if (typeof window === "undefined") return

      // Determinar el nombre de la tabla según el examen seleccionado
      const tableName = selectedExam ? `${selectedExam}questions` : "pmpquestions" // Default to pmpquestions if no exam selected

      console.log(`[useDailyQuestion] Loading history and question for ${selectedExam} exam, table: ${tableName}`)

      try {
        // Obtener la fecha actual en formato YYYY-MM-DD
        const today = new Date().toISOString().split("T")[0]

        // Cargar historial desde localStorage
        let history: DailyQuestionHistory[] = []
        let todayEntry = null

        // Usar un key específico para cada tipo de examen
        const storageKey = `${selectedExam || "pmp"}-daily-questions`

        const storedHistory = localStorage.getItem(storageKey)
        if (storedHistory) {
          try {
            history = JSON.parse(storedHistory)

            // Calcular racha actual
            const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

            let streak = 0
            for (const entry of sortedHistory) {
              if (entry.answered && entry.correct) {
                streak++
              } else {
                break
              }
            }

            // Buscar entrada para hoy
            todayEntry = history.find((entry) => entry.date === today)

            // Actualizar estado con historial y racha
            setState((prev) => ({
              ...prev,
              history,
              streak,
              todayAnswered: !!todayEntry?.answered,
              todayCorrect: todayEntry?.correct || null,
              question: todayEntry?.question || null,
              loading: !todayEntry, // Si ya tenemos pregunta para hoy, no estamos cargando
            }))
          } catch (e) {
            console.error("Error parsing stored history:", e)
            // Si hay un error al parsear, reiniciar el historial
            localStorage.removeItem(storageKey)
            history = []
          }
        }

        console.log(`[useDailyQuestion] Loaded history for ${selectedExam} exam:`, history)

        // Si no tenemos pregunta para hoy, obtener una nueva
        if (!todayEntry) {
          console.log(`Fetching new question for ${selectedExam} exam for today:`, today)

          // Obtener IDs de preguntas ya vistas
          const seenQuestionIds = history.map((entry) => entry.questionId)

          // Construir URL para obtener nueva pregunta
          let url = `https://quientecrea.pythonanywhere.com/api/v1/questions/1?table_name=${tableName}`
          if (seenQuestionIds.length > 0) {
            url += `&exclude=${seenQuestionIds.join(",")}`
          }

          console.log("Fetching from URL:", url)

          const response = await fetch(url, { signal })

          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`)
          }

          const data = await response.json()
          console.log("API response:", data)

          if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error("No se recibieron preguntas del servidor")
          }

          const newQuestion = data[0]

          // Crear nueva entrada para hoy
          const newEntry = {
            date: today,
            questionId: newQuestion.id,
            question: newQuestion,
            answered: false,
            correct: false,
          }

          // Actualizar historial
          const updatedHistory = [...history, newEntry]

          // Guardar en localStorage
          localStorage.setItem(storageKey, JSON.stringify(updatedHistory))

          // Actualizar estado
          setState((prev) => ({
            ...prev,
            question: newQuestion,
            history: updatedHistory,
            loading: false,
          }))
        }
      } catch (error) {
        // No reportar errores de solicitudes abortadas
        if (error.name !== "AbortError") {
          console.error("Error in daily question:", error)
          setState((prev) => ({
            ...prev,
            error: error instanceof Error ? error.message : "Error desconocido",
            loading: false,
          }))
        }
      }
    }

    loadHistoryAndQuestion()

    // Limpiar: abortar cualquier solicitud pendiente cuando el componente se desmonte o las dependencias cambien
    return () => {
      abortController.abort()
    }
  }, [selectedExam]) // Ejecutar cuando cambie el examen seleccionado

  // Función para responder a la pregunta diaria
  const answerQuestion = (answer: string) => {
    if (!state.question || state.todayAnswered) return false

    const isCorrect = answer === state.question.correct_answer
    const today = new Date().toISOString().split("T")[0]

    // Usar un key específico para cada tipo de examen
    const storageKey = `${selectedExam || "pmp"}-daily-questions`

    // Actualizar el historial
    const updatedHistory = state.history.map((entry) => {
      if (entry.date === today) {
        return {
          ...entry,
          answered: true,
          correct: isCorrect,
        }
      }
      return entry
    })

    // Calcular nueva racha
    const newStreak = isCorrect ? state.streak + 1 : 0

    // Guardar en localStorage
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory))

    // Actualizar estado inmediatamente
    setState((prev) => ({
      ...prev,
      history: updatedHistory,
      todayAnswered: true,
      todayCorrect: isCorrect,
      streak: newStreak,
    }))

    // Log para depuración
    console.log(`[useDailyQuestion] Answer submitted for ${selectedExam} exam:`, {
      isCorrect,
      newStreak,
      updatedHistory,
    })

    return isCorrect
  }

  // Función para forzar la recarga de una nueva pregunta
  const refreshQuestion = async () => {
    // Crear un controlador de aborto para cancelar solicitudes anteriores
    const abortController = new AbortController()
    const signal = abortController.signal

    // Cancelar la solicitud anterior si existe
    if (previousRequestRef.current) {
      previousRequestRef.current.abort()
    }

    // Guardar el controlador actual para posible cancelación futura
    previousRequestRef.current = abortController

    // Determinar el nombre de la tabla según el examen seleccionado
    const tableName = selectedExam ? `${selectedExam}questions` : "pmpquestions"

    // Usar un key específico para cada tipo de examen
    const storageKey = `${selectedExam || "pmp"}-daily-questions`

    // Marcar como cargando
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      // Obtener la fecha actual
      const today = new Date().toISOString().split("T")[0]

      // Obtener una nueva pregunta
      const response = await fetch(
        `https://quientecrea.pythonanywhere.com/api/v1/questions/1?table_name=${tableName}`,
        { signal },
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("No se recibieron preguntas del servidor")
      }

      const newQuestion = data[0]

      // Actualizar el historial
      const updatedHistory = [...state.history]
      const todayIndex = updatedHistory.findIndex((entry) => entry.date === today)

      if (todayIndex >= 0) {
        // Actualizar la entrada existente
        updatedHistory[todayIndex] = {
          ...updatedHistory[todayIndex],
          questionId: newQuestion.id,
          question: newQuestion,
          answered: false,
          correct: false,
        }
      } else {
        // Crear una nueva entrada
        updatedHistory.push({
          date: today,
          questionId: newQuestion.id,
          question: newQuestion,
          answered: false,
          correct: false,
        })
      }

      // Guardar en localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory))

      // Actualizar estado
      setState((prev) => ({
        ...prev,
        question: newQuestion,
        history: updatedHistory,
        loading: false,
        todayAnswered: false,
        todayCorrect: null,
      }))

      return true
    } catch (error) {
      // No reportar errores de solicitudes abortadas
      if (error.name !== "AbortError") {
        console.error("Error refreshing question:", error)
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Error desconocido",
          loading: false,
        }))
      }
      return false
    }
  }

  return {
    ...state,
    answerQuestion,
    refreshQuestion,
  }
}

