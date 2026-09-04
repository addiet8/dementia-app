"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Heart, Calendar, BookOpen, Shield, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Redirect logged-in users directly to their dashboard
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile?.role === "caregiver") {
          router.replace("/caregiver");
        } else {
          router.replace("/dashboard");
        }
      } else {
        setCheckingAuth(false);
      }
    }
    checkUser();
  }, [router, supabase]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Brain className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground text-sm font-medium">Welcome to MindMate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
              <Brain className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-primary">MindMate</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-sm font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="text-sm font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-semibold border border-primary/20">
          <Sparkles className="w-4 h-4" />
          Personalized Digital Cognitive Support
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
          A gentle, supportive companion for exercising the mind and staying organized.
        </h1>

        <p className="text-base md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          MindMate combines adaptive brain exercises, daily routines, medication reminders, and caregiver monitoring to support cognitive wellness and everyday independence.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/auth/register">
            <Button size="lg" className="text-base px-8 h-14 rounded-2xl gap-2 shadow-md">
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="text-base px-8 h-14 rounded-2xl">
              Sign In to Account
            </Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full pt-12 text-left">
          <Card className="border border-border hover:border-primary/40 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Brain Exercises</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Adaptive cognitive activities for memory, attention, reaction, and visual processing.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border hover:border-primary/40 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Daily Routines</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Simple schedule management and clear medication reminders with one-tap confirmation.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border hover:border-primary/40 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Memory Journal</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Record cherished experiences, personal photos, and moods that resurface on your home dashboard.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border hover:border-primary/40 transition-colors">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Caregiver Portal</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A non-intrusive dashboard providing peace of mind with 5-second status overviews and performance trends.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>MindMate • Personalized Digital Cognitive Support System</p>
        <p className="mt-1 text-[11px] text-muted-foreground/80">
          Designed with WCAG 2.2 AA accessibility standards for mild cognitive impairment and early-stage dementia support.
        </p>
      </footer>
    </div>
  );
}
