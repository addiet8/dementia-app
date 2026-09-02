"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, ArrowLeft, Smile, Sparkles, Heart, Meh, Frown, AlertCircle, Trash2 } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface Memory {
  id: string
  title: string | null
  content: string
  photo_url: string | null
  mood: string | null
  tags: string[] | null
  memory_date: string | null
  created_at: string
}

const moodIcons: Record<string, any> = {
  happy: Smile,
  excited: Sparkles,
  calm: Heart,
  neutral: Meh,
  sad: Frown,
  anxious: AlertCircle
}

const moodColors: Record<string, string> = {
  happy: "text-yellow-500",
  excited: "text-purple-500",
  calm: "text-green-500",
  neutral: "text-gray-500",
  sad: "text-blue-500",
  anxious: "text-orange-500"
}

const moodLabels: Record<string, string> = {
  happy: "Happy",
  excited: "Excited",
  calm: "Calm",
  neutral: "Okay",
  sad: "Sad",
  anxious: "Anxious"
}

export default function MemoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [memory, setMemory] = useState<Memory | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadMemory()
  }, [params.id])

  const loadMemory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('journal_memories')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error loading memory:', error)
      router.push('/memories')
    } else {
      setMemory(data)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from('journal_memories')
      .delete()
      .eq('id', params.id)

    if (!error) {
      router.push('/memories')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Recently"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return null
    const Icon = moodIcons[mood] || Smile
    return <Icon className={`w-6 h-6 ${moodColors[mood]}`} />
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!memory) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Memory not found
            </h3>
            <Button onClick={() => router.push('/memories')}>
              Back to Memories
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/memories')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Memories
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>

      <Card>
        <CardContent className="p-8">
          {/* Photo */}
          {memory.photo_url && (
            <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden bg-muted mb-6">
              <img 
                src={memory.photo_url} 
                alt={memory.title || "Memory"} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title and Mood */}
          <div className="flex items-center gap-3 mb-4">
            {memory.title && (
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {memory.title}
              </h1>
            )}
            {memory.mood && (
              <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                {getMoodIcon(memory.mood)}
                <span className="text-sm font-medium">{moodLabels[memory.mood]}</span>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(memory.memory_date)}</span>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-6">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {memory.content}
            </p>
          </div>

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-6 border-t border-border">
              {memory.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Memory?</DialogTitle>
            <DialogDescription>
              This memory will be permanently deleted and cannot be recovered.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Memory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}