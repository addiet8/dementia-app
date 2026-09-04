"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, User, Settings, LogOut, Sparkles, Database, Check, ShieldCheck, HeartHandshake } from "lucide-react";
import { CaregiverManagement } from "@/components/caregiver-management";
import { useAccessibility } from "@/components/accessibility-provider";
import { seedDemoData } from "@/lib/demo-data";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    preferred_name: "",
    role: "user",
  });

  const { preferences: a11y, updatePreferences } = useAccessibility();
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      // Load preferences
      const { data: preferencesData } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(profileData);
      setPreferences(preferencesData);
      setFormData({
        full_name: profileData?.full_name || "",
        preferred_name: profileData?.preferred_name || "",
        role: profileData?.role || "user",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          preferred_name: formData.preferred_name,
          role: formData.role,
        })
        .eq("id", user.id);

      await loadProfile();
      setEditMode(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDemoData = async () => {
    setSeeding(true);
    setSeedSuccess(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await seedDemoData(supabase, user.id);
      setSeedSuccess(true);
      await loadProfile();
    } catch (err) {
      console.error("Error seeding demo data:", err);
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Brain className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isCaregiver = profile?.role === "caregiver";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Account & Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage personal info, caregiver connections, and accessibility
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Personal Information Card */}
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your basic profile and application role</CardDescription>
                </div>
              </div>
              {!editMode && (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block text-foreground">Full Name</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-foreground">Preferred Name</label>
                  <Input
                    value={formData.preferred_name}
                    onChange={(e) => setFormData({ ...formData, preferred_name: e.target.value })}
                    placeholder="What should MindMate call you?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block text-foreground">Portal Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="user">Patient / Primary Individual</option>
                    <option value="caregiver">Caregiver</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        full_name: profile?.full_name || "",
                        preferred_name: profile?.preferred_name || "",
                        role: profile?.role || "user",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="font-semibold text-foreground">{profile?.full_name || "Not set"}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground">Preferred Name</p>
                  <p className="font-semibold text-foreground">
                    {profile?.preferred_name || profile?.full_name || "Not set"}
                  </p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">{profile?.email}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground">Active Role</p>
                  <p className="font-semibold text-foreground capitalize">
                    {profile?.role === "caregiver" ? "Caregiver" : "Patient"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Caregiver & Patient Connections Section (Phase 7 & 8) */}
        <CaregiverManagement isCaregiverRole={isCaregiver} />

        {/* Live Accessibility Settings (WCAG 2.2 AA) */}
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Accessibility Settings</CardTitle>
                <CardDescription>
                  Live visual adjustments complying with WCAG 2.2 AA
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Text Size */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
              <div>
                <p className="font-medium text-sm text-foreground">Text Size</p>
                <p className="text-xs text-muted-foreground">Adjust font scaling across the application</p>
              </div>
              <div className="flex gap-1.5">
                {[
                  { id: "standard", label: "Standard (16px)" },
                  { id: "large", label: "Large (18px)" },
                  { id: "extra_large", label: "Extra Large (20px)" },
                ].map((s) => (
                  <Button
                    key={s.id}
                    size="sm"
                    variant={a11y.text_size === s.id ? "default" : "outline"}
                    onClick={() => updatePreferences({ text_size: s.id as any })}
                    className="text-xs h-8 px-3"
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-border">
              <div>
                <p className="font-medium text-sm text-foreground">High Contrast Mode</p>
                <p className="text-xs text-muted-foreground">Enhance contrast ratios for better readability</p>
              </div>
              <Button
                size="sm"
                variant={a11y.high_contrast ? "default" : "outline"}
                onClick={() => updatePreferences({ high_contrast: !a11y.high_contrast })}
                className="text-xs h-8 px-4"
              >
                {a11y.high_contrast ? "Enabled" : "Disabled"}
              </Button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-border">
              <div>
                <p className="font-medium text-sm text-foreground">Reduced Motion</p>
                <p className="text-xs text-muted-foreground">Minimize animations and transition effects</p>
              </div>
              <Button
                size="sm"
                variant={a11y.motion_preference === "reduced" ? "default" : "outline"}
                onClick={() =>
                  updatePreferences({
                    motion_preference: a11y.motion_preference === "reduced" ? "standard" : "reduced",
                  })
                }
                className="text-xs h-8 px-4"
              >
                {a11y.motion_preference === "reduced" ? "Reduced" : "Standard"}
              </Button>
            </div>

            {/* Sound Enabled */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-sm text-foreground">Audio & Sound Cues</p>
                <p className="text-xs text-muted-foreground">Auditory encouragement during cognitive exercises</p>
              </div>
              <Button
                size="sm"
                variant={a11y.sound_enabled ? "default" : "outline"}
                onClick={() => updatePreferences({ sound_enabled: !a11y.sound_enabled })}
                className="text-xs h-8 px-4"
              >
                {a11y.sound_enabled ? "Enabled" : "Muted"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Data Seeder (Phase 9) */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Seeded Demo Dataset</CardTitle>
                <CardDescription>
                  Instantly populate this account with 30 days of realistic cognitive sessions, schedules, medications, check-ins, and journal memories
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs md:text-sm text-muted-foreground">
              Ideal for presentations, evaluation, and testing the Caregiver Dashboard, performance charts, and memory journal with realistic data for Margaret Johnson.
            </p>

            {seedSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>30-Day demo data successfully seeded! Navigate to Progress, Schedule, or Memories to explore.</span>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleSeedDemoData}
                disabled={seeding}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{seeding ? "Generating 30 Days of Data..." : "Load 30-Day Demo Data"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}