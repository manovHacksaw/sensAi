"use client"

import { format } from "date-fns"
import type React from "react"
import { useEffect, useState } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, TrendingUp, TrendingDown } from "lucide-react"

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

interface PerformanceChartProps {
  assessments: Assessment[]
}

interface ChartData {
  date: string
  score: number
  formattedDate: string
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <Card className="border shadow-sm p-2 bg-background">
        <CardContent className="p-2">
          <p className="font-medium">{payload[0].payload.formattedDate}</p>
          <p className="text-primary font-semibold">Score: {payload[0].value?.toFixed(1)}%</p>
        </CardContent>
      </Card>
    )
  }

  return null
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ assessments }) => {
  const [chartData, setChartData] = useState<ChartData[] | null>(null)
  const [trend, setTrend] = useState<"up" | "down" | "neutral">("neutral")

  useEffect(() => {
    if (assessments && assessments.length > 0) {
      // Sort assessments by date
      const sortedAssessments = [...assessments].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )

      const formattedData: ChartData[] = sortedAssessments.map((assessment) => ({
        date: format(new Date(assessment.createdAt), "MM/dd"),
        formattedDate: format(new Date(assessment.createdAt), "MMMM d, yyyy"),
        score: assessment.quizScore,
      }))

      setChartData(formattedData)

      // Calculate trend
      if (formattedData.length >= 2) {
        const firstScore = formattedData[0].score
        const lastScore = formattedData[formattedData.length - 1].score

        if (lastScore > firstScore) {
          setTrend("up")
        } else if (lastScore < firstScore) {
          setTrend("down")
        } else {
          setTrend("neutral")
        }
      }
    }
  }, [assessments])

  if (!chartData || chartData.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>Complete at least one quiz to see your performance chart.</AlertDescription>
      </Alert>
    )
  }

  const averageScore = chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            {trend === "up" ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : trend === "down" ? (
              <TrendingDown className="h-5 w-5 text-red-500" />
            ) : (
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Overall Trend</p>
            <p className="font-medium">{trend === "up" ? "Improving" : trend === "down" ? "Declining" : "Stable"}</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <InfoIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="font-medium">{averageScore.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "#e5e7eb" }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "#e5e7eb" }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            name="Quiz Score"
            stroke="#8884d8"
            strokeWidth={2}
            activeDot={{ r: 8, strokeWidth: 2, stroke: "#fff" }}
            dot={{ strokeWidth: 2, r: 4, stroke: "#fff", fill: "#8884d8" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PerformanceChart

