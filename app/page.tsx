"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ExamSimulator from "@/components/exam-simulator"
import ExamSetup from "@/components/exam-setup"
import PageWrapper from "@/components/layout/page-wrapper"
import AchievementsPanel from "@/components/achievements/achievements-panel"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import { useAchievements } from "@/hooks/use-achievements"
import { useExamSelection } from "@/hooks/use-exam-selection"

export default function Home() {
  const router = useRouter()
  const [examStarted, setExamStarted] = useState(false)
  const [questionCount, setQuestionCount] = useState(5)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [testType, setTestType] = useState("practice")
  const [examSubmitted, setExamSubmitted] = useState(false)
  const { newlyUnlocked } = useAchievements()
  const [shouldExpandAchievements, setShouldExpandAchievements] = useState(false)
  const [unlockedAchievementType, setUnlockedAchievementType] = useState<string | null>(null)
  const { selectedExam, isLoaded } = useExamSelection()
  const [mounted, setMounted] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(useState(false))

  // ADD a key to force re-mounting of the ExamSimulator component
  const [examKey, setExamKey] = useState(Date.now())

  // Asegurarse de que el componente esté montado antes de renderizar
  useEffect(() => {
    setMounted(true)
  }, [])

  // Asegurarse de que la navegación funcione correctamente en la página principal
  useEffect(() => {
    if (mounted && isLoaded && !selectedExam) {
      router.push("/select-exam")
    }
  }, [mounted, isLoaded, selectedExam, router])

  // Check if there's a completed exam flag
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Usar un key específico para cada tipo de examen
      const examKey = `${selectedExam || "pmp"}-exam-completed`
      const examCompleted = localStorage.getItem(examKey) === "true"
      if (examCompleted) {
        setExamSubmitted(true)
      }

      // Mark page as loaded after initial checks
      setPageLoaded(true)
    }
  }, [selectedExam])

  // Check if we should expand achievements panel based on newly unlocked achievements
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setShouldExpandAchievements(false)
      setUnlockedAchievementType(newlyUnlocked[0])

      // Reset after 10 seconds
      const timer = setTimeout(() => {
        setShouldExpandAchievements(false)
        setUnlockedAchievementType(null)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [newlyUnlocked])

  // Clear any previous exam data when the component mounts
  useEffect(() => {
    if (!examStarted) {
      // Clear any previous exam data from localStorage
      if (selectedExam) {
        // Usar un key específico para cada tipo de examen
        const examKey = `${selectedExam}-exam-answers`
        const submittedKey = `${selectedExam}-exam-submitted`
        const startTimeKey = `${selectedExam}-exam-start-time`
        const completedKey = `${selectedExam}-exam-completed`

        localStorage.removeItem(examKey)
        localStorage.removeItem(submittedKey)
        localStorage.removeItem(startTimeKey)
        localStorage.removeItem(completedKey)
      }
    }
  }, [examStarted, selectedExam])

  // Modificar el efecto que verifica los logros desbloqueados para asegurar
  // que se manejen correctamente para cada examen

  // Check for achievement unlocked flag in localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && !examStarted && pageLoaded && selectedExam) {
      // Verificar tanto los logros específicos del examen como los globales
      const examType = selectedExam || "pmp"

      // Verificar logros específicos del examen
      const examAchievementUnlocked = localStorage.getItem(`${examType}-achievement-unlocked`)
      const examAchievementType = localStorage.getItem(`${examType}-achievement-type-unlocked`)

      // Verificar logros globales
      const globalAchievementUnlocked = localStorage.getItem(`global-achievement-unlocked`)
      const globalAchievementType = localStorage.getItem(`global-achievement-type-unlocked`)

      console.log(`[HomePage] Checking achievements for ${examType}:`, {
        examAchievementUnlocked,
        examAchievementType,
        globalAchievementUnlocked,
        globalAchievementType,
      })

      if (examAchievementUnlocked === "true") {
        setShouldExpandAchievements(false)
        setUnlockedAchievementType(examAchievementType)

        // Clear the flags after reading them
        console.log('Removing localStorage items:', `${examType}-achievement-unlocked`, `${examType}-achievement-type-unlocked`);
        localStorage.removeItem(`${examType}-achievement-unlocked`)
        localStorage.removeItem(`${examType}-achievement-type-unlocked`)

        // Verificar si se han eliminado correctamente
        const achievementUnlocked = localStorage.getItem(`${examType}-achievement-unlocked`);
        const achievementTypeUnlocked = localStorage.getItem(`${examType}-achievement-type-unlocked`);
        
        if (!achievementUnlocked && !achievementTypeUnlocked) {
            console.log('Items removed successfully.');
        } else {
            console.log('Items not removed:', {
                achievementUnlocked,
                achievementTypeUnlocked,
            });
        }                     
        
        // Reset after 10 seconds
        const timer = setTimeout(() => {
          setShouldExpandAchievements(false)
          setUnlockedAchievementType(null)
        }, 1000)

        return () => clearTimeout(timer)
      } else if (globalAchievementUnlocked === "true") {
        setShouldExpandAchievements(false)
        setUnlockedAchievementType(globalAchievementType)

        // Clear the flags after reading them
        localStorage.removeItem(`global-achievement-unlocked`)
        localStorage.removeItem(`global-achievement-type-unlocked`)

        // Reset after 10 seconds
        const timer = setTimeout(() => {
          setShouldExpandAchievements(false)
          setUnlockedAchievementType(null)
        }, 1000)

        return () => clearTimeout(timer)
      }
    }
  }, [examStarted, pageLoaded, selectedExam])

  const handleStartExam = (count: number, tags: string[], type: string) => {
    // Limpiar cualquier dato de examen anterior de localStorage
    if (selectedExam) {
      // Usar un key específico para cada tipo de examen
      const examKey = `${selectedExam}-exam-answers`
      const submittedKey = `${selectedExam}-exam-submitted`
      const startTimeKey = `${selectedExam}-exam-start-time`
      const completedKey = `${selectedExam}-exam-completed`

      localStorage.removeItem(examKey)
      localStorage.removeItem(submittedKey)
      localStorage.removeItem(startTimeKey)
      localStorage.removeItem(completedKey)
    }

    console.log("Starting exam with tags:", tags) // Log para depuración
    console.log("Test type:", type) // Log para depuración
    console.log("Question count:", count) // Log para depuración

    // Actualizar el estado con la nueva configuración del examen
    setQuestionCount(count)
    setSelectedTags(tags)
    setTestType(type)
    setExamSubmitted(false)

    // Generar una nueva clave para forzar el remontaje del ExamSimulator
    setExamKey(Date.now())

    // Iniciar el examen
    setExamStarted(true)
  }

  // Asegurarse de que el botón de reinicio funcione correctamente
  const handleResetExam = () => {
    // Clear exam data from localStorage
    if (selectedExam) {
      // Usar un key específico para cada tipo de examen
      const examKey = `${selectedExam}-exam-answers`
      const submittedKey = `${selectedExam}-exam-submitted`
      const startTimeKey = `${selectedExam}-exam-start-time`
      const completedKey = `${selectedExam}-exam-completed`

      localStorage.removeItem(examKey)
      localStorage.removeItem(submittedKey)
      localStorage.removeItem(startTimeKey)
      localStorage.removeItem(completedKey)
    }

    // Generar una nueva clave para forzar el remontaje del ExamSimulator
    setExamKey(Date.now())

    setExamStarted(false)
    setExamSubmitted(false)
  }

  const handleExamSubmit = () => {
    setExamSubmitted(true)
  }

  // Only show the confirmation dialog if the exam is in progress but not submitted
  const examInProgress = examStarted && !examSubmitted

  // Mostrar un indicador de carga mientras se verifica la selección de examen
  if (!mounted || (isLoaded && !selectedExam)) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <PageWrapper examInProgress={examInProgress}>
      {!examStarted && (
        <Box sx={{ mb: 4 }}>
          <AchievementsPanel
            defaultExpanded={false}
            forceExpanded={shouldExpandAchievements}
            unlockedAchievementType={unlockedAchievementType}
          />
        </Box>
      )}

      {examStarted ? (
        <ExamSimulator
          key={examKey} // Add key to force re-mounting
          questionCount={questionCount}
          selectedTags={selectedTags}
          testType={testType}
          onReset={handleResetExam}
          onSubmit={handleExamSubmit}
        />
      ) : (
        <ExamSetup onStartExam={handleStartExam} />
      )}
    </PageWrapper>
  )
}
