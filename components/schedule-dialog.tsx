"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ScheduleDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (item: { title: string; time: string; description?: string }) => void
}

export function ScheduleDialog({ isOpen, onClose, onAdd }: ScheduleDialogProps) {
  const [title, setTitle] = useState("")
  const [time, setTime] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title && time) {
      onAdd({ title, time, description: description || undefined })
      setTitle("")
      setTime("")
      setDescription("")
      onClose()
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Schedule</DialogTitle>
          <DialogDescription>
            Add a new item to your daily schedule.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Breakfast, Walk, Doctor appointment"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Time</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="text-foreground dark:text-white" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="text-white dark:text-black">Add to Schedule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}