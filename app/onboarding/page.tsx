"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, User, Users, Book, Music, Trees, Utensils, Palette, Puzzle, Heart, Check } from "lucide-react";

const INTERESTS = [
  { id: 'reading', label: 'Reading', icon: Book },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'nature', label: 'Nature', icon: Trees },
  { id: 'cooking', label: 'Cooking', icon: Utensils },
  { id: 'art', label: 'Art', icon: Palette },
  { id: 'puzzles', label: 'Puzzles', icon: Puzzle },
  { id: 'family', label: 'Family', icon: Heart },
];

type Step = 'welcome' | 'role' | 'interests' | 'accessibility' | 'complete';

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome');
  const [role, setRole] = useState<'user' | 'caregiver'>('user');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [accessibility, setAccessibility] = useState({
    text_size: 'standard',
    high_contrast: false,
    sound_enabled: true,
    motion_preference: 'standard',
  });
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseClient();

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update user profile with role
      await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id);

      // Update user preferences with interests
      await supabase
        .from('user_preferences')
        .update({ interests: selectedInterests })
        .eq('user_id', user.id);

      // Update accessibility preferences
      await supabase
        .from('accessibility_preferences')
        .update(accessibility)
        .eq('user_id', user.id);

      setStep('complete');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 'welcome') setStep('role');
    else if (step === 'role') setStep('interests');
    else if (step === 'interests') setStep('accessibility');
    else if (step === 'accessibility') handleComplete();
  };

  const handleBack = () => {
    if (step === 'role') setStep('welcome');
    else if (step === 'interests') setStep('role');
    else if (step === 'accessibility') setStep('interests');
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-6 rounded-full">
                <Brain className="w-16 h-16 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-3">Welcome to MindMate 👋</h2>
              <p className="text-lg text-muted-foreground">
                A simple place to exercise your mind, stay organized, and keep track of meaningful memories.
              </p>
            </div>
          </div>
        );

      case 'role':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-3">How will you use MindMate?</h2>
              <p className="text-lg text-muted-foreground">
                This helps us personalize your experience
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setRole('user')}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  role === 'user'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-4 rounded-full ${role === 'user' ? 'bg-primary text-white' : 'bg-muted'}`}>
                    <User className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">I'm using it for myself</h3>
                    <p className="text-sm text-muted-foreground">For cognitive exercises and daily support</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setRole('caregiver')}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  role === 'caregiver'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-4 rounded-full ${role === 'caregiver' ? 'bg-primary text-white' : 'bg-muted'}`}>
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">I'm a caregiver</h3>
                    <p className="text-sm text-muted-foreground">To support someone I care about</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case 'interests':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-3">What interests you?</h2>
              <p className="text-lg text-muted-foreground">
                Select all that apply (optional)
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {INTERESTS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => toggleInterest(id)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-2 ${
                    selectedInterests.includes(id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${selectedInterests.includes(id) ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">{label}</span>
                  {selectedInterests.includes(id) && (
                    <Check className="w-4 h-4 text-primary absolute top-2 right-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-3">Accessibility preferences</h2>
              <p className="text-lg text-muted-foreground">
                Customize your experience (optional)
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Text Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {['standard', 'large', 'extra_large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setAccessibility({ ...accessibility, text_size: size })}
                      className={`p-3 rounded-xl border-2 capitalize ${
                        accessibility.text_size === size
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {size.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border">
                <div>
                  <h3 className="font-medium">High Contrast</h3>
                  <p className="text-sm text-muted-foreground">Increase color contrast</p>
                </div>
                <button
                  onClick={() => setAccessibility({ ...accessibility, high_contrast: !accessibility.high_contrast })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    accessibility.high_contrast ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      accessibility.high_contrast ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border">
                <div>
                  <h3 className="font-medium">Sound Effects</h3>
                  <p className="text-sm text-muted-foreground">Enable audio feedback</p>
                </div>
                <button
                  onClick={() => setAccessibility({ ...accessibility, sound_enabled: !accessibility.sound_enabled })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    accessibility.sound_enabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      accessibility.sound_enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Motion</label>
                <div className="grid grid-cols-2 gap-2">
                  {['standard', 'reduced'].map((motion) => (
                    <button
                      key={motion}
                      onClick={() => setAccessibility({ ...accessibility, motion_preference: motion })}
                      className={`p-3 rounded-xl border-2 capitalize ${
                        accessibility.motion_preference === motion
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {motion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-success/10 p-6 rounded-full">
                <Check className="w-16 h-16 text-success" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-3">You're all set! 🎉</h2>
              <p className="text-lg text-muted-foreground">
                Let's see what's on your day.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="sr-only">MindMate Onboarding</CardTitle>
          <CardDescription className="sr-only">Complete your profile setup</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {renderStep()}
          
          {step !== 'complete' && (
            <div className="flex justify-between mt-8">
              {step !== 'welcome' && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              <div className="flex-1" />
              <Button
                onClick={handleNext}
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? 'Saving...' : step === 'accessibility' ? 'Complete' : 'Next'}
              </Button>
            </div>
          )}
          
          {step === 'complete' && (
            <div className="mt-8">
              <Button
                onClick={() => (window.location.href = '/')}
                className="w-full"
                size="lg"
              >
                Go to My Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}