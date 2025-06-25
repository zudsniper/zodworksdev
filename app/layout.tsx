import type React from "react"
import type { Metadata } from "next"
import { JetBrains_Mono, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ChatbotPopup from "@/components/chatbot-popup"
import { Toaster } from "@/components/ui/toaster"
import ScrollRateLimiter from "@/components/scroll-rate-limiter"
// Removed ApiStatusProvider and OfflineBanner imports

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "700"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "jason mcelhenney | software dev & ai tinkerer",
  description:
    "portfolio of jason mcelhenney. software development, ai, full-stack engineering, and other experiments.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} ${inter.variable} font-sans bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {/* ApiStatusProvider removed */}
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
            <Footer />
          </div>
          <ChatbotPopup />
          {/* OfflineBanner removed */}
          <Toaster />
          <ScrollRateLimiter />
        </ThemeProvider>
      </body>
    </html>
  )
}
