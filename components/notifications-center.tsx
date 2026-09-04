"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, AlertTriangle, TrendingUp, Users, Info, Check, X } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export interface NotificationItem {
  id: string;
  user_id: string;
  caregiver_id: string;
  type: 'medication_missed' | 'activity_completed' | 'performance_change' | 'caregiver_request' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadNotifications();

    // Close panel on outside click
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`user_id.eq.${session.user.id},caregiver_id.eq.${session.user.id}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from("notifications")
        .update({ read: true })
        .or(`user_id.eq.${session.user.id},caregiver_id.eq.${session.user.id}`)
        .eq("read", false);
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'medication_missed':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'activity_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'performance_change':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'caregiver_request':
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-card border border-border shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95">
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p>No notifications yet</p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Updates on routines, brain exercises, and check-ins will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    notif.read ? "bg-card opacity-75" : "bg-primary/5 hover:bg-primary/10"
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-background border border-border shrink-0">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(notif.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
