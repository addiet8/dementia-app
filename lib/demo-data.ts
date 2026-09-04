import { SupabaseClient } from "@supabase/supabase-js";

export async function seedDemoData(supabase: SupabaseClient, userId: string) {
  const today = new Date();

  // 1. Update Profile to demo patient Margaret Johnson if desired
  await supabase
    .from("profiles")
    .update({
      full_name: "Margaret Johnson",
      preferred_name: "Margaret",
    })
    .eq("id", userId);

  // 2. Generate 30 days of performance metrics across 4 categories
  const categories = ["memory", "attention", "reaction", "visual"] as const;
  const metricsToInsert = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    for (const cat of categories) {
      // Create realistic progression
      let baseAcc = 70;
      let baseReact = 950;
      let trend = "stable";

      if (cat === "memory") {
        baseAcc = 72 + Math.sin(i / 4) * 6 + (29 - i) * 0.3; // slightly improving
        baseReact = 1100 - (29 - i) * 5 + Math.cos(i) * 40;
        trend = i < 7 ? "improving" : "stable";
      } else if (cat === "attention") {
        baseAcc = 80 + Math.cos(i / 3) * 5;
        baseReact = 820 + Math.sin(i / 2) * 30;
        trend = "stable";
      } else if (cat === "reaction") {
        baseAcc = 85 + (i % 5);
        baseReact = 680 + (i % 7) * 20;
        trend = "stable";
      } else if (cat === "visual") {
        baseAcc = 76 + (i % 4) * 3;
        baseReact = 900 - (i % 3) * 30;
        trend = "improving";
      }

      metricsToInsert.push({
        user_id: userId,
        activity_type: cat,
        date: dateStr,
        average_accuracy: Math.min(100, Math.max(50, Math.round(baseAcc))),
        average_reaction_time: Math.round(baseReact),
        sessions_completed: 1,
        difficulty_level: cat === "reaction" ? 2 : 3,
        trend,
      });
    }
  }

  // Insert performance metrics in chunks
  try {
    for (let i = 0; i < metricsToInsert.length; i += 20) {
      const chunk = metricsToInsert.slice(i, i + 20);
      await supabase
        .from("performance_metrics")
        .upsert(chunk, { onConflict: "user_id,activity_type,date" });
    }
  } catch (err) {
    console.warn("Error seeding performance metrics:", err);
  }

  // 3. Seed today's and upcoming schedules
  const todayStr = today.toISOString().split("T")[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const sampleSchedules = [
    {
      user_id: userId,
      title: "Morning Blood Pressure Medication",
      time: "08:00:00",
      date: todayStr,
      description: "Take with a full glass of water and light breakfast.",
      completed: true,
      reminder: true,
    },
    {
      user_id: userId,
      title: "Healthy Breakfast & Fresh Fruit",
      time: "08:30:00",
      date: todayStr,
      description: "Oatmeal with berries and herbal tea.",
      completed: true,
      reminder: false,
    },
    {
      user_id: userId,
      title: "Daily Brain Training Session",
      time: "10:30:00",
      date: todayStr,
      description: "Complete Remember Objects and Target Identification exercises.",
      completed: true,
      reminder: true,
    },
    {
      user_id: userId,
      title: "Afternoon Garden Walk",
      time: "14:00:00",
      date: todayStr,
      description: "Enjoy 20 minutes of gentle fresh air in the backyard.",
      completed: false,
      reminder: true,
    },
    {
      user_id: userId,
      title: "Family Video Call with Grandkids",
      time: "17:00:00",
      date: todayStr,
      description: "Catch up with Emily and Lucas over iPad.",
      completed: false,
      reminder: true,
    },
    {
      user_id: userId,
      title: "Evening Heart Health Tablet",
      time: "20:00:00",
      date: todayStr,
      description: "Take evening dose before bed.",
      completed: false,
      reminder: true,
    },
    // Tomorrow
    {
      user_id: userId,
      title: "Morning Medication",
      time: "08:00:00",
      date: tomorrowStr,
      description: "Daily morning dose.",
      completed: false,
      reminder: true,
    },
    {
      user_id: userId,
      title: "Doctor Follow-up Appointment",
      time: "11:00:00",
      date: tomorrowStr,
      description: "Dr. Henderson clinic - routine wellness check.",
      completed: false,
      reminder: true,
    },
  ];

  try {
    await supabase.from("schedules").insert(sampleSchedules);
  } catch (err) {
    console.warn("Error inserting schedules:", err);
  }

  // 4. Seed Medications
  const sampleMeds = [
    {
      user_id: userId,
      name: "Lisinopril",
      dosage: "10mg",
      instructions: "Take once daily in the morning with food",
    },
    {
      user_id: userId,
      name: "Donepezil",
      dosage: "5mg",
      instructions: "Take once daily at bedtime",
    },
    {
      user_id: userId,
      name: "Vitamin D3",
      dosage: "1000 IU",
      instructions: "Take once daily with breakfast",
    },
  ];

  try {
    await supabase.from("medications").insert(sampleMeds);
  } catch (err) {
    console.warn("Error inserting medications:", err);
  }

  // 5. Seed Check-ins (last 7 days)
  const moods: ("good" | "okay")[] = ["good", "good", "okay", "good", "okay", "good", "good"];
  const notesList = [
    "Slept very peacefully and excited for the garden today!",
    "Had a pleasant morning walk with tea.",
    "A little bit foggy this morning, feeling better after lunch.",
    "Enjoyed listening to classical music on the radio.",
    "Resting quietly in the afternoon.",
    "Loved speaking with Sarah on the phone.",
    "Feeling energized and ready for my brain games!",
  ];

  const checkIns = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    checkIns.push({
      user_id: userId,
      date: d.toISOString().split("T")[0],
      mood: moods[i],
      notes: notesList[i],
    });
  }

  try {
    await supabase
      .from("check_ins")
      .upsert(checkIns, { onConflict: "user_id,date" });
  } catch (err) {
    console.warn("Error inserting check-ins:", err);
  }

  // 6. Seed Journal Memories
  const sampleMemories = [
    {
      user_id: userId,
      title: "Spring Garden Blooms",
      content: "The yellow daffodils and purple irises came up along the fence today. The weather was crisp and sunny, reminding me of planting them with John last autumn.",
      mood: "happy",
      tags: ["garden", "nature", "spring"],
      memory_date: todayStr,
    },
    {
      user_id: userId,
      title: "Baking Apple Cinnamon Crisp",
      content: "Made grandmother's apple crisp recipe. The whole kitchen smelled of warm cinnamon and nutmeg. Shared warm slices with afternoon tea.",
      mood: "calm",
      tags: ["cooking", "family", "recipe"],
      memory_date: new Date(today.getTime() - 86400000 * 3).toISOString().split("T")[0],
    },
    {
      user_id: userId,
      title: "Watching Birds at the Feeder",
      content: "A bright red cardinal and two blue jays visited the cedar feeder outside the kitchen window this morning. Watching them brings so much peaceful joy.",
      mood: "excited",
      tags: ["birds", "peace", "nature"],
      memory_date: new Date(today.getTime() - 86400000 * 7).toISOString().split("T")[0],
    },
    {
      user_id: userId,
      title: "Family Sunday Dinner",
      content: "Everyone gathered around the big dining table. The grandchildren told funny stories about school. My heart was completely full.",
      mood: "happy",
      tags: ["family", "grandchildren", "dinner"],
      memory_date: new Date(today.getTime() - 86400000 * 14).toISOString().split("T")[0],
    },
  ];

  try {
    await supabase.from("journal_memories").insert(sampleMemories);
  } catch (err) {
    console.warn("Error inserting memories:", err);
  }

  // 7. Seed Notifications
  const sampleNotifications = [
    {
      user_id: userId,
      caregiver_id: userId,
      type: "activity_completed",
      title: "Brain Exercise Completed",
      message: "Margaret completed Remember Objects with 85% accuracy.",
      read: false,
    },
    {
      user_id: userId,
      caregiver_id: userId,
      type: "system",
      title: "Daily Check-in Logged",
      message: 'Margaret reported feeling Good 😊: "Slept very peacefully and excited for the garden today!"',
      read: false,
    },
    {
      user_id: userId,
      caregiver_id: userId,
      type: "performance_change",
      title: "Weekly Performance Summary",
      message: "Cognitive stability observed across Memory and Attention over the last 14 days.",
      read: true,
    },
  ];

  try {
    await supabase.from("notifications").insert(sampleNotifications);
  } catch (err) {
    console.warn("Error inserting notifications:", err);
  }

  return { success: true };
}
