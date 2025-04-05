"use client"

import { useState, useMemo, useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import { useTheme } from "@mui/material/styles"
import { useMobile } from "@/hooks/use-mobile"
import { useExamSelection } from "@/hooks/use-exam-selection"
import PageWrapper from "@/components/layout/page-wrapper"
import dynamic from "next/dynamic"

// Importar el BackButton de forma dinámica para evitar problemas de SSR
const BackButton = dynamic(() => import("@/components/back-button"), { ssr: false })

// Definir la interfaz para las flashcards
interface Flashcard {
  id: string
  question: string
  answer: string
  category: string
  created_at?: string
  related_question_id?: string | null
}

export default function FlashcardsPage() {
  const theme = useTheme()
  const isMobile = useMobile()
  const { selectedExam } = useExamSelection()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showAllCards, setShowAllCards] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  // Asegurarse de que el componente esté montado antes de renderizar contenido que depende del cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Cargar flashcards desde la API cuando cambia el examen seleccionado
  useEffect(() => {
    if (!mounted || !selectedExam) return

    const fetchFlashcards = async () => {
      setLoading(true)
      setError(null)

      try {
        // Determinar el nombre de la tabla según el examen seleccionado
        const tableName = selectedExam === "pmp" ? "pmp_flashcards" : "fce_flashcards"

        // Construir la URL con el parámetro table_name
        const url = `https://quientecrea.pythonanywhere.com/api/v1/flashcards/100?table_name=${tableName}`

        console.log(`Fetching flashcards from: ${url}`)

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setFlashcards(data)

        // Extraer categorías únicas de las flashcards
        const uniqueCategories = Array.from(new Set(data.map((card: Flashcard) => card.category)))
        setCategories(uniqueCategories)

        // Resetear el índice de la tarjeta actual y el estado de volteo
        setCurrentCardIndex(0)
        setIsFlipped(false)
        setSelectedCategories([])
        setShowAllCards(true)
      } catch (err) {
        console.error("Error fetching flashcards:", err)
        setError(err instanceof Error ? err.message : "Error desconocido al cargar las flashcards")
      } finally {
        setLoading(false)
      }
    }

    fetchFlashcards()
  }, [selectedExam, mounted])

  // Filter cards based on selected categories
  const filteredCards = useMemo(() => {
    if (showAllCards) {
      return flashcards
    }

    return flashcards.filter((card) => selectedCategories.includes(card.category))
  }, [selectedCategories, showAllCards, flashcards])

  const currentCard = filteredCards.length > 0 ? filteredCards[currentCardIndex % filteredCards.length] : null

  const handleNextCard = () => {
    setIsFlipped(false)
    if (filteredCards.length > 0) {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % filteredCards.length)
    }
  }

  const handlePrevCard = () => {
    setIsFlipped(false)
    if (filteredCards.length > 0) {
      setCurrentCardIndex((prevIndex) => (prevIndex === 0 ? filteredCards.length - 1 : prevIndex - 1))
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const toggleCategory = (category: string) => {
    if (category === "all") {
      // Alternar entre mostrar todas las tarjetas y ninguna
      setShowAllCards(!showAllCards)
      setSelectedCategories([])
    } else {
      // Si estamos mostrando todas las tarjetas y se selecciona una categoría específica,
      // cambiar al modo filtrado
      if (showAllCards) {
        setShowAllCards(false)
        setSelectedCategories([category])
      } else {
        // Alternar la categoría seleccionada
        if (selectedCategories.includes(category)) {
          const newCategories = selectedCategories.filter((c) => c !== category)
          // Si no hay categorías seleccionadas, mostrar todas las tarjetas
          if (newCategories.length === 0) {
            setShowAllCards(true)
          }
          setSelectedCategories(newCategories)
        } else {
          setSelectedCategories([...selectedCategories, category])
        }
      }
    }

    // Resetear a la primera tarjeta cuando se cambian los filtros
    setCurrentCardIndex(0)
    setIsFlipped(false)
  }

  // Obtener el título según el examen seleccionado
  const getTitle = () => {
    if (!selectedExam) return "Flash Cards"
    return selectedExam === "pmp" ? "PMP Flash Cards" : "FCE Flash Cards"
  }

  // Renderizar contenido de carga
  if (loading) {
    return (
      <PageWrapper examInProgress={false}>
        {mounted && <BackButton />}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading flash cards...
          </Typography>
        </Box>
      </PageWrapper>
    )
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <PageWrapper examInProgress={false}>
        {mounted && <BackButton />}
        <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      </PageWrapper>
    )
  }

  // Renderizar mensaje si no hay flashcards
  if (flashcards.length === 0) {
    return (
      <PageWrapper examInProgress={false}>
        {mounted && <BackButton />}
        <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
          <Alert severity="info">No flash cards available for this exam.</Alert>
        </Box>
      </PageWrapper>
    )
  }

  const content = (
    <>
      {mounted && <BackButton />}
      <Box sx={{ maxWidth: 1000, mx: "auto", width: "100%" }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          {getTitle()}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Filter by Category:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            <Chip
              key="all"
              label="All"
              onClick={() => toggleCategory("all")}
              color="primary"
              variant={showAllCards ? "filled" : "outlined"}
              sx={{
                borderRadius: 2,
                mb: 1,
                fontWeight: 500,
                "&.MuiChip-filled": {
                  bgcolor: theme.palette.primary.main,
                },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                onClick={() => toggleCategory(category)}
                color="primary"
                variant={!showAllCards && selectedCategories.includes(category) ? "filled" : "outlined"}
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

        {filteredCards.length === 0 ? (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" align="center" gutterBottom>
                No flash cards match the selected categories.
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Please select different categories or click "All" to see all cards.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Card container */}
            <Box sx={{ height: isMobile ? "400px" : "300px", mb: 4 }}>
              {/* Card wrapper with perspective */}
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  perspective: "1000px",
                  position: "relative",
                }}
              >
                {/* Flippable card */}
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.6s",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front side - Question */}
                  <Card
                    sx={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      backfaceVisibility: "hidden",
                      cursor: "pointer",
                      boxShadow: 3,
                    }}
                    onClick={handleFlip}
                  >
                    <CardContent
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        p: 4,
                      }}
                    >
                      <Typography variant="h6" align="center" gutterBottom>
                        Question:
                      </Typography>
                      <Typography
                        variant="body1"
                        align="center"
                        sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        {currentCard?.question}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, flexWrap: "wrap" }}>
                        <Chip
                          key={currentCard?.category}
                          label={currentCard?.category.charAt(0).toUpperCase() + currentCard?.category.slice(1)}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mx: 0.5, mb: 0.5 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Back side - Answer */}
                  <Card
                    sx={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      cursor: "pointer",
                      boxShadow: 3,
                    }}
                    onClick={handleFlip}
                  >
                    <CardContent
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        p: 4,
                        overflowY: "auto",
                      }}
                    >
                      <Typography variant="h6" align="center" gutterBottom>
                        Answer:
                      </Typography>
                      <Typography
                        variant="body1"
                        align="center"
                        sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        {currentCard?.answer}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <IconButton
                color="primary"
                onClick={handlePrevCard}
                sx={{ border: `1px solid ${theme.palette.primary.main}` }}
              >
                <ArrowBackIcon />
              </IconButton>

              <Button variant="contained" color="primary" startIcon={<FlipCameraAndroidIcon />} onClick={handleFlip}>
                {isFlipped ? "Show Question" : "Show Answer"}
              </Button>

              <IconButton
                color="primary"
                onClick={handleNextCard}
                sx={{ border: `1px solid ${theme.palette.primary.main}` }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>

            <Typography align="center" sx={{ mt: 2 }}>
              Card {currentCardIndex + 1} of {filteredCards.length}
            </Typography>
          </>
        )}
      </Box>
    </>
  )

  return <PageWrapper examInProgress={false}>{content}</PageWrapper>
}

