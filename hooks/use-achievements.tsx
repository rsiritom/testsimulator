"use client"

import { useState, useEffect, useRef } from "react"
import { useLocalStorage } from "./use-local-storage"
import { useDailyQuestion } from "./use-daily-question"
import { useTestHistory } from "./use-test-history"
import { useExamSelection, type ExamType } from "./use-exam-selection"

// Define achievement levels (Fibonacci sequence)
export const ACHIEVEMENT_LEVELS = [3, 5, 8, 13, 21, 34]

export interface Achievement {
  id: string
  name: string
  description: string
  currentValue: number
  nextLevel: number
  maxLevel: number
  currentLevel: number
  isCompleted: boolean
  lastUnlocked: Date | null
  // For score threshold achievement
  targetCount?: number
  currentCount?: number
  // Para seguimiento de niveles completados
  completedLevels?: number
}

export interface AchievementsState {
  appUsageStreak: Achievement
  dailyQuestionStreak: Achievement
  testScoreThreshold: Achievement
  scoreThreshold: number
}

// Default achievement templates
const defaultAppUsageStreak: Achievement = {
  id: "app-usage-streak",
  name: "App Usage Streak",
  description: "Use the app for consecutive days",
  currentValue: 0,
  nextLevel: ACHIEVEMENT_LEVELS[0],
  maxLevel: ACHIEVEMENT_LEVELS[ACHIEVEMENT_LEVELS.length - 1],
  currentLevel: 0,
  isCompleted: false,
  lastUnlocked: null,
  completedLevels: 0,
}

const defaultDailyQuestionStreak: Achievement = {
  id: "daily-question-streak",
  name: "Daily Question Streak",
  description: "Answer daily questions correctly for consecutive days",
  currentValue: 0,
  nextLevel: ACHIEVEMENT_LEVELS[0],
  maxLevel: ACHIEVEMENT_LEVELS[ACHIEVEMENT_LEVELS.length - 1],
  currentLevel: 0,
  isCompleted: false,
  lastUnlocked: null,
  completedLevels: 0,
}

const defaultTestScoreThreshold: Achievement = {
  id: "test-score-threshold",
  name: "Score Threshold",
  description: "Complete 3 tests with scores above your target threshold",
  currentValue: 0,
  nextLevel: 3, // Need 3 tests above threshold
  maxLevel: 3,
  currentLevel: 0,
  isCompleted: false,
  lastUnlocked: null,
  targetCount: 3,
  currentCount: 0,
  completedLevels: 0,
}

// Default threshold value
const DEFAULT_THRESHOLD = 60

