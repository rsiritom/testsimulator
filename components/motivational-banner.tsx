"use client"

import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import IconButton from "@mui/material/IconButton"
import RefreshIcon from "@mui/icons-material/Refresh"
import FormatQuoteIcon from "@mui/icons-material/FormatQuote"
import { useTheme } from "@mui/material/styles"
import { useMotivationalQuotes } from "@/hooks/use-motivational-quotes"

export default function MotivationalBanner() {
  const theme = useTheme()
  const { quote, refreshQuote } = useMotivationalQuotes()
  const [animate, setAnimate] = useState(false)

  // Efecto de animación al cambiar la cita
  useEffect(() => {
    setAnimate(true)
    const timer = setTimeout(() => {
      setAnimate(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [quote])

  return (
    <Card
      sx={{
        mb: 4,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <FormatQuoteIcon sx={{ fontSize: 40, opacity: 0.8, transform: "rotate(180deg)", mr: 2 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 500,
                opacity: animate ? 0 : 1,
                transition: "opacity 0.5s ease",
                fontStyle: "italic",
              }}
            >
              {quote}
            </Typography>
          </Box>
          <IconButton
            onClick={refreshQuote}
            sx={{
              color: "white",
              opacity: 0.8,
              "&:hover": {
                opacity: 1,
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
            aria-label="Get new motivational quote"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </CardContent>
      {/* Elementos decorativos */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          bgcolor: "rgba(255, 255, 255, 0.1)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: "50%",
          bgcolor: "rgba(255, 255, 255, 0.05)",
        }}
      />
    </Card>
  )
}

