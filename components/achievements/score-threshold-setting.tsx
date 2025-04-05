"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Slider from "@mui/material/Slider"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import Button from "@mui/material/Button"
import Alert from "@mui/material/Alert"
import { useTheme } from "@mui/material/styles"
import { useExamSelection } from "@/hooks/use-exam-selection"

interface ScoreThresholdSettingProps {
  threshold: number
  onUpdateThreshold: (newThreshold: number) => void
}

export default function ScoreThresholdSetting({ threshold, onUpdateThreshold }: ScoreThresholdSettingProps) {
  const theme = useTheme()
  const { selectedExam } = useExamSelection()
  const [value, setValue] = useState(threshold)
  const [isEditing, setIsEditing] = useState(false)
  const [showResetAlert, setShowResetAlert] = useState(false)
  const [originalThreshold, setOriginalThreshold] = useState(threshold)
  const previousExamRef = useRef(selectedExam)
  const previousThresholdRef = useRef(threshold)
  // Modificar el componente para evitar actualizaciones innecesarias

  // Añadir un ref para controlar los cambios de umbral
  const thresholdChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Modificar el useEffect para evitar actualizaciones innecesarias
  useEffect(() => {
    // Si hay un timeout pendiente, cancelarlo
    if (thresholdChangeTimeoutRef.current) {
      clearTimeout(thresholdChangeTimeoutRef.current)
      thresholdChangeTimeoutRef.current = null
    }

    // Si el examen ha cambiado o el umbral ha cambiado, actualizar el valor
    if (previousExamRef.current !== selectedExam || previousThresholdRef.current !== threshold) {
      // Usar un timeout para evitar múltiples actualizaciones
      thresholdChangeTimeoutRef.current = setTimeout(() => {
        setValue(threshold)
        setOriginalThreshold(threshold)
        previousExamRef.current = selectedExam
        previousThresholdRef.current = threshold

        thresholdChangeTimeoutRef.current = null
      }, 300)
    }

    // Limpiar el timeout al desmontar
    return () => {
      if (thresholdChangeTimeoutRef.current) {
        clearTimeout(thresholdChangeTimeoutRef.current)
      }
    }
  }, [threshold, selectedExam])

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseInt(event.target.value)
    if (!isNaN(newValue)) {
      setValue(Math.max(10, Math.min(100, newValue)))
    }
  }

  const handleSave = () => {
    // Only show reset alert if the threshold is changing
    if (value !== originalThreshold) {
      setShowResetAlert(true)
    } else {
      setIsEditing(false)
    }
  }

  const confirmThresholdChange = () => {
    // Solo actualizar si el valor ha cambiado realmente
    if (value !== originalThreshold) {
      onUpdateThreshold(value)
      setOriginalThreshold(value)
    }
    setShowResetAlert(false)
    setIsEditing(false)
  }

  const cancelThresholdChange = () => {
    setShowResetAlert(false)
  }

  return (
    <Box sx={{ mt: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Score Threshold Setting for {selectedExam?.toUpperCase() || "PMP"}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Set your target score threshold for the achievement (10-100%)
      </Typography>

      {isEditing ? (
        <>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Slider
              value={value}
              onChange={handleSliderChange}
              aria-labelledby="score-threshold-slider"
              valueLabelDisplay="auto"
              step={5}
              marks
              min={10}
              max={100}
              sx={{ mr: 2, flexGrow: 1 }}
            />
            <TextField
              value={value}
              onChange={handleInputChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{
                min: 10,
                max: 100,
                type: "number",
                "aria-labelledby": "score-threshold-input",
              }}
              sx={{ width: 100 }}
            />
          </Box>

          {showResetAlert && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <>
                  <Button color="inherit" size="small" onClick={cancelThresholdChange} sx={{ mr: 1 }}>
                    Cancel
                  </Button>
                  <Button color="warning" size="small" onClick={confirmThresholdChange}>
                    Reset Progress
                  </Button>
                </>
              }
            >
              Changing the threshold will reset your progress to 0/3 for {selectedExam?.toUpperCase() || "PMP"}.
              Continue?
            </Alert>
          )}

          {!showResetAlert && (
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setValue(originalThreshold)
                  setIsEditing(false)
                }}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography>
            Current threshold for {selectedExam?.toUpperCase() || "PMP"}: <strong>{threshold}%</strong>
          </Typography>
          <Button variant="outlined" size="small" onClick={() => setIsEditing(true)}>
            Change
          </Button>
        </Box>
      )}
    </Box>
  )
}

