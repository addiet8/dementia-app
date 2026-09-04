"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Check, X, Shield, Mail, Clock, Trash2, HeartHandshake, AlertCircle } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CaregiverConnection {
  id: string;
  user_id: string;
  caregiver_id: string;
  relationship_type: "primary" | "regular";
  status: "pending" | "active" | "removed";
  created_at: string;
  caregiver_profile?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  patient_profile?: {
    full_name: string;
    email: string;
  };
}

export function CaregiverManagement({ isCaregiverRole = false }: { isCaregiverRole?: boolean }) {
  const [connections, setConnections] = useState<CaregiverConnection[]>([]);
  const [pendingInvitesForMe, setPendingInvitesForMe] = useState<CaregiverConnection[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [relationshipType, setRelationshipType] = useState<"primary" | "regular">("primary");
  const [isInviting, setIsInviting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (!isCaregiverRole) {
        // Patient view: get caregivers connected to me
        const { data, error } = await supabase
          .from("caregiver_connections")
          .select(`
            id,
            user_id,
            caregiver_id,
            relationship_type,
            status,
            created_at,
            caregiver_profile:profiles!caregiver_connections_caregiver_id_fkey(full_name, email)
          `)
          .eq("user_id", session.user.id)
          .neq("status", "removed");

        if (!error && data) {
          setConnections(data as any);
        }
      } else {
        // Caregiver view: get patients connected to me + pending invites to me
        const { data, error } = await supabase
          .from("caregiver_connections")
          .select(`
            id,
            user_id,
            caregiver_id,
            relationship_type,
            status,
            created_at,
            patient_profile:profiles!caregiver_connections_user_id_fkey(full_name, email)
          `)
          .eq("caregiver_id", session.user.id)
          .neq("status", "removed");

        if (!error && data) {
          const active = data.filter((c: any) => c.status === "active");
          const pending = data.filter((c: any) => c.status === "pending");
          setConnections(active as any);
          setPendingInvitesForMe(pending as any);
        }
      }
    } catch (err) {
      console.error("Error loading connections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setError("");
    setSuccess("");
    setIsInviting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in to invite a caregiver.");

      // Look up caregiver by email in profiles
      const { data: targetProfile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("email", inviteEmail.trim().toLowerCase())
        .maybeSingle();

      if (profileErr) throw profileErr;

      let caregiverId = targetProfile?.id;

      if (!caregiverId) {
        // Create demo placeholder or inform user
        setError(`We couldn't find a registered user with email "${inviteEmail.trim()}". Make sure they have signed up for MindMate first.`);
        setIsInviting(false);
        return;
      }

      if (caregiverId === session.user.id) {
        setError("You cannot invite yourself as a caregiver.");
        setIsInviting(false);
        return;
      }

      // Insert connection
      const { error: insertErr } = await supabase
        .from("caregiver_connections")
        .upsert(
          {
            user_id: session.user.id,
            caregiver_id: caregiverId,
            relationship_type: relationshipType,
            status: "pending",
          },
          { onConflict: "user_id,caregiver_id" }
        );

      if (insertErr) throw insertErr;

      // Create notification for the caregiver
      await supabase.from("notifications").insert({
        caregiver_id: caregiverId,
        user_id: session.user.id,
        type: "caregiver_request",
        title: "New Caregiver Invitation",
        message: `You were invited as a ${relationshipType} caregiver.`,
        read: false,
      });

      setSuccess(`Invitation successfully sent to ${inviteEmail.trim()}!`);
      setInviteEmail("");
      loadConnections();
    } catch (err: any) {
      setError(err.message || "Failed to send invitation.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleAcceptInvite = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("caregiver_connections")
        .update({ status: "active" })
        .eq("id", connectionId);

      if (!error) {
        loadConnections();
      }
    } catch (err) {
      console.error("Error accepting invite:", err);
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    if (!confirm("Are you sure you want to disconnect this caregiver?")) return;

    try {
      const { error } = await supabase
        .from("caregiver_connections")
        .update({ status: "removed" })
        .eq("id", connectionId);

      if (!error) {
        setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      }
    } catch (err) {
      console.error("Error removing connection:", err);
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {isCaregiverRole ? "Connected Patients" : "My Caregivers"}
            </CardTitle>
            <CardDescription>
              {isCaregiverRole
                ? "Manage patient connections and pending caregiver invitations"
                : "Manage trusted caregivers who can view your progress and assist with your schedule"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pending invites for caregiver */}
        {isCaregiverRole && pendingInvitesForMe.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold text-sm">
              <Clock className="w-4 h-4" />
              <span>Pending Invitations ({pendingInvitesForMe.length})</span>
            </div>
            <div className="divide-y divide-amber-200/60 dark:divide-amber-800/60">
              {pendingInvitesForMe.map((invite) => (
                <div
                  key={invite.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {invite.patient_profile?.full_name || invite.patient_profile?.email || "Someone"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Invited you as a {invite.relationship_type} caregiver
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptInvite(invite.id)}
                      className="h-8 px-3 text-xs gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveConnection(invite.id)}
                      className="h-8 px-3 text-xs"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List of active connections */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            {isCaregiverRole ? "Active Patients" : "Connected Caregivers"}
          </h4>

          {loading ? (
            <p className="text-sm text-muted-foreground py-2">Loading connections...</p>
          ) : connections.length === 0 ? (
            <div className="p-6 text-center rounded-2xl border border-dashed border-border bg-muted/20">
              <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">
                {isCaregiverRole ? "No connected patients yet" : "No caregiver connected yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {isCaregiverRole
                  ? "When a patient invites you, their invitation will appear above."
                  : "Invite a family member or trusted caregiver to help monitor routines and support your journey."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
              {connections.map((conn) => {
                const displayName = isCaregiverRole
                  ? conn.patient_profile?.full_name || conn.patient_profile?.email || "Connected Patient"
                  : conn.caregiver_profile?.full_name || conn.caregiver_profile?.email || "Connected Caregiver";
                const displayEmail = isCaregiverRole
                  ? conn.patient_profile?.email
                  : conn.caregiver_profile?.email;

                return (
                  <div
                    key={conn.id}
                    className="p-4 flex items-center justify-between gap-4 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground">
                            {displayName}
                          </p>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              conn.status === "active"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {conn.status}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                            {conn.relationship_type}
                          </span>
                        </div>
                        {displayEmail && (
                          <p className="text-xs text-muted-foreground">{displayEmail}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveConnection(conn.id)}
                      className="text-xs text-error hover:bg-error/10 hover:text-error gap-1.5 h-8 px-3"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Invite Caregiver Form (Patient View) */}
        {!isCaregiverRole && (
          <form onSubmit={handleSendInvite} className="pt-2 border-t border-border space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              <span>Invite a Caregiver</span>
            </h4>

            {error && (
              <div className="flex items-start gap-2 bg-error/10 border border-error/20 text-error p-3 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 p-3 rounded-xl text-xs">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Input
                  type="email"
                  placeholder="caregiver@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isInviting}
                  className="h-11 text-sm"
                  required
                />
              </div>
              <div>
                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="primary">Primary Caregiver</option>
                  <option value="regular">Regular Caregiver</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isInviting || !inviteEmail.trim()} className="gap-2">
                <Mail className="w-4 h-4" />
                <span>{isInviting ? "Sending..." : "Send Invitation"}</span>
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
