"use client"

import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import LinearProgress from "@mui/material/LinearProgress"
import Tooltip from "@mui/material/Tooltip"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import { useTheme } from "@mui/material/styles"
import { type Achievement, ACHIEVEMENT_LEVELS } from "@/hooks/use-achievements"
import Confetti from "react-confetti"
import { useMobile } from "@/hooks/use-mobile"
import Alert from "@mui/material/Alert"
import { useExamSelection } from "@/hooks/use-exam-selection"

interface AchievementCardProps {
  achievement: Achievement
  isNewlyUnlocked: boolean
  threshold?: number
}

export default function AchievementCard({ achievement, isNewlyUnlocked, threshold }: AchievementCardProps) {
  const theme = useTheme()
  const isMobile = useMobile()
  const [showConfetti, setShowConfetti] = useState(false)
  const { selectedExam } = useExamSelection()

  // Log para depuración
  useEffect(() => {
    console.log(`[AchievementCard] Rendering ${achievement.id} for ${selectedExam}:`, {
      currentValue: achievement.currentValue,
      isCompleted: achievement.isCompleted,
      isNewlyUnlocked,
    })
  }, [achievement, isNewlyUnlocked, selectedExam])

  // Show confetti when achievement is newly unlocked
  useEffect(() => {
    const confettiShownKey = `confetti-shown-${achievement.id}`
    const confettiShown = localStorage.getItem(confettiShownKey)

    if (isNewlyUnlocked && !confettiShown) {
      setShowConfetti(true)
      localStorage.setItem(confettiShownKey, "true")
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isNewlyUnlocked, achievement.id])

  // Calculate progress percentage
  const calculateProgress = () => {
    // Special case for score threshold achievement
    if (achievement.id === "test-score-threshold") {
      const targetCount = achievement.targetCount || 3
      const currentCount = achievement.currentCount || 0
      return Math.min(100, (currentCount / targetCount) * 100)
    }

    if (achievement.isCompleted) return 100

    const prevLevel = achievement.currentLevel > 0 ? ACHIEVEMENT_LEVELS[achievement.currentLevel - 1] : 0

    const progressInCurrentLevel = achievement.currentValue - prevLevel
    const rangeInCurrentLevel = achievement.nextLevel - prevLevel

    return Math.min(100, (progressInCurrentLevel / rangeInCurrentLevel) * 100)
  }

  const progress = calculateProgress()

  // Format the achievement level display
  const formatLevelDisplay = () => {
    // Special case for score threshold achievement
    if (achievement.id === "test-score-threshold") {
      const targetCount = achievement.targetCount || 3
      const currentCount = achievement.currentCount || 0
      return `${currentCount}/${targetCount}`
    }

    if (achievement.isCompleted) {
      return `${achievement.currentValue}/${achievement.nextLevel}`
    }

    return `${achievement.currentValue}/${achievement.nextLevel}`
  }

  return (
    <Card
      sx={{
        position: "relative",
        overflow: "visible",
        transition: "transform 0.3s ease",
        transform: isNewlyUnlocked ? "scale(1.05)" : "scale(1)",
        boxShadow: isNewlyUnlocked ? `0 0 20px ${theme.palette.primary.main}` : undefined,
      }}
    >
      {showConfetti && (
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: "none" }}>
          <Confetti width={isMobile ? 300 : 400} height={200} recycle={false} numberOfPieces={200} gravity={0.2} />
        </Box>
      )}

      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <EmojiEventsIcon
            color={
              achievement.currentLevel > 0 || (achievement.id === "test-score-threshold" && achievement.isCompleted)
                ? "primary"
                : "action"
            }
            sx={{ mr: 1, fontSize: 28 }}
          />
          <Typography variant="h6" comp>
            {achievement.name}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {achievement.id === "test-score-threshold" && threshold
            ? `${achievement.description} (${threshold}%)`
            : achievement.description}
        </Typography>

        {isNewlyUnlocked && achievement.id === "test-score-threshold" && achievement.isCompleted && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Congratulations! You've completed 3 tests above your threshold of {threshold}%!
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            <Tooltip title={`${Math.round(progress)}% to next level`}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: achievement.isCompleted ? theme.palette.success.main : theme.palette.primary.main,
                  },
                }}
              />
            </Tooltip>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {formatLevelDisplay()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
