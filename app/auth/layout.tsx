import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MindMate - Authentication",
  description: "Sign in or create your MindMate account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {children}
    </div>
  );
}