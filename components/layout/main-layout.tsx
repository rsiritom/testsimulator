"use client"

import { type ReactNode, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import { useTheme } from "@mui/material/styles"
import { useMobile } from "@/hooks/use-mobile"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Button from "@mui/material/Button"
import { useExamSelection } from "@/hooks/use-exam-selection"
import SettingsIcon from "@mui/icons-material/Settings"
import AssignmentIcon from "@mui/icons-material/Assignment"
import InfoIcon from "@mui/icons-material/Info"
import BarChartIcon from "@mui/icons-material/BarChart"
import MenuBookIcon from "@mui/icons-material/MenuBook"

const drawerWidth = 250

const menuItems = [
  { text: "Select Exam", path: "/select-exam", icon: <AssignmentIcon /> },
  { text: "Test Setup", path: "/", icon: <SettingsIcon /> },
  { text: "Test Results", path: "/results", icon: <BarChartIcon /> },
  { text: "Flash Cards", path: "/flashcards", icon: <MenuBookIcon /> },
  { text: "About", path: "/about", icon: <InfoIcon /> },
]

interface MainLayoutProps {
  children: ReactNode
  darkMode: boolean
  toggleDarkMode: () => void
  examInProgress?: boolean
}

export default function MainLayout({ children, darkMode, toggleDarkMode, examInProgress = false }: MainLayoutProps) {
  const theme = useTheme()
  const isMobile = useMobile()
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState("")
  const [isExamCompleted, setIsExamCompleted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { selectedExam } = useExamSelection()
  const [activePath, setActivePath] = useState("")

  useEffect(() => {
    setMounted(true)
    setActivePath(window.location.pathname)
  }, [])

  useEffect(() => {
    const checkExamStatus = () => {
      if (typeof window !== "undefined") {
        const examKey = `${selectedExam || "pmp"}-exam-completed`
        const examCompleted = localStorage.getItem(examKey) === "true"
        setIsExamCompleted(examCompleted)
      }
    }

    checkExamStatus()
    window.addEventListener("storage", checkExamStatus)
    window.addEventListener("examStatusChanged", checkExamStatus)

    return () => {
      window.removeEventListener("storage", checkExamStatus)
      window.removeEventListener("examStatusChanged", checkExamStatus)
    }
  }, [selectedExam])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleNavigation = (path: string) => {
    if (examInProgress && !isExamCompleted) {
      setPendingNavigation(path)
      setConfirmDialogOpen(true)
      if (isMobile) {
        setMobileOpen(false)
      }
      return
    }

    window.location.href = path
    setActivePath(path)

    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const handleConfirmNavigation = () => {
    setConfirmDialogOpen(false)
    if (pendingNavigation) {
      window.location.href = pendingNavigation
      setActivePath(pendingNavigation)
      setPendingNavigation("")
    }
  }

  const handleCancelNavigation = () => {
    setConfirmDialogOpen(false)
    setPendingNavigation("")
  }

  const getTitle = () => {
    if (!selectedExam) return "Exam Simulator"
    return selectedExam === "pmp" ? "Simulator PMP" : "Simulator FCE"
  }

  const drawer = (
    <Box role="navigation" aria-label="Main Navigation">
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: isMobile ? "space-between" : "flex-end",
          alignItems: "center",
        }}
      >
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} aria-label="Close menu">
            <CloseIcon />
          </IconButton>
        )}
        <IconButton onClick={toggleDarkMode} aria-label="Toggle dark mode">
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>
      <List sx={{ mt: 4 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                backgroundColor: activePath === item.path ? theme.palette.action.selected : "inherit",
                "&:hover": {
                  bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
                },
              }}
              aria-label={item.text}
            >
              <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>{item.icon}</Box>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "1.1rem",
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  if (!mounted) {
    return null
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Dialog
        open={confirmDialogOpen}
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

      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: "none",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                {getTitle()}
              </Typography>
            </Box>
            <IconButton onClick={toggleDarkMode} color="inherit" edge="end">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: theme.palette.mode === "dark" ? "#1a1a2e" : "#f0f0f0",
              borderRight: "none",
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
             "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: theme.palette.mode === "dark" ? "#1a1a2e" : "#f0f0f0",
              borderRight: "none",
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          mt: isMobile ? "64px" : 0,
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          align="center"
          sx={{
            my: { xs: 2, md: 4 },
            fontWeight: 500,
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
          }}
        >
          {getTitle()}
        </Typography>
        {children}
      </Box>
    </Box>
  )
}
