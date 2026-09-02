
# UI/UX SPECIFICATION

## MindMate — Personalized Digital Cognitive Support System

**Document Type:** UI/UX + Development Handoff Specification
**Target Implementation:** Next.js responsive web application
**Primary Backend:** Supabase
**Status:** Prototype / Functional MVP
**Primary Audience:** Individuals experiencing MCI/early-stage dementia
**Secondary Audience:** Caregivers

---

# 1. Product Vision

MindMate is a personalized digital cognitive-support platform designed to help individuals experiencing mild cognitive impairment or early-stage dementia:

* exercise cognitive skills,
* maintain daily routines,
* remember meaningful experiences,
* manage scheduled reminders,
* and maintain a greater sense of independence.

Caregivers receive a separate dashboard that allows them to understand activity participation, view performance trends, and support the user's daily routine.

### Core UX principle

> **MindMate should feel like a friendly personal companion for exercising the mind and staying organized—not a medical test or surveillance system.**

The application should emphasize:

**encouragement → independence → consistency → personalization**

rather than:

**scores → competition → failure → diagnosis**

---

# 2. Target Users

## 2.1 Primary User

An individual experiencing:

* mild cognitive impairment, or
* early-stage dementia.

The interface must assume that the user may experience difficulties with:

* memory,
* attention,
* navigation,
* reading,
* reaction time,
* remembering instructions,
* completing multi-step tasks.

Therefore, the interface should minimize cognitive load.

---

## 2.2 Caregiver

A family member or other caregiver who supports the primary user.

The caregiver needs to:

* understand how the user is doing,
* monitor activity participation,
* view performance trends,
* manage schedules,
* manage reminders,
* view memories,
* receive important notifications.

The caregiver dashboard should **summarize information rather than overwhelm the caregiver with raw data**.

---

# 3. User Roles

The system has two primary roles.

### `user`

The person using MindMate.

Can:

* complete cognitive activities,
* view their schedule,
* manage appropriate schedule items,
* confirm reminders,
* create memories,
* view memories,
* complete check-ins,
* manage accessibility preferences,
* view their own progress.

### `caregiver`

A connected caregiver.

Can:

* view the user's activity,
* view performance trends,
* manage the user's schedule,
* manage reminders,
* view memories,
* view check-ins,
* receive notifications,
* manage appropriate user settings.

---

# 4. Information Architecture

## User navigation

```text
Home
│
├── Today's Overview
├── Next Reminder
├── Recommended Brain Exercise
├── Today's Schedule
└── Recent Memory

Brain Exercises
│
├── Recommended
├── Memory
├── Attention
└── Reaction

Schedule
│
├── Today
├── Upcoming
├── Calendar
└── Completed

My Memories
│
├── Recent Memories
├── Timeline
├── Add Memory
└── Memory Detail

Profile
│
├── Personal Information
├── Accessibility
├── Preferences
├── Connected Caregiver
└── Settings
```

## Caregiver navigation

```text
Overview
│
├── Today's Summary
├── Activity
├── Performance
└── Notifications

Schedule

My Memories

Settings
```

---

# 5. Responsive Navigation

## Desktop

Use a left sidebar.

```text
┌───────────────┬─────────────────────────────┐
│ MindMate      │                             │
│               │       Page Content          │
│ 🏠 Home       │                             │
│ 🧠 Exercises  │                             │
│ 📅 Schedule   │                             │
│ 📖 Memories   │                             │
│ 👤 Profile    │                             │
│               │                             │
└───────────────┴─────────────────────────────┘
```

Sidebar should be collapsible.

## Tablet

Use a compact sidebar.

## Mobile

Use bottom navigation:

```text
Home | Exercises | Schedule | Memories | Profile
```

Navigation should always remain obvious and accessible.

---

# 6. Design System

## Visual direction

Use:

> **Warm, calm, modern healthcare/wellness aesthetic**

Avoid making the application look:

* clinical,
* hospital-like,
* childish,
* overly gamified,
* overly technical.

### Recommended palette

Use a warm neutral foundation with calm blue/green accents.

Example conceptual palette:

```text
Background: warm off-white
Primary: muted blue/teal
Secondary: soft green
Accent: gentle yellow
Text: dark neutral
Success: accessible green
Warning: accessible amber
Error: accessible red
```

