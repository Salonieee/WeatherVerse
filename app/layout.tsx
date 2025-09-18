import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "WeatherVerse - Your Personal Weather Companion",
  description:
    "Get real-time weather updates, smart clothing advice, travel planning, and voice-powered weather assistance for any city worldwide.",
  keywords: "weather, forecast, travel, voice assistant, clothing advice, weather app",
  authors: [{ name: "WeatherVerse Team" }],
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
