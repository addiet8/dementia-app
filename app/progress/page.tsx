"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Brain, Target, Zap, Eye, Calendar, Award, Activity } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"

type TimeFilter = "today" | "7days" | "30days" | "3months"

interface PerformanceData {
  activity_type: string
  date: string
  average_accuracy: number
  average_reaction_time: number
  sessions_completed: number
  difficulty_level: number
  trend: string
}

export default function ProgressPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today")
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPerformanceData()
  }, [timeFilter])

  const loadPerformanceData = async () => {
    try {
      console.log('=== Starting loadPerformanceData ===')
      const supabase = createSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('No session found')
        setLoading(false)
        return
      }

      console.log('Session found for user:', session.user.id)
      console.log('Current time filter:', timeFilter)

      // Calculate date range based on filter (fixed to avoid date mutation issues)
      const today = new Date()
      const filterStartDate = new Date()
      
      switch (timeFilter) {
        case "today":
          filterStartDate.setHours(0, 0, 0, 0)
          break
        case "7days":
          filterStartDate.setDate(today.getDate() - 7)
          break
        case "30days":
          filterStartDate.setDate(today.getDate() - 30)
          break
        case "3months":
          filterStartDate.setMonth(today.getMonth() - 3)
          break
      }

      const startDateStr = filterStartDate.toISOString().split('T')[0]
      const todayStr = new Date().toISOString().split('T')[0]
      
      console.log('Date range:', startDateStr, 'to', todayStr)
      console.log('Filtering for user_id:', session.user.id)

      // First, try to get ALL data for this user (for debugging)
      const { data: allData, error: allError } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: true })

      console.log('All data query completed. Error:', allError)
      console.log('All data received:', allData)
      console.log('All data length:', allData?.length || 0)

      // Then try the filtered query
      const { data: performanceData, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', startDateStr)
        .order('date', { ascending: true })

      console.log('Query completed. Error:', error)
      console.log('Data received:', performanceData)
      console.log('Data length:', performanceData?.length || 0)

      if (error) {
        console.error('Error loading performance data:', error)
      } else if (performanceData && performanceData.length > 0) {
        console.log('Setting performance data with', performanceData.length, 'records')
        console.log('First record:', performanceData[0])
        setPerformanceData(performanceData)
      } else {
        console.log('No performance data found within date range')
        setPerformanceData([])
      }
    } catch (error) {
      console.error('Exception in loadPerformanceData:', error)
    } finally {
      console.log('=== loadPerformanceData completed ===')
      setLoading(false)
    }
  }

  const categoryIcons = {
    memory: <Brain className="w-5 h-5" />,
    attention: <Target className="w-5 h-5" />,
    reaction: <Zap className="w-5 h-5" />,
    visual: <Eye className="w-5 h-5" />
  }

  const categoryColors = {
    memory: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    attention: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    reaction: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    visual: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
  }

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (performanceData.length === 0) return null

    const totalSessions = performanceData.reduce((sum, p) => sum + (p.sessions_completed || 0), 0)
    const avgAccuracy = performanceData.reduce((sum, p) => sum + (p.average_accuracy || 0), 0) / performanceData.length
    const avgReactionTime = performanceData.reduce((sum, p) => sum + (p.average_reaction_time || 0), 0) / performanceData.length

    // Get unique categories
    const categories = [...new Set(performanceData.map(p => p.activity_type))]

    return {
      totalSessions,
      avgAccuracy: Math.round(avgAccuracy),
      avgReactionTime: Math.round(avgReactionTime),
      categoriesCompleted: categories.length
    }
  }

  // Get category-specific performance
  const getCategoryPerformance = (category: string) => {
    const categoryData = performanceData.filter(p => p.activity_type === category)
    if (categoryData.length === 0) return null

    const totalSessions = categoryData.reduce((sum, p) => sum + (p.sessions_completed || 0), 0)
    const avgAccuracy = categoryData.reduce((sum, p) => sum + (p.average_accuracy || 0), 0) / categoryData.length
    const avgReactionTime = categoryData.reduce((sum, p) => sum + (p.average_reaction_time || 0), 0) / categoryData.length
    const latestTrend = categoryData[categoryData.length - 1]?.trend || 'stable'

    return {
      totalSessions,
      avgAccuracy: Math.round(avgAccuracy),
      avgReactionTime: Math.round(avgReactionTime),
      trend: latestTrend
    }
  }

  // Simple SVG chart component (no external libraries)
  const SimpleChart = ({ data }: { data: PerformanceData[] }) => {
    if (data.length === 0) return null

    const width = 300
    const height = 100
    const padding = 10

    // Group by date and calculate average accuracy
    const chartData = data.reduce((acc, curr) => {
      const existing = acc.find(item => item.date === curr.date)
      if (existing) {
        existing.accuracy += curr.average_accuracy || 0
        existing.count += 1
      } else {
        acc.push({
          date: curr.date,
          accuracy: curr.average_accuracy || 0,
          count: 1
        })
      }
      return acc
    }, [] as { date: string; accuracy: number; count: number }[])

    // Calculate averages
    const averagedData = chartData.map(item => ({
      date: item.date,
      accuracy: item.accuracy / item.count
    }))

    // Find min/max for scaling
    const maxAccuracy = Math.max(...averagedData.map(d => d.accuracy), 100)
    const minAccuracy = Math.min(...averagedData.map(d => d.accuracy), 0)

    // Generate points for the line
    const points = averagedData.map((d, i) => {
      const x = padding + (i / (averagedData.length - 1)) * (width - 2 * padding)
      const y = height - padding - ((d.accuracy - minAccuracy) / (maxAccuracy - minAccuracy)) * (height - 2 * padding)
      return `${x},${y}`
    }).join(' ')

    return (
      <svg width={width} height={height} className="w-full h-auto">
        {/* Background grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = height - padding - (percent / 100) * (height - 2 * padding)
          return (
            <line
              key={percent}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted-foreground/20"
            />
          )
        })}
        
        {/* The line */}
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />
        
        {/* Data points */}
        {averagedData.map((d, i) => {
          const x = padding + (i / (averagedData.length - 1)) * (width - 2 * padding)
          const y = height - padding - ((d.accuracy - minAccuracy) / (maxAccuracy - minAccuracy)) * (height - 2 * padding)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="currentColor"
              className="text-primary"
            />
          )
        })}
      </svg>
    )
  }

  const summaryStats = getSummaryStats()
  const categories = ['memory', 'attention', 'reaction', 'visual'] as const

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          My Progress
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your cognitive activity and performance over time.
        </p>
      </div>

      {/* Time Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['today', '7days', '30days', '3months'] as TimeFilter[]).map((filter) => (
          <Button
            key={filter}
            variant={timeFilter === filter ? "default" : "outline"}
            onClick={() => setTimeFilter(filter)}
            size="sm"
          >
            {filter === 'today' ? 'Today' : filter === '7days' ? '7 Days' : filter === '30days' ? '30 Days' : '3 Months'}
          </Button>
        ))}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading your progress data...</p>
          </CardContent>
        </Card>
      ) : performanceData.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No progress data yet</p>
            <p className="text-sm text-muted-foreground">
              Complete some exercises to start tracking your progress!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          {summaryStats && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryStats.totalSessions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Exercises completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryStats.avgAccuracy}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(summaryStats.avgReactionTime / 1000).toFixed(1)}s</div>
                  <p className="text-xs text-muted-foreground mt-1">Reaction speed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryStats.categoriesCompleted}/4</div>
                  <p className="text-xs text-muted-foreground mt-1">Exercise types tried</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Overall Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleChart data={performanceData} />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Start</span>
                <span>Accuracy Trend</span>
                <span>Now</span>
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((category) => {
              const categoryPerf = getCategoryPerformance(category)
              if (!categoryPerf) return null

              const trendIcon = {
                stable: '→',
                improving: '↑',
                declining: '↓'
              }[categoryPerf.trend] || '→'

              const trendColor = {
                stable: 'text-muted-foreground',
                improving: 'text-green-600',
                declining: 'text-red-600'
              }[categoryPerf.trend] || 'text-muted-foreground'

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${categoryColors[category]}`}>
                        {categoryIcons[category]}
                      </div>
                      <span className="capitalize">{category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Sessions</p>
                        <p className="text-xl font-bold">{categoryPerf.totalSessions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="text-xl font-bold">{categoryPerf.avgAccuracy}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Trend</p>
                        <p className={`text-xl font-bold ${trendColor}`}>
                          {trendIcon}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summaryStats && summaryStats.totalSessions >= 10 && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <p className="font-medium">Consistent Learner</p>
                      <p className="text-sm text-muted-foreground">Completed 10+ exercise sessions</p>
                    </div>
                  </div>
                )}
                {summaryStats && summaryStats.avgAccuracy >= 80 && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="text-2xl">⭐</div>
                    <div>
                      <p className="font-medium">High Performer</p>
                      <p className="text-sm text-muted-foreground">Maintained 80%+ average accuracy</p>
                    </div>
                  </div>
                )}
                {summaryStats && summaryStats.categoriesCompleted >= 3 && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="text-2xl">🧠</div>
                    <div>
                      <p className="font-medium">Well-Rounded</p>
                      <p className="text-sm text-muted-foreground">Tried 3+ different exercise types</p>
                    </div>
                  </div>
                )}
                {!summaryStats || (summaryStats.totalSessions < 10 && summaryStats.avgAccuracy < 80 && summaryStats.categoriesCompleted < 3) && (
                  <p className="text-center text-muted-foreground py-4">
                    Keep exercising to unlock achievements!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}