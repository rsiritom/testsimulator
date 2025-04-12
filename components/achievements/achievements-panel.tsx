"use client"

import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Collapse from "@mui/material/Collapse"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import { useAchievements } from "@/hooks/use-achievements"
import AchievementCard from "./achievement-card"
import ScoreThresholdSetting from "./score-threshold-setting"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import Tooltip from "@mui/material/Tooltip"

interface AchievementsPanelProps {
  defaultExpanded?: boolean
  forceExpanded?: boolean
  unlockedAchievementType?: string | null
}

export default function AchievementsPanel({
  defaultExpanded = false,
  forceExpanded = false,
  unlockedAchievementType = null,
}: AchievementsPanelProps) {
  const { achievements, newlyUnlocked, updateScoreThreshold } = useAchievements()
  const [expanded, setExpanded] = useState(defaultExpanded || forceExpanded)

  // Expand the panel when a new achievement is unlocked
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setExpanded(true)
    }
  }, [newlyUnlocked])

  // Expand the panel when forceExpanded prop changes
  useEffect(() => {
    if (forceExpanded) {
      setExpanded(true)
    }
  }, [forceExpanded])

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={toggleExpanded}
        >
          <Typography variant="h5" component="div">
            Achievements
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip
              title={achievements.appUsageStreak.isCompleted ? "App Usage Streak Completed" : "App Usage Streak"}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EmojiEventsIcon
                  color={achievements.appUsageStreak.currentLevel > 0 ? "primary" : "action"}
                  sx={{ fontSize: 24 }}
                />
              </Box>
            </Tooltip>
            <Tooltip
              title={
                achievements.dailyQuestionStreak.isCompleted
                  ? "Daily Question Streak Completed"
                  : "Daily Question Streak"
              }
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EmojiEventsIcon
                  color={achievements.dailyQuestionStreak.currentLevel > 0 ? "primary" : "action"}
                  sx={{ fontSize: 24 }}
                />
              </Box>
            </Tooltip>
            <Tooltip
              title={achievements.testScoreThreshold.isCompleted ? "Score Threshold Completed" : "Score Threshold"}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EmojiEventsIcon
                  color={achievements.testScoreThreshold.isCompleted ? "primary" : "action"}
                  sx={{ fontSize: 24 }}
                />
              </Box>
            </Tooltip>
          </Box>
          <Button
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expanded ? "Hide" : "Show"}
          </Button>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <AchievementCard
                  achievement={achievements.appUsageStreak}
                  isNewlyUnlocked={
                    newlyUnlocked.includes("appUsageStreak") || unlockedAchievementType === "appUsageStreak"
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <AchievementCard
                  achievement={achievements.dailyQuestionStreak}
                  isNewlyUnlocked={
                    newlyUnlocked.includes("dailyQuestionStreak") || unlockedAchievementType === "dailyQuestionStreak"
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <AchievementCard
                  achievement={achievements.testScoreThreshold}
                  isNewlyUnlocked={
                    newlyUnlocked.includes("testScoreThreshold") || unlockedAchievementType === "testScoreThreshold"
                  }
                  threshold={achievements.scoreThreshold}
                />
              </Grid>
            </Grid>

            <ScoreThresholdSetting threshold={achievements.scoreThreshold} updateScoreThreshold={updateScoreThreshold} />
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  )
}
