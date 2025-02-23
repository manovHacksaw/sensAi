"use client"
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  TrendingUp, Calendar, DollarSign, Briefcase, Award, TrendingDown, 
  LineChart, Info, RefreshCcw, Filter, Grid, Table as TableIcon, 
  ChevronDown, ChevronUp, Download, Share2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend,
} from 'recharts';

// Types remain the same as before (omitted for brevity)

interface DashboardViewProps {
  insights?: Insights;
  isLoading?: boolean;
  error?: string;
}

const DashboardView = ({ insights, isLoading = false, error }: DashboardViewProps) => {
  // States:
  const [view, setView] = useState<'chart' | 'table'>('chart'); //  Union type for clarity. Consider an enum if you want to use the value for any backend logic
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null); // Explicit type for hoveredSkill
  const [sortColumn, setSortColumn] = useState<string>('role'); // Explicit type for sortColumn
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); //  Union type for clarity. Consider an enum for more complex sorting scenarios
  const [filterValue, setFilterValue] = useState<string>(''); // Explicit type for filterValue
  const [selectedLocation, setSelectedLocation] = useState<string>('all'); // Explicit type for selectedLocation

  // Memoized helper functions for performance
  const marketOutlookInfo = useMemo(() => {
    return (outlook?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE') => { // Explicit type for the argument and a default return
      switch (outlook) {
        case 'POSITIVE':
          return { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' };
        case 'NEUTRAL':
          return { icon: LineChart, color: 'text-amber-500', bg: 'bg-amber-50' };
        case 'NEGATIVE':
          return { icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50' };
        default:
          return { icon: LineChart, color: 'text-gray-500', bg: 'bg-gray-50' };
      }
    };
  }, []);

  const demandLevelInfo = useMemo(() => {
    return (level?: 'LOW' | 'MEDIUM' | 'HIGH') => { // Explicit type for the argument and a default return
      switch (level) {
        case 'HIGH':
          return { color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
        case 'MEDIUM':
          return { color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
        case 'LOW':
          return { color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' };
        default:
          return { color: 'bg-gray-500', text: 'text-gray-700', bg: 'bg-gray-50' };
      }
    };
  }, []);

  // Process salary data with sorting and filtering
  const processedSalaryData = useMemo(() => {
    if (!insights?.salaryRanges) return []; // Safeguard if insights or salaryRanges are undefined

    let data = insights.salaryRanges.map((range) => ({
      name: range.role,
      min: range.min / 1000,
      max: range.max / 1000,
      median: range.median / 1000,
      location: range.location,
    }));

    // Filter by location if selected
    if (selectedLocation !== 'all') {
      data = data.filter(item => item.location === selectedLocation);
    }

    // Filter by search term
    if (filterValue) {
      data = data.filter(item => 
        item.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.location.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // Sort data
    return [...data].sort((a, b) => { // Sort on a copy to avoid mutating state directly.
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      if (sortColumn === 'role') {
        return multiplier * a.name.localeCompare(b.name);
      }
      return multiplier * (a[sortColumn] - b[sortColumn]);
    });
  }, [insights?.salaryRanges, sortColumn, sortDirection, filterValue, selectedLocation]); // Dependency array includes insights to trigger recalculation

  // Get unique locations for filter
  const locations = useMemo(() => {
    if (!insights?.salaryRanges) return ['all'];
    const uniqueLocations = new Set<string>(); // Use a Set for efficient uniqueness
    insights.salaryRanges.forEach(range => uniqueLocations.add(range.location));  //forEach is faster than map in this case.
    return ['all', ...Array.from(uniqueLocations)]; // Convert back to array for rendering
  }, [insights?.salaryRanges]);

  // Components: Move to separate files for larger projects
  const MetricsSection = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {insights &&  //Added checks.
        <>
        <Card className="transform transition-all duration-300 hover:scale-102 hover:shadow-lg">
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
              {insights.marketOutlook && React.createElement(marketOutlookInfo(insights.marketOutlook).icon, { //Explicitly check if insights exists.
                className: `h-5 w-5 ${marketOutlookInfo(insights.marketOutlook).color}`
              })}
              <span className="text-xl font-bold">{insights.marketOutlook}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="transform transition-all duration-300 hover:scale-102 hover:shadow-lg">
          <CardContent className="pt-6">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
              Industry
            </h3>
            <span className="text-xl font-bold">{insights.industry}</span>
          </CardContent>
        </Card>

        <Card className="transform transition-all duration-300 hover:scale-102 hover:shadow-lg">
          <CardContent className="pt-6">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
              Growth Rate
            </h3>
            <span className="text-xl font-bold">{insights.growthRate}</span>
          </CardContent>
        </Card>

        <Card className="transform transition-all duration-300 hover:scale-102 hover:shadow-lg">
          <CardContent className="pt-6">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
              Demand Level
            </h3>
            <span className="text-xl font-bold">{insights.demandLevel}</span>
          </CardContent>
        </Card>
        </>
      }
    </div>
  );

  const SalaryTable = () => (
    <div className="mt-6 overflow-x-auto">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Filter roles or locations..."
            className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-blue-500 focus:outline-none"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-gray-200 p-2 text-sm focus:border-blue-500 focus:outline-none"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          {locations.map(location => (
            <option key={location} value={location}>
              {location === 'all' ? 'All Locations' : location}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {['Role', 'Location', 'Min Salary', 'Median Salary', 'Max Salary'].map((header, index) => {
              const col = ['role', 'location', 'min', 'median', 'max'][index];
              return (
                <th
                  key={header}
                  className="cursor-pointer p-4 text-left font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    if (sortColumn === col) {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortColumn(col);
                      setSortDirection('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    {header}
                    {sortColumn === col && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {processedSalaryData.map((row, index) => (
            <tr
              key={`${row.name}-${index}`}
              className="border-b border-gray-100 transition-colors hover:bg-gray-50"
            >
              <td className="p-4 font-medium text-gray-900">{row.name}</td>
              <td className="p-4 text-gray-600">{row.location}</td>
              <td className="p-4 text-gray-600">${(row.min * 1000).toLocaleString()}</td>
              <td className="p-4 text-gray-600">${(row.median * 1000).toLocaleString()}</td>
              <td className="p-4 text-gray-600">${(row.max * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Loading and error state components (can be moved to separate files). You can use the components used earlier.
  const LoadingState = () => (
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        {/* Add skeleton UI elements here, like cards and tables with skeleton rows */}
        <p>Loading...</p>
      </div>
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Unable to load dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Industry Insights Dashboard</h1>
          <p className="text-sm text-gray-500">Comprehensive analysis of market trends and opportunities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <MetricsSection />

      {/* Skills Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {insights &&
        <>
        <Card className="transform transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Top Skills
            </CardTitle>
            <CardDescription>Most in-demand skills for this industry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.topSkills && insights.topSkills.map((skill) => (
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

        <Card className="transform transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              Recommended Skills
            </CardTitle>
            <CardDescription>Skills to consider learning next</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.recommendedSkills && insights.recommendedSkills.map((skill) => (
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
        </>
        }
      </div>

      {/* Salary Data Section */}
      <Card className="transform transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Salary Ranges
              </CardTitle>
              <CardDescription>Annual salary ranges by role</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === 'chart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('chart')}
                className="flex items-center gap-2"
              >
                <Grid className="h-4 w-4" />
                Chart
              </Button>
              <Button
                variant={view === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('table')}
                className="flex items-center gap-2"
              >
                <TableIcon className="h-4 w-4" />
                Table
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'chart' ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedSalaryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  barGap={8}
                  barSize={24}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.4} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={80}
                    tickMargin={20}
                    tickFormatter={(value) => value.length > 15 ? `${value.slice(0, 15)}...` : value}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 12 }}
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
                                <div key={entry.dataKey} className="flex items-center justify-between text-xs text-gray-700">
                                  <span>{entry.name}:</span>
                                  <span>${(entry.value * 1000).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: 20,
                      fontSize: '12px',
                      color: '#64748B'
                    }}
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
          ) : (
            <SalaryTable />
          )}
        </CardContent>
      </Card>

      {/* Key Trends Section - similar to skills section */}
      {/* Footer */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-gray-50 p-4 sm:flex-row">
        <span className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCcw className="h-4 w-4" />
          Last updated: {insights && insights.lastUpdated && format(new Date(insights.lastUpdated), 'MMM d, yyyy')}
        </span>
        <span className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          Next update {insights && insights.nextUpdate && formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

export default DashboardView;