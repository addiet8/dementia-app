"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, User, Settings, LogOut } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [accessibility, setAccessibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    preferred_name: '',
  });
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
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Load preferences
      const { data: preferencesData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Load accessibility
      const { data: accessibilityData } = await supabase
        .from('accessibility_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);
      setPreferences(preferencesData);
      setAccessibility(accessibilityData);
      setFormData({
        full_name: profileData?.full_name || '',
        preferred_name: profileData?.preferred_name || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
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
        .from('profiles')
        .update({
          full_name: formData.full_name,
          preferred_name: formData.preferred_name,
        })
        .eq('id', user.id);

      await loadProfile();
      setEditMode(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your basic profile details</CardDescription>
                </div>
              </div>
              {!editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Preferred Name</label>
                  <Input
                    value={formData.preferred_name}
                    onChange={(e) => setFormData({ ...formData, preferred_name: e.target.value })}
                    placeholder="What would you like us to call you?"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        full_name: profile?.full_name || '',
                        preferred_name: profile?.preferred_name || '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{profile?.full_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preferred Name</p>
                  <p className="font-medium">{profile?.preferred_name || profile?.full_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{profile?.role}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accessibility Settings Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Accessibility Settings</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {accessibility && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Text Size</p>
                  <p className="font-medium capitalize">{accessibility.text_size?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Contrast</p>
                  <p className="font-medium">{accessibility.high_contrast ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sound Effects</p>
                  <p className="font-medium">{accessibility.sound_enabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Motion Preference</p>
                  <p className="font-medium capitalize">{accessibility.motion_preference}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/onboarding')}
                >
                  Update Accessibility Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interests Card */}
        {preferences && (
          <Card>
            <CardHeader>
              <CardTitle>Your Interests</CardTitle>
              <CardDescription>Topics you've selected for personalized content</CardDescription>
            </CardHeader>
            <CardContent>
              {preferences.interests && preferences.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {preferences.interests.map((interest: string) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm capitalize"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No interests selected yet</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}