"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface MedicationDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (medication: { name: string; dosage?: string; instructions?: string }) => void
}

export function MedicationDialog({ isOpen, onClose, onAdd }: MedicationDialogProps) {
  const [name, setName] = useState("")
  const [dosage, setDosage] = useState("")
  const [instructions, setInstructions] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAdd({ 
        name: name.trim(), 
        dosage: dosage.trim() || undefined, 
        instructions: instructions.trim() || undefined 
      })
      setName("")
      setDosage("")
      setInstructions("")
      onClose()
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medication</DialogTitle>
          <DialogDescription>
            Add a new medication to your list.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Medication Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aspirin, Lisinopril"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Dosage (optional)</label>
            <Input
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 10mg, 1 tablet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Instructions (optional)</label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Take with food, Take in the morning"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="text-foreground dark:text-white" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="text-white dark:text-black">Add Medication</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}