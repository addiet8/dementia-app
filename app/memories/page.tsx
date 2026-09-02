"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, Calendar, Heart, Smile, Meh, Frown, AlertCircle, Sparkles } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { MemoryDialog } from "@/components/memory-dialog"
import Link from "next/link"

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

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('Load memories - Session:', session ? 'active' : 'null', 'Error:', sessionError)
      
      if (!session) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('journal_memories')
        .select('*')
        .eq('user_id', session.user.id)
        .order('memory_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading memories:', error)
        // Check if it's a table not found error
        if (error.code === '42P01') {
          console.error('journal_memories table does not exist. Please run the database schema from supabase/schema.sql in Supabase SQL Editor.')
        } else {
          console.error('Database error:', error.message)
        }
      } else {
        setMemories(data || [])
      }
    } catch (error) {
      console.error('Unexpected error loading memories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMemory = async (memory: { title?: string; content: string; photo_url?: string; mood?: string; tags?: string[]; memory_date?: string }) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Auth error:', sessionError)
        alert('Authentication error. Please try logging in again.')
        return
      }
      
      if (!session) {
        alert('You must be logged in to add memories')
        return
      }

      console.log('User ID:', session.user.id, 'Adding memory:', memory)

      const { data, error } = await supabase
        .from('journal_memories')
        .insert({
          user_id: session.user.id,
          title: memory.title || null,
          content: memory.content,
          photo_url: memory.photo_url || null,
          mood: memory.mood || null,
          tags: memory.tags || null,
          memory_date: memory.memory_date || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding memory:', error)
        if (error.code === '42P01') {
          alert('Database tables not set up. Please run the database schema from supabase/schema.sql in your Supabase SQL Editor.')
        } else {
          alert(`Failed to add memory: ${error.message || 'Unknown error'}`)
        }
      } else {
        console.log('Memory added successfully:', data)
        loadMemories()
      }
    } catch (error) {
      console.error('Unexpected error adding memory:', error)
      alert('Failed to add memory. Please try again.')
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
    return <Icon className={`w-5 h-5 ${moodColors[mood]}`} />
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            My Memories
          </h1>
          <p className="text-muted-foreground text-lg">
            Your personal memory journal.
          </p>
        </div>
        <Button size="lg" className="gap-2 text-white dark:text-black" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Memory
        </Button>
      </div>

      {memories.length > 0 ? (
        <div className="space-y-6">
          {memories.map((memory) => (
            <Link key={memory.id} href={`/memories/${memory.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {memory.photo_url && (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={memory.photo_url} 
                          alt={memory.title || "Memory"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {memory.title && (
                          <h3 className="text-xl font-semibold text-foreground">
                            {memory.title}
                          </h3>
                        )}
                        {memory.mood && getMoodIcon(memory.mood)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(memory.memory_date)}</span>
                      </div>
                      <p className="text-foreground mb-3 line-clamp-3">
                        {memory.content}
                      </p>
                      {memory.tags && memory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {memory.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Your memories will appear here
            </h3>
            <p className="text-muted-foreground mb-6">
              Add your first memory to get started with your personal journal.
            </p>
            <Button size="lg" className="gap-2 text-white dark:text-black" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-5 h-5" />
              Add Your First Memory
            </Button>
          </CardContent>
        </Card>
      )}

      <MemoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleAddMemory}
      />
    </div>
  )
}