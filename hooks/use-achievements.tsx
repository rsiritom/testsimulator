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

  const [appUsageStreak, setAppUsageStreak] = useLocalStorage(`global-achievement-app-usage`, defaultAppUsageStreak)
  const [dailyQuestionStreak, setDailyQuestionStreak] = useLocalStorage(
    `${examType}-achievement-daily-question`,
    defaultDailyQuestionStreak,
  )
  const [testScoreThreshold, setTestScoreThreshold] = useLocalStorage(
    `${examType}-achievement-score-threshold`,
    defaultTestScoreThreshold,
  )

  const [scoreThreshold, setScoreThreshold] = useLocalStorage(`${examType}-score-threshold`, DEFAULT_THRESHOLD)

  const { history: dailyQuestionHistory } = useDailyQuestion()
  const { testHistory } = useTestHistory()

  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])
  const [showAchievementAnimation, setShowAchievementAnimation] = useState(false)

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

  useEffect(() => {
    if (initialLoadDone.current) {
      if (previousExamType.current !== examType && !descriptionUpdated.current) {
        descriptionUpdateTimeoutRef.current = setTimeout(() => {
          setTestScoreThreshold((prev) => ({
            ...prev,
            description: `Complete 3 tests with scores above your target threshold (${scoreThreshold}%)`,
          }));

          previousExamType.current = examType;
          descriptionUpdated.current = true;

          setTimeout(() => {
            descriptionUpdated.current = false;
          }, 1000);
        }, 300);
      }
    } else {
      initialLoadDone.current = true;
      previousExamType.current = examType;
    }

    return () => {
      if (descriptionUpdateTimeoutRef.current) {
        clearTimeout(descriptionUpdateTimeoutRef.current);
      }
    };
  }, [examType, scoreThreshold]);

  useEffect(() => {
    const checkAppUsage = () => {
      if (appUsageCheckedToday.current) {
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const lastUsageDate = localStorage.getItem(`global-last-usage-date`);

      if (lastUsageDate === today) {
        appUsageCheckedToday.current = true;
        return;
      }

      localStorage.setItem(`global-last-usage-date`, today);
      appUsageCheckedToday.current = true;

      if (!lastUsageDate) {
        updateAppUsageStreak(1);
        return;
      }

      const lastDate = new Date(lastUsageDate);
      const currentDate = new Date(today);
      const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

      if (dayDiff === 1) {
        updateAppUsageStreak(appUsageStreak.currentValue + 1);
      } else if (dayDiff > 1) {
        updateAppUsageStreak(1);
      }
    }

    checkAppUsage();
  }, []);

  useEffect(() => {
    if (dailyQuestionHistory && dailyQuestionHistory.length > 0) {
      const sortedHistory = [...dailyQuestionHistory].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      let streak = 0;
      for (const entry of sortedHistory) {
        if (entry.answered && entry.correct) {
          streak++;
        } else {
          break;
        }
      }

      updateDailyQuestionStreak(streak);
    }
  }, [dailyQuestionHistory]);

  useEffect(() => {
    const handleTestResultSaved = (event) => {
      if (processingTestResult.current) {
        return;
      }

      if (testScoreThreshold.isCompleted && testScoreThreshold.currentCount >= 3) {
        return;
      }

      if (event.detail && typeof event.detail.score === "number") {
        const testId = event.detail.id || Date.now().toString();

        if (lastProcessedTestId.current === testId) {
          return;
        }

        processingTestResult.current = true;
        lastProcessedTestId.current = testId;

        if (event.detail.examType && event.detail.examType !== examType) {
          processingTestResult.current = false;
          return;
        }

        if (event.detail.score >= scoreThreshold) {
          const currentCount = (testScoreThreshold.currentCount || 0) + 1;
          updateTestScoreThresholdAchievement(currentCount);
        }

        setTimeout(() => {
          processingTestResult.current = false;
        }, 500);
      }
    }

    window.addEventListener("testResultSaved", handleTestResultSaved);

    return () => {
      window.removeEventListener("testResultSaved", handleTestResultSaved);
    };
  }, [examType, scoreThreshold]);

  const updateAppUsageStreak = (newValue: number) => {
    const completingLevel = appUsageStreak.currentValue === 3 && newValue > 3;
    const completedLevels = completingLevel ? (appUsageStreak.completedLevels || 0) + 1 : appUsageStreak.completedLevels || 0;
    const adjustedValue = completingLevel ? 1 : newValue;

    let currentLevel = 0;
    let nextLevel = ACHIEVEMENT_LEVELS[0];

    for (let i = 0; i < ACHIEVEMENT_LEVELS.length; i++) {
      if (adjustedValue >= ACHIEVEMENT_LEVELS[i]) {
        currentLevel = i + 1;
        nextLevel = i < ACHIEVEMENT_LEVELS.length - 1 ? ACHIEVEMENT_LEVELS[i + 1] : ACHIEVEMENT_LEVELS[i];
      } else {
        break;
      }
    }

    const hasLeveledUp = currentLevel > appUsageStreak.currentLevel || completingLevel;

    if (hasLeveledUp && !appUsageStreak.isCompleted) {
      setNewlyUnlocked((prev) => [...prev, "appUsageStreak"]);
      setShowAchievementAnimation(true); // Set flag to show animation

      localStorage.setItem(`global-achievement-unlocked`, "true");
      localStorage.setItem(`global-achievement-type-unlocked`, "appUsageStreak");

      setTimeout(() => {
        setNewlyUnlocked((prev) => prev.filter((id) => id !== "appUsageStreak"));
      }, 5000);
    }

    setAppUsageStreak({
      ...appUsageStreak,
      currentValue: adjustedValue,
      currentLevel,
      nextLevel,
      isCompleted: adjustedValue >= 3,
      lastUnlocked: hasLeveledUp ? new Date() : appUsageStreak.lastUnlocked,
      completedLevels,
    });
  }

  const updateDailyQuestionStreak = (newValue: number) => {
    const completingLevel = dailyQuestionStreak.currentValue === 3 && newValue > 3;
    const completedLevels = completingLevel ? (dailyQuestionStreak.completedLevels || 0) + 1 : dailyQuestionStreak.completedLevels || 0;
    const adjustedValue = completingLevel ? 1 : newValue;

    let currentLevel = 0;
    let nextLevel = ACHIEVEMENT_LEVELS[0];

    for (let i = 0; i < ACHIEVEMENT_LEVELS.length; i++) {
      if (adjustedValue >= ACHIEVEMENT_LEVELS[i]) {
        currentLevel = i + 1;
        nextLevel = i < ACHIEVEMENT_LEVELS.length - 1 ? ACHIEVEMENT_LEVELS[i + 1] : ACHIEVEMENT_LEVELS[i];
      } else {
        break;
      }
    }

    const hasLeveledUp = currentLevel > dailyQuestionStreak.currentLevel || completingLevel;

    if (hasLeveledUp && !dailyQuestionStreak.isCompleted) {
      setNewlyUnlocked((prev) => [...prev, "dailyQuestionStreak"]);
      localStorage.setItem(`${examType}-achievement-unlocked`, "true");
      localStorage.setItem(`${examType}-achievement-type-unlocked`, "dailyQuestionStreak");

      setTimeout(() => {
        setNewlyUnlocked((prev) => prev.filter((id) => id !== "dailyQuestionStreak"));
      }, 5000);
    }

    setDailyQuestionStreak({
      ...dailyQuestionStreak,
      currentValue: adjustedValue,
      currentLevel,
      nextLevel,
      isCompleted: adjustedValue >= 3,
      lastUnlocked: hasLeveledUp ? new Date() : dailyQuestionStreak.lastUnlocked,
      completedLevels,
    });
  }

  const updateTestScoreThresholdAchievement = (count: number) => {
    if (testScoreThreshold.currentCount === count) {
      return;
    }

    const targetCount = 3;
    const hasCompleted = count >= targetCount;
    const hasLeveledUp = hasCompleted && !testScoreThreshold.isCompleted;

    const completedLevels = hasLeveledUp ? (testScoreThreshold.completedLevels || 0) + 1 : testScoreThreshold.completedLevels || 0;
    const adjustedCount = count > targetCount && testScoreThreshold.isCompleted ? 1 : count;

    if (hasLeveledUp && !testScoreThreshold.isCompleted) {
      setNewlyUnlocked((prev) => [...prev, "testScoreThreshold"]);
      setShowAchievementAnimation(true); // Set flag to show animation

      setTimeout(() => {
        setNewlyUnlocked((prev) => prev.filter((id) => id !== "testScoreThreshold"));
      }, 5000);

      localStorage.setItem(`${examType}-achievement-unlocked`, "true");
      localStorage.setItem(`${examType}-achievement-type-unlocked`, "testScoreThreshold");
    }

    setTestScoreThreshold({
      ...testScoreThreshold,
      currentValue: adjustedCount,
      currentCount: adjustedCount,
      currentLevel: hasCompleted ? 1 : 0,
      isCompleted: hasCompleted,
      lastUnlocked: hasLeveledUp ? new Date() : testScoreThreshold.lastUnlocked,
      completedLevels,
    });
  }

  const updateScoreThreshold = (newThreshold: number) => {
    const validThreshold = Math.max(10, Math.min(100, newThreshold));

    if (validThreshold !== scoreThreshold) {
      setScoreThreshold(validThreshold);

      setTestScoreThreshold({
        ...defaultTestScoreThreshold,
        description: `Complete 3 tests with scores above your target threshold (${validThreshold}%)`,
        completedLevels: testScoreThreshold.completedLevels || 0,
      });
    }
  }

  useEffect(() => {
    // Reset the achievement animation flag when navigating to the page
    setShowAchievementAnimation(false);
  }, [examType]); // Adjust dependencies as needed

  return {
    achievements,
    newlyUnlocked,
    updateScoreThreshold,
    showAchievementAnimation,
  }
}
