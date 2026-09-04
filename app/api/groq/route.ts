import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (apiKey) {
      try {
        const groq = new Groq({ apiKey });
        const systemMessage = {
          role: "system",
          content:
            "You are MindMate's friendly and compassionate AI companion. You assist individuals experiencing mild cognitive impairment or early-stage dementia and their caregivers. Always keep responses warm, clear, concise, and easy to understand. Never give medical diagnoses. Provide encouragement, simple explanations, and reminders to stay positive and connected.",
        };

        const response = await groq.chat.completions.create({
          messages: [systemMessage, ...messages],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 512,
        });

        const reply =
          response.choices[0]?.message?.content ||
          "I'm here for you! Let me know if you need help with your schedule, exercises, or memories.";

        return NextResponse.json({ reply });
      } catch (groqError: any) {
        console.warn("Groq API error, using compassionate fallback:", groqError?.message);
      }
    }

    // Compassionate fallback responses if API key is not configured or network error
    const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let reply = "I'm here with you! You can practice your daily brain exercises, check today's schedule, or record a fond memory in your journal.";

    if (userMessage.includes("hello") || userMessage.includes("hi")) {
      reply = "Hello! It is wonderful to see you today. How are you feeling?";
    } else if (userMessage.includes("schedule") || userMessage.includes("today")) {
      reply = "You can view today's schedule items and medications by clicking the Schedule tab on your navigation bar.";
    } else if (userMessage.includes("exercise") || userMessage.includes("game")) {
      reply = "Brain exercises are a great way to stay sharp! Head to the Exercises tab to try memory recall, target identification, or response time games.";
    } else if (userMessage.includes("memory") || userMessage.includes("remember")) {
      reply = "Memories are precious. Visit the Memories tab to view cherished photos and stories, or add a new memory of today!";
    } else if (userMessage.includes("help") || userMessage.includes("tired")) {
      reply = "Take things one step at a time. Rest whenever you need to, and remember your loved ones and caregivers are always here to support you.";
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Route error in /api/groq:", error);
    return NextResponse.json(
      { reply: "I'm here to help! Please let me know what you'd like to do today." },
      { status: 200 }
    );
  }
}
