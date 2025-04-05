"use client"

import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Grid from "@mui/material/Grid"
import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useTheme } from "@mui/material/styles"
import { useMobile } from "@/hooks/use-mobile"
import { useTestHistory } from "@/hooks/use-test-history"
import { useExamSelection } from "@/hooks/use-exam-selection"
import DeleteIcon from "@mui/icons-material/Delete"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import CircularProgress from "@mui/material/CircularProgress"
import ResetButton from "./reset-button"
import PageWrapper from "@/components/layout/page-wrapper"
import dynamic from "next/dynamic"

// Importar el BackButton de forma dinámica para evitar problemas de SSR
const BackButton = dynamic(() => import("@/components/back-button"), { ssr: false })

export default function ResultsPage() {
  const { testHistory, clearTestHistory, isLoaded } = useTestHistory()
  const { selectedExam } = useExamSelection()
  const theme = useTheme()
  const isMobile = useMobile()
  const [chartData, setChartData] = useState<any[]>([])
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Asegurarse de que el componente esté montado antes de renderizar contenido que depende del cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset any invalid test history on first load
  useEffect(() => {
    // Check if we have the localStorage key but with invalid data
    if (typeof window !== "undefined") {
      const storedHistory = localStorage.getItem("pmp-test-history")
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory)
          // Check if the data looks suspicious (too many tests or perfect scores)
          if (
            parsedHistory.length > 100 ||
            (parsedHistory.length > 0 && parsedHistory.every((test) => test.score === 100))
          ) {
            // Clear the suspicious data
            localStorage.removeItem("pmp-test-history")
            window.location.reload() // Reload to reset the state
          }
        } catch (error) {
          // If we can't parse it, remove it
          localStorage.removeItem("pmp-test-history")
        }
      }
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      // Process test history for chart display
      const processedData = testHistory.map((test) => ({
        id: test.id,
        date: new Date(test.date).toLocaleDateString(),
        score: test.score,
        type: test.testType,
      }))

      setChartData(processedData)
    }
  }, [testHistory, isLoaded])

  // Calculate average score
  const averageScore =
    testHistory.length > 0 ? Math.round(testHistory.reduce((sum, test) => sum + test.score, 0) / testHistory.length) : 0

  // Get best score
  const bestScore = testHistory.length > 0 ? Math.max(...testHistory.map((test) => test.score)) : 0

  const handleClearHistory = () => {
    setConfirmClearOpen(true)
  }

  const confirmClearHistory = () => {
    clearTestHistory()
    setConfirmClearOpen(false)
  }

  const cancelClearHistory = () => {
    setConfirmClearOpen(false)
  }

  // Obtener el título según el examen seleccionado
  const getExamTitle = () => {
    if (!selectedExam) return "Test Results History"
    return selectedExam === "pmp" ? "PMP Test Results History" : "FCE Test Results History"
  }

  const content = !isLoaded ? (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
      <CircularProgress />
    </Box>
  ) : (
    <>
      {mounted && <BackButton />}
      <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            {getExamTitle()}
          </Typography>

          {testHistory.length > 0 && (
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClearHistory}>
              Clear History
            </Button>
          )}
        </Box>

        <Dialog
          open={confirmClearOpen}
          onClose={cancelClearHistory}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Clear Test History?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {selectedExam
                ? `This will permanently delete all your ${selectedExam.toUpperCase()} test history. This action cannot be undone. Are you sure you want to continue?`
                : "This will permanently delete all your test history. This action cannot be undone. Are you sure you want to continue?"}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelClearHistory} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmClearHistory} color="error" autoFocus>
              Clear History
            </Button>
          </DialogActions>
        </Dialog>

        {testHistory.length === 0 ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            {selectedExam
              ? `No ${selectedExam.toUpperCase()} test results found. Complete a test to see your results history.`
              : "No test results found. Complete a test to see your results history."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" gutterBottom>
                      Tests Taken
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {testHistory.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" gutterBottom>
                      Average Score
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {averageScore}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" gutterBottom>
                      Best Score
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {bestScore}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Score History
                </Typography>
                {chartData.length > 0 ? (
                  <Box sx={{ height: 400, width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 70,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          label={{
                            value: "Score (%)",
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: "middle" },
                          }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" name="Score (%)" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: "center", py: 4 }}>
                    No chart data available yet.
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Tests
                </Typography>
                <Box sx={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: isMobile ? "600px" : "auto",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          Date
                        </th>
                        <th
                          style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          Type
                        </th>
                        <th
                          style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          Questions
                        </th>
                        <th
                          style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {testHistory
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((test) => (
                          <tr key={test.id}>
                            <td
                              style={{
                                padding: "12px 16px",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              {new Date(test.date).toLocaleString()}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                textTransform: "capitalize",
                              }}
                            >
                              {test.testType}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              {test.totalQuestions}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                fontWeight: "bold",
                                color: test.score >= 70 ? theme.palette.success.main : theme.palette.error.main,
                              }}
                            >
                              {test.score}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          </>
        )}

        {/* Add the reset button */}
        <ResetButton />
      </Box>
    </>
  )

  return <PageWrapper examInProgress={false}>{content}</PageWrapper>
}

