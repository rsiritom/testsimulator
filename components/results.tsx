"use client"

import { useMemo, useEffect, useState, useRef } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import Divider from "@mui/material/Divider"
import LinearProgress from "@mui/material/LinearProgress"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Alert from "@mui/material/Alert"
import { useMobile } from "@/hooks/use-mobile"
import { useTestHistory } from "@/hooks/use-test-history"
import { useExamSelection } from "@/hooks/use-exam-selection"

export default function Results({
  questions,
  userAnswers,
  timeElapsed,
  onReset,
  testType = "practice",
  totalExamTime = 0,
}) {
  const isMobile = useMobile()
  const isTestMode = testType === "test"
  const { saveTestResult } = useTestHistory()
  const { selectedExam } = useExamSelection()
  const [resultSaved, setResultSaved] = useState(false)
  const eventDispatched = useRef(false)

  const results = useMemo(() => {
    const correctAnswers = questions.filter((q) => userAnswers[q.id] === q.correct_answer).length

    const incorrectAnswers = questions.filter((q) => userAnswers[q.id] && userAnswers[q.id] !== q.correct_answer).length

    const unanswered = questions.length - correctAnswers - incorrectAnswers

    const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0

    const passingScore = 70
    const passed = score >= passingScore

    // Análisis por categorías (tags)
    const tagStats = {}
    questions.forEach((question) => {
      const tags = question.tags.split(", ")
      const isCorrect = userAnswers[question.id] === question.correct_answer

      tags.forEach((tag) => {
        if (!tagStats[tag]) {
          tagStats[tag] = { total: 0, correct: 0 }
        }
        tagStats[tag].total += 1
        if (isCorrect) {
          tagStats[tag].correct += 1
        }
      })
    })

    return {
      correctAnswers,
      incorrectAnswers,
      unanswered,
      score,
      passed,
      passingScore,
      tagStats,
    }
  }, [questions, userAnswers])

  // Save test result to history and mark exam as completed
  useEffect(() => {
    // Solo guardar el resultado una vez cuando el componente se monta
    if (!resultSaved && !eventDispatched.current && selectedExam) {
      console.log(`Saving test result for ${selectedExam} exam`)

      // Extraer etiquetas únicas de las preguntas
      const tags = Array.from(new Set(questions.flatMap((q) => q.tags.split(", "))))

      const savedResult = saveTestResult({
        score: results.score,
        totalQuestions: questions.length,
        correctAnswers: results.correctAnswers,
        testType: testType,
        tags: tags,
      })

      // Marcar el examen como completado en localStorage usando una clave específica para el examen
      const examKey = `${selectedExam}-exam-completed`
      localStorage.setItem(examKey, "true")

      // Despachar un evento personalizado para notificar a otros componentes - SOLO UNA VEZ
      if (typeof window !== "undefined" && !eventDispatched.current) {
        // Obtener el umbral actual de localStorage para el examen específico
        const thresholdKey = `${selectedExam}-score-threshold`
        const currentThreshold = localStorage.getItem(thresholdKey) || "60"
        const thresholdValue = Number.parseInt(currentThreshold, 10)

        // Usar un timeout para evitar múltiples eventos
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("testResultSaved", {
              detail: {
                id: savedResult.id, // Incluir el ID para evitar el procesamiento duplicado
                score: results.score,
                totalQuestions: questions.length,
                correctAnswers: results.correctAnswers,
                examType: selectedExam, // Incluir el tipo de examen en el evento
              },
            }),
          )

          eventDispatched.current = true

          // Verificar si esta prueba completa el logro
          if (results.score >= thresholdValue) {
            // Obtener el recuento actual de localStorage
            const achievementKey = `${selectedExam}-achievement-score-threshold`
            const achievementData = localStorage.getItem(achievementKey)
            if (achievementData) {
              try {
                const achievement = JSON.parse(achievementData)
                const currentCount = (achievement.currentCount || 0) + 1

                // Si esta prueba completa el logro (llega a 3/3)
                if (currentCount >= 3 && !achievement.isCompleted) {
                  // Establecer bandera para expandir el panel de logros y mostrar confeti
                  localStorage.setItem(`${selectedExam}-achievement-unlocked`, "true")
                  localStorage.setItem(`${selectedExam}-achievement-type-unlocked`, "testScoreThreshold")
                }
              } catch (e) {
                console.error("Error parsing achievement data:", e)
              }
            }
          }
        }, 100)
      }

      setResultSaved(true)
    }
  }, [questions, results, saveTestResult, testType, resultSaved, selectedExam])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":")
  }

  // Calculate time used or time remaining
  const getTimeDisplay = () => {
    if (isTestMode) {
      const timeUsed = timeElapsed
      const timeRemaining = Math.max(0, totalExamTime - timeElapsed)

      if (timeRemaining === 0) {
        return `Time's up (${formatTime(timeUsed)} used)`
      } else {
        return `Time used: ${formatTime(timeUsed)} (${formatTime(timeRemaining)} remaining)`
      }
    }

    return `Total time: ${formatTime(timeElapsed)}`
  }

  // Ordenar las categorías por rendimiento
  const sortedCategories = useMemo(() => {
    return Object.entries(results.tagStats)
      .map(([tag, stats]) => ({
        tag,
        total: stats.total,
        correct: stats.correct,
        percentage: Math.round((stats.correct / stats.total) * 100) || 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
  }, [results.tagStats])

  // Función para manejar el reinicio del examen
  const handleReset = () => {
    // Resetear la bandera de evento despachado
    eventDispatched.current = false

    // Limpiar cualquier dato de examen anterior de localStorage
    if (selectedExam) {
      // Usar un key específico para cada tipo de examen
      const examKey = `${selectedExam}-exam-completed`
      localStorage.removeItem(examKey)
    }

    // Llamar a la función onReset proporcionada por el componente padre
    if (onReset) {
      onReset()
    }
  }

  return (
    <Box sx={{ mt: 4, maxWidth: 1000, mx: "auto" }}>
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}>
            {results.passed ? "Congratulations! You passed the exam" : "You did not pass the exam"}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={results.score}
                size={isMobile ? 120 : 150}
                thickness={5}
                sx={{
                  color: results.passed ? "success.main" : "error.main",
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h3" component="div" sx={{ fontSize: { xs: "1.75rem", md: "3rem" } }}>
                  {results.score}%
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Centrar las cajas de estadísticas */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <Grid container spacing={2} sx={{ maxWidth: "800px" }}>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    p: { xs: 2, md: 3 },
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircleIcon color="success" sx={{ fontSize: { xs: 30, md: 40 }, mb: 1 }} />
                  <Typography variant="h6">Correct</Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}>
                    {results.correctAnswers}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    p: { xs: 2, md: 3 },
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ErrorIcon color="error" sx={{ fontSize: { xs: 30, md: 40 }, mb: 1 }} />
                  <Typography variant="h6">Incorrect</Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}>
                    {results.incorrectAnswers}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    p: { xs: 2, md: 3 },
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HelpOutlineIcon sx={{ fontSize: { xs: 30, md: 40 }, mb: 1, color: "text.secondary" }} />
                  <Typography variant="h6">Unanswered</Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}>
                    {results.unanswered}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {timeElapsed > 0 && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {getTimeDisplay()}
              </Typography>
              <Typography variant="body1">Minimum passing score: {results.passingScore}%</Typography>
            </Paper>
          )}

          <Typography variant="h5" gutterBottom>
            Analysis by Category
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Vista compacta de categorías ordenadas por rendimiento */}
          <Box sx={{ mb: 4 }}>
            {sortedCategories.map((category) => (
              <Box key={category.tag} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ textTransform: "capitalize" }}>
                    {category.tag}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {category.correct}/{category.total} ({category.percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={category.percentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: "background.paper",
                    "& .MuiLinearProgress-bar": {
                      bgcolor:
                        category.percentage >= 70
                          ? "success.main"
                          : category.percentage >= 40
                            ? "warning.main"
                            : "error.main",
                    },
                  }}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              sx={{ px: 4, py: 1.5 }}
            >
              Restart Exam
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom sx={{ mt: 6, mb: 3 }}>
        Question Review
      </Typography>

      {questions.map((question, index) => {
        const userAnswer = userAnswers[question.id] || ""
        const isCorrect = userAnswer === question.correct_answer

        return (
          <Card key={question.id} sx={{ mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                {index + 1}. {question.question}
              </Typography>

              <Box sx={{ mb: 2 }}>
                {["A", "B", "C", "D"].map((option) => (
                  <Box
                    key={option}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 2,
                      bgcolor:
                        option === question.correct_answer
                          ? "success.light"
                          : userAnswer === option && option !== question.correct_answer
                            ? "error.light"
                            : "transparent",
                      border: "1px solid",
                      borderColor:
                        option === question.correct_answer
                          ? "success.main"
                          : userAnswer === option && option !== question.correct_answer
                            ? "error.main"
                            : "divider",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: option === question.correct_answer ? "bold" : "normal",
                      }}
                    >
                      {option}: {question[`option_${option}`]}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Alert severity={isCorrect ? "success" : "error"} sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                  {isCorrect ? "Correct!" : "Incorrect"}
                </Typography>
                <Typography variant="body2">{question.explanation}</Typography>
              </Alert>
            </CardContent>
          </Card>
        )
      })}
    </Box>
  )
}

