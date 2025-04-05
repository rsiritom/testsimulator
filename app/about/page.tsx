"use client"
import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Link from "@mui/material/Link"
import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import Divider from "@mui/material/Divider"
import LaunchIcon from "@mui/icons-material/Launch"
import { useTheme } from "@mui/material/styles"
import { useMobile } from "@/hooks/use-mobile"
import PageWrapper from "@/components/layout/page-wrapper"
import dynamic from "next/dynamic"

// Importar el BackButton de forma dinámica para evitar problemas de SSR
const BackButton = dynamic(() => import("@/components/back-button"), { ssr: false })

export default function AboutPage() {
  const theme = useTheme()
  const isMobile = useMobile()
  const [mounted, setMounted] = useState(false)

  // Asegurarse de que el componente esté montado antes de renderizar contenido que depende del cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <PageWrapper examInProgress={false}>
      {mounted && <BackButton />}
      <Box sx={{ maxWidth: 1000, mx: "auto", width: "100%" }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          About PMP Simulator
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h5" gutterBottom>
              Project Overview
            </Typography>
            <Typography variant="body1" paragraph>
              Testsimulator is a web application designed to help users prepare for a variety of language and professional certification exams. 
              It offers a realistic testing environment with practice questions tailored to each exam's format and subject areas. 
              The simulator provides an effective way to assess your knowledge and build confidence.
            </Typography>

            <Typography variant="body1" paragraph>
              Visit the live application at:{" "}
              <Link
                href="https://testsimulator-ebon.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: "inline-flex", alignItems: "center" }}
              >
                https://testsimulator-ebon.vercel.app/ <LaunchIcon sx={{ ml: 0.5, fontSize: "0.9rem" }} />
              </Link>
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom>
              Features
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" gutterBottom>
                    Practice Mode
                  </Typography>
                  <Typography variant="body2">
                    Study at your own pace without time pressure. Review answers and explanations as you go.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" gutterBottom>
                    Test Mode
                  </Typography>
                  <Typography variant="body2">
                    Simulate real exam conditions with timed tests to build your speed and confidence.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" gutterBottom>
                    Performance Tracking
                  </Typography>
                  <Typography variant="body2">
                    Monitor your progress with detailed test history and performance analytics.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" gutterBottom>
                    Flash Cards
                  </Typography>
                  <Typography variant="body2">
                    Review key concepts and test your knowledge with interactive flash cards.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom>
              Technology Stack
            </Typography>
            <Typography variant="body1" paragraph>
              This application is built with modern web technologies:
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={4} md={3}>
                <Box sx={{ textAlign: "center", p: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Next.js
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Box sx={{ textAlign: "center", p: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    React
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Box sx={{ textAlign: "center", p: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Material UI
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Box sx={{ textAlign: "center", p: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    TypeScript
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom>
              Disclaimer
            </Typography>
            <Typography variant="body2" paragraph>
              PMP® is a registered mark of the Project Management Institute, Inc.
              This application is not affiliated with or endorsed by PMI.
              The questions provided are for practice purposes only and may not reflect the actual PMP® exam content.
              
              FCE (First Certificate in English) is part of the Cambridge English Qualifications and is a trademark of the University of Cambridge.
              This application is not affiliated with or endorsed by Cambridge Assessment English.
              The practice materials included are for educational purposes only and may not match the official exam format or content.
            </Typography>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Button
                variant="contained"
                color="primary"
                href="https://testsimulator-ebon.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<LaunchIcon />}
              >
                Visit Live Application
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </PageWrapper>
  )
}

