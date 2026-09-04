"use client";

import { useState, useEffect } from "react";
import { BookOpen, Calendar, Heart, Smile, Meh, Frown, Sparkles, Users, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createSupabaseClient } from "@/lib/supabase/client";

interface Memory {
  id: string;
  title: string | null;
  content: string;
  photo_url: string | null;
  mood: string | null;
  tags: string[] | null;
  memory_date: string | null;
  created_at: string;
}

const moodIcons: Record<string, any> = {
  happy: Smile,
  excited: Sparkles,
  calm: Heart,
  neutral: Meh,
  sad: Frown,
};

const moodColors: Record<string, string> = {
  happy: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
  excited: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
  calm: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
  neutral: "text-slate-500 bg-slate-50 dark:bg-slate-900/40",
  sad: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
};

export default function CaregiverMemoriesPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      loadMemories(selectedPatientId);
    }
  }, [selectedPatientId]);

  const init = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: connections } = await supabase
        .from("caregiver_connections")
        .select(`
          user_id,
          profiles:profiles!caregiver_connections_user_id_fkey(id, full_name, preferred_name, email)
        `)
        .eq("caregiver_id", session.user.id)
        .eq("status", "active");

      let list = [];
      if (connections && connections.length > 0) {
        list = connections.map((c: any) => c.profiles).filter(Boolean);
      }
      if (list.length === 0) {
        list = [{ id: session.user.id, full_name: "Active Patient", preferred_name: "Margaret" }];
      }

      setPatients(list);
      setSelectedPatientId(list[0]?.id || session.user.id);
    } catch (err) {
      console.error("Error initializing caregiver memories:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMemories = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from("journal_memories")
        .select("*")
        .eq("user_id", patientId)
        .order("memory_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (!error) {
        setMemories(data || []);
      }
    } catch (err) {
      console.error("Error loading memories:", err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Memory Journal</h1>
          <p className="text-muted-foreground text-sm">
            Read-only compassionate timeline of recorded memories and meaningful stories
          </p>
        </div>

        {patients.length > 1 && (
          <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-xl border border-border">
            <Users className="w-4 h-4 text-primary" />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
              aria-label="Select patient"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.preferred_name || p.full_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading memories...</div>
      ) : memories.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-12 text-center space-y-2">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <p className="font-semibold text-foreground">No memories recorded yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              When the patient records special moments, photos, and thoughts, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {memories.map((mem) => {
            const MoodIcon = mem.mood && moodIcons[mem.mood] ? moodIcons[mem.mood] : Heart;
            const moodStyle = mem.mood && moodColors[mem.mood] ? moodColors[mem.mood] : "text-primary bg-primary/10";

            return (
              <Card key={mem.id} className="border border-border hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground">
                        {mem.title || "Special Moment"}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{mem.memory_date || mem.created_at?.slice(0, 10)}</span>
                      </div>
                    </div>

                    {mem.mood && (
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold capitalize ${moodStyle}`}>
                        <MoodIcon className="w-4 h-4" />
                        <span>{mem.mood}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {mem.content}
                  </p>

                  {mem.photo_url && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-border max-w-md">
                      <img
                        src={mem.photo_url}
                        alt={mem.title || "Memory photo"}
                        className="w-full h-56 object-cover"
                      />
                    </div>
                  )}

                  {mem.tags && mem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                      {mem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
