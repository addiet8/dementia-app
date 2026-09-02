"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Target, Zap, Eye, TrendingUp, Play } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"

interface Exercise {
  id: string
  name: string
  category: "memory" | "attention" | "reaction" | "visual"
  description: string
  icon: React.ReactNode
  difficulty: number
  estimatedTime: string
}

const exercises: Exercise[] = [
  {
    id: "remember-objects",
    name: "Remember Objects",
    category: "memory",
    description: "Memorize and recall objects displayed on screen",
    icon: <Brain className="w-6 h-6" />,
    difficulty: 3,
    estimatedTime: "3-5 min"
  },
  {
    id: "target-identification",
    name: "Target Identification",
    category: "attention",
    description: "Find and click specific targets among distractions",
    icon: <Target className="w-6 h-6" />,
    difficulty: 4,
    estimatedTime: "2-4 min"
  },
  {
    id: "response-time",
    name: "Response Time",
    category: "reaction",
    description: "React quickly when the screen changes color",
    icon: <Zap className="w-6 h-6" />,
    difficulty: 2,
    estimatedTime: "2-3 min"
  },
  {
    id: "pattern-match",
    name: "Pattern Match",
    category: "visual",
    description: "Identify matching patterns and sequences",
    icon: <Eye className="w-6 h-6" />,
    difficulty: 5,
    estimatedTime: "4-6 min"
  }
]

const categoryColors = {
  memory: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  attention: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  reaction: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  visual: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
}

