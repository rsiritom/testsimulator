"use client"

import type { ReactNode } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import Box from "@mui/material/Box"
import MainLayout from "@/components/layout/main-layout"
import { useThemeMode } from "@/hooks/use-theme-mode"

interface PageWrapperProps {
  children: ReactNode
  examInProgress?: boolean
}

export default function PageWrapper({ children, examInProgress = false }: PageWrapperProps) {
  const { darkMode, toggleDarkMode } = useThemeMode()

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#00bcd4",
      },
      secondary: {
        main: "#f50057",
      },
      background: {
        default: darkMode ? "#1e1e2f" : "#f5f5f5",
        paper: darkMode ? "#252547" : "#ffffff",
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: "2.5rem",
        fontWeight: 500,
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 50,
            textTransform: "none",
            padding: "10px 20px",
            fontSize: "1rem",
          },
          containedPrimary: {
            backgroundColor: "#00bcd4",
            "&:hover": {
              backgroundColor: "#00a0b7",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: "0 4px 20px 0 rgba(0,0,0,0.12)",
          },
        },
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} examInProgress={examInProgress}>
        <Box sx={{ width: "100%", height: "100%" }}>{children}</Box>
      </MainLayout>
    </ThemeProvider>
  )
}

