 "use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            🧠 MindCare
          </Link>

          <div className="flex gap-6">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <Link href="/games" className="hover:text-blue-600">
              Games
            </Link>
            <Link href="/progress" className="hover:text-blue-600">
              Progress
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-bold">
          Good morning! 👋
        </h1>

        <p className="mt-2 text-lg text-slate-600">
           Here is your plan for today.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">💊 Medication</h2>
            <p className="mt-3 text-slate-600">
              Morning medication
            </p>
            <p className="mt-1 font-semibold">9:00 AM</p>

            <button className="mt-5 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white">
              ✓ Mark as Done
            </button>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              🧠 Today's Brain Activity
            </h2>

            <p className="mt-3 text-slate-600">
              Exercise your memory with a short activity.
            </p>

            <Link
              href="/games/memory-match"
              className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
            >
              Start Activity →
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">📅 Today's Schedule</h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between border-b pb-3">
              <span>9:00 AM</span>
              <span>Medication</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span>10:00 AM</span>
              <span>Brain Activity</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span>12:00 PM</span>
              <span>Lunch</span>
            </div>

            <div className="flex justify-between">
              <span>2:00 PM</span>
              <span>Walk</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}