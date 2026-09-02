"use client";

import { useState } from "react";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your MindCare assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful and friendly assistant for MindCare, a dementia care app. Be patient, clear, and supportive in your responses.",
          },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: input },
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.7,
        max_tokens: 1024,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: chatCompletion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="/" className="text-2xl font-bold">
            🧠 MindCare
          </a>

          <div className="flex gap-6">
            <a href="/" className="hover:text-blue-600">
              Home
            </a>
            <a href="/games" className="hover:text-blue-600">
              Games
            </a>
            <a href="/progress" className="hover:text-blue-600">
              Progress
            </a>
            <a href="/chat" className="text-blue-600 font-semibold">
              Chat
            </a>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-6">Chat with MindCare Assistant</h1>

          <div className="space-y-4 h-[500px] overflow-y-auto mb-4 p-4 bg-slate-50 rounded-xl">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-900"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}