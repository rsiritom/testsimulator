"use client"

import { useState, useEffect, useRef } from "react"
import { useExamSelection } from "./use-exam-selection"

export function useExamData(questionCount = 10, selectedTags = []) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { selectedExam } = useExamSelection()
  const previousRequestRef = useRef(null)

  useEffect(() => {
    // Crear un controlador de aborto para cancelar solicitudes anteriores
    const abortController = new AbortController()
    const signal = abortController.signal

    const fetchQuestions = async () => {
      try {
        setLoading(true)

        // Cancelar la solicitud anterior si existe
        if (previousRequestRef.current) {
          previousRequestRef.current.abort()
        }

        // Guardar el controlador actual para posible cancelación futura
        previousRequestRef.current = abortController

        // Determinar el nombre de la tabla según el examen seleccionado
        const tableName = selectedExam ? `${selectedExam}questions` : "pmpquestions" // Default to pmpquestions if no exam selected

        // Build the URL with the selected tags and table_name as query parameters
        let url = `https://quientecrea.pythonanywhere.com/api/v1/questions/${questionCount}?table_name=${tableName}`

        if (selectedTags.length > 0) {
          // Join the tags with commas without spaces
          const tagsParam = selectedTags.join(",")
          url += `&tags=${tagsParam}`
        }

        console.log(`Fetching questions for ${selectedExam} exam from:`, url) // Log the URL for debugging

        const response = await fetch(url, { signal })

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setQuestions(data)
      } catch (err) {
        // No reportar errores de solicitudes abortadas
        if (err.name !== "AbortError") {
          console.error("Error fetching exam questions:", err)
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()

    // Limpiar: abortar cualquier solicitud pendiente cuando el componente se desmonte o los dependencias cambien
    return () => {
      abortController.abort()
    }
  }, [questionCount, selectedTags, selectedExam])

  return { questions, loading, error }
}

