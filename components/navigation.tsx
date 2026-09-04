"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Brain,
  Calendar,
  BookOpen,
  User,
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createSupabaseClient } from "@/lib/supabase/client";
import { NotificationsCenter } from "@/components/notifications-center";

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<"user" | "caregiver">("user");
  const [sessionUser, setSessionUser] = useState<any>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSessionUser(null);
        return;
      }
      setSessionUser(session.user);

      // Check profile role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.role === "caregiver" || pathname.startsWith("/caregiver")) {
        setRole("caregiver");
      } else {
        setRole("user");
      }
    }

    checkUser();
  }, [pathname]);

  // Don't render sidebar on auth routes or root landing
  if (pathname.startsWith("/auth") || pathname === "/") {
    return null;
  }

  const patientNavItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Exercises", href: "/exercises", icon: Brain },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Memories", href: "/memories", icon: BookOpen },
    { name: "Progress", href: "/progress", icon: TrendingUp },
    { name: "Companion", href: "/chat", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const caregiverNavItems = [
    { name: "Overview", href: "/caregiver", icon: LayoutDashboard },
    { name: "Schedule", href: "/caregiver/schedule", icon: Calendar },
    { name: "Memories", href: "/caregiver/memories", icon: BookOpen },
    { name: "Progress", href: "/caregiver/progress", icon: TrendingUp },
    { name: "Companion", href: "/chat", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const isCaregiverView = pathname.startsWith("/caregiver") || role === "caregiver";
  const navItems = isCaregiverView ? caregiverNavItems : patientNavItems;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <Link href={isCaregiverView ? "/caregiver" : "/dashboard"} className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-xl block leading-tight">MindMate</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {isCaregiverView ? "Caregiver Portal" : "Patient Portal"}
            </span>
          </div>
        </Link>
        <NotificationsCenter />
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        {/* Quick View Switcher */}
        <div className="bg-muted/50 p-2.5 rounded-xl flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Switch Portal:</span>
          {isCaregiverView ? (
            <Link
              href="/dashboard"
              className="text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              Patient Home
            </Link>
          ) : (
            <Link
              href="/caregiver"
              className="text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Caregiver View
            </Link>
          )}
        </div>

        <div className="text-[11px] text-muted-foreground leading-snug">
          Compassionate digital support for mind & daily living.
        </div>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<"user" | "caregiver">("user");
  const supabase = createSupabaseClient();

  useEffect(() => {
    async function checkRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.role === "caregiver" || pathname.startsWith("/caregiver")) {
        setRole("caregiver");
      }
    }
    checkRole();
  }, [pathname]);

  // Don't render bottom nav on auth routes or root landing
  if (pathname.startsWith("/auth") || pathname === "/") {
    return null;
  }

  const isCaregiverView = pathname.startsWith("/caregiver") || role === "caregiver";

  const patientNavItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Exercises", href: "/exercises", icon: Brain },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Memories", href: "/memories", icon: BookOpen },
    { name: "Progress", href: "/progress", icon: TrendingUp },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const caregiverNavItems = [
    { name: "Overview", href: "/caregiver", icon: LayoutDashboard },
    { name: "Schedule", href: "/caregiver/schedule", icon: Calendar },
    { name: "Memories", href: "/caregiver/memories", icon: BookOpen },
    { name: "Progress", href: "/caregiver/progress", icon: TrendingUp },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const navItems = isCaregiverView ? caregiverNavItems : patientNavItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-1 transition-colors min-w-[50px]",
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppHeader() {
  const pathname = usePathname();

  // Don't render mobile header on auth routes or root landing
  if (pathname.startsWith("/auth") || pathname === "/") {
    return null;
  }

  const isCaregiver = pathname.startsWith("/caregiver");

  return (
    <header className="md:hidden bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href={isCaregiver ? "/caregiver" : "/dashboard"} className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg block leading-tight">MindMate</span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
              {isCaregiver ? "Caregiver Portal" : "Patient Portal"}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationsCenter />
        </div>
      </div>
    </header>
  );
}