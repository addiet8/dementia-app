"use client";

import { useState } from "react";
import { Brain, Send, User, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your MindMate friendly companion. I'm here to support you with routines, exercises, memories, or just to chat. How are you doing today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || "I'm right here with you! Let me know if you need anything.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm here with you! You can practice your exercises, review your schedule, or record a nice memory.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col">
      <Card className="flex-1 flex flex-col shadow-sm border border-border">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                MindMate Companion
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal">
                  Supportive AI
                </span>
              </CardTitle>
              <CardDescription>
                A gentle, compassionate conversational assistant
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4 md:p-6 justify-between gap-4">
          {/* Messages display */}
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[60vh] pr-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-base leading-relaxed ${
                    message.role === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-muted text-foreground border border-border rounded-bl-none"
                  }`}
                >
                  {message.content}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center text-muted-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl border border-border flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {[
              "How are you today?",
              "What brain exercises can I do?",
              "Tell me a cheerful thought",
              "Help me with my routine",
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInput(suggestion)}
                className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input box */}
          <div className="flex gap-2 pt-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything or just say hello..."
              disabled={isLoading}
              className="h-12 text-base"
              aria-label="Chat message"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="h-12 px-5 gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}