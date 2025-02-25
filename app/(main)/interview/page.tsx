import { getAssessments } from "@/actions/interview"
import PerformanceChart from "./_components/PerformanceChart"
import QuizList from "./_components/QuizList"
import StatsCard from "./_components/StatsCard"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, BarChart3, ListChecks } from 'lucide-react'

export default async function InterviewPage() {
  const assessments = await getAssessments()

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Interview Assessment</h1>
        <p className="text-muted-foreground">
          Track your progress and improve your technical interview skills
        </p>
      </div>

      <Suspense fallback={<StatsCardSkeleton />}>
        <StatsCard assessments={assessments} />
      </Suspense>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <span>Quiz History</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Performance Trends
              </CardTitle>
              <CardDescription>
                Track your quiz scores over time to monitor your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ChartSkeleton />}>
                <PerformanceChart assessments={assessments} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Suspense fallback={<QuizListSkeleton />}>
            <QuizList assessments={assessments} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatsCardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="h-[250px] w-full" />
    </div>
  )
}

function QuizListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  )
}
