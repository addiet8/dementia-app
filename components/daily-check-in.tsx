"use client";

import { useState, useEffect } from "react";
import { Smile, Meh, Frown, Check, MessageSquare, ChevronRight, Sparkles } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MoodType = "good" | "okay" | "not_great";

interface CheckInRecord {
  id?: string;
  date: string;
  mood: MoodType;
  notes?: string;
}

export function DailyCheckIn({ onCompleted }: { onCompleted?: () => void }) {
  const [existingCheckIn, setExistingCheckIn] = useState<CheckInRecord | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [notes, setNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadTodayCheckIn();
  }, []);

  const loadTodayCheckIn = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("check_ins")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("date", today)
        .maybeSingle();

      if (!error && data) {
        setExistingCheckIn(data as CheckInRecord);
        setSelectedMood(data.mood);
        if (data.notes) setNotes(data.notes);
      }
    } catch (err) {
      console.error("Error loading today check in:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (moodToSave?: MoodType) => {
    const mood = moodToSave || selectedMood;
    if (!mood) return;

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("check_ins")
        .upsert(
          {
            user_id: session.user.id,
            date: today,
            mood,
            notes: notes.trim() || null,
          },
          { onConflict: "user_id,date" }
        )
        .select()
        .single();

      if (!error && data) {
        setExistingCheckIn(data as CheckInRecord);
        setShowNotesInput(false);

        // Notify caregiver
        try {
          const { data: connections } = await supabase
            .from("caregiver_connections")
            .select("caregiver_id")
            .eq("user_id", session.user.id)
            .eq("status", "active");

          if (connections && connections.length > 0) {
            const moodLabel = mood === "good" ? "Good 😊" : mood === "okay" ? "Okay 😐" : "Not Great 😔";
            const notifications = connections.map((c: any) => ({
              caregiver_id: c.caregiver_id,
              user_id: session.user.id,
              type: "system",
              title: "Daily Check-in Completed",
              message: `Reported feeling ${moodLabel}.${notes.trim() ? ` Note: "${notes.trim()}"` : ""}`,
              read: false,
            }));
            await supabase.from("notifications").insert(notifications);
          }
        } catch (notifErr) {
          console.warn("Could not notify caregiver:", notifErr);
        }

        if (onCompleted) onCompleted();
      }
    } catch (err) {
      console.error("Error saving check in:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || dismissed) return null;

  const moodOptions: { id: MoodType; label: string; icon: any; color: string; bg: string }[] = [
    {
      id: "good",
      label: "Good",
      icon: Smile,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    },
    {
      id: "okay",
      label: "Okay",
      icon: Meh,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    },
    {
      id: "not_great",
      label: "Not Great",
      icon: Frown,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    },
  ];

  // Already completed today
  if (existingCheckIn && !showNotesInput) {
    const currentMoodOption = moodOptions.find((m) => m.id === existingCheckIn.mood);
    const MoodIcon = currentMoodOption?.icon || Smile;

    return (
      <Card className="mb-6 border border-border bg-card/60 backdrop-blur-sm">
        <CardContent className="p-4 md:p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${currentMoodOption?.bg} border shrink-0`}>
              <MoodIcon className={`w-6 h-6 ${currentMoodOption?.color}`} />
            </div>
            <div>
              <p className="font-semibold text-sm md:text-base text-foreground">
                Today's Check-in Complete
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                You felt <span className="font-medium text-foreground">{currentMoodOption?.label}</span> today.
                {existingCheckIn.notes && ` "${existingCheckIn.notes}"`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotesInput(true)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Update
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg md:text-xl font-bold">
              How are you feeling today?
            </CardTitle>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-xs text-muted-foreground hover:text-foreground underline px-2 py-1"
          >
            Skip for now
          </button>
        </div>
        <CardDescription className="text-xs md:text-sm">
          A quick moment to check in with yourself.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mood buttons */}
        <div className="grid grid-cols-3 gap-3">
          {moodOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedMood === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSelectedMood(opt.id);
                  setShowNotesInput(true);
                }}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  opt.bg
                } ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 scale-[1.02] shadow-sm font-semibold"
                    : "opacity-85 hover:opacity-100"
                }`}
              >
                <Icon className={`w-8 h-8 ${opt.color}`} />
                <span className="text-sm font-medium text-foreground">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Optional follow-up text */}
        {showNotesInput && (
          <div className="space-y-3 pt-2 animate-in fade-in-50 duration-200">
            <label className="text-xs font-medium text-muted-foreground block">
              Would you like to tell us more? (optional)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Slept well, enjoying the sunshine..."
              className="text-sm h-11"
              maxLength={140}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowNotesInput(false);
                  if (!existingCheckIn) setDismissed(true);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave()}
                disabled={saving || !selectedMood}
                className="gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Check-in"}</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
