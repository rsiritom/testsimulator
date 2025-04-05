import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeModeProvider } from "@/hooks/use-theme-mode"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Exam Simulator",
  description: "Aplicación para practicar exámenes de certificación",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* Add this meta tag to prevent caching issues */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={inter.className}>
        <ThemeModeProvider>{children}</ThemeModeProvider>
      </body>
    </html>
  )
}



import './globals.css'