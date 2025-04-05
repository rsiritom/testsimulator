"use client"

import { useState } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import { useTestHistory } from "@/hooks/use-test-history"
import { useExamSelection } from "@/hooks/use-exam-selection"
import Box from "@mui/material/Box"

export default function ResetButton() {
  const { resetTestHistory, allTestHistory } = useTestHistory()
  const { selectedExam } = useExamSelection()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [debugOpen, setDebugOpen] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  const handleReset = () => {
    setConfirmOpen(true)
  }

  const confirmReset = () => {
    resetTestHistory()
    setConfirmOpen(false)
  }

  const cancelReset = () => {
    setConfirmOpen(false)
  }

  const handleDebug = () => {
    try {
      // Mostrar todos los resultados y destacar los del examen actual
      const filteredHistory = allTestHistory.map((item) => ({
        ...item,
        isCurrentExam: !selectedExam || item.examType === selectedExam || (selectedExam === "pmp" && !item.examType),
      }))

      setDebugInfo(JSON.stringify(filteredHistory, null, 2) || "No test history found")
      setDebugOpen(true)
    } catch (error) {
      setDebugInfo(`Error: ${error.message}`)
      setDebugOpen(true)
    }
  }

  return (
    <>
      <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000, display: "flex", gap: 2 }}>
        <Button variant="outlined" color="info" onClick={handleDebug}>
          Debug History
        </Button>
        <Button variant="outlined" color="warning" onClick={handleReset}>
          Reset History
        </Button>
      </Box>

      <Dialog open={confirmOpen} onClose={cancelReset}>
        <DialogTitle>Reset Test History?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedExam
              ? `This will completely reset the ${selectedExam.toUpperCase()} test history storage. This is intended for development purposes only.`
              : "This will completely reset the test history storage. This is intended for development purposes only."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelReset}>Cancel</Button>
          <Button onClick={confirmReset} color="warning">
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={debugOpen} onClose={() => setDebugOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedExam ? `${selectedExam.toUpperCase()} Test History Debug Info` : "Test History Debug Info"}
        </DialogTitle>
        <DialogContent>
          <pre style={{ whiteSpace: "pre-wrap", overflow: "auto", maxHeight: "400px" }}>{debugInfo}</pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDebugOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

