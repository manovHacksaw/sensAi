"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { format } from 'date-fns'
import { BookOpen, Calendar, ChevronRight, Clock, Trophy } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Assessment {
  id: string
  userId: string
  quizScore: number
  questions: any[]
  category: string
  improvementTip: string
  createdAt: Date
  updatedAt: Date
}

interface QuizListProps {
  assessments: Assessment[]
}

const QuizList: React.FC<QuizListProps> = ({ assessments }) => {
  const router = useRouter()
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (!assessments || assessments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Recent Quizzes</h2>
          <Button 
            onClick={() => router.push("/interview/mock")}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Start new quiz
          </Button>
        </div>
        
        <Alert>
          <AlertDescription>
            You haven't taken any quizzes yet. Start a new quiz to begin tracking your progress.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Sort assessments by date (newest first)
  const sortedAssessments = [...assessments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recent Quizzes</h2>
        <Button 
          onClick={() => router.push("/interview/mock")}
          className="flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Start new quiz
        </Button>
      </div>

      <div className="grid gap-4">
        {sortedAssessments.map((assessment) => (
          <Card 
            key={assessment.id}
            className="transition-all hover:border-primary cursor-pointer"
            onClick={() => {
              setSelectedQuiz(assessment.id)
              router.push(`/interview/results/${assessment.id}`)
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                      {assessment.category}
                    </Badge>
                    <div 
                      className={`w-3 h-3 rounded-full ${getScoreColor(assessment.quizScore)}`}
                      title={`Score: ${assessment.quizScore.toFixed(1)}%`}
                    />
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(assessment.createdAt), 'MMM d, yyyy')}
                    <Clock className="h-3 w-3 ml-2" />
                    {format(new Date(assessment.createdAt), 'h:mm a')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className={`h-5 w-5 ${assessment.quizScore >= 80 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                  <span className="text-xl font-bold">{assessment.quizScore.toFixed(1)}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {assessment.improvementTip || "No improvement tips available."}
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-end">
              <Button variant="ghost" size="sm" className="gap-1">
                View Details
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default QuizList
