"use client"

import { generateQuiz, saveQuiz } from "@/actions/interview"
import useFetch from "@/hooks/useFetch"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

interface SaveQuizResult {
  quizScore: number
  improvementTip: string
}

const Quiz = () => {
  const { loading: generatingQuiz, fn: generateQuizFn, data: quizData } = useFetch<QuizQuestion[]>(generateQuiz)
  const { loading: savingQuiz, fn: saveQuizFn, data: resultData } = useFetch<SaveQuizResult>(saveQuiz)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  // Start timer when quiz begins
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerActive && !showResults) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, showResults])

  const startQuiz = async () => {
    try {
      await generateQuizFn()
      setUserAnswers({})
      setCurrentQuestion(0)
      setShowResults(false)
      setTimeSpent(0)
      setTimerActive(true)
    } catch (error) {
      toast.error("Failed to generate quiz. Please try again.")
    }
  }

  const handleAnswer = (answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [currentQuestion]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < (quizData?.length || 0) - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrevious = () => {
    setCurrentQuestion((prev) => Math.max(0, prev - 1))
  }

  const handleFinish = async () => {
    try {
      setTimerActive(false)
      // Make sure we're passing the correct format of answers
      await saveQuizFn(userAnswers)
      setShowResults(true)
      toast.success("Quiz completed! Check your results.")
    } catch (error) {
      console.error("Error saving quiz:", error)
      toast.error("Failed to save quiz results. Please try again.")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  if (generatingQuiz) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p className="text-lg font-medium">Generating your personalized quiz...</p>
          <p className="text-sm text-muted-foreground mt-2">
            This may take a moment as we tailor questions to your profile
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!quizData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Technical Assessment</CardTitle>
          <CardDescription>Test your knowledge with personalized questions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12">
          <Trophy className="h-16 w-16 text-primary mb-6" />
          <p className="text-center mb-6 max-w-md">
            Take this quiz to assess your technical knowledge and get personalized improvement tips. Your results will
            help you identify areas to focus on.
          </p>
          <Button size="lg" onClick={startQuiz}>
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (showResults && resultData) {
    const correctAnswers = Object.entries(userAnswers).filter(
      ([index, answer]) => answer === quizData[Number(index)].correctAnswer,
    ).length
    const score = (correctAnswers / quizData.length) * 100

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Quiz Results
          </CardTitle>
          <CardDescription>Completed in {formatTime(timeSpent)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Score: {score.toFixed(1)}%</span>
              <span>
                {correctAnswers} of {quizData.length} correct
              </span>
            </div>
            <Progress value={score} className="h-3" />
          </div>

          {resultData.improvementTip && (
            <Alert className="bg-primary/10 border-primary/20">
              <AlertTitle className="font-medium">Improvement Tip</AlertTitle>
              <AlertDescription>{resultData.improvementTip}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 mt-6">
            <h3 className="font-semibold text-lg">Question Review</h3>
            {quizData.map((question, index) => {
              const userAnswer = userAnswers[index]
              const isCorrect = userAnswer === question.correctAnswer

              return (
                <div key={index} className="space-y-2 border rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">
                        {index + 1}. {question.question}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Your answer:</span> {userAnswer}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm">
                            <span className="font-medium">Correct answer:</span> {question.correctAnswer}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={startQuiz} className="w-full">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const currentQuestionData = quizData[currentQuestion]
  const progress = ((currentQuestion + 1) / quizData.length) * 100

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-lg">Technical Assessment</CardTitle>
          <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
            Time: {formatTime(timeSpent)}
          </div>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQuestion + 1} of {quizData.length}
            </span>
            <span>{progress.toFixed(0)}% Complete</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <h2 className="text-xl font-semibold">{currentQuestionData.question}</h2>

        <RadioGroup value={userAnswers[currentQuestion]} onValueChange={handleAnswer} className="space-y-3">
          {currentQuestionData.options.map((option, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center space-x-2 border rounded-lg p-3 transition-colors",
                userAnswers[currentQuestion] === option ? "border-primary bg-primary/5" : "hover:bg-muted/50",
              )}
              onClick={() => handleAnswer(option)}
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!userAnswers[currentQuestion] || savingQuiz}
          className="flex items-center gap-1"
        >
          {currentQuestion === quizData.length - 1 ? (
            savingQuiz ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Finish"
            )
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default Quiz

