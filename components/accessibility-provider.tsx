"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

interface AccessibilityState {
  text_size: "standard" | "large" | "extra_large";
  high_contrast: boolean;
  sound_enabled: boolean;
  motion_preference: "standard" | "reduced";
}

interface AccessibilityContextType {
  preferences: AccessibilityState;
  updatePreferences: (updates: Partial<AccessibilityState>) => Promise<void>;
  loading: boolean;
}

const defaultPreferences: AccessibilityState = {
  text_size: "standard",
  high_contrast: false,
  sound_enabled: true,
  motion_preference: "standard",
};

const AccessibilityContext = createContext<AccessibilityContextType>({
  preferences: defaultPreferences,
  updatePreferences: async () => {},
  loading: true,
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityState>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadPreferences();
  }, []);

  // Apply classes to document root whenever preferences change
  useEffect(() => {
    const root = document.documentElement;

    // 1. Text Size
    root.classList.remove("text-size-standard", "text-size-large", "text-size-xl");
    if (preferences.text_size === "large") {
      root.classList.add("text-size-large");
      root.style.fontSize = "18px";
    } else if (preferences.text_size === "extra_large") {
      root.classList.add("text-size-xl");
      root.style.fontSize = "20px";
    } else {
      root.classList.add("text-size-standard");
      root.style.fontSize = "16px";
    }

    // 2. High Contrast
    if (preferences.high_contrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // 3. Motion Preference
    if (preferences.motion_preference === "reduced") {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  }, [preferences]);

  const loadPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Check localStorage fallback for guests
        const cached = localStorage.getItem("mindmate_accessibility");
        if (cached) {
          setPreferences(JSON.parse(cached));
        }
        return;
      }

      const { data, error } = await supabase
        .from("accessibility_preferences")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!error && data) {
        const loaded: AccessibilityState = {
          text_size: data.text_size || "standard",
          high_contrast: Boolean(data.high_contrast),
          sound_enabled: data.sound_enabled !== false,
          motion_preference: data.motion_preference || "standard",
        };
        setPreferences(loaded);
        localStorage.setItem("mindmate_accessibility", JSON.stringify(loaded));
      }
    } catch (err) {
      console.warn("Could not load accessibility preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<AccessibilityState>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    localStorage.setItem("mindmate_accessibility", JSON.stringify(newPrefs));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from("accessibility_preferences")
          .upsert(
            {
              user_id: session.user.id,
              ...newPrefs,
            },
            { onConflict: "user_id" }
          );
      }
    } catch (err) {
      console.error("Error saving accessibility preferences:", err);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreferences, loading }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