export function useAchievements() {
  const { selectedExam } = useExamSelection()
  const examType = selectedExam || "pmp" // Default to pmp if no exam selected

  // App Usage Streak es compartido entre exámenes - usar una clave global
  const [appUsageStreak, setAppUsageStreak] = useLocalStorage(`global-achievement-app-usage`, defaultAppUsageStreak)

  // Daily Question Streak es específico para cada examen
  const [dailyQuestionStreak, setDailyQuestionStreak] = useLocalStorage(
    `${examType}-achievement-daily-question`,
    defaultDailyQuestionStreak,
  )

  // Test Score Threshold es específico para cada examen
  const [testScoreThreshold, setTestScoreThreshold] = useLocalStorage(
    `${examType}-achievement-score-threshold`,
    defaultTestScoreThreshold,
  )

  // Usar una clave específica para cada tipo de examen para el umbral de puntuación
  const [scoreThreshold, setScoreThreshold] = useLocalStorage(`${examType}-score-threshold`, DEFAULT_THRESHOLD)

  // Get data from other hooks
  const { history: dailyQuestionHistory } = useDailyQuestion()
  const { testHistory } = useTestHistory()

  // State to track newly unlocked achievements for celebration
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])

  // Use refs to prevent infinite loops
  const processingTestResult = useRef(false)
  const lastProcessedTestId = useRef<string | null>(null)
  const initialLoadDone = useRef(false)
  const previousExamType = useRef<ExamType | null>(null)
  const descriptionUpdated = useRef(false)
  const appUsageCheckedToday = useRef(false)

  // Combined achievements object for the UI
  const achievements: AchievementsState = {
    appUsageStreak,
    dailyQuestionStreak,
    testScoreThreshold,
    scoreThreshold,
  }

  // Añadir un nuevo ref para controlar las actualizaciones de descripción
  const descriptionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debug logging - but limit it to avoid spamming the console
  const logRef = useRef(false)

  // Modificar el efecto que actualiza la descripción del logro
  useEffect(() => {
    // Evitar actualizaciones innecesarias si ya estamos en el proceso de actualización
    if (descriptionUpdateTimeoutRef.current) {
      clearTimeout(descriptionUpdateTimeoutRef.current)
      descriptionUpdateTimeoutRef.current = null
    }

    if (initialLoadDone.current) {
      // Reducir la frecuencia de los logs
      if (process.env.NODE_ENV === "development" && !logRef.current) {
        console.log(`Loaded score threshold for ${examType}: ${scoreThreshold}%`)
        logRef.current = true

        // Resetear el flag de log después de un tiempo
        setTimeout(() => {
          logRef.current = false
        }, 5000)
      }

      // Si el tipo de examen ha cambiado, actualizar la descripción del logro
      if (previousExamType.current !== examType && !descriptionUpdated.current) {
        // Usar un timeout para evitar múltiples actualizaciones
        descriptionUpdateTimeoutRef.current = setTimeout(() => {
          setTestScoreThreshold((prev) => {
            // Solo actualizar si la descripción no contiene ya el umbral actual
            if (!prev.description.includes(`(${scoreThreshold}%)`)) {
              return {
                ...prev,
                description: `Complete 3 tests with scores above your target threshold (${scoreThreshold}%)`,
              }
            }
            return prev
          })

          previousExamType.current = examType
          descriptionUpdated.current = true

          // Resetear la bandera después de un tiempo
          setTimeout(() => {
            descriptionUpdated.current = false
          }, 1000)

          descriptionUpdateTimeoutRef.current = null
        }, 300)
      }
    } else {
      initialLoadDone.current = true
      previousExamType.current = examType
    }

    // Limpiar el timeout al desmontar
    return () => {
      if (descriptionUpdateTimeoutRef.current) {
        clearTimeout(descriptionUpdateTimeoutRef.current)
      }
    }
  }, [examType, scoreThreshold])

  // Update app usage streak - check once per day - COMPARTIDO ENTRE EXÁMENES
  useEffect(() => {
    const checkAppUsage = () => {
      // Si ya verificamos hoy, no actualizar nuevamente
      if (appUsageCheckedToday.current) {
        return
      }

      const today = new Date().toISOString().split("T")[0]
      const lastUsageDate = localStorage.getItem(`global-last-usage-date`)

      // Si ya verificamos hoy, no actualizar nuevamente
      if (lastUsageDate === today) {
        appUsageCheckedToday.current = true
        return
      }

      // Update last usage date
      localStorage.setItem(`global-last-usage-date`, today)
      appUsageCheckedToday.current = true

      if (!lastUsageDate) {
        // First time using the app
        updateAppUsageStreak(1)
        return
      }

      const lastDate = new Date(lastUsageDate)
      const currentDate = new Date(today)

      // Calculate the difference in days
      const timeDiff = currentDate.getTime() - lastDate.getTime()
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24))

      if (dayDiff === 1) {
        // Consecutive day
        updateAppUsageStreak(appUsageStreak.currentValue + 1)
      } else if (dayDiff > 1) {
        // Streak broken
        updateAppUsageStreak(1)
      }
    }

    checkAppUsage()
  }, []) // Solo verificar una vez al cargar

  // Update daily question streak - ESPECÍFICO PARA CADA EXAMEN
  useEffect(() => {
    if (dailyQuestionHistory && dailyQuestionHistory.length > 0) {
      // Sort history by date (newest first)
      const sortedHistory = [...dailyQuestionHistory].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )

      // Count consecutive correct answers
      let streak = 0
      for (const entry of sortedHistory) {
        if (entry.answered && entry.correct) {
          streak++
        } else {
          break
        }
      }

      updateDailyQuestionStreak(streak)
    }
  }, [dailyQuestionHistory])

  // Modificar el listener del evento dailyQuestionCorrect para asegurar que
  // solo se procese para el examen correcto y que se actualice correctamente

  // Listen for daily question correct event
  useEffect(() => {
    const handleDailyQuestionCorrect = (event) => {
      if (!event.detail) return

      console.log(`[useAchievements] Received dailyQuestionCorrect event:`, event.detail)

      const eventExamType = event.detail.examType
      const eventStreak = event.detail.streak

      // Verificar que tenemos toda la información necesaria
      if (typeof eventStreak !== "number" || !eventExamType) {
        console.error("[useAchievements] Invalid dailyQuestionCorrect event:", event.detail)
        return
      }

      // Solo actualizar si el evento es para el examen actual
      if (eventExamType === examType) {
        console.log(`[useAchievements] Updating ${examType} daily question streak to ${eventStreak}`)
        updateDailyQuestionStreak(eventStreak)
      } else {
        console.log(
          `[useAchievements] Ignoring dailyQuestionCorrect event for ${eventExamType}, current exam is ${examType}`,
        )
      }
    }

    window.addEventListener("dailyQuestionCorrect", handleDailyQuestionCorrect)

    return () => {
      window.removeEventListener("dailyQuestionCorrect", handleDailyQuestionCorrect)
    }
  }, [examType]) // Añadir examType como dependencia

  // Update test score threshold achievement - ESPECÍFICO PARA CADA EXAMEN
  useEffect(() => {
    // Si el achievement ya está completado para este nivel, no actualizarlo
    if (testScoreThreshold.isCompleted && testScoreThreshold.currentCount >= 3) {
      return
    }

    if (testHistory && testHistory.length > 0) {
      // Count tests that meet the threshold
      const testsAboveThreshold = testHistory.filter((test) => test.score >= scoreThreshold).length

      // Log for debugging only in development and limit frequency
      if (process.env.NODE_ENV === "development") {
        console.log(`Tests above threshold (${scoreThreshold}%):`, testsAboveThreshold)
      }

      // Update only the test score threshold achievement
      updateTestScoreThresholdAchievement(testsAboveThreshold)
    }
  }, [testHistory, scoreThreshold])

  // Listen for new test results
  useEffect(() => {
    const handleTestResultSaved = (event) => {
      // Prevent processing the same test result multiple times
      if (processingTestResult.current) {
        return
      }

      // Si el achievement ya está completado para este nivel, no actualizarlo
      if (testScoreThreshold.isCompleted && testScoreThreshold.currentCount >= 3) {
        return
      }

      // Force refresh of achievements when a new test result is saved
      if (event.detail && typeof event.detail.score === "number") {
        const testId = event.detail.id || Date.now().toString()

        // Skip if we've already processed this test
        if (lastProcessedTestId.current === testId) {
          return
        }

        console.log("New test result detected:", event.detail)
        processingTestResult.current = true
        lastProcessedTestId.current = testId

        // Verificar que el resultado pertenece al examen actual
        if (event.detail.examType && event.detail.examType !== examType) {
          console.log(`Test result is for ${event.detail.examType}, current exam is ${examType}, ignoring`)
          processingTestResult.current = false
          return
        }

        // Check if the test meets the threshold
        if (event.detail.score >= scoreThreshold) {
          console.log(`Test score ${event.detail.score} meets threshold ${scoreThreshold}`)

          // Get current count and increment it
          const currentCount = (testScoreThreshold.currentCount || 0) + 1

          // Update only the test score threshold achievement
          updateTestScoreThresholdAchievement(currentCount)
        }

        // Reset the processing flag after a short delay
        setTimeout(() => {
          processingTestResult.current = false
        }, 500)
      }
    }

    window.addEventListener("testResultSaved", handleTestResultSaved)

    return () => {
      window.removeEventListener("testResultSaved", handleTestResultSaved)
    }
  }, [examType, scoreThreshold])

  // Function to update app usage streak - COMPARTIDO ENTRE EXÁMENES
  const updateAppUsageStreak = (newValue: number) => {
    // Si el valor actual es 3 y estamos incrementando, significa que completamos un nivel
    const completingLevel = appUsageStreak.currentValue === 3 && newValue > 3

    // Si estamos completando un nivel, incrementar el contador de niveles completados
    const completedLevels = completingLevel
      ? (appUsageStreak.completedLevels || 0) + 1
      : appUsageStreak.completedLevels || 0

    // Si estamos completando un nivel, reiniciar a 1 en lugar de incrementar
    const adjustedValue = completingLevel ? 1 : newValue

    // Find the next level
    let currentLevel = 0
    let nextLevel = ACHIEVEMENT_LEVELS[0]

    for (let i = 0; i < ACHIEVEMENT_LEVELS.length; i++) {
      if (adjustedValue >= ACHIEVEMENT_LEVELS[i]) {
        currentLevel = i + 1
        nextLevel = i < ACHIEVEMENT_LEVELS.length - 1 ? ACHIEVEMENT_LEVELS[i + 1] : ACHIEVEMENT_LEVELS[i]
      } else {
        break
      }
    }

    // Check if we've leveled up
    const hasLeveledUp = currentLevel > appUsageStreak.currentLevel || completingLevel

    // If leveled up, add to newly unlocked
    if (hasLeveledUp || (adjustedValue === 3 && !appUsageStreak.isCompleted)) {
      setNewlyUnlocked((prev) => [...prev, "appUsageStreak"])

      // Set flag to expand achievements panel when returning to main page
      localStorage.setItem(`global-achievement-unlocked`, "true")
      localStorage.setItem(`global-achievement-type-unlocked`, "appUsageStreak")

      // After 5 seconds, remove from newly unlocked
      setTimeout(() => {
        setNewlyUnlocked((prev) => prev.filter((id) => id !== "appUsageStreak"))
      }, 5000)
    }

    // Update the achievement
    setAppUsageStreak({
      ...appUsageStreak,
      currentValue: adjustedValue,
      currentLevel,
      nextLevel,
      isCompleted: adjustedValue >= 3,
      lastUnlocked: hasLeveledUp ? new Date() : appUsageStreak.lastUnlocked,
      completedLevels,
    })
  }

  // Function to update daily question streak - ESPECÍFICO PARA CADA EXAMEN
  const updateDailyQuestionStreak = (newValue: number) => {
    // Si el valor actual es 3 y estamos incrementando, significa que completamos un nivel
    const completingLevel = dailyQuestionStreak.currentValue === 3 && newValue > 3

    // Si estamos completando un nivel, incrementar el contador de niveles completados
    const completedLevels = completingLevel
      ? (dailyQuestionStreak.completedLevels || 0) + 1
      : dailyQuestionStreak.completedLevels || 0

    // Si estamos completando un nivel, reiniciar a 1 en lugar de incrementar
    const adjustedValue = completingLevel ? 1 : newValue

    // Find the next level
    let currentLevel = 0
    let nextLevel = ACHIEVEMENT_LEVELS[0]

    for (let i = 0; i < ACHIEVEMENT_LEVELS.length; i++) {
      if (adjustedValue >= ACHIEVEMENT_LEVELS[i]) {
        currentLevel = i + 1
        nextLevel = i < ACHIEVEMENT_LEVELS.length - 1 ? ACHIEVEMENT_LEVELS[i + 1] : ACHIEVEMENT_LEVELS[i]
      } else {
        break
      }
    }

    // Check if we've leveled up
    const hasLeveledUp = currentLevel > dailyQuestionStreak.currentLevel || completingLevel

    console.log('Entering to if...');
    // If leveled up, add to newly unlocked
    if (hasLeveledUp || (adjustedValue === 3 && !dailyQuestionStreak.isCompleted)) {
      console.log('Creando en localstorage dailyQuestionStreak desde use-achievements..'); 
      setNewlyUnlocked((prev) => [...prev, "dailyQuestionStreak"])
      // Set flag to expand achievements panel when returning to main page
      localStorage.setItem(`${examType}-achievement-unlocked`, "true")
      localStorage.setItem(`${examType}-achievement-type-unlocked`, "dailyQuestionStreak")
     
      
      // After 5 seconds, remove from newly unlocked
      setTimeout(() => {
        setNewlyUnlocked((prev) => prev.filter((id) => id !== "dailyQuestionStreak"))
      }, 5000)
    }

    // Update the achievement
    setDailyQuestionStreak({
      ...dailyQuestionStreak,
      currentValue: adjustedValue,
      currentLevel,
      nextLevel,
      isCompleted: adjustedValue >= 3,
      lastUnlocked: hasLeveledUp ? new Date() : dailyQuestionStreak.lastUnlocked,
      completedLevels,
    })
  }

  // Modificar la función updateTestScoreThresholdAchievement para evitar actualizaciones innecesarias
  const updateTestScoreThresholdAchievement = (count: number) => {
    // Si el contador actual ya es igual al nuevo contador, no hacer nada
    if (testScoreThreshold.currentCount === count) {
      return
    }

    const targetCount = 3
    const hasCompleted = count >= targetCount
    const hasLeveledUp = hasCompleted && !testScoreThreshold.isCompleted

    // Si estamos completando un nivel, incrementar el contador de niveles completados
    const completedLevels = hasLeveledUp
      ? (testScoreThreshold.completedLevels || 0) + 1
      : testScoreThreshold.completedLevels || 0

    // Si alcanzamos el objetivo y ya estaba completado, reiniciar a 1
    const adjustedCount = count > targetCount && testScoreThreshold.isCompleted ? 1 : count

    console.log('Entering to if 2');
    if (hasLeveledUp || (adjustedCount === 3 && !testScoreThreshold.isCompleted)) {
      const now = new Date();
      console.log('Creando en localstorage testScoreThreshold desde use-achievements..', now.toLocaleDateString(), now.toLocaleTimeString());
      //console.log('Creando en localstorage testScoreThreshold desde use-achievements..'); 
      setNewlyUnlocked((prev) => [...prev, "testScoreThreshold"])

      setTimeout(() => {
        setNewlyUnlocked((prev) => prev.filter((id) => id !== "testScoreThreshold"))
      }, 5000)
      // Set flag to expand achievements panel when returning to main page
      localStorage.setItem(`${examType}-achievement-unlocked`, "true")
      localStorage.setItem(`${examType}-achievement-type-unlocked`, "testScoreThreshold")

    }

    // Update the achievement
    setTestScoreThreshold({
      ...testScoreThreshold,
      currentValue: adjustedCount,
      currentCount: adjustedCount,
      currentLevel: hasCompleted ? 1 : 0,
      isCompleted: hasCompleted,
      lastUnlocked: hasLeveledUp ? new Date() : testScoreThreshold.lastUnlocked,
      completedLevels,
    })
  }

  // Function to update score threshold
  const updateScoreThreshold = (newThreshold: number) => {
    // Ensure threshold is between 10 and 100
    const validThreshold = Math.max(10, Math.min(100, newThreshold))

    // Only update if the threshold has changed
    if (validThreshold !== scoreThreshold) {
      // Update the threshold
      setScoreThreshold(validThreshold)

      // Reset ONLY the test score threshold achievement
      setTestScoreThreshold({
        ...defaultTestScoreThreshold,
        description: `Complete 3 tests with scores above your target threshold (${validThreshold}%)`,
        completedLevels: testScoreThreshold.completedLevels || 0, // Mantener los niveles completados
      })

      // Log the threshold change
      console.log(`Score threshold changed from ${scoreThreshold}% to ${validThreshold}% for ${examType}`)
      console.log("Score Threshold achievement reset to 0/3")
    }
  }

  return {
    achievements,
    newlyUnlocked,
    updateScoreThreshold,
  }
}
