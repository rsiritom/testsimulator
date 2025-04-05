"use client"

import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import AccessTimeIcon from "@mui/icons-material/AccessTime"

interface TimerProps {
  startTime?: number
  totalTime?: number
  isRunning: boolean
  isCountdown?: boolean
  onTimeUpdate: (elapsed: number) => void
  onTimeExpired?: () => void
}

export default function Timer({
  startTime,
  totalTime = 0,
  isRunning,
  isCountdown = false,
  onTimeUpdate,
  onTimeExpired,
}: TimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [remainingTime, setRemainingTime] = useState(totalTime)

  useEffect(() => {
    if (!startTime) return

    const calculateTime = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)

      setElapsedTime(elapsed)

      if (isCountdown) {
        const remaining = Math.max(0, totalTime - elapsed)
        setRemainingTime(remaining)

        // Notify parent component about time update
        onTimeUpdate(elapsed)

        // Check if time expired
        if (remaining === 0 && onTimeExpired) {
          onTimeExpired()
        }
      } else {
        // For count-up timer
        onTimeUpdate(elapsed)
      }
    }

    calculateTime()

    let intervalId
    if (isRunning) {
      intervalId = setInterval(calculateTime, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [startTime, isRunning, onTimeUpdate, isCountdown, totalTime, onTimeExpired])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":")
  }

  // Determine color based on remaining time (for countdown timer)
  const getTimerColor = () => {
    if (!isCountdown) return "white"

    const percentRemaining = (remainingTime / totalTime) * 100

    if (percentRemaining <= 10) return "#ff5252" // Red for last 10%
    if (percentRemaining <= 25) return "#ffab40" // Orange for last 25%
    return "white" // Default color
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        bgcolor: "primary.main",
        color: "white",
        p: 2,
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <AccessTimeIcon sx={{ mr: 1 }} />
      <Typography
        variant="h6"
        component="div"
        sx={{
          color: getTimerColor(),
          transition: "color 0.5s ease",
        }}
      >
        {isCountdown ? formatTime(remainingTime) : formatTime(elapsedTime)}
      </Typography>
    </Box>
  )
}