Exact colors should meet **WCAG 2.2 AA contrast requirements**.

---

# 7. Typography

Prioritize readability over compactness.

Recommended baseline:

```text
Page heading: 32px+
Section heading: 24px
Body: 17–18px
Button text: 18–20px
Supporting text: 16px+
```

The system must support larger accessibility text settings.

---

# 8. Components

Use:

* **Tailwind CSS**
* **shadcn/ui**
* **Lucide React**

Use consistent reusable components.

Core components:

* Button
* Card
* Modal/Dialog
* Input
* Select
* Checkbox
* Radio group
* Toggle
* Tabs
* Badge
* Progress indicator
* Alert
* Toast
* Tooltip
* Dropdown
* Navigation
* Calendar
* Chart
* Empty state
* Loading skeleton

Do not create visually inconsistent one-off components when an existing component can be reused.

---

# 9. Accessibility

Target:

> **WCAG 2.2 AA**

Requirements include:

* keyboard navigation,
* visible focus indicators,
* semantic HTML,
* appropriate ARIA labels,
* sufficient color contrast,
* scalable text,
* screen-reader support,
* alt text,
* large interactive targets,
* reduced motion support,
* icon + text rather than icons alone.

Important actions should have large buttons.

Example:

```text
✓ Mark as Taken
```

rather than:

```text
✓
```

---

# 10. Accessibility Settings

Profile → Accessibility

Allow:

### Text Size

* Standard
* Large
* Extra Large

### High Contrast

* On / Off

### Sound

* On / Off

### Motion

* Standard
* Reduced Motion

The application should also respect the user's system-level `prefers-reduced-motion` setting.

---

# 11. Authentication

Use Supabase Authentication.

Initial implementation:

* Email
* Password
* Login
* Logout
* Forgot password
* Create account

Do not implement Google/Apple authentication in v1.

---

# 12. Onboarding

## Welcome

```text
Welcome to MindMate 👋

A simple place to exercise your mind,
stay organized, and keep track of
meaningful memories.

[Let's Get Started]
```

---

## Role selection

```text
How will you use MindMate?

🧠
I'm using it for myself

🤝
I'm a caregiver
```

---

## Basic profile

Collect only necessary information:

* name
* preferred name
* profile picture
* age/birthday if required by the prototype

Avoid unnecessary medical questionnaires.

---

## Personalization

Allow users to select interests:

* Reading
* Music
* Nature
* Cooking
* Art
* Puzzles
* Family
* Other

These preferences can influence recommended activities and content.

---

## Accessibility

Allow users to configure:

* text size,
* high contrast,
* sound,
* motion.

---

## Completion

```text
You're all set! 🎉

Let's see what's on your day.

[Go to My Home]
```

---

# 13. Home Dashboard

The Home screen should answer:

> **"What do I need to know or do right now?"**

Example:

```text
Good morning, Margaret! ☀️

┌─────────────────────────────┐
│ NEXT UP                     │
│                             │
│ 💊 Morning Medication       │
│ 10:00 AM                    │
│                             │
│ [View Reminder]             │
└─────────────────────────────┘

Today's Brain Exercise
🧠 Memory

A short activity to exercise
your memory.

[Start Exercise]

Today's Schedule
✓ Breakfast
○ Medication
○ Brain Exercise
○ Afternoon Walk

💭 A Memory From Your Journal
"You went to the beach with Sarah..."

[View Memory]
```

---

# 14. Daily Goal

Use a **soft daily goal**.

Example:

```text
🧠 Today's Goal

Complete one brain exercise.

[Start]
```

After completion:

```text
⭐ You're all set for today!
```

Do not create guilt-based streaks.

Instead of:

> 🔥 YOU BROKE YOUR STREAK!

use:

> **5 days active**

---

# 15. Brain Exercises

The app should initially include four core exercise categories.

### 1. Memory

### 2. Attention

### 3. Reaction

### 4. Visual/Image Recall

Keep the initial game library intentionally small.

---

# 16. Exercise Experience

Every activity follows:

```text
Introduction
↓
Instructions
↓
Practice
↓
Actual Exercise
↓
Results
↓
Encouragement
```

Practice rounds should be used whenever necessary so that users understand the task before performance is measured.

