"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, CheckCircle, Circle, Clock, Pill } from "lucide-react"
import { ScheduleDialog } from "@/components/schedule-dialog"
import { MedicationDialog } from "@/components/medication-dialog"
import { createSupabaseClient } from "@/lib/supabase/client"

interface ScheduleItem {
  id: string
  title: string
  time: string
  description?: string
  completed: boolean
  reminder: boolean
}

interface Medication {
  id: string
  name: string
  dosage?: string
  instructions?: string
}

export default function SchedulePage() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMedDialogOpen, setIsMedDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScheduleData()
  }, [])

  const loadScheduleData = async () => {
    const supabase = createSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('Load schedule data - Session:', session ? 'active' : 'null', 'Error:', sessionError)
    
    if (!session) return

    const today = new Date().toISOString().split('T')[0]
    
    const [scheduleResult, medsResult] = await Promise.all([
      supabase
        .from('schedules')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .order('time', { ascending: true }),
      supabase
        .from('medications')
        .select('*')
        .eq('user_id', session.user.id)
    ])

    setScheduleItems(scheduleResult.data || [])
    setMedications(medsResult.data || [])
    setLoading(false)
  }

  const handleAddScheduleItem = async (item: { title: string; time: string; description?: string }) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Auth error:', sessionError)
        alert('Authentication error. Please try logging in again.')
        return
      }
      
      if (!session) {
        alert('You must be logged in to add schedule items')
        return
      }

      console.log('User ID:', session.user.id, 'Adding schedule item:', item)

      const today = new Date().toISOString().split('T')[0]
      
      const { error } = await supabase
        .from('schedules')
        .insert({
          user_id: session.user.id,
          title: item.title,
          time: item.time,
          date: today,
          description: item.description,
          completed: false,
          reminder: false
        })

      if (error) {
        console.error('Error adding schedule item:', error)
        if (error.code === '42P01') {
          alert('Database tables not set up. Please run the database schema from supabase/schema.sql in your Supabase SQL Editor.')
        } else {
          alert(`Failed to add schedule item: ${error.message || 'Unknown error'}`)
        }
      } else {
        loadScheduleData()
      }
    } catch (error) {
      console.error('Unexpected error adding schedule item:', error)
      alert('Failed to add schedule item. Please try again.')
    }
  }

  const toggleComplete = async (id: string, completed: boolean) => {
    const supabase = createSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) return
    
    const { error } = await supabase
      .from('schedules')
      .update({ 
        completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (!error) {
      setScheduleItems(items =>
        items.map(item =>
          item.id === id ? { ...item, completed } : item
        )
      )
    }
  }

  const handleAddMedication = async (medication: { name: string; dosage?: string; instructions?: string }) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Auth error:', sessionError)
        alert('Authentication error. Please try logging in again.')
        return
      }
      
      if (!session) {
        alert('You must be logged in to add medications')
        return
      }

      console.log('User ID:', session.user.id, 'Adding medication:', medication)
      
      const { error } = await supabase
        .from('medications')
        .insert({
          user_id: session.user.id,
          name: medication.name,
          dosage: medication.dosage,
          instructions: medication.instructions
        })

      if (error) {
        console.error('Error adding medication:', error)
        if (error.code === '42P01') {
          alert('Database tables not set up. Please run the database schema from supabase/schema.sql in your Supabase SQL Editor.')
        } else {
          alert(`Failed to add medication: ${error.message || 'Unknown error'}`)
        }
      } else {
        loadScheduleData()
      }
    } catch (error) {
      console.error('Unexpected error adding medication:', error)
      alert('Failed to add medication. Please try again.')
    }
  }

  const handleMarkAsTaken = async (medicationId: string) => {
    try {
      const supabase = createSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase
        .from('medication_logs')
        .insert({
          medication_id: medicationId,
          user_id: session.user.id,
          scheduled_time: new Date().toISOString(),
          taken: true,
          taken_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error logging medication:', error)
        alert('Failed to log medication. Please try again.')
      } else {
        alert('Medication marked as taken!')
      }
    } catch (error) {
      console.error('Unexpected error logging medication:', error)
      alert('Failed to log medication. Please try again.')
    }
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
            Schedule
          </h1>
          <p className="text-muted-foreground text-lg">
            Your daily schedule and upcoming events.
          </p>
        </div>
        <Button size="lg" className="gap-2 text-white dark:text-black" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-5 h-5" />
          Add Item
        </Button>
      </div>

      {/* Today's Schedule */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduleItems.length > 0 ? (
            <div className="space-y-3">
              {scheduleItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => toggleComplete(item.id, !item.completed)}
                >
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title}
                      </span>
                      {item.reminder && (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(item.time)}
                      {item.description && ` • ${item.description}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Your schedule is empty for today.
              </p>
              <Button variant="outline" className="text-foreground dark:text-white" onClick={() => setIsDialogOpen(true)}>
                Add something to your schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-orange-500" />
              Medications
            </CardTitle>
            <Button size="sm" variant="outline" className="text-foreground dark:text-white" onClick={() => setIsMedDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {medications.length > 0 ? (
            <div className="space-y-3">
              {medications.map((med) => (
                <div key={med.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
                    <Pill className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{med.name}</h4>
                    {med.dosage && (
                      <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    )}
                    {med.instructions && (
                      <p className="text-sm text-muted-foreground">{med.instructions}</p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-foreground dark:text-white"
                    onClick={() => handleMarkAsTaken(med.id)}
                  >
                    Mark as Taken
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No medications added yet.
              </p>
              <Button variant="outline" className="text-foreground dark:text-white" onClick={() => setIsMedDialogOpen(true)}>
                Add Your First Medication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ScheduleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleAddScheduleItem}
      />
      
      <MedicationDialog
        isOpen={isMedDialogOpen}
        onClose={() => setIsMedDialogOpen(false)}
        onAdd={handleAddMedication}
      />
    </div>
  )
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}