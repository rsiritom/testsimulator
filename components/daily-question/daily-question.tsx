"use client"

import { useState, useEffect, useRef } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import Alert from "@mui/material/Alert"
import CircularProgress from "@mui/material/CircularProgress"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import BoltIcon from "@mui/icons-material/Bolt"
import RefreshIcon from "@mui/icons-material/Refresh"
import { useDailyQuestion } from "@/hooks/use-daily-question"
import { useMotivationalQuotes } from "@/hooks/use-motivational-quotes"
import { useExamSelection } from "@/hooks/use-exam-selection"
import QuestionCalendar from "./calendar"

export default function DailyQuestion() {
  const { selectedExam } = useExamSelection()
  const examType = selectedExam || "pmp" // Asegurar que siempre tengamos un valor

  // Usar el hook después de determinar el examType para asegurar que los datos son específicos del examen
  const { question, loading, error, history, streak, todayAnswered, todayCorrect, answerQuestion, refreshQuestion } =
    useDailyQuestion()
  const { quote } = useMotivationalQuotes()

  useEffect(() => {
    if (!loading) {
      console.log(`[DailyQuestion] Data for ${examType}:`, {
        todayAnswered,
        todayCorrect,
        streak,
        historyLength: history.length,
      })
    }
  }, [loading, todayAnswered, todayCorrect, streak, history, examType])

  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [activeTab, setActiveTab] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const previousExamRef = useRef(examType)

  // Efecto para manejar cambios en el examen seleccionado
  useEffect(() => {
    if (previousExamRef.current !== examType) {
      console.log(`[DailyQuestion] Exam changed from ${previousExamRef.current} to ${examType}`)
      // Si el examen cambió, reiniciar completamente el estado
      previousExamRef.current = examType
      setDataLoaded(false)
      setSelectedAnswer("")
      setActiveTab(0) // Resetear al tab de pregunta por defecto
    }
  }, [examType])

  // Efecto para determinar el tab activo basado en si la pregunta ha sido respondida
  useEffect(() => {
    // Solo proceder si los datos están cargados y no estamos en estado de carga
    if (!loading) {
      console.log(`[DailyQuestion] Data loaded for ${examType}, todayAnswered:`, todayAnswered)

      // REGLA PRINCIPAL: Si la pregunta ya fue respondida, mostrar el calendario por defecto
      if (todayAnswered) {
        console.log(`[DailyQuestion] Question already answered for ${examType}, showing calendar`)
        setActiveTab(1)
      } else {
        // Si la pregunta no ha sido respondida, mostrar la pregunta
        console.log(`[DailyQuestion] Question not answered for ${examType}, showing question`)
        setActiveTab(0)
      }

      setDataLoaded(true)
    }
  }, [loading, todayAnswered, examType])

  const handleAnswerChange = (event) => {
    if (todayAnswered) return
    setSelectedAnswer(event.target.value)
  }

  const handleSubmit = () => {
    if (!selectedAnswer || todayAnswered) return

    const isCorrect = answerQuestion(selectedAnswer)
    console.log(`[DailyQuestion] Answer submitted for ${examType}, isCorrect:`, isCorrect)

    // Después de responder, siempre cambiar al tab de calendario
    setActiveTab(1)

    // If the answer is correct, set a flag to expand achievements panel
    if (isCorrect) {
      localStorage.setItem(`${examType}-achievement-unlocked`, "true")

      // Dispatch a custom event to notify other components
      if (typeof window !== "undefined") {
        // Crear un evento con toda la información necesaria
        const eventDetail = {
          streak: streak + 1,
          examType: examType,
          timestamp: Date.now(), // Añadir timestamp para evitar problemas de caché
        }

        console.log(`[DailyQuestion] Dispatching dailyQuestionCorrect event for ${examType}:`, eventDetail)

        window.dispatchEvent(
          new CustomEvent("dailyQuestionCorrect", {
            detail: eventDetail,
          }),
        )

        // Force a refresh of the page to ensure achievements are updated
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    }
  }

  const handleTabChange = (event, newValue) => {
    // Permitir cambiar libremente entre tabs
    setActiveTab(newValue)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshQuestion()
    setSelectedAnswer("")
    setRefreshing(false)
    // Al refrescar la pregunta, asegurarse de mostrar el tab de la pregunta
    setActiveTab(0)
  }

  // Si estamos cargando datos, mostrar un indicador de carga
  if (loading && !dataLoaded) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent sx={{ p: { xs: 2, md: 4 }, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Daily Challenge
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {quote}
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="daily question tabs">
            <Tab label="Question of the Day" />
            <Tab label="Calendar" />
          </Tabs>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <BoltIcon color="primary" />
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {streak} Consecutive {streak === 1 ? "Day" : "Days"}
            </Typography>
          </Box>
        </Box>

        {activeTab === 0 && (
          <Box>
            {loading || refreshing ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ py: 4 }}>
                <Alert
                  severity="warning"
                  action={
                    <Button color="inherit" size="small" onClick={handleRefresh}>
                      <RefreshIcon />
                    </Button>
                  }
                >
                  Could not load the question of the day. Try refreshing the page.
                </Alert>
              </Box>
            ) : question ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {question.question}
                </Typography>

                <FormControl component="fieldset" sx={{ width: "100%", my: 2 }}>
                  <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
                    {["A", "B", "C", "D"].map((option) => (
                      <FormControlLabel
                        key={option}
                        value={option}
                        control={
                          <Radio
                            disabled={todayAnswered}
                            color={
                              todayAnswered
                                ? option === question.correct_answer
                                  ? "success"
                                  : selectedAnswer === option && option !== question.correct_answer
                                    ? "error"
                                    : "primary"
                                : "primary"
                            }
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: todayAnswered && option === question.correct_answer ? "bold" : "normal",
                              color:
                                todayAnswered && option === question.correct_answer ? "success.main" : "text.primary",
                            }}
                          >
                            {option}: {question[`option_${option}`]}
                          </Typography>
                        }
                        sx={{
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: todayAnswered
                            ? option === question.correct_answer
                              ? "success.light"
                              : selectedAnswer === option && option !== question.correct_answer
                                ? "error.light"
                                : "transparent"
                            : "transparent",
                          opacity:
                            todayAnswered && option !== question.correct_answer && selectedAnswer !== option ? 0.7 : 1,
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>

                {!todayAnswered ? (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={!selectedAnswer}
                    onClick={handleSubmit}
                    sx={{ mt: 2 }}
                  >
                    Answer
                  </Button>
                ) : (
                  <Alert severity={todayCorrect ? "success" : "error"} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                      {todayCorrect ? "Correct!" : "Incorrect"}
                    </Typography>
                    <Typography variant="body2">{question.explanation}</Typography>
                  </Alert>
                )}
              </>
            ) : (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Alert
                  severity="warning"
                  action={
                    <Button color="inherit" size="small" onClick={handleRefresh}>
                      <RefreshIcon />
                    </Button>
                  }
                >
                  Could not load the question of the day. Try refreshing the page.
                </Alert>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <QuestionCalendar history={history} />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