---

# 17. Memory Exercise — Remember Objects

Example:

```text
Remember these objects:

🍎  🔑  ☕  📕  🧸
```

Objects are displayed for a controlled period.

Then:

```text
Which objects did you see?
```

User selects objects.

Track:

* accuracy,
* completion time,
* attempts,
* number remembered,
* difficulty.

---

# 18. Memory Exercise — Image Recall

Show a simple visual scene.

After the image disappears, ask questions such as:

> Was there a dog?

> What color was the car?

> Where was the person?

Track:

* accuracy,
* response time,
* attempts,
* difficulty.

---

# 19. Attention Exercise

Example:

```text
Tap every apple.

🍎 🍌 🍎 🍊 🍎 🍇
```

Difficulty can increase through:

* more objects,
* more distractors,
* visually similar distractors,
* faster presentation.

Track:

* accuracy,
* incorrect taps,
* missed targets,
* reaction time.

---

# 20. Reaction Exercise

Simple interaction:

```text
Wait...

        ○

       ↓

     TAP!

       🟦
```

Measure response time.

Use several trials rather than relying on one reaction.

Track:

* reaction time,
* number of trials,
* invalid taps,
* average response time.

---

# 21. Adaptive Difficulty

Do **not** use machine learning for the initial prototype.

Use a deterministic rules-based algorithm.

Example:

```text
Accuracy ≥ 85%
→ Increase difficulty slightly

Accuracy 60–84%
→ Maintain difficulty

Accuracy < 60%
→ Decrease difficulty slightly
```

Also consider:

* reaction time,
* number of attempts,
* recent performance,
* consistency across sessions.

### Important

Difficulty should change **gradually**.

Never jump from:

> Level 1 → extremely difficult

because of one successful session.

---

# 22. Personalization

The recommendation system can consider:

* performance,
* activity history,
* difficulty,
* activity frequency,
* interests,
* activities not recently completed.

Example:

```text
⭐ Recommended for you

Attention Exercise

You haven't practiced attention
recently.

[Start]
```

Do not expose technical algorithm details to the user.

Do not say:

> "Your adaptive difficulty algorithm increased your difficulty."

Instead:

> **Here's a new challenge!**

---

# 23. Results

The user should receive simple, encouraging feedback.

Example:

```text
🌟 Well done!

You completed today's
memory exercise.

You're all done for today!

[Back to Home]
```

Do not emphasize failure.

If performance is poor:

```text
That one was a little challenging today.

That's okay!

We'll adjust your next activity.

[Done]
```

Detailed metrics should primarily be available to caregivers.

---

# 24. Leaving an Activity

If the user attempts to leave:

```text
Leave activity?

Your current activity won't be
completed.

[Keep Playing] [Leave]
```

Leaving an activity should **not count as a failed cognitive performance result**.

---

# 25. Schedule

The schedule should prioritize a simple daily list.

```text
TODAY

9:00 AM
🍳 Breakfast

10:00 AM
💊 Morning Medication

11:00 AM
🧠 Brain Exercise

2:00 PM
🚶 Afternoon Walk
```

Users can view:

* Today
* Tomorrow
* This week
* Future dates
* Calendar

---

# 26. Schedule Creation

Users and caregivers can add schedule items.

Fields:

* title
* date
* time
* optional notes
* reminder
* recurrence

Recurrence:

* one-time
* daily
* selected days
* weekly

---

# 27. Medication Reminder

Reminder UI:

```text
💊 Morning Medication

It's time for your scheduled
medication.

[Mark as Taken]

[Remind Me Later]
```

Remind later:

```text
[10 minutes]
[30 minutes]
```

Do not provide medical advice.

The system only manages reminders entered by the user/caregiver.

---

# 28. Medication Confirmation

When confirmed:

```text
✓ Taken
```

The caregiver can see the confirmation.

If ignored:

```text
Reminder
↓
10 minutes
↓
Reminder
↓
30 minutes
↓
Caregiver notification
```

The exact number of reminders should be configurable.

---

# 29. Memory Journal / "My Memories"

This is one of the most important features.

Use the user-facing name:

> **My Memories**

The system should support:

* text,
* photos,
* date,
* mood,
* optional tags.

Example:

