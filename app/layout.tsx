import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, BottomNav, AppHeader } from "@/components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindMate - Personalized Digital Cognitive Support",
  description: "A personalized digital platform that combines cognitive exercises, personalized reminders, daily routines, and caregiver monitoring for individuals experiencing mild cognitive impairment or early-stage dementia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-64 pb-16 md:pb-0">
            <AppHeader />
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
