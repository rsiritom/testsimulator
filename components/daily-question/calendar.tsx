"use client"

import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { useTheme } from "@mui/material/styles"

interface CalendarProps {
  history: Array<{
    date: string
    answered: boolean
    correct: boolean
  }>
}

export default function QuestionCalendar({ history }: CalendarProps) {
  const theme = useTheme()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Array<Date | null>>([])

  // Generar los días del calendario para el mes actual
  useEffect(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Primer día del mes
    const firstDay = new Date(year, month, 1)
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0)

    // Día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
    const firstDayOfWeek = firstDay.getDay()

    // Crear array con los días del mes
    const days: Array<Date | null> = []

    // Añadir días vacíos para completar la primera semana
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Añadir los días del mes
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    setCalendarDays(days)
  }, [currentMonth])

  // Función para cambiar al mes anterior
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Función para cambiar al mes siguiente
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Formatear la fecha como YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0]
  }

  // Obtener el estado de una fecha específica
  const getDateStatus = (date: Date) => {
    const dateStr = formatDate(date)
    const entry = history.find((h) => h.date === dateStr)

    if (!entry || !entry.answered) {
      return null
    }

    return entry.correct ? "correct" : "incorrect"
  }

  // Verificar si una fecha es hoy
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Nombres de los días de la semana
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="button" sx={{ cursor: "pointer" }} onClick={prevMonth}>
          &lt;
        </Typography>
        <Typography variant="h6">
          {currentMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
        </Typography>
        <Typography variant="button" sx={{ cursor: "pointer" }} onClick={nextMonth}>
          &gt;
        </Typography>
      </Box>

      {/* Días de la semana - Ahora usando un Box con display flex para mejor alineación */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        {weekdays.map((day, index) => (
          <Box key={`weekday-${index}`} sx={{ width: "calc(100% / 7)", textAlign: "center" }}>
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Días del mes - Usando un contenedor flex para mejor alineación */}
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        {calendarDays.map((day, index) => (
          <Box
            key={`day-${index}`}
            sx={{
              width: "calc(100% / 7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 40,
              mb: 1,
            }}
          >
            {day && (
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 36,
                  width: 36,
                  borderRadius: "50%",
                  border: isToday(day) ? `2px solid ${theme.palette.primary.main}` : "none",
                  bgcolor: (() => {
                    const status = getDateStatus(day)
                    if (status === "correct") return theme.palette.success.main
                    if (status === "incorrect") return theme.palette.error.main
                    return "transparent"
                  })(),
                  color: (() => {
                    const status = getDateStatus(day)
                    if (status === "correct" || status === "incorrect") return "white"
                    return "inherit"
                  })(),
                }}
              >
                <Typography variant="body2">{day.getDate()}</Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              bgcolor: theme.palette.success.main,
              mr: 1,
            }}
          />
          <Typography variant="caption">Correct</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              bgcolor: theme.palette.error.main,
              mr: 1,
            }}
          />
          <Typography variant="caption">Incorrect</Typography>
        </Box>
      </Box>
    </Box>
  )
}