```text
📷

August 12, 2026

Went to the beach with Sarah.

😊 Happy

People: Sarah
Place: Beach
```

---

# 30. Memory Creation

```text
+ Add Memory
```

Then:

```text
What would you like to remember?

[📷 Add Photo]

[✍️ Write Memory]
```

Provide prompts:

* What did you enjoy today?
* Who did you spend time with?
* What is something you want to remember?
* What made you smile today?

---

# 31. Memory Dates

Store two separate values:

```text
createdAt
memoryDate
```

For example:

The user creates the memory on:

> August 26

but records that the event happened:

> July 14.

Both dates must be preserved.

---

# 32. Memory Resurfacing

This is a major product feature.

The system can display:

```text
💭 A Memory From Your Journal

You went to the beach with Sarah
on July 14.

[View Memory]
```

The application must **only surface real saved memories**.

### Never:

* invent memories,
* fabricate people,
* fabricate events,
* infer memories that weren't entered,
* present generated content as a real memory.

---

# 33. Personal Memory Activities

Optional activity category:

> 🧠 **My Memories**

Example:

```text
You saved a memory about
going to the beach.

Who went with you?

○ Sarah
○ Emma
○ Maria
○ James
```

These activities should be clearly separated from standardized cognitive exercises.

They should **not be used as objective cognitive-performance measurements**, because familiarity with the memory affects performance.

---

# 34. Daily Check-in

Once per day:

```text
How are you feeling today?

😊 Good

😐 Okay

😔 Not great

[Skip]
```

Optional follow-up:

```text
Would you like to tell us more?

[Write something]
```

Skip must always be available.

---

# 35. Caregiver Dashboard

The dashboard should answer:

> **"How is everything going?"**

within approximately five seconds.

Example:

```text
Good morning, John

Margaret's Overview

🟢 Doing well today

Activity
2 / 3 completed

Schedule
✓ Breakfast
✓ Medication
○ Brain Exercise

Cognitive Activity

🧠 Memory
Stable

🎯 Attention
Improving

⚡ Reaction
Stable

[View Full Progress]
```

---

# 36. Caregiver Performance

Provide both summary and detail.

Summary:

```text
Memory       Stable
Attention    Improving
Reaction     Stable
```

Clicking a category provides detailed charts.

---

# 37. Performance Charts

### Memory

Line chart:

> Accuracy over time

### Attention

Line chart:

> Accuracy over time

### Reaction

Line chart:

> Reaction time over time

### Consistency

Show:

> Stable

rather than requiring caregivers to understand a complicated statistical score.

---

# 38. Time Filters

Allow:

* Today
* 7 days
* 30 days
* 3 months

---

# 39. Performance Trend Detection

The system can identify patterns such as:

```text
Performance has changed
over the past several weeks.
```

Do **not** say:

```text
Possible dementia progression
```

or:

```text
Cognitive decline detected
```

The application is not a diagnostic tool.

---

# 40. Individual Attempts

Caregivers can click:

> **View Details**

to see:

```text
Memory Exercise
August 26

Attempt 1
Accuracy: 70%
Time: 4:32

Attempt 2
Accuracy: 80%
Time: 3:58
```

Do not put this information on the main dashboard.

---

# 41. Caregiver Notifications

Use an in-app notification center.

Examples:

```text
⚠️ Morning medication was not confirmed.

✓ Brain exercise completed.

ℹ️ Weekly performance summary available.
```

Important alerts:

* repeated missed medication confirmation,
* repeated missed activities,
* meaningful performance pattern changes.

Avoid excessive notifications.

External email/browser notifications are **out of scope for v1**.

---

# 42. Caregiver Connections

A user can have multiple caregivers.

Roles:

### Primary caregiver

Can:

* manage schedule,
* manage reminders,
* view performance,
* view memories,
* manage caregivers.

### Caregiver

Can:

* view schedule,
* view progress,
* view memories.

---

# 43. Adding a Caregiver

User:

```text
Profile
↓
My Caregiver
↓
Add Caregiver
↓
Email
↓
Send Invitation
```

The caregiver accepts the invitation.

---

# 44. Schedule Permissions

Both user and caregiver can edit the schedule.

If changes conflict:

> **Most recent valid change becomes active.**

Record timestamps for changes.

