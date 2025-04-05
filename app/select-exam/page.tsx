"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import { useExamSelection, type ExamType } from "@/hooks/use-exam-selection"

export default function SelectExamPage() {
  const router = useRouter()
  const { selectedExam, selectExam } = useExamSelection()
  const [localSelection, setLocalSelection] = useState<ExamType | null>(null)
  const [mounted, setMounted] = useState(false)

  // Asegurarse de que el componente esté montado antes de renderizar
  useEffect(() => {
    setMounted(true)
    // Inicializar la selección local con la selección guardada
    setLocalSelection(selectedExam)
  }, [selectedExam])

  const handleExamSelect = (exam: ExamType) => {
    setLocalSelection(exam)
  }

  const handleStart = () => {
    if (localSelection) {
      selectExam(localSelection)
      router.push("/")
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e0f7fa 0%, #fff8e1 100%)",
        padding: 3,
      }}
    >
      <Typography
        variant="h2"
        component="h1"
        sx={{
          mb: 6,
          fontWeight: 600,
          textAlign: "center",
          color: "#1a237e",
          fontSize: { xs: "2.5rem", md: "3.5rem" },
        }}
      >
        Select Your Exam
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 3,
          maxWidth: "1000px",
          mb: 6,
        }}
      >
        <Card
          onClick={() => handleExamSelect("pmp")}
          sx={{
            width: 180,
            height: 180,
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: localSelection === "pmp" ? "scale(1.05)" : "scale(1)",
            boxShadow: localSelection === "pmp" ? 8 : 2,
            border: localSelection === "pmp" ? "2px solid #00bcd4" : "none",
            "&:hover": {
              boxShadow: 5,
              transform: "scale(1.03)",
            },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
              PMP
            </Typography>
            <Typography variant="body1" color="text.secondary">
              PMP Exam
            </Typography>
          </CardContent>
        </Card>

        <Card
          onClick={() => handleExamSelect("fce")}
          sx={{
            width: 180,
            height: 180,
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: localSelection === "fce" ? "scale(1.05)" : "scale(1)",
            boxShadow: localSelection === "fce" ? 8 : 2,
            border: localSelection === "fce" ? "2px solid #00bcd4" : "none",
            "&:hover": {
              boxShadow: 5,
              transform: "scale(1.03)",
            },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
              FCE
            </Typography>
            <Typography variant="body1" color="text.secondary">
              First Certificate in English
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleStart}
        disabled={!localSelection}
        sx={{
          py: 1.5,
          px: 6,
          fontSize: "1.25rem",
          borderRadius: 50,
          minWidth: 200,
          boxShadow: 3,
          background: "linear-gradient(45deg, #0288d1 30%, #00bcd4 90%)",
          "&:hover": {
            boxShadow: 5,
          },
          "&.Mui-disabled": {
            background: "#e0e0e0",
            color: "#9e9e9e",
          },
        }}
      >
        Start
      </Button>
    </Box>
  )
}

