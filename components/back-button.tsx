"use client"
import { useState, useEffect } from "react"
import { IconButton } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useRouter } from "next/navigation"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Button from "@mui/material/Button"
import { useExamSelection } from "@/hooks/use-exam-selection"

interface BackButtonProps {
  examInProgress?: boolean
}

const BackButton = ({ examInProgress = false }: BackButtonProps) => {
  const router = useRouter()
  const { selectedExam } = useExamSelection()
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Solo ejecutar código relacionado con el router después de montar el componente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Modificar la función handleClick para simplificar la lógica
  const handleClick = () => {
    // Check if the exam is completed using the exam-specific key
    const examKey = `${selectedExam || "pmp"}-exam-completed`
    const examCompleted = typeof window !== "undefined" && localStorage.getItem(examKey) === "true"

    if (examInProgress && !examCompleted) {
      setConfirmDialogOpen(true)
    } else {
      navigateBack()
    }
  }

  // Modificar la función navigateBack para que siempre vaya a la página principal cuando examInProgress es true
  const navigateBack = () => {
    // Si estamos en un examen en progreso, siempre ir a la página principal
    if (examInProgress) {
      window.location.href = "/"
      return
    }

    // Para otros casos, mantener el comportamiento original
    try {
      window.history.back()

      // Como fallback, si después de un tiempo seguimos en la misma página,
      // redirigir a la página principal
      setTimeout(() => {
        if (
          window.location.pathname.includes("/results") ||
          window.location.pathname.includes("/flashcards") ||
          window.location.pathname.includes("/about")
        ) {
          window.location.href = "/"
        }
      }, 300)
    } catch (error) {
      console.error("Navigation error:", error)
      // Último recurso: navegación directa
      window.location.href = "/"
    }
  }

  const handleConfirmNavigation = () => {
    setConfirmDialogOpen(false)
    navigateBack()
  }

  const handleCancelNavigation = () => {
    setConfirmDialogOpen(false)
  }

  // No renderizar nada durante el renderizado del servidor
  if (!mounted) {
    return null
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 9999,
          bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(66, 66, 66, 0.9)" : "rgba(255, 255, 255, 0.9)"),
          boxShadow: 3,
          width: 40,
          height: 40,
          "&:hover": {
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(80, 80, 80, 0.9)" : "rgba(240, 240, 240, 0.9)"),
          },
        }}
        aria-label="back to test setup"
      >
        <ArrowBackIcon />
      </IconButton>

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelNavigation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Abandon current test?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You are in the middle of a test. If you navigate away, your progress will be lost. Are you sure you want to
            continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNavigation} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmNavigation} color="primary" autoFocus>
            Leave Test
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BackButton