---

# 45. My Memories Permissions

Connected caregivers can view memories according to the v1 permission model.

Users can remove caregiver access.

---

# 46. Demo Data

The prototype should include seeded/demo accounts.

Example:

### User

**Margaret Johnson**

with:

* 30 days of cognitive activity,
* historical performance,
* schedule,
* medication reminders,
* journal memories,
* check-ins.

### Caregiver

**John Johnson**

connected to Margaret.

This allows the application to demonstrate meaningful graphs and trends immediately.

---

# 47. Database

Recommended:

> **Supabase PostgreSQL**

Core entities:

```text
users
profiles
caregiver_connections
schedules
medications
medication_logs
activities
activity_sessions
activity_attempts
performance_metrics
journal_memories
check_ins
notifications
user_preferences
accessibility_preferences
```

---

# 48. Memory Photos

Use:

> **Supabase Storage**

Store references to uploaded images rather than putting image files directly into database records.

Access must be controlled according to the user's permissions.

---

# 49. Security

Users must only access their own data.

Caregivers may only access data belonging to explicitly connected users.

Implement appropriate Supabase **Row Level Security (RLS)** policies.

Never trust client-side role checks alone.

---

# 50. Loading States

Use skeleton loaders where appropriate.

Do not show blank screens.

Example:

```text
[████████████]
[████████]
[██████████████]
```

---

# 51. Empty States

Every major section needs an intentional empty state.

### No memories

> 🌱
> **Your memories will appear here.**
>
> Add your first memory to get started.
>
> [Add Memory]

### No schedule

> **Your schedule is empty.**
>
> Add something you'd like to remember.
>
> [Add to Schedule]

### No caregiver

> **No caregiver connected yet.**
>
> [Add Caregiver]

---

# 52. Error States

Example:

```text
We couldn't load your memories.

Please try again.

[Try Again]
```

Never expose technical errors to the user.

---

# 53. Offline/Error Behavior

If data cannot be saved:

```text
You're offline.

We couldn't save that memory.

Please reconnect and try again.

[Try Again]
```

Never tell the user something was saved when it wasn't.

---

# 54. Activity Failure

If an activity crashes:

```text
Something went wrong.

Don't worry — this activity
wasn't counted as a failed attempt.

[Try Again]

[Return Home]
```

---

# 55. Activity Progress

Simple activities may restart if interrupted.

Longer activities may save progress.

The implementation can decide this per activity.

---

# 56. Confirmation Dialogs

Require confirmation for destructive actions:

* Delete memory
* Remove caregiver
* Delete medication
* Delete schedule item where appropriate
* Account deletion

Example:

```text
Delete Memory?

This memory will be permanently deleted.

[Cancel] [Delete]
```

Use undo where appropriate.

---

# 57. Design Language

Use:

* warm off-white backgrounds,
* calm blue/green primary colors,
* subtle activity-specific accent colors,
* moderate 12–16px rounded corners,
* large readable typography,
* generous whitespace,
* large interactive elements,
* subtle illustrations,
* real user photos in memories.

Avoid:

* childish graphics,
* excessive emoji,
* aggressive gamification,
* leaderboards,
* red warning-heavy interfaces,
* dense dashboards.

---

# 58. Activity Accent Colors

Use subtle category differentiation.

Example:

```text
Memory    → purple accent
Attention → blue accent
Reaction  → orange accent
```

Do not make the entire application change color between activities.

---

# 59. Animation

Use subtle animation for:

* success states,
* button interactions,
* page transitions,
* activity feedback.

Respect:

```text
prefers-reduced-motion
```

Avoid unnecessary animation.

---

# 60. Responsive Requirements

The application must work across:

### Desktop

Primary dashboard experience.

### Tablet

Large touch targets and compact navigation.

### Mobile

Bottom navigation and vertically stacked cards.

Do not simply shrink the desktop layout.

Components should reflow intentionally.

---

# 61. Calendar

Schedule supports:

* daily list,
* weekly/future browsing,
* calendar view.

Prioritize the **daily list** for the primary user.

---

# 62. Future Scheduling

Users can schedule events for unlimited future dates.

Quick access should prioritize:

* Today
* Tomorrow
* This week

---

# 63. Scope — V1

### MUST HAVE

