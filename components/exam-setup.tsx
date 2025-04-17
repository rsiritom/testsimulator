"use client"

import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Slider from "@mui/material/Slider"
import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import Chip from "@mui/material/Chip"
import { useTheme } from "@mui/material/styles"
import { useMobile } from "@/hooks/use-mobile"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import SchoolIcon from "@mui/icons-material/School"
import Tooltip from "@mui/material/Tooltip"
import Collapse from "@mui/material/Collapse"
import DailyQuestion from "./daily-question/daily-question"
import { useExamSelection } from "@/hooks/use-exam-selection"

// Categorías para el examen PMP
const pmpKnowledgeAreas = [
  "All",
  "Scope",
  "Cost",
  "Quality",
  "Procurement",
  "Communication",
  "Stakeholders",
  "Resources",
  "Schedule",
  "Integration",
  "People",
  "Process",
  "Business",
]

// Categorías para el examen FCE
const fceKnowledgeAreas = [
  "All",
  "Grammar",
  "Prepositions",
  "ReadingComprehension",
  "Vocabulary",
  "WordFormation",
  "Collocation",
  "SentenceCompletion",
  "Pronunciation",
  "PhrasalVerbs",
]

export default function ExamSetup({ onStartExam }) {
  const theme = useTheme()
  const isMobile = useMobile()
  const { selectedExam } = useExamSelection()
  const [questionCount, setQuestionCount] = useState(5)
  const [testType, setTestType] = useState("practice")
  const [selectedTags, setSelectedTags] = useState<string[]>(["All"])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Determinar qué categorías mostrar según el examen seleccionado
  const knowledgeAreas = selectedExam === "fce" ? fceKnowledgeAreas : pmpKnowledgeAreas

  // Calcular el tiempo estimado para el modo de prueba
  const estimatedMinutes = Math.round((questionCount * 240) / 180)
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}m`
    } else {
      return `${mins}m`
    }
  }

  // Clear any previous exam data when the component mounts or exam changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Usar un key específico para cada tipo de examen
      const examKey = `${selectedExam || "pmp"}-exam-completed`

      // Clear any previous exam data from localStorage
      localStorage.removeItem(`${selectedExam || "pmp"}-exam-answers`)
      localStorage.removeItem(`${selectedExam || "pmp"}-exam-submitted`)
      localStorage.removeItem(`${selectedExam || "pmp"}-exam-start-time`)
      localStorage.removeItem(examKey)
    }
  }, [selectedExam])

  // Reset question count when changing modes
  useEffect(() => {
    // Reset to minimum value when changing modes
    setQuestionCount(5)
  }, [testType])

  // Reset selected tags when exam type changes
  useEffect(() => {
    setSelectedTags(["All"])
  }, [selectedExam])

  const handleQuestionCountChange = (event, newValue) => {
    setQuestionCount(newValue)
  }

  const handleTestTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setTestType(newValue)
    }
  }

  const handleTagClick = (tag: string) => {
    if (tag === "All") {
      setSelectedTags(["All"])
      return
    }

    // Si "All" está seleccionado y se hace clic en una categoría específica,
    // cambiamos a modo filtrado
    if (selectedTags.includes("All")) {
      setSelectedTags([tag])
    } else {
      // Alternar la categoría seleccionada
      if (selectedTags.includes(tag)) {
        const newCategories = selectedTags.filter((t) => t !== tag)
        // Si no hay categorías seleccionadas, mostrar todas
        if (newCategories.length === 0) {
          setSelectedTags(["All"])
        } else {
          setSelectedTags(newCategories)
        }
      } else {
        setSelectedTags([...selectedTags, tag])
      }
    }

    // Resetear al primer card cuando se cambian los filtros
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }

  const handleStartExam = () => {
    // Limpiar cualquier dato de examen anterior de localStorage
    if (typeof window !== "undefined") {
      // Usar un key específico para cada tipo de examen
      const examKey = `${selectedExam || "pmp"}-exam-completed`

      localStorage.removeItem(`${selectedExam || "pmp"}-exam-answers`)
      localStorage.removeItem(`${selectedExam || "pmp"}-exam-submitted`)
      localStorage.removeItem(`${selectedExam || "pmp"}-exam-start-time`)
      localStorage.removeItem(examKey)
    }

    console.log(`Starting ${selectedExam} exam with tags:`, selectedTags) // Log para depuración
    console.log("Test type:", testType) // Log para depuración
    console.log("Question count:", questionCount) // Log para depuración

    // Determinar qué categorías pasar al examen
    // Si estamos en modo test, no pasamos ninguna categoría
    // Si estamos en modo practice y "All" está seleccionado, no pasamos ninguna categoría
    const tagsToPass =
      testType === "test" ? [] : selectedTags.includes("All") ? [] : selectedTags.map((tag) => tag.toLowerCase())

    // Llamar a la función onStartExam del componente padre
    onStartExam(questionCount, tagsToPass, testType)
  }

  // Determinar el rango de preguntas según el modo
  const minQuestions = 5
  const maxQuestions = testType === "test" ? 180 : 50
  const questionStepSize = testType === "test" ? 10 : 5

  // En lugar de usar Grid, vamos a usar un enfoque diferente para pantallas grandes
  if (!isMobile) {
    return (
      <Box sx={{ display: "flex", flexDirection: "row", gap: 4 }}>
        {/* Daily Challenge - A la izquierda en pantallas grandes */}
        <Box sx={{ flex: 1 }}>
          <DailyQuestion />
        </Box>

        {/* Test Setup - A la derecha en pantallas grandes */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
                Test Settings
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography gutterBottom>Mode:</Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <ToggleButtonGroup
                    value={testType}
                    exclusive
                    onChange={handleTestTypeChange}
                    aria-label="test mode"
                    sx={{ width: "100%", maxWidth: 400 }}
                  >
                    <ToggleButton
                      value="practice"
                      aria-label="practice mode"
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: "4px 0 0 4px",
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": {
                            bgcolor: "primary.dark",
                          },
                        },
                      }}
                    >
                      <Tooltip title="Take your time, no timer, 5-50 questions, filter by categories">
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <SchoolIcon />
                          <Typography>Practice</Typography>
                        </Box>
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton
                      value="test"
                      aria-label="test mode"
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: "0 4px 4px 0",
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": {
                            bgcolor: "primary.dark",
                          },
                        },
                      }}
                    >
                      <Tooltip title={`Timed test (${formatTime(estimatedMinutes)}), 5-180 questions, all categories`}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <AccessTimeIcon />
                          <Typography>Test</Typography>
                        </Box>
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                {testType === "test" && (
                  <Typography align="center" variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                    Time limit: {formatTime(estimatedMinutes)} • All categories included
                  </Typography>
                )}
                {testType === "practice" && (
                  <Typography align="center" variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                    No time limit - take as long as you need
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography gutterBottom>
                  Number of questions ({minQuestions}-{maxQuestions}):
                </Typography>
                <Box sx={{ px: 2, display: "flex", alignItems: "center" }}>
                  <Slider
                    value={questionCount}
                    onChange={handleQuestionCountChange}
                    aria-labelledby="question-count-slider"
                    valueLabelDisplay="auto"
                    step={questionStepSize}
                    marks={
                      testType === "test"
                        ? [
                            { value: 5, label: "5" },
                            { value: 60, label: "60" },
                            { value: 120, label: "120" },
                            { value: 180, label: "180" },
                          ]
                        : undefined
                    }
                    min={minQuestions}
                    max={maxQuestions}
                  />
                  <Typography sx={{ ml: 2, minWidth: 30 }}>{questionCount}</Typography>
                </Box>
                {testType === "test" && questionCount >= 180 && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1, textAlign: "center" }}>
                    Full exam simulation ({questionCount} questions)
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleStartExam}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: "1.1rem",
                    width: "100%",
                    maxWidth: 300,
                  }}
                >
                  Start {testType === "test" ? "Exam" : "Practice"}
                </Button>
              </Box>

              {/* Mostrar categorías solo en modo práctica */}
              <Collapse in={testType === "practice"}>
                <Box>
                  <Typography gutterBottom>Categories:</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    <Chip
                      key="All"
                      label="All"
                      onClick={() => handleTagClick("All")}
                      color="primary"
                      variant={selectedTags.includes("All") ? "filled" : "outlined"}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        fontWeight: 500,
                        "&.MuiChip-filled": {
                          bgcolor: theme.palette.primary.main,
                        },
                      }}
                    />
                    {knowledgeAreas
                      .filter((area) => area !== "All")
                      .map((area) => (
                        <Chip
                          key={area}
                          label={area}
                          onClick={() => handleTagClick(area)}
                          color="primary"
                          variant={selectedTags.includes(area) ? "filled" : "outlined"}
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            fontWeight: 500,
                            "&.MuiChip-filled": {
                              bgcolor: theme.palette.primary.main,
                            },
                          }}
                        />
                      ))}
                  </Box>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Box>
      </Box>
    )
  }

  // Para pantallas móviles, mantenemos el diseño original
  return (
    <Grid container spacing={2}>
      {/* Test Setup - Primero en móviles */}
      <Grid item xs={12}>
        <Card sx={{ height: "100%" }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
              Test Settings
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography gutterBottom>Mode:</Typography>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <ToggleButtonGroup
                  value={testType}
                  exclusive
                  onChange={handleTestTypeChange}
                  aria-label="test mode"
                  sx={{ width: "100%", maxWidth: 400 }}
                >
                  <ToggleButton
                    value="practice"
                    aria-label="practice mode"
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: "4px 0 0 4px",
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                      },
                    }}
                  >
                    <Tooltip title="Take your time, no timer, 5-50 questions, filter by categories">
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <SchoolIcon />
                        <Typography>Practice</Typography>
                      </Box>
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton
                    value="test"
                    aria-label="test mode"
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: "0 4px 4px 0",
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                      },
                    }}
                  >
                    <Tooltip title={`Timed test (${formatTime(estimatedMinutes)}), 5-180 questions, all categories`}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <AccessTimeIcon />
                        <Typography>Test</Typography>
                      </Box>
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              {testType === "test" && (
                <Typography align="center" variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                  Time limit: {formatTime(estimatedMinutes)} • All categories included
                </Typography>
              )}
              {testType === "practice" && (
                <Typography align="center" variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                  No time limit - take as long as you need
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography gutterBottom>
                Number of questions ({minQuestions}-{maxQuestions}):
              </Typography>
              <Box sx={{ px: 2, display: "flex", alignItems: "center" }}>
                <Slider
                  value={questionCount}
                  onChange={handleQuestionCountChange}
                  aria-labelledby="question-count-slider"
                  valueLabelDisplay="auto"
                  step={questionStepSize}
                  marks={
                    testType === "test"
                      ? [
                          { value: 5, label: "5" },
                          { value: 60, label: "60" },
                          { value: 120, label: "120" },
                          { value: 180, label: "180" },
                        ]
                      : undefined
                  }
                  min={minQuestions}
                  max={maxQuestions}
                />
                <Typography sx={{ ml: 2, minWidth: 30 }}>{questionCount}</Typography>
              </Box>
              {testType === "test" && questionCount >= 180 && (
                <Typography variant="body2" color="primary" sx={{ mt: 1, textAlign: "center" }}>
                  Full exam simulation ({questionCount} questions)
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleStartExam}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  width: "100%",
                  maxWidth: 300,
                }}
              >
                Start {testType === "test" ? "Exam" : "Practice"}
              </Button>
            </Box>

            {/* Mostrar categorías solo en modo práctica */}
            <Collapse in={testType === "practice"}>
              <Box>
                <Typography gutterBottom>Categories:</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Chip
                    key="All"
                    label="All"
                    onClick={() => handleTagClick("All")}
                    color="primary"
                    variant={selectedTags.includes("All") ? "filled" : "outlined"}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      fontWeight: 500,
                      "&.MuiChip-filled": {
                        bgcolor: theme.palette.primary.main,
                      },
                    }}
                  />
                  {knowledgeAreas
                    .filter((area) => area !== "All")
                    .map((area) => (
                      <Chip
                        key={area}
                        label={area}
                        onClick={() => handleTagClick(area)}
                        color="primary"
                        variant={selectedTags.includes(area) ? "filled" : "outlined"}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          fontWeight: 500,
                          "&.MuiChip-filled": {
                            bgcolor: theme.palette.primary.main,
                          },
                        }}
                      />
                    ))}
                </Box>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </Grid>

      {/* Daily Question - Segundo en móviles */}
      <Grid item xs={12}>
        <DailyQuestion />
      </Grid>
    </Grid>
  )
}

