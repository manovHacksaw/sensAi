"use client"

import Link from "next/link"

import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Quiz from "../_components/Quiz"

export default function MockInterviewPage() {
  return (
    <main className="container mx-auto py-8 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link href="/interview-preparation" className="inline-flex items-center mb-8">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Button>
        </Link>

        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Mock Interview</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Sharpen your interview skills with realistic, AI-powered technical questions 
              tailored to your industry. Get personalized feedback and identify areas 
              for improvement to ace your next interview!
            </p>
          </div>

          <Quiz />
        </div>
      </div>
    </main>
  )
}