* Authentication
* User/caregiver roles
* Onboarding
* Home dashboard
* Brain exercises
* Adaptive difficulty
* Schedule
* Medication reminders
* Check-ins
* My Memories
* Photo uploads
* Memory resurfacing
* Caregiver dashboard
* Performance charts
* Notifications
* Accessibility settings
* Supabase persistence
* Responsive design
* Demo data

---

# 64. V1.5 / Later

Do not prioritize initially:

* external notifications,
* PDF/CSV reports,
* dark mode,
* advanced machine learning,
* sophisticated AI-generated activities,
* extensive game library,
* advanced caregiver permissions.

---

# 65. Explicitly OUT OF SCOPE

The application must **not**:

* diagnose dementia,
* claim to detect dementia,
* provide medical advice,
* recommend medication changes,
* fabricate memories,
* fabricate journal entries,
* force cognitive exercises,
* compare users against one another,
* use guilt-based streak mechanics,
* make clinical claims about cognitive decline.

---

# 66. Technology Stack

Recommended implementation:

```text
Frontend
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide React

Backend
Supabase

Database
PostgreSQL

Authentication
Supabase Auth

File Storage
Supabase Storage

Charts
Recharts or an equivalent accessible chart library
```

Devin should use the existing Next.js project structure rather than unnecessarily restructuring the application.

---

# 67. Golden Path

The primary demonstration flow should be:

```text
Create Account
      ↓
Personalized Onboarding
      ↓
Home Dashboard
      ↓
Today's Schedule
      ↓
Medication Reminder
      ↓
Brain Exercise
      ↓
Adaptive Difficulty
      ↓
Results
      ↓
My Memories
      ↓
Memory Resurfacing
      ↓
Caregiver Dashboard
      ↓
Performance Trends
```

If these features work properly, the prototype successfully demonstrates the central concept.

---

# 68. Priority Order

If development time becomes limited:

### Priority 1

**Accessibility + usability**

### Priority 2

**Functional cognitive exercises**

### Priority 3

**Adaptive personalization**

### Priority 4

**Caregiver dashboard**

### Priority 5

**Visual polish**

A beautiful interface with broken cognitive exercises is less valuable than a simple interface that actually works.

---

# 69. Definition of Done

A feature is considered complete when:

1. It works on desktop, tablet, and mobile.
2. It follows the established design system.
3. It is keyboard accessible where applicable.
4. Interactive elements have accessible labels.
5. Loading states exist.
6. Empty states exist.
7. Error states exist.
8. Data persists correctly when required.
9. User permissions are enforced.
10. Destructive actions have confirmation.
11. The feature does not expose technical errors.
12. It does not contradict the application's non-diagnostic purpose.

---

# 70. Devin's First Development Task

**Do not immediately build every feature.**

Start with the application foundation:

```text
1. Inspect existing Next.js project
        ↓
2. Configure Tailwind/shadcn/ui
        ↓
3. Establish design tokens
        ↓
4. Configure Supabase
        ↓
5. Configure authentication
        ↓
6. Create database schema
        ↓
7. Implement RLS/security
        ↓
8. Build responsive navigation
        ↓
9. Build onboarding
        ↓
10. Build Home dashboard
```

Then build features incrementally.

---

# 71. Most Important UX Rule

If Devin encounters ambiguity, use this rule:

> **Choose the option that minimizes cognitive load for the primary user while preserving independence and dignity.**

The primary user should never have to understand the application's underlying technology, adaptive algorithm, database, performance calculations, or caregiver monitoring system.

They should simply experience:

> **"This app helps me exercise my mind, remember things that matter to me, and stay on track with my day."**

---

## One thing I would change in your original PRD

Your original PRD says:

> **"Detection optional"**

I would replace that entire concept with:

### **Performance Trend Monitoring**

> The system tracks cognitive-task performance over time and identifies changes or patterns in metrics such as accuracy, reaction time, recall, and consistency. These observations are presented as non-diagnostic performance trends and are intended to provide useful information to the user and caregiver rather than diagnose or predict dementia.

That makes your project **much more defensible** technically and ethically, while still giving you the interesting data/algorithm component.

And importantly, **this specification is now specific enough that Devin should be able to build from it without you needing to know how to architect the application yourself.**
