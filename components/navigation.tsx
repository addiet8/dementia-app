"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Brain, Calendar, BookOpen, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Exercises', href: '/exercises', icon: Brain },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Memories', href: '/memories', icon: BookOpen },
  { name: 'Progress', href: '/progress', icon: LayoutDashboard },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl">MindMate</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Need help? Contact your caregiver
        </div>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppHeader() {
  return (
    <header className="md:hidden bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-lg">MindMate</span>
        </div>
      </div>
    </header>
  );
}