export default function ExercisesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [recommendedDifficulty, setRecommendedDifficulty] = useState<{ [key: string]: number }>({})

  // Load user's performance data for adaptive difficulty
  useEffect(() => {
    loadPerformanceData()
  }, [])

  const loadPerformanceData = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      // Get recent performance data
      const { data: performanceData } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .limit(7) // Last 7 days

      if (performanceData && performanceData.length > 0) {
        const recommendations = calculateAdaptiveDifficulty(performanceData)
        setRecommendedDifficulty(recommendations)
      }
    } catch (error) {
      console.error('Error loading performance data:', error)
    }
  }

  const calculateAdaptiveDifficulty = (performanceData: any[]) => {
    const recommendations: { [key: string]: number } = {}
    
    // Group by category and calculate average performance
    const categories = ['memory', 'attention', 'reaction', 'visual']
    
    categories.forEach(category => {
      const categoryData = performanceData.filter(p => p.category === category)
      
      if (categoryData.length > 0) {
        const avgAccuracy = categoryData.reduce((sum, p) => sum + (p.average_accuracy || 0), 0) / categoryData.length
        const avgReactionTime = categoryData.reduce((sum, p) => sum + (p.average_reaction_time || 0), 0) / categoryData.length
        
        // Simple adaptive difficulty rules
        let recommendedLevel = 3 // Base difficulty
        
        if (avgAccuracy > 85 && avgReactionTime < 1000) {
          recommendedLevel = 5 // High performance - increase difficulty
        } else if (avgAccuracy > 75 && avgReactionTime < 1500) {
          recommendedLevel = 4 // Good performance - moderate difficulty
        } else if (avgAccuracy < 50) {
          recommendedLevel = 1 // Low performance - decrease difficulty
        } else if (avgAccuracy < 65) {
          recommendedLevel = 2 // Below average - lower difficulty
        }
        
        recommendations[category] = recommendedLevel
      } else {
        // No data - default to moderate difficulty
        recommendations[category] = 3
      }
    })
    
    return recommendations
  }

  const filteredExercises = selectedCategory
    ? exercises.filter(ex => ex.category === selectedCategory)
    : exercises

  if (selectedExercise) {
    // Render the specific exercise component
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <Button
          variant="outline"
          onClick={() => setSelectedExercise(null)}
          className="mb-6"
        >
          ← Back to Exercises
        </Button>
        <ExerciseRunner exercise={selectedExercise} />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Brain Exercises
        </h1>
        <p className="text-muted-foreground text-lg">
          Cognitive training activities to exercise your mind.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          size="sm"
        >
          All Exercises
        </Button>
        <Button
          variant={selectedCategory === "memory" ? "default" : "outline"}
          onClick={() => setSelectedCategory("memory")}
          size="sm"
        >
          Memory
        </Button>
        <Button
          variant={selectedCategory === "attention" ? "default" : "outline"}
          onClick={() => setSelectedCategory("attention")}
          size="sm"
        >
          Attention
        </Button>
        <Button
          variant={selectedCategory === "reaction" ? "default" : "outline"}
          onClick={() => setSelectedCategory("reaction")}
          size="sm"
        >
          Reaction
        </Button>
        <Button
          variant={selectedCategory === "visual" ? "default" : "outline"}
          onClick={() => setSelectedCategory("visual")}
          size="sm"
        >
          Visual
        </Button>
      </div>

      {/* Exercise Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => {
          const recommendedLevel = recommendedDifficulty[exercise.category]
          const isRecommended = recommendedLevel && Math.abs(exercise.difficulty - recommendedLevel) <= 1
          
          return (
            <Card key={exercise.id} className={`hover:shadow-lg transition-shadow ${isRecommended ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${categoryColors[exercise.category]}`}>
                    {exercise.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span>Level {exercise.difficulty}</span>
                    </div>
                    {isRecommended && (
                      <span className="text-xs text-primary font-medium">Recommended</span>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl mt-3">{exercise.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{exercise.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{exercise.estimatedTime}</span>
                  <Button
                    onClick={() => setSelectedExercise(exercise)}
                    size="sm"
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredExercises.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No exercises found in this category.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ExerciseRunner({ exercise }: { exercise: Exercise }) {
  const [phase, setPhase] = useState<"intro" | "practice" | "exercise" | "results">("intro")
  const [performance, setPerformance] = useState<{ accuracy: number; avgResponseTime: number }>({ accuracy: 0, avgResponseTime: 0 })

  if (phase === "intro") {
    return (
      <Card>
        <CardHeader>
          <div className={`p-4 rounded-xl ${categoryColors[exercise.category]} w-fit mb-4`}>
            {exercise.icon}
          </div>
          <CardTitle className="text-2xl">{exercise.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Instructions</h3>
            <p className="text-muted-foreground">{exercise.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Difficulty</p>
              <p className="font-semibold">Level {exercise.difficulty}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Time</p>
              <p className="font-semibold">{exercise.estimatedTime}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setPhase("practice")}
              className="flex-1"
            >
              Practice Round
            </Button>
            <Button
              onClick={() => setPhase("exercise")}
              className="flex-1"
            >
              Start Exercise
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (phase === "practice") {
    return <ExerciseContent exercise={exercise} isPractice onComplete={() => setPhase("intro")} onPerformance={(perf) => setPerformance(perf)} />
  }

  if (phase === "exercise") {
    return <ExerciseContent exercise={exercise} isPractice={false} onComplete={(perf) => { setPerformance(perf); setPhase("results") }} onPerformance={(perf) => setPerformance(perf)} />
  }

  if (phase === "results") {
    return <ExerciseResults exercise={exercise} performance={performance} onRestart={() => setPhase("intro")} />
  }

  return null
}

function ExerciseContent({ exercise, isPractice, onComplete, onPerformance }: { exercise: Exercise; isPractice: boolean; onComplete: (performance?: { accuracy: number; avgResponseTime: number }) => void; onPerformance: (performance: { accuracy: number; avgResponseTime: number }) => void }) {
  // Render specific exercise based on category
  switch (exercise.category) {
    case "memory":
      return <MemoryExercise isPractice={isPractice} onComplete={onComplete} onPerformance={onPerformance} />
    case "attention":
      return <AttentionExercise isPractice={isPractice} onComplete={onComplete} onPerformance={onPerformance} />
    case "reaction":
      return <ReactionExercise isPractice={isPractice} onComplete={onComplete} onPerformance={onPerformance} />
    case "visual":
      return <VisualExercise isPractice={isPractice} onComplete={onComplete} onPerformance={onPerformance} />
    default:
      return <div>Exercise not implemented yet</div>
  }
}

function ExerciseResults({ exercise, performance, onRestart }: { exercise: Exercise; performance: { accuracy: number; avgResponseTime: number }; onRestart: () => void }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const savePerformance = async () => {
    if (saved || saving) return
    
    setSaving(true)
    try {
      const supabase = createSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error('No session found')
        return
      }

      // Get the correct activity_id from the activities table based on exercise category
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('id')
        .eq('category', exercise.category)
        .limit(1)
        .maybeSingle()

      if (activityError) {
        console.error('Error finding activity:', activityError)
        return
      }

      if (!activityData) {
        console.error('No activity found for category:', exercise.category)
        // Skip session save if no matching activity exists
        return
      }

      // Save activity session
      const { data: sessionData, error: sessionError } = await supabase
        .from('activity_sessions')
        .insert({
          user_id: session.user.id,
          activity_id: activityData.id,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          difficulty_level: exercise.difficulty,
          completion_status: 'completed'
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Error saving session:', sessionError)
        return
      }

      // Save performance metrics
      const { error: metricsError } = await supabase
        .from('performance_metrics')
        .insert({
          user_id: session.user.id,
          category: exercise.category,
          date: new Date().toISOString().split('T')[0],
          average_accuracy: performance.accuracy,
          average_reaction_time: performance.avgResponseTime,
          sessions_completed: 1,
          difficulty_level: exercise.difficulty,
          trend: 'stable'
        })

      if (metricsError) {
        console.error('Error saving metrics:', metricsError)
        // Try update instead if insert fails (duplicate for same day)
        const { error: updateError } = await supabase
          .from('performance_metrics')
          .update({
            average_accuracy: performance.accuracy,
            average_reaction_time: performance.avgResponseTime,
            sessions_completed: 1, // This would need aggregation in real implementation
          })
          .eq('user_id', session.user.id)
          .eq('category', exercise.category)
          .eq('date', new Date().toISOString().split('T')[0])

        if (updateError) {
          console.error('Error updating metrics:', updateError)
        }
      }

      setSaved(true)
    } catch (error) {
      console.error('Error saving performance:', error)
    } finally {
      setSaving(false)
    }
  }

  // Auto-save on mount
  useEffect(() => {
    savePerformance()
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className={`p-4 rounded-xl ${categoryColors[exercise.category]} w-fit mb-4`}>
          {exercise.icon}
        </div>
        <CardTitle className="text-2xl">Exercise Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">Great job!</h3>
          <p className="text-muted-foreground">
            {saved ? "Your performance has been saved." : saving ? "Saving your progress..." : "Saving your progress..."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted rounded-xl">
            <p className="text-2xl font-bold">{Math.round(performance.accuracy)}%</p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-xl">
            <p className="text-2xl font-bold">{(performance.avgResponseTime / 1000).toFixed(1)}s</p>
            <p className="text-sm text-muted-foreground">Avg Response</p>
          </div>
        </div>
        <Button onClick={onRestart} className="w-full">
          Try Another Exercise
        </Button>
      </CardContent>
    </Card>
  )
}

// Memory Exercise: Remember Objects
function MemoryExercise({ isPractice, onComplete, onPerformance }: { isPractice: boolean; onComplete: (performance?: { accuracy: number; avgResponseTime: number }) => void; onPerformance: (performance: { accuracy: number; avgResponseTime: number }) => void }) {
  const [phase, setPhase] = useState<"instructions" | "memorize" | "recall" | "complete">("instructions")
  const [objects, setObjects] = useState<string[]>([])
  const [selectedObjects, setSelectedObjects] = useState<string[]>([])
  const [startTime, setStartTime] = useState<number>(0)

  const objectEmojis = ["🍎", "🚗", "🐕", "🌟", "🎸", "📚", "🌈", "⏰", "🎪", "🍕", "🏠", "🌺", "🎯", "📱", "🚀"]

  const startMemorize = () => {
    const shuffled = [...objectEmojis].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, isPractice ? 3 : 5)
    setObjects(selected)
    setSelectedObjects([])
    setPhase("memorize")
    setStartTime(Date.now())

    // Auto transition to recall after 3 seconds for practice, 5 seconds for real
    setTimeout(() => {
      setPhase("recall")
    }, isPractice ? 3000 : 5000)
  }

  const handleObjectClick = (obj: string) => {
    if (selectedObjects.includes(obj)) {
      setSelectedObjects(selectedObjects.filter(o => o !== obj))
    } else if (selectedObjects.length < objects.length) {
      setSelectedObjects([...selectedObjects, obj])
    }
  }

  const submitRecall = () => {
    const reactionTime = Date.now() - startTime
    const correct = selectedObjects.filter(obj => objects.includes(obj)).length
    const accuracy = (correct / objects.length) * 100
    setPhase("complete")
    
    if (!isPractice) {
      onPerformance({ accuracy, avgResponseTime: reactionTime })
    }
  }

  if (phase === "instructions") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Remember Objects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">How to play:</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>You will see {isPractice ? "3" : "5"} objects on the screen</li>
              <li>Memorize them within {isPractice ? "3" : "5"} seconds</li>
              <li>Then select the objects you remember from a larger set</li>
            </ol>
          </div>
          <Button onClick={startMemorize} className="w-full">
            Start
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (phase === "memorize") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memorize these objects!</CardTitle>
          <p className="text-muted-foreground">
            You have {isPractice ? "3" : "5"} seconds
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 py-8">
            {objects.map((obj, i) => (
              <div key={i} className="text-6xl text-center animate-pulse">
                {obj}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (phase === "recall") {
    const shuffledOptions = [...objectEmojis].sort(() => Math.random() - 0.5)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select the objects you remember</CardTitle>
          <p className="text-muted-foreground">
            Selected: {selectedObjects.length} / {objects.length}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-5 gap-3">
            {shuffledOptions.map((obj, i) => (
              <button
                key={i}
                onClick={() => handleObjectClick(obj)}
                className={`text-4xl p-4 rounded-xl border-2 transition-all ${
                  selectedObjects.includes(obj)
                    ? "border-primary bg-primary/10 scale-110"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {obj}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setPhase("instructions")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={submitRecall}
              disabled={selectedObjects.length !== objects.length}
              className="flex-1"
            >
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (phase === "complete") {
    const correct = selectedObjects.filter(obj => objects.includes(obj)).length
    const accuracy = Math.round((correct / objects.length) * 100)
    const reactionTime = Date.now() - startTime
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Round Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">{accuracy >= 80 ? "🎉" : accuracy >= 60 ? "👍" : "💪"}</div>
            <h3 className="text-2xl font-bold mb-2">{accuracy}% Correct</h3>
            <p className="text-muted-foreground">
              You remembered {correct} out of {objects.length} objects
            </p>
          </div>
          <Button onClick={() => onComplete({ accuracy, avgResponseTime: reactionTime })} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}

// Attention Exercise: Target Identification
function AttentionExercise({ isPractice, onComplete, onPerformance }: { isPractice: boolean; onComplete: (performance?: { accuracy: number; avgResponseTime: number }) => void; onPerformance: (performance: { accuracy: number; avgResponseTime: number }) => void }) {
  const [phase, setPhase] = useState<"instructions" | "playing" | "complete">("instructions")
  const [target, setTarget] = useState<string>("")
  const [grid, setGrid] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [totalTargets, setTotalTargets] = useState(0)
  const [startTime, setStartTime] = useState<number>(0)

  const targets = ["🎯", "⭐", "❤️", "🔴", "🟢"]
  const distractors = ["🔵", "🟡", "🟣", "🟠", "⚪", "⚫", "🟤", "🔷", "🔶", "💎"]

  const startGame = () => {
    const newTarget = targets[Math.floor(Math.random() * targets.length)]
    setTarget(newTarget)
    setScore(0)
    setTotalTargets(isPractice ? 3 : 5) // Match the actual number of targets in grid
    setStartTime(Date.now())
    generateGrid(newTarget)
    setPhase("playing")
  }

  const generateGrid = (targetSymbol: string) => {
    const size = isPractice ? 16 : 25 // 4x4 or 5x5
    const newGrid = []
    const targetCount = isPractice ? 3 : 5

    // Add targets
    for (let i = 0; i < targetCount; i++) {
      newGrid.push(targetSymbol)
    }

    // Fill rest with distractors
    while (newGrid.length < size) {
      newGrid.push(distractors[Math.floor(Math.random() * distractors.length)])
    }

    // Shuffle
    setGrid(newGrid.sort(() => Math.random() - 0.5))
  }

  const handleClick = (item: string, index: number) => {
    if (item === target) {
      setScore(score + 1)
      const newGrid = [...grid]
      newGrid[index] = "✅"
      setGrid(newGrid)

      if (score + 1 >= totalTargets) {
        const reactionTime = Date.now() - startTime
        setPhase("complete")
        
        if (!isPractice) {
          const accuracy = ((score + 1) / totalTargets) * 100
          onPerformance({ accuracy, avgResponseTime: reactionTime })
        }
      }
    }
  }

  if (phase === "instructions") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Target Identification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">How to play:</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Find and click all the target symbols</li>
              <li>The target will be shown at the top</li>
              <li>Ignore the distractor symbols</li>
              <li>Find {isPractice ? "3" : "5"} targets as fast as you can</li>
            </ol>
          </div>
          <Button onClick={startGame} className="w-full">
            Start
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (phase === "playing") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Find all: {target}</CardTitle>
          <p className="text-muted-foreground">
            Found: {score} / {totalTargets}
          </p>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-2 ${
            isPractice ? "grid-cols-4" : "grid-cols-5"
          }`}>
            {grid.map((item, i) => (
              <button
                key={i}
                onClick={() => handleClick(item, i)}
                disabled={item === "✅"}
                className={`text-4xl p-4 rounded-xl border-2 transition-all ${
                  item === "✅"
                    ? "border-green-500 bg-green-100 dark:bg-green-900/30"
                    : "border-border hover:border-primary/50 hover:scale-105"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (phase === "complete") {
    const accuracy = Math.round((score / totalTargets) * 100)
    const reactionTime = Date.now() - startTime
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Round Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">{accuracy === 100 ? "🎉" : accuracy >= 80 ? "👍" : "💪"}</div>
            <h3 className="text-2xl font-bold mb-2">{accuracy}% Complete</h3>
            <p className="text-muted-foreground">
              You found {score} out of {totalTargets} targets
            </p>
          </div>
          <Button onClick={() => onComplete({ accuracy, avgResponseTime: reactionTime })} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}

// Reaction Exercise: Response Time
function ReactionExercise({ isPractice, onComplete, onPerformance }: { isPractice: boolean; onComplete: (performance?: { accuracy: number; avgResponseTime: number }) => void; onPerformance: (performance: { accuracy: number; avgResponseTime: number }) => void }) {
  const [phase, setPhase] = useState<"instructions" | "waiting" | "click" | "complete">("instructions")
  const [startTime, setStartTime] = useState<number>(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [round, setRound] = useState(0)
  const [totalRounds] = useState(isPractice ? 2 : 5)

  const startWaiting = () => {
    setPhase("waiting")
    const delay = Math.random() * 2000 + 1000 // 1-3 seconds
    setTimeout(() => {
      setStartTime(Date.now())
      setPhase("click")
    }, delay)
  }

  const handleClick = () => {
    if (phase === "click") {
      const reactionTime = Date.now() - startTime
      const newReactionTimes = [...reactionTimes, reactionTime]
      setReactionTimes(newReactionTimes)

      if (round + 1 >= totalRounds) {
        setPhase("complete")
        
        if (!isPractice) {
          const validTimes = newReactionTimes.filter(t => t < 9999)
          const avgTime = validTimes.length > 0
            ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
            : 0
          const accuracy = validTimes.length / totalRounds * 100
          onPerformance({ accuracy, avgResponseTime: avgTime })
        }
      } else {
        setRound(round + 1)
        startWaiting()
      }
    } else if (phase === "waiting") {
      // Clicked too early
      setReactionTimes([...reactionTimes, 9999]) // Penalty for early click
      if (round + 1 >= totalRounds) {
        setPhase("complete")
        
        if (!isPractice) {
          const validTimes = [...reactionTimes, 9999].filter(t => t < 9999)
          const avgTime = validTimes.length > 0
            ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
            : 0
          const accuracy = validTimes.length / totalRounds * 100
          onPerformance({ accuracy, avgResponseTime: avgTime })
        }
      } else {
        setRound(round + 1)
        startWaiting()
      }
    }
  }

  if (phase === "instructions") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">How to play:</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Wait for the screen to turn green</li>
              <li>Click as fast as you can when it changes</li>
              <li>Don't click before it changes!</li>
              <li>You'll have {isPractice ? "2" : "5"} rounds</li>
            </ol>
          </div>
          <Button onClick={() => { setRound(0); setReactionTimes([]); startWaiting() }} className="w-full">
            Start
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (phase === "waiting") {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <div className="bg-red-500 text-white rounded-2xl p-12 mb-6">
            <p className="text-2xl font-bold">Wait for green...</p>
          </div>
          <p className="text-muted-foreground mb-4">Round {round + 1} of {totalRounds}</p>
          <Button onClick={handleClick} className="w-full max-w-md">
            Click Here
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (phase === "click") {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <div className="bg-green-500 text-white rounded-2xl p-12 mb-6 animate-pulse">
            <p className="text-2xl font-bold">CLICK NOW!</p>
          </div>
          <Button onClick={handleClick} className="w-full max-w-md">
            Click!
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (phase === "complete") {
    const validTimes = reactionTimes.filter(t => t < 9999)
    const avgTime = validTimes.length > 0
      ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
      : 0
    const earlyClicks = reactionTimes.filter(t => t >= 9999).length
    const accuracy = ((totalRounds - earlyClicks) / totalRounds) * 100

    return (
      <Card>
        <CardHeader>
          <CardTitle>Round Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">{avgTime < 300 ? "⚡" : avgTime < 500 ? "👍" : "💪"}</div>
            <h3 className="text-2xl font-bold mb-2">{avgTime}ms Average</h3>
            <p className="text-muted-foreground">
              {earlyClicks > 0 ? `${earlyClicks} early click(s)` : "Perfect timing!"}
            </p>
          </div>
          <Button onClick={() => onComplete({ accuracy, avgResponseTime: avgTime })} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}

// Visual Exercise: Pattern Match
function VisualExercise({ isPractice, onComplete, onPerformance }: { isPractice: boolean; onComplete: (performance?: { accuracy: number; avgResponseTime: number }) => void; onPerformance: (performance: { accuracy: number; avgResponseTime: number }) => void }) {
  const [phase, setPhase] = useState<"instructions" | "playing" | "complete">("instructions")
  const [pattern, setPattern] = useState<string[]>([])
  const [userPattern, setUserPattern] = useState<string[]>([])
  const [showPattern, setShowPattern] = useState(true)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [totalRounds] = useState(isPractice ? 2 : 4)
  const [startTime, setStartTime] = useState<number>(0)

  const colors = ["🔴", "🔵", "🟢", "🟡"]

  const startRound = () => {
    const length = isPractice ? 3 : round + 3
    const newPattern = []
    for (let i = 0; i < length; i++) {
      newPattern.push(colors[Math.floor(Math.random() * colors.length)])
    }
    setPattern(newPattern)
    setUserPattern([])
    setShowPattern(true)
    setStartTime(Date.now())

    // Hide pattern after delay
    setTimeout(() => {
      setShowPattern(false)
    }, isPractice ? 2000 : 3000 - (round * 200))
  }

  const startGame = () => {
    setRound(0)
    setScore(0)
    startRound()
    setPhase("playing")
  }

  const handleColorClick = (color: string) => {
    if (showPattern) return

    const newUserPattern = [...userPattern, color]
    setUserPattern(newUserPattern)

    // Check if pattern is complete
    if (newUserPattern.length === pattern.length) {
      const isCorrect = newUserPattern.every((color, i) => color === pattern[i])
      if (isCorrect) {
        setScore(score + 1)
      }

      if (round + 1 >= totalRounds) {
        setPhase("complete")
        
        if (!isPractice) {
          const accuracy = (score / totalRounds) * 100
          const reactionTime = Date.now() - startTime
          onPerformance({ accuracy, avgResponseTime: reactionTime })
        }
      } else {
        setRound(round + 1)
        setTimeout(() => startRound(), 1000)
      }
    }
  }

  if (phase === "instructions") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pattern Match</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">How to play:</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Watch the color pattern displayed</li>
              <li>Memorize the sequence</li>
              <li>Repeat the pattern by clicking the colors</li>
              <li>Patterns get longer each round</li>
            </ol>
          </div>
          <Button onClick={startGame} className="w-full">
            Start
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (phase === "playing") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pattern Match</CardTitle>
          <p className="text-muted-foreground">
            Round {round + 1} of {totalRounds} | Score: {score}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {showPattern ? (
            <div className="text-center py-8">
              <p className="text-lg mb-4">Watch the pattern:</p>
              <div className="flex justify-center gap-4">
                {pattern.map((color, i) => (
                  <div key={i} className="text-6xl animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                    {color}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-lg">Repeat the pattern:</p>
              <div className="flex justify-center gap-4 mb-4">
                {userPattern.map((color, i) => (
                  <div key={i} className="text-4xl">
                    {color}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorClick(color)}
                    className="text-6xl p-6 rounded-xl border-2 border-border hover:border-primary/50 hover:scale-105 transition-all"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (phase === "complete") {
    const accuracy = Math.round((score / totalRounds) * 100)
    const reactionTime = Date.now() - startTime
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Round Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">{accuracy >= 75 ? "🎉" : accuracy >= 50 ? "👍" : "💪"}</div>
            <h3 className="text-2xl font-bold mb-2">{accuracy}% Correct</h3>
            <p className="text-muted-foreground">
              You completed {score} out of {totalRounds} patterns
            </p>
          </div>
          <Button onClick={() => onComplete({ accuracy, avgResponseTime: reactionTime })} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}