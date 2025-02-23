"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TrendingUp, Calendar, DollarSign, Briefcase, Award, TrendingDown, LineChart, Info, RefreshCcw } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'

// Utility type to make certain properties required. Useful when your API might return partial data.
type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };


interface SalaryRange {
  role: string
  min: number
  max: number
  median: number
  location: string
}

interface Insights {
  salaryRanges: SalaryRange[]
  growthRate: number
  demandLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  topSkills: string[]
  marketOutlook: 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE'
  keyTrends: string[]
  recommendedSkills: string[]
  industry: string
  lastUpdated: Date
  nextUpdate: Date
}

// Use `Require` to enforce that `insights` are always passed when not loading/erroring.  This makes the code safer.
interface DashboardViewProps {
  insights?: Insights
  isLoading?: boolean
  error?: string
}

const DashboardView = ({ insights, isLoading = false, error }: DashboardViewProps) => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  // Memoize helper functions to avoid recreating them on every render.  This is an important optimization for performance.
  const marketOutlookInfo = useMemo(() => {
    return (outlook?: 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE') => {
      switch (outlook) {
        case 'POSITIVE':
          return { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' }
        case 'NEUTRAL':
          return { icon: LineChart, color: 'text-amber-500', bg: 'bg-amber-50' }
        case 'NEGATIVE':
          return { icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50' }
        default:
          return { icon: LineChart, color: 'text-gray-500', bg: 'bg-gray-50' }
      }
    };
  }, []);

  const demandLevelInfo = useMemo(() => {
    return (level?: 'LOW' | 'MEDIUM' | 'HIGH') => {
      switch (level) {
        case 'HIGH':
          return { color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' }
        case 'MEDIUM':
          return { color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' }
        case 'LOW':
          return { color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' }
        default:
          return { color: 'bg-gray-500', text: 'text-gray-700', bg: 'bg-gray-50' }
      }
    };
  }, []);


  // Early return for error state
  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Unable to load dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  // Early return for loading state (important for performance and avoids unnecessary calculations)
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={`skeleton-metric-${i}`} className="transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6">
                <MetricSkeleton />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={`skeleton-skills-${i}`} className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                </CardTitle>
                <CardDescription><Skeleton className="h-4 w-40" /></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Skeleton key={`skeleton-skill-${j}`} className="h-6 w-20" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
            </CardTitle>
            <CardDescription><Skeleton className="h-4 w-40" /></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <Skeleton className="h-full w-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
            </CardTitle>
            <CardDescription><Skeleton className="h-4 w-40" /></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={`skeleton-trend-${i}`} className="h-6 w-32" />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-gray-50 p-4 sm:flex-row">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
    );
  }


  // Data processing outside the JSX for clarity and performance (using `useMemo` for caching)
  const salaryData = useMemo(() => {
    return insights?.salaryRanges.map((range) => ({
      name: range.role,
      min: range.min / 1000,
      max: range.max / 1000,
      median: range.median / 1000,
      location: range.location,
    })) ?? []; // Return empty array if insights or salaryRanges are undefined to avoid errors
  }, [insights?.salaryRanges]); // Only re-calculate when `insights?.salaryRanges` changes



  const OutlookIcon = marketOutlookInfo(insights?.marketOutlook).icon
  const { color: outlookColor, bg: outlookBg } = marketOutlookInfo(insights?.marketOutlook)

  const formattedIndustry = useMemo(() => {
    return insights?.industry.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "";
  }, [insights?.industry]);

  const lastUpdatedDate = useMemo(() => insights?.lastUpdated ? new Date(insights.lastUpdated) : new Date(), [insights?.lastUpdated]);
  const nextUpdateDate = useMemo(() => insights?.nextUpdate ? new Date(insights.nextUpdate) : new Date(), [insights?.nextUpdate]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Market Outlook */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="pt-6">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
              Market Outlook
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current market outlook based on industry analysis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            <div className="flex items-center gap-2">
              <OutlookIcon className={`h-5 w-5 ${outlookColor}`} />
              <span className="text-xl font-bold">{insights?.marketOutlook}</span>
            </div>
          </CardContent>
        </Card>

        {/* Industry */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="pt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Industry</h3>
            <p className="text-xl font-bold capitalize">
              {formattedIndustry}
            </p>
          </CardContent>
        </Card>

        {/* Growth Rate */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="pt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Growth Rate</h3>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="text-xl font-bold">{insights?.growthRate}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Demand Level */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="pt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Demand Level</h3>
            <div
              className={`inline-flex items-center rounded-full px-3 py-1 ${
                demandLevelInfo(insights?.demandLevel).bg
              }`}
            >
              <span className={`text-sm font-medium ${demandLevelInfo(insights?.demandLevel).text}`}>
                {insights?.demandLevel}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills and Salary Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Skills */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Top Skills
            </CardTitle>
            <CardDescription>Most in-demand skills for this industry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights?.topSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="transition-all duration-300 hover:bg-purple-50"
                  onMouseEnter={() => setHoveredSkill(skill)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  {skill}
                  {hoveredSkill === skill && (
                    <span className="ml-1 inline-flex h-2 w-2 animate-pulse rounded-full bg-purple-400" />
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Skills */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              Recommended Skills
            </CardTitle>
            <CardDescription>Skills to consider learning next</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights?.recommendedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="transition-all duration-300 hover:bg-blue-50"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Ranges Chart */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Salary Ranges
          </CardTitle>
          <CardDescription>Annual salary ranges by role (in thousands)</CardDescription>
        </CardHeader>
        <CardContent>
        <div className="h-[600px]">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart 
      data={salaryData} 
      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
      barGap={8}
      barSize={24}
    >
      <CartesianGrid 
        strokeDasharray="3 3" 
        stroke="#E2E8F0" 
        opacity={0.4} 
      />
      <XAxis
        dataKey="name"
        tick={{ 
          fill: '#64748B',
          fontSize: 12,
          width: 100,
          wordWrap: 'break-word'
        }}
        interval={0}
        angle={-35}
        textAnchor="end"
        height={80}
        tickMargin={20}
        tickFormatter={(value) => {
          // Split long role names into multiple lines
          return value.length > 15 ? `${value.slice(0, 15)}...` : value;
        }}
      />
      <YAxis
        tick={{ 
          fill: '#64748B',
          fontSize: 12 
        }}
        label={{
          value: 'Salary (k$)',
          angle: -90,
          position: 'insideLeft',
          fill: '#64748B',
          fontSize: 12,
          dx: -10
        }}
      />
      <RechartsTooltip
        content={({ active, payload, label }) => {
          if (active && payload && payload.length) {
            return (
              <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-lg">
                <p className="mb-2 text-sm font-semibold text-gray-900">{label}</p>
                <div className="space-y-1">
                  {payload.map((entry) => (
                    <div 
                      key={entry.name} 
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="text-xs text-gray-600">{entry.name}:</span>
                      <span className="font-medium text-gray-900">
                        ${entry.value.toLocaleString()}k
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
          return null
        }}
        wrapperStyle={{ outline: 'none' }}
      />
      <Legend 
        verticalAlign="top"
        height={36}
        formatter={(value) => (
          <span className="text-xs font-medium text-gray-600">{value}</span>
        )}
      />
      <Bar
        dataKey="min"
        fill="#94A3B8"
        name="Minimum"
        radius={[4, 4, 0, 0]}
        className="transition-all duration-300 hover:opacity-80"
      />
      <Bar
        dataKey="median"
        fill="#475569"
        name="Median"
        radius={[4, 4, 0, 0]}
        className="transition-all duration-300 hover:opacity-80"
      />
      <Bar
        dataKey="max"
        fill="#1E293B"
        name="Maximum"
        radius={[4, 4, 0, 0]}
        className="transition-all duration-300 hover:opacity-80"
      />
    </BarChart>
  </ResponsiveContainer>
</div>

        </CardContent>
      </Card>

      {/* Key Trends */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Key Trends
          </CardTitle>
          <CardDescription>Current industry trends and developments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {insights?.keyTrends.map((trend) => (
              <Badge
                key={trend}
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700 transition-all duration-300 hover:bg-blue-100"
              >
                {trend}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-gray-50 p-4 sm:flex-row">
        <span className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCcw className="h-4 w-4" />
          Last updated: {format(lastUpdatedDate, 'MMM d, yyyy')}
        </span>
        <span className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          Next update {formatDistanceToNow(nextUpdateDate, { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}

const MetricSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-8 w-32" />
  </div>
)

export default DashboardView