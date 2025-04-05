"use client"

import { useState, useEffect, useCallback } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Alert from "@mui/material/Alert"
import LinearProgress from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { useExamData } from "@/hooks/use-exam-data"
import { useMobile } from "@/hooks/use-mobile"
import { useExamSelection } from "@/hooks/use-exam-selection"
import Results from "./results"
import Timer from "./timer"
import QuestionCard from "./question-card"
import dynamic from "next/dynamic"

// Importar el BackButton de forma dinámica para evitar problemas de SSR
const BackButton = dynamic(() => import("./back-button"), { ssr: false })

export default function ExamSimulator({ questionCount, selectedTags, testType = "practice", onReset, onSubmit }) {
  const isMobile = useMobile()
  const { selectedExam } = useExamSelection()
  const { questions, loading, error } = useExamData(questionCount, selectedTags)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [examStartTime, setExamStartTime] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [totalExamTime, setTotalExamTime] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Asegurarse de que el componente esté montado antes de renderizar contenido que depende del cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  const isTestMode = testType === "test"

  // Limpiar datos de exámenes anteriores al montar el componente
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Usar un key específico para cada tipo de examen
      const examKey = `${selectedExam || "pmp"}-exam-completed`
      localStorage.removeItem(examKey)
    }
  }, [selectedExam])

  // Calculate total exam time based on question count
  useEffect(() => {
    if (isTestMode && questionCount > 0) {
      // Calculate time as (number of questions * 240) / 180 minutes, converted to seconds
      // 1 minute = 60 seconds
      const calculatedMinutes = Math.round((questionCount * 240) / 180)
      const calculatedSeconds = calculatedMinutes * 60
      setTotalExamTime(calculatedSeconds)
    }
  }, [questionCount, isTestMode])

  // Initialize exam start time when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !examStartTime) {
      setExamStartTime(Date.now())
      // Clear the completed flag when starting a new exam
      if (typeof window !== "undefined") {
        // Usar un key específico para cada tipo de examen
        const examKey = `${selectedExam || "pmp"}-exam-completed`
        localStorage.removeItem(examKey)
      }
    }
  }, [questions, examStartTime, selectedExam])

  const handleTimeUpdate = useCallback((elapsed) => {
    setTimeElapsed(elapsed)
  }, [])

  const handleTimeExpired = useCallback(() => {
    if (!submitted) {
      // Auto-submit the exam when time expires
      handleSubmit()

      // Show alert to user
      alert("¡El tiempo ha terminado! Tu examen ha sido enviado automáticamente.")
    }
  }, [submitted])

  const handleAnswerSelect = (questionId, answer) => {
    if (submitted) return

    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = () => {
    setSubmitted(true)
    // Call the onSubmit callback to update the parent component
    if (onSubmit) {
      onSubmit()
    }

    // Marcar el examen como completado usando un key específico para cada tipo de examen
    if (typeof window !== "undefined") {
      const examKey = `${selectedExam || "pmp"}-exam-completed`
      localStorage.setItem(examKey, "true")
    }
  }

  const handleReset = () => {
    // Only show confirmation dialog if the exam is in progress (not submitted)
    if (!submitted) {
      if (window.confirm("Are you sure you want to restart the exam? All your answers will be lost.")) {
        resetExam()
      }
    } else {
      // If exam is already submitted, no need for confirmation
      resetExam()
    }
  }

  // Separate function to reset the exam
  const resetExam = () => {
    setAnswers({})
    setSubmitted(false)
    setExamStartTime(null)
    setCurrentQuestionIndex(0)
    // Clear the completed flag when resetting
    if (typeof window !== "undefined") {
      const examKey = `${selectedExam || "pmp"}-exam-completed`
      localStorage.removeItem(examKey)
    }
    onReset()
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const answeredCount = Object.keys(answers).length
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h6" align="center" gutterBottom>
          Loading questions...
        </Typography>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        Error loading questions: {error}
      </Alert>
    )
  }

  // Asegurarse de que el botón esté visible en el simulador de examen
  if (submitted) {
    return (
      <>
        {mounted && <BackButton />}
        <Results
          questions={questions}
          userAnswers={answers}
          timeElapsed={timeElapsed}
          onReset={handleReset}
          testType={testType}
          totalExamTime={isTestMode ? totalExamTime : 0}
        />
      </>
    )
  }

  if (questions.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 4 }}>
        No questions found with the selected filters. Please try with different filters.
      </Alert>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const selectedAnswer = answers[currentQuestion.id] || ""

  return (
    <>
      {mounted && <BackButton examInProgress={true} />}
      <Box sx={{ mt: 4, maxWidth: 800, mx: "auto", width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 0,
          }}
        >
          <Typography variant="h6">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>

          {isTestMode && examStartTime && (
            <Timer
              startTime={examStartTime}
              totalTime={totalExamTime}
              isRunning={!submitted}
              isCountdown={true}
              onTimeUpdate={handleTimeUpdate}
              onTimeExpired={handleTimeExpired}
            />
          )}
        </Box>

        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mb: 4 }} />

        <QuestionCard
          question={currentQuestion}
          index={currentQuestionIndex}
          selectedAnswer={selectedAnswer}
          onAnswerChange={handleAnswerSelect}
          isSubmitted={false}
          testType={testType}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 0,
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            startIcon={<ArrowBackIcon />}
            fullWidth={isMobile}
          >
            Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              fullWidth={isMobile}
            >
              Submit Exam
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleNextQuestion}
              endIcon={<ArrowForwardIcon />}
              fullWidth={isMobile}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </>
  )
}

