"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Smile, Sparkles, Heart, Meh, Frown, AlertCircle, Upload, X } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"

interface MemoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (memory: { title?: string; content: string; photo_url?: string; mood?: string; tags?: string[]; memory_date?: string }) => void
}

const moodOptions = [
  { value: "happy", label: "Happy", icon: Smile, color: "text-yellow-500" },
  { value: "excited", label: "Excited", icon: Sparkles, color: "text-purple-500" },
  { value: "calm", label: "Calm", icon: Heart, color: "text-green-500" },
  { value: "neutral", label: "Okay", icon: Meh, color: "text-gray-500" },
  { value: "sad", label: "Sad", icon: Frown, color: "text-blue-500" },
  { value: "anxious", label: "Anxious", icon: AlertCircle, color: "text-orange-500" }
]

const prompts = [
  "What did you enjoy today?",
  "Who did you spend time with?",
  "What is something you want to remember?",
  "What made you smile today?",
  "What are you grateful for?"
]

export function MemoryDialog({ isOpen, onClose, onAdd }: MemoryDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("")
  const [tags, setTags] = useState("")
  const [memoryDate, setMemoryDate] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState("")
  const [uploading, setUploading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      const tagArray = tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      onAdd({
        title: title || undefined,
        content: content.trim(),
        photo_url: photoUrl || undefined,
        mood: mood || undefined,
        tags: tagArray.length > 0 ? tagArray : undefined,
        memory_date: memoryDate || undefined
      })

      // Reset form
      setTitle("")
      setContent("")
      setMood("")
      setTags("")
      setMemoryDate("")
      setPhotoUrl("")
      setSelectedPrompt("")
      onClose()
    }
  }

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt)
    setContent(prompt)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload photo')
      }

      const data = await response.json()
      setPhotoUrl(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Memory</DialogTitle>
          <DialogDescription>
            What would you like to remember?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Photo (optional)</label>
            {photoUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                <img src={photoUrl} alt="Memory photo" className="w-full h-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 text-white dark:text-black"
                  onClick={() => setPhotoUrl("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Uploading photo...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload a photo
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="max-w-xs mx-auto"
                    />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title (optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your memory a title"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">What would you like to remember?</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write about your memory..."
              rows={4}
              required
            />
            
            {/* Prompts */}
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-2">Need inspiration?</p>
              <div className="flex flex-wrap gap-2">
                {prompts.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromptClick(prompt)}
                    className="text-xs text-foreground dark:text-white"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium mb-2">How are you feeling? (optional)</label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((option) => {
                const Icon = option.icon
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={mood === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMood(option.value)}
                    className={`gap-2 ${mood === option.value ? "text-white dark:text-black" : "text-foreground dark:text-white"}`}
                  >
                    <Icon className={`w-4 h-4 ${mood === option.value ? "" : option.color}`} />
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Memory Date */}
          <div>
            <label className="block text-sm font-medium mb-2">When did this happen? (optional)</label>
            <Input
              type="date"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave blank if this happened today
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (optional)</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., Family, Beach, Sarah (comma separated)"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="text-foreground dark:text-white" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="text-white dark:text-black">Save Memory</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}