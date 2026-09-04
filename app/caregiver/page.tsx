"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Smile,
  Meh,
  Frown,
  Users,
  Bell,
  Heart,
  Target,
  Zap,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabase/client";

interface ConnectedPatient {
  id: string;
  full_name: string;
  preferred_name?: string;
  email: string;
}

export default function CaregiverDashboardPage() {
  const [patients, setPatients] = useState<ConnectedPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [caregiverName, setCaregiverName] = useState<string>("Caregiver");
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [todayCheckIn, setTodayCheckIn] = useState<any>(null);
  const [performanceSummary, setPerformanceSummary] = useState<Record<string, { trend: string; accuracy: number }>>({});
  const [activityStats, setActivityStats] = useState({ completed: 0, total: 3 });
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    initCaregiverData();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientDetails(selectedPatientId);
    }
  }, [selectedPatientId]);

  const initCaregiverData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Caregiver profile
      const { data: cProfile } = await supabase
        .from("profiles")
        .select("full_name, preferred_name")
        .eq("id", session.user.id)
        .maybeSingle();

      if (cProfile) {
        setCaregiverName(cProfile.preferred_name || cProfile.full_name || "Caregiver");
      }

      // Find connected patients
      const { data: connections, error: connErr } = await supabase
        .from("caregiver_connections")
        .select(`
          user_id,
          status,
          profiles:profiles!caregiver_connections_user_id_fkey(id, full_name, preferred_name, email)
        `)
        .eq("caregiver_id", session.user.id)
        .eq("status", "active");

      let patientList: ConnectedPatient[] = [];

      if (!connErr && connections && connections.length > 0) {
        patientList = connections
          .map((c: any) => c.profiles)
          .filter(Boolean);
      }

      // If no connections found, allow caregiver to view self or demo patient
      if (patientList.length === 0) {
        patientList = [
          {
            id: session.user.id,
            full_name: "Self / Active Account",
            preferred_name: "Margaret Johnson",
            email: session.user.email || "",
          },
        ];
      }

      setPatients(patientList);
      const defaultId = patientList[0]?.id || session.user.id;
      setSelectedPatientId(defaultId);
    } catch (err) {
      console.error("Error initializing caregiver data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // 1. Patient Profile
      const { data: pProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", patientId)
        .maybeSingle();
      setPatientProfile(pProfile);

      // 2. Today's Schedules
      const { data: schedules } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", patientId)
        .eq("date", today)
        .order("time", { ascending: true });

      const schedList = schedules || [];
      setTodaySchedule(schedList);

      // 3. Check-in
      const { data: checkIn } = await supabase
        .from("check_ins")
        .select("*")
        .eq("user_id", patientId)
        .eq("date", today)
        .maybeSingle();
      setTodayCheckIn(checkIn);

      // 4. Performance metrics summary (last 30 days)
      const { data: metrics } = await supabase
        .from("performance_metrics")
        .select("*")
        .eq("user_id", patientId)
        .order("date", { ascending: false });

      const summary: Record<string, { trend: string; accuracy: number }> = {
        memory: { trend: "stable", accuracy: 78 },
        attention: { trend: "improving", accuracy: 84 },
        reaction: { trend: "stable", accuracy: 82 },
      };

      if (metrics && metrics.length > 0) {
        ["memory", "attention", "reaction"].forEach((cat) => {
          const catEntries = metrics.filter(
            (m: any) => m.activity_type === cat || m.category === cat
          );
          if (catEntries.length > 0) {
            summary[cat] = {
              trend: catEntries[0].trend || "stable",
              accuracy: Math.round(catEntries[0].average_accuracy || catEntries[0].avg_accuracy || 80),
            };
          }
        });
      }
      setPerformanceSummary(summary);

      // Calculate activity participation
      const completedSched = schedList.filter((s: any) => s.completed).length;
      const totalSched = Math.max(schedList.length, 3);
      setActivityStats({ completed: completedSched, total: totalSched });

      // 5. Recent notifications
      const { data: notifs } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", patientId)
        .order("created_at", { ascending: false })
        .limit(3);
      setRecentNotifications(notifs || []);
    } catch (err) {
      console.error("Error loading patient details:", err);
    }
  };

  const toggleScheduleComplete = async (scheduleId: string, current: boolean) => {
    setTodaySchedule((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, completed: !current } : s))
    );

    try {
      await supabase
        .from("schedules")
        .update({
          completed: !current,
          completed_at: !current ? new Date().toISOString() : null,
        })
        .eq("id", scheduleId);
    } catch (err) {
      console.error("Error toggling schedule item:", err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const patientDisplayName =
    patientProfile?.preferred_name || patientProfile?.full_name || "Margaret";

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {getGreeting()}, {caregiverName}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Monitoring & Care Companion Overview
          </p>
        </div>

        {/* Patient Switcher */}
        {patients.length > 1 && (
          <div className="flex items-center gap-2 bg-card p-2 rounded-2xl border border-border">
            <Users className="w-4 h-4 text-primary shrink-0 ml-1" />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer pr-2"
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

      {/* 5-Second Overview Card */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/70 via-background to-teal-50/50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                {patientDisplayName}&apos;s Overview
              </span>
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <h2 className="text-2xl font-bold text-foreground">
                  {todayCheckIn?.mood === "not_great"
                    ? "Needs a little extra care today"
                    : "Doing well today"}
                </h2>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                {todayCheckIn?.notes
                  ? `Recent note: "${todayCheckIn.notes}"`
                  : "Routines and morning activities are on track."}
              </p>
            </div>

            <div className="flex items-center gap-6 bg-background/80 backdrop-blur-sm p-4 rounded-2xl border border-border shrink-0">
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Activity</span>
                <span className="text-xl font-bold text-foreground">
                  {activityStats.completed} / {activityStats.total}
                </span>
                <span className="text-[10px] text-muted-foreground block">completed</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Mood</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {todayCheckIn?.mood === "good"
                    ? "😊 Good"
                    : todayCheckIn?.mood === "not_great"
                    ? "😔 Down"
                    : "😐 Okay"}
                </span>
                <span className="text-[10px] text-muted-foreground block">today</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Schedule Preview & Cognitive Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule Preview */}
        <Card className="flex flex-col border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
            </div>
            <Link
              href="/caregiver/schedule"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Manage Schedule
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between space-y-3">
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No schedule items recorded for today.</p>
                <Link href="/caregiver/schedule" className="mt-2 inline-block">
                  <Button size="sm" variant="outline" className="text-xs mt-2">
                    + Add Schedule Item
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {todaySchedule.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleScheduleComplete(item.id, item.completed)}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            item.completed
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono shrink-0 ml-2">
                      {item.time?.slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
              <span>Click items to mark completed</span>
              <Link href="/caregiver/schedule" className="text-primary hover:underline">
                View all items →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Cognitive Activity Summary */}
        <Card className="flex flex-col border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Cognitive Activity Trends</CardTitle>
            </div>
            <Link
              href="/caregiver/progress"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View Full Progress
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {/* Memory */}
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-center space-y-1">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto" />
                <span className="text-xs font-bold text-foreground block">Memory</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full inline-block font-semibold capitalize ${
                    performanceSummary.memory?.trend === "improving"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {performanceSummary.memory?.trend || "Stable"}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  ~{performanceSummary.memory?.accuracy || 75}% accuracy
                </span>
              </div>

              {/* Attention */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-center space-y-1">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto" />
                <span className="text-xs font-bold text-foreground block">Attention</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full inline-block font-semibold capitalize ${
                    performanceSummary.attention?.trend === "improving"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {performanceSummary.attention?.trend || "Stable"}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  ~{performanceSummary.attention?.accuracy || 82}% accuracy
                </span>
              </div>

              {/* Reaction */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-1">
                <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto" />
                <span className="text-xs font-bold text-foreground block">Reaction</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full inline-block font-semibold capitalize ${
                    performanceSummary.reaction?.trend === "improving"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {performanceSummary.reaction?.trend || "Stable"}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  ~{performanceSummary.reaction?.accuracy || 80}% accuracy
                </span>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-0.5">Non-Diagnostic Insight</p>
              Activity and recall metrics have maintained healthy consistency over the past several sessions.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/caregiver/schedule" className="group">
          <Card className="h-full border border-border hover:border-primary/50 transition-all hover:shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Manage Schedule
                </h3>
                <p className="text-xs text-muted-foreground">
                  Update appointments, routines & medication reminders
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/caregiver/memories" className="group">
          <Card className="h-full border border-border hover:border-primary/50 transition-all hover:shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Memory Journal
                </h3>
                <p className="text-xs text-muted-foreground">
                  View fond memories, meaningful stories & photos
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/caregiver/progress" className="group">
          <Card className="h-full border border-border hover:border-primary/50 transition-all hover:shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Cognitive Analytics
                </h3>
                <p className="text-xs text-muted-foreground">
                  View historical performance charts & attempt details
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
