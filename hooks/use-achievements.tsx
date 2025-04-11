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
  targetCount?: number
  currentCount?: number
  completedLevels?: number
}

export interface AchievementsState {
  appUsageStreak: Achievement
  dailyQuestionStreak: Achievement
  testScoreThreshold: Achievement
  scoreThreshold: number
}

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
  nextLevel: 3,
  maxLevel: 3,
  currentLevel: 0,
  isCompleted: false,
  lastUnlocked: null,
  targetCount: 3,
  currentCount: 0,
  completedLevels: 0,
}

const DEFAULT_THRESHOLD = 60

export function useAchievements() {
  const { selectedExam } = useExamSelection()
  const examType = selectedExam || "pmp"

  const [appUsageStreak, setAppUsageStreak] = useLocalStorage(
    `global-achievement-app-usage`,
    defaultAppUsageStreak
  )

  const [dailyQuestionStreak, setDailyQuestionStreak] = useLocalStorage(
    `${examType}-achievement-daily-question`,
    defaultDailyQuestionStreak
  )

  const [testScoreThreshold, setTestScoreThreshold] = useLocalStorage(
    `${examType}-achievement-score-threshold`,
    defaultTestScoreThreshold
  )

  const [scoreThreshold, setScoreThreshold] = useLocalStorage(
    `${examType}-score-threshold`,
    DEFAULT_THRESHOLD
  )

  const { history: dailyQuestionHistory } = useDailyQuestion()
  const { testHistory } = useTestHistory()

  const processingTestResult = useRef(false)
  const lastProcessedTestId = useRef<string | null>(null)
  const initialLoadDone = useRef(false)
  const previousExamType = useRef<ExamType | null>(null)
  const descriptionUpdated = useRef(false)
  const appUsageCheckedToday = useRef(false)

  const achievements: AchievementsState = {
    appUsageStreak,
    dailyQuestionStreak,
    testScoreThreshold,
    scoreThreshold,
  }

  const descriptionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const logRef = useRef(false)

  useEffect(() => {
    if (descriptionUpdateTimeoutRef.current) {
      clearTimeout(descriptionUpdateTimeoutRef.current)
      descriptionUpdateTimeoutRef.current = null
    }

    if (initialLoadDone.current) {
      if (process.env.NODE_ENV === "development" && !logRef.current) {
        console.log(`Loaded score threshold for ${examType}: ${scoreThreshold}%`)
        logRef.current = true
        setTimeout(() => {
          logRef.current = false
        }, 5000)
      }

      if (previousExamType.current !== examType && !descriptionUpdated.current) {
        descriptionUpdateTimeoutRef.current = setTimeout(() => {
          setTestScoreThreshold((prev) => {
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

    return () => {
      if (descriptionUpdateTimeoutRef.current) {
        clearTimeout(descriptionUpdateTimeoutRef.current)
      }
    }
  }, [examType, scoreThreshold])

  useEffect(() => {
    const checkAppUsage = () => {
      if (appUsageCheckedToday.current) return

      const today = new Date().toISOString().split("T")[0]
      const lastUsageDate = localStorage.getItem(`global-last-usage-date`)

      if (lastUsageDate === today) {
        appUsageCheckedToday.current = true
        return
      }

      localStorage.setItem(`global-last-usage-date`, today)
      appUsageCheckedToday.current = true

      if (!lastUsageDate) {
        updateAppUsageStreak(1)
        return
      }

      const lastDate = new Date(lastUsageDate)
      const currentDate = new Date(today)
      const timeDiff = currentDate.getTime() - lastDate.getTime()
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24))

      if (dayDiff === 1) {
        updateAppUsageStreak(appUsageStreak.currentValue + 1)
      } else if (dayDiff > 1) {
        updateAppUsageStreak(1)
      }
    }

    checkAppUsage()
  }, [])

  useEffect(() => {
    if (dailyQuestionHistory && dailyQuestionHistory.length > 0) {
      const sortedHistory = [...dailyQuestionHistory].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )

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

  useEffect(() => {
    const handleDailyQuestionCorrect = (event) => {
      if (!event.detail) return

      const eventExamType = event.detail.examType
      const eventStreak = event.detail.streak

      if (typeof eventStreak !== "number" || !eventExamType) return

      if (eventExamType === examType) {
        updateDailyQuestionStreak(eventStreak)
      }
    }

    window.addEventListener("dailyQuestionCorrect", handleDailyQuestionCorrect)
    return () => window.removeEventListener("dailyQuestionCorrect", handleDailyQuestionCorrect)
  }, [examType])

  function updateAppUsageStreak(value: number) {
    const level = ACHIEVEMENT_LEVELS.findIndex((lvl) => value < lvl)
    const nextLevel = ACHIEVEMENT_LEVELS[level] || ACHIEVEMENT_LEVELS[ACHIEVEMENT_LEVELS.length - 1]

    setAppUsageStreak((prev) => ({
      ...prev,
      currentValue: value,
      nextLevel,
      currentLevel: level,
      isCompleted: value >= prev.maxLevel,
      lastUnlocked: new Date(),
    }))
  }

  function updateDailyQuestionStreak(value: number) {
    const level = ACHIEVEMENT_LEVELS.findIndex((lvl) => value < lvl)
    const nextLevel = ACHIEVEMENT_LEVELS[level] || ACHIEVEMENT_LEVELS[ACHIEVEMENT_LEVELS.length - 1]

    setDailyQuestionStreak((prev) => ({
      ...prev,
      currentValue: value,
      nextLevel,
      currentLevel: level,
      isCompleted: value >= prev.maxLevel,
      lastUnlocked: new Date(),
    }))
  }

  return {
    achievements,
    setScoreThreshold,
  }
}
