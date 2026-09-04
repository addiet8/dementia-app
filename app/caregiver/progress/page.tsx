"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Brain,
  Target,
  Zap,
  Eye,
  Calendar,
  Users,
  Activity,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabase/client";

type TimeFilter = "today" | "7days" | "30days" | "3months";
type CategoryKey = "memory" | "attention" | "reaction" | "visual";

interface MetricRecord {
  id?: string;
  activity_type?: string;
  category?: string;
  date: string;
  average_accuracy?: number;
  avg_accuracy?: number;
  average_reaction_time?: number;
  avg_reaction_time_ms?: number;
  sessions_completed?: number;
  difficulty_level?: number;
  trend?: string;
}

export default function CaregiverProgressPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30days");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("memory");
  const [metrics, setMetrics] = useState<MetricRecord[]>([]);
  const [sessionAttempts, setSessionAttempts] = useState<any[]>([]);
  const [showAttemptDetails, setShowAttemptDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      loadMetrics(selectedPatientId, timeFilter);
    }
  }, [selectedPatientId, timeFilter]);

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
        list = [{ id: session.user.id, full_name: "Active Account", preferred_name: "Margaret" }];
      }

      setPatients(list);
      setSelectedPatientId(list[0]?.id || session.user.id);
    } catch (err) {
      console.error("Error initializing caregiver progress:", err);
    }
  };

  const loadMetrics = async (patientId: string, filter: TimeFilter) => {
    setLoading(true);
    try {
      const today = new Date();
      const filterStart = new Date();

      switch (filter) {
        case "today":
          filterStart.setHours(0, 0, 0, 0);
          break;
        case "7days":
          filterStart.setDate(today.getDate() - 7);
          break;
        case "30days":
          filterStart.setDate(today.getDate() - 30);
          break;
        case "3months":
          filterStart.setMonth(today.getMonth() - 3);
          break;
      }

      const startStr = filterStart.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("performance_metrics")
        .select("*")
        .eq("user_id", patientId)
        .gte("date", startStr)
        .order("date", { ascending: true });

      if (!error && data) {
        setMetrics(data as MetricRecord[]);
      } else {
        setMetrics([]);
      }

      // Also load recent activity sessions for attempt details
      const { data: sessions } = await supabase
        .from("activity_sessions")
        .select(`
          id,
          started_at,
          completed_at,
          difficulty_level,
          completion_status,
          activities:activities!activity_sessions_activity_id_fkey(name, category)
        `)
        .eq("user_id", patientId)
        .order("started_at", { ascending: false })
        .limit(10);

      setSessionAttempts(sessions || []);
    } catch (err) {
      console.error("Error loading metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const categoryMeta: Record<CategoryKey, { label: string; icon: any; color: string; bg: string }> = {
    memory: {
      label: "Memory",
      icon: Brain,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
    },
    attention: {
      label: "Attention",
      icon: Target,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    },
    reaction: {
      label: "Reaction",
      icon: Zap,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    },
    visual: {
      label: "Visual",
      icon: Eye,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    },
  };

  // Filter metrics for selected category
  const filteredMetrics = metrics.filter(
    (m) => (m.activity_type || m.category) === selectedCategory
  );

  // SVG Chart rendering calculations
  const chartWidth = 600;
  const chartHeight = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const isReaction = selectedCategory === "reaction";

  // Get data points
  const points = filteredMetrics.map((m) => ({
    date: m.date.slice(5),
    value: isReaction
      ? m.average_reaction_time || m.avg_reaction_time_ms || 800
      : m.average_accuracy || m.avg_accuracy || 75,
  }));

  const values = points.map((p) => p.value);
  const minVal = values.length ? Math.min(...values) : (isReaction ? 400 : 40);
  const maxVal = values.length ? Math.max(...values) : (isReaction ? 1400 : 100);
  const yRange = maxVal - minVal || 1;

  const getCoordinates = (val: number, index: number, total: number) => {
    const x =
      padding.left +
      (index / (total > 1 ? total - 1 : 1)) *
        (chartWidth - padding.left - padding.right);
    const y =
      chartHeight -
      padding.bottom -
      ((val - minVal) / yRange) *
        (chartHeight - padding.top - padding.bottom);
    return { x, y };
  };

  const pathD = points
    .map((p, i) => {
      const { x, y } = getCoordinates(p.value, i, points.length);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Trend detection observation
  const latestTrend = filteredMetrics[filteredMetrics.length - 1]?.trend || "stable";
  const avgAccuracy =
    points.length > 0
      ? Math.round(points.reduce((acc, p) => acc + p.value, 0) / points.length)
      : 80;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cognitive Performance Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Longitudinal trend observation and activity engagement metrics
          </p>
        </div>

        {/* Patient Switcher */}
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

      {/* Non-Diagnostic Clinical & Ethical Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-start gap-3 text-xs md:text-sm text-muted-foreground">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground block">
            Non-Diagnostic Performance Observation
          </span>
          MindMate tracks cognitive-task performance to help understand routine consistency and exercise engagement over time. These observations are supportive insights and are not intended to diagnose, stage, or predict dementia progression.
        </div>
      </div>

      {/* Filter and Category Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {(["memory", "attention", "reaction", "visual"] as CategoryKey[]).map((cat) => {
            const Meta = categoryMeta[cat];
            const Icon = Meta.icon;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-sm scale-[1.02]"
                    : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{Meta.label}</span>
              </button>
            );
          })}
        </div>

        {/* Time Filters */}
        <div className="flex bg-muted p-1 rounded-xl border border-border">
          {[
            { id: "today", label: "Today" },
            { id: "7days", label: "7 Days" },
            { id: "30days", label: "30 Days" },
            { id: "3months", label: "3 Months" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTimeFilter(t.id as TimeFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                timeFilter === t.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Card */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl capitalize flex items-center gap-2">
                {selectedCategory} Performance Over Time
              </CardTitle>
              <CardDescription>
                {isReaction ? "Reaction time (milliseconds — lower is faster)" : "Average accuracy percentage (%)"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Consistency:</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 capitalize">
                {latestTrend}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {points.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No performance data recorded for this time range.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Data will plot automatically as exercises are completed.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-64 select-none font-sans"
              >
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y =
                    chartHeight -
                    padding.bottom -
                    ratio * (chartHeight - padding.top - padding.bottom);
                  const val = Math.round(minVal + ratio * yRange);
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="currentColor"
                        className="text-border"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] fill-muted-foreground"
                      >
                        {val}
                        {isReaction ? "ms" : "%"}
                      </text>
                    </g>
                  );
                })}

                {/* Line Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--color-primary, #2d5a4e)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data point dots */}
                {points.map((p, i) => {
                  const { x, y } = getCoordinates(p.value, i, points.length);
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="var(--color-card, #ffffff)"
                        stroke="var(--color-primary, #2d5a4e)"
                        strokeWidth="2.5"
                      />
                      {/* Date label for sparse points */}
                      {(i % Math.ceil(points.length / 6) === 0 || i === points.length - 1) && (
                        <text
                          x={x}
                          y={chartHeight - 8}
                          textAnchor="middle"
                          className="text-[10px] fill-muted-foreground"
                        >
                          {p.date}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* Performance Trend Pattern Description */}
          <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Performance Observation
                </p>
                <p className="text-xs text-muted-foreground">
                  {latestTrend === "improving"
                    ? "Consistent upward progression noticed across recent exercise sessions."
                    : "Activity and response metrics have maintained a steady, stable profile over the selected interval."}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">
                {isReaction ? "Average Speed" : "Average Accuracy"}
              </span>
              <span className="text-lg font-bold text-foreground">
                {avgAccuracy}
                {isReaction ? " ms" : "%"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Session Attempts (Section 40) */}
      <Card className="border border-border">
        <CardHeader
          className="cursor-pointer select-none pb-4"
          onClick={() => setShowAttemptDetails(!showAttemptDetails)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Individual Session Attempts History
              </CardTitle>
              <CardDescription>
                Detailed logs of completed exercise sessions
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              {showAttemptDetails ? "Hide Details" : "View Details"}
              {showAttemptDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        {showAttemptDetails && (
          <CardContent className="pt-0 border-t border-border">
            {sessionAttempts.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No recent individual session logs found.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sessionAttempts.map((session, index) => (
                  <div
                    key={session.id || index}
                    className="py-3.5 flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {session.activities?.name || "Cognitive Activity"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.started_at).toLocaleDateString()} at{" "}
                        {new Date(session.started_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                        Level {session.difficulty_level || 1}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold capitalize">
                        {session.completion_status || "Completed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
