"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, Clock, Pill, Trash2, CheckCircle2, Circle, AlertCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createSupabaseClient } from "@/lib/supabase/client";

interface ScheduleItem {
  id: string;
  user_id: string;
  title: string;
  time: string;
  date: string;
  description?: string;
  completed: boolean;
  reminder: boolean;
}

interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage?: string;
  instructions?: string;
}

export default function CaregiverSchedulePage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);

  // New Schedule Form
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleDesc, setScheduleDesc] = useState("");
  const [scheduleReminder, setScheduleReminder] = useState(true);

  // New Medication Form
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medInstructions, setMedInstructions] = useState("");

  const supabase = createSupabaseClient();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      loadData(selectedPatientId);
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
          status,
          profiles:profiles!caregiver_connections_user_id_fkey(id, full_name, preferred_name, email)
        `)
        .eq("caregiver_id", session.user.id)
        .eq("status", "active");

      let list = [];
      if (connections && connections.length > 0) {
        list = connections.map((c: any) => c.profiles).filter(Boolean);
      }
      if (list.length === 0) {
        list = [{ id: session.user.id, full_name: "Active Account", preferred_name: "Margaret" }];
      }

      setPatients(list);
      setSelectedPatientId(list[0]?.id || session.user.id);
      setScheduleDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      console.error("Error initializing caregiver schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (patientId: string) => {
    try {
      const [schedulesRes, medsRes] = await Promise.all([
        supabase
          .from("schedules")
          .select("*")
          .eq("user_id", patientId)
          .order("date", { ascending: true })
          .order("time", { ascending: true }),
        supabase
          .from("medications")
          .select("*")
          .eq("user_id", patientId)
          .order("created_at", { ascending: true }),
      ]);

      setScheduleItems(schedulesRes.data || []);
      setMedications(medsRes.data || []);
    } catch (err) {
      console.error("Error loading patient schedule/meds:", err);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim() || !scheduleDate || !scheduleTime) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from("schedules").insert({
        user_id: selectedPatientId,
        title: scheduleTitle.trim(),
        date: scheduleDate,
        time: scheduleTime,
        description: scheduleDesc.trim() || null,
        reminder: scheduleReminder,
        completed: false,
        created_by: session?.user.id,
      });

      if (!error) {
        setIsScheduleModalOpen(false);
        setScheduleTitle("");
        setScheduleDesc("");
        loadData(selectedPatientId);
      }
    } catch (err) {
      console.error("Error creating schedule item:", err);
    }
  };

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    try {
      const { error } = await supabase.from("medications").insert({
        user_id: selectedPatientId,
        name: medName.trim(),
        dosage: medDosage.trim() || null,
        instructions: medInstructions.trim() || null,
      });

      if (!error) {
        setIsMedModalOpen(false);
        setMedName("");
        setMedDosage("");
        setMedInstructions("");
        loadData(selectedPatientId);
      }
    } catch (err) {
      console.error("Error creating medication:", err);
    }
  };

  const toggleComplete = async (itemId: string, current: boolean) => {
    setScheduleItems((prev) =>
      prev.map((s) => (s.id === itemId ? { ...s, completed: !current } : s))
    );

    await supabase
      .from("schedules")
      .update({
        completed: !current,
        completed_at: !current ? new Date().toISOString() : null,
      })
      .eq("id", itemId);
  };

  const deleteSchedule = async (itemId: string) => {
    setScheduleItems((prev) => prev.filter((s) => s.id !== itemId));
    await supabase.from("schedules").delete().eq("id", itemId);
  };

  const deleteMedication = async (medId: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== medId));
    await supabase.from("medications").delete().eq("id", medId);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayItems = scheduleItems.filter((s) => s.date === todayStr);
  const upcomingItems = scheduleItems.filter((s) => s.date > todayStr);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule & Medications</h1>
          <p className="text-muted-foreground text-sm">
            Manage daily routines, appointments, and medication reminders
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <Button onClick={() => setIsScheduleModalOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsMedModalOpen(true)}
            className="gap-1.5"
          >
            <Pill className="w-4 h-4" />
            <span>Add Medication</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Columns (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Today&apos;s Schedule
                </CardTitle>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {todayItems.filter((i) => i.completed).length} / {todayItems.length} Done
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayItems.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No events scheduled for today.
                </div>
              ) : (
                todayItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleComplete(item.id, item.completed)}
                        className="text-primary hover:opacity-80 transition-opacity"
                        aria-label="Toggle completion"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            item.completed ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {item.time?.slice(0, 5)}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteSchedule(item.id)}
                        className="text-muted-foreground hover:text-error transition-colors p-1"
                        aria-label="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Schedule */}
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Routine & Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingItems.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No upcoming schedule items.
                </div>
              ) : (
                upcomingItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.date} • {item.time?.slice(0, 5)}
                        {item.description && ` — ${item.description}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteSchedule(item.id)}
                      className="text-muted-foreground hover:text-error transition-colors p-1"
                      aria-label="Delete upcoming event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Medications List (1 col) */}
        <div>
          <Card className="border border-border h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Prescriptions
                </CardTitle>
                <button
                  type="button"
                  onClick={() => setIsMedModalOpen(true)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  + Add
                </button>
              </div>
              <CardDescription className="text-xs">
                Active medications and dosages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {medications.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No medications configured.
                </div>
              ) : (
                medications.map((med) => (
                  <div
                    key={med.id}
                    className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{med.name}</span>
                        {med.dosage && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-mono">
                            {med.dosage}
                          </span>
                        )}
                      </div>
                      {med.instructions && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {med.instructions}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMedication(med.id)}
                      className="text-muted-foreground hover:text-error transition-colors p-1"
                      aria-label="Delete medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Schedule Modal */}
      <Dialog isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Schedule Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Event Title *
              </label>
              <Input
                placeholder="e.g. Afternoon Tea, Brain Training, Doctor Visit"
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Date *</label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Time *</label>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Description / Instructions
              </label>
              <Input
                placeholder="Helpful notes or reminders"
                value={scheduleDesc}
                onChange={(e) => setScheduleDesc(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Event</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Medication Modal */}
      <Dialog isOpen={isMedModalOpen} onClose={() => setIsMedModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateMedication} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Medication Name *
              </label>
              <Input
                placeholder="e.g. Donepezil, Lisinopril"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Dosage</label>
              <Input
                placeholder="e.g. 5mg, 1 tablet"
                value={medDosage}
                onChange={(e) => setMedDosage(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Instructions
              </label>
              <Input
                placeholder="e.g. Take with breakfast glass of water"
                value={medInstructions}
                onChange={(e) => setMedInstructions(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMedModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Medication</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
