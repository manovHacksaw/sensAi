import type React from "react"
import { Inter } from "next/font/google"
import { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'SensAI | Authenticate | Your AI Powered Career Coach',
  description: 'SensAI is an AI powered career coach that helps you find the right job for you.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className={`min-h-screen ${inter.className}`}>
      {children}
    </main>
  )
}