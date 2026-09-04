import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Calendar, Clock, Pill, CheckCircle, Circle, Star, BookOpen } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DailyCheckIn } from "@/components/daily-check-in";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user profile with error handling
  let profile = null;
  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = profileData;
  } catch (error) {
    console.error('Error fetching profile:', error);
  }

  const userName = profile?.preferred_name || profile?.full_name || 'Friend';
  const greeting = getGreeting();

  // Get today's schedule items with error handling
  let scheduleItems = [];
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: scheduleData } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('time', { ascending: true })
      .limit(4);
    scheduleItems = scheduleData || [];
  } catch (error) {
    console.error('Error fetching schedule:', error);
  }

  // Get recent memory with error handling
  let recentMemory = null;
  try {
    const { data: memoryData } = await supabase
      .from('journal_memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle to avoid error if no memories
    recentMemory = memoryData;
  } catch (error) {
    console.error('Error fetching memory:', error);
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {greeting}, {userName}! ☀️
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's what's happening today.
        </p>
      </div>

      {/* Daily Check-in */}
      <DailyCheckIn />

      {/* Daily Goal */}
      <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100">Today's Goal</h3>
                <p className="text-muted-foreground">Complete one brain exercise</p>
              </div>
            </div>
            <Link href="/exercises">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white dark:text-black">
                Start
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Schedule Item */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Next Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scheduleItems && scheduleItems.length > 0 ? (
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-semibold">{scheduleItems[0].title}</h4>
                  <p className="text-sm text-muted-foreground">{formatTime(scheduleItems[0].time)}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-semibold">No upcoming items</h4>
                  <p className="text-sm text-muted-foreground">Your schedule is empty</p>
                </div>
              </div>
            )}
            <Link href="/schedule">
              <Button variant="outline" className="w-full text-foreground dark:text-white">
                View Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Today's Brain Exercise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Today's Brain Exercise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold">Memory Exercise</h4>
                <p className="text-sm text-muted-foreground">
                  A short activity to exercise your memory
                </p>
              </div>
            </div>
            <Link href="/exercises">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:text-black">
                Start Exercise
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scheduleItems && scheduleItems.length > 0 ? (
              <div className="space-y-3">
                {scheduleItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className={item.completed ? "text-muted-foreground line-through" : ""}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No schedule items for today
              </p>
            )}
            <Link href="/schedule">
              <Button variant="outline" className="w-full mt-4 text-foreground dark:text-white">
                View Full Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Memory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-500" />
              A Memory From Your Journal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMemory ? (
              <div className="bg-pink-50 dark:bg-pink-950 p-4 rounded-lg mb-4">
                <p className="text-sm italic text-muted-foreground mb-2">
                  "{recentMemory.content.substring(0, 100)}..."
                </p>
                {recentMemory.memory_date && (
                  <p className="text-xs text-muted-foreground">
                    From {formatDate(recentMemory.memory_date)}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-pink-50 dark:bg-pink-950 p-4 rounded-lg mb-4">
                <p className="text-sm italic text-muted-foreground">
                  No memories yet. Start recording your special moments!
                </p>
              </div>
            )}
            <Link href="/memories">
              <Button variant="outline" className="w-full text-foreground dark:text-white">
                {recentMemory ? "View Memory" : "Add Memory"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}