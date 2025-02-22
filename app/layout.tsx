import type React from "react"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import { Navbar } from "@/components/common/navbar"
import "./globals.css"
import { Footer } from "@/components/common/footer"
import {dark} from "@clerk/themes"

import {
  ClerkProvider
} from '@clerk/nextjs'
import { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'SensAI | Your AI Powered Carrer Coach ',
  description: 'SensAI is an AI powered career coach that helps you find the right job for you.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
    }}>
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers  attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
          <Navbar />
          {children}
          <Toaster richColors/>
          <Footer/>
        </Providers>

      </body>
    </html>
    </ClerkProvider>
  )
}

