"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const supabase = createSupabaseClient();

  useEffect(() => {
    // Check if we have the reset token in the URL
    const hash = window.location.hash;
    if (!hash.includes('access_token')) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error: any) {
      setError(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-success/10 p-4 rounded-full">
                <Brain className="w-12 h-12 text-success" />
              </div>
            </div>
            <CardTitle className="text-3xl">Password reset successful</CardTitle>
            <CardDescription className="text-base">
              Your password has been reset. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/login">
              <Button className="w-full">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Brain className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Set new password</CardTitle>
          <CardDescription className="text-base">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="bg-error/10 border border-error/20 text-error p-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Resetting password..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}