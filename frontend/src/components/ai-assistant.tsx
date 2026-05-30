"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, X, Sparkles, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Contextual AI responses (no external API needed)
function getAIResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey"))
    return "Hello! I'm GestureSpeak AI. I can help you understand sign language gestures, explain how to use the platform, or answer questions about accessibility. What would you like to know?";
  if (lower.includes("gesture") && lower.includes("how"))
    return "To use gesture recognition: 1) Click 'Start Camera' to enable your webcam. 2) Show a hand gesture to the camera. 3) The AI will recognize it and translate to text. Supported gestures include Thumbs Up (Yes/Agree), Victory (Peace/Hello), Open Palm (Hello/Stop), and more!";
  if (lower.includes("language"))
    return "GestureSpeak supports 6 languages: English, Spanish (Español), French (Français), Hindi (हिन्दी), Japanese (日本語), and Arabic (العربية). Use the Language Switcher panel to change the output language.";
  if (lower.includes("confidence"))
    return "Confidence score shows how certain the AI is about the detected gesture. Green (80%+) = high confidence, Yellow (50-80%) = moderate, Red (<50%) = low. For best results, ensure good lighting and keep your hand clearly visible.";
  if (lower.includes("speak") || lower.includes("voice") || lower.includes("tts"))
    return "Click the 'Speak' button on any translation to hear it spoken aloud using text-to-speech. You can adjust speech rate and voice in Settings.";
  if (lower.includes("history"))
    return "Your translation history is shown in the sidebar. Each entry includes the gesture, translation, confidence score, and timestamp. Click the speaker icon to replay any translation.";
  if (lower.includes("camera") || lower.includes("webcam"))
    return "For best results: 1) Use good lighting. 2) Position your hand clearly in frame. 3) Keep background clutter minimal. 4) Make gestures slowly and clearly. The camera captures at 5 FPS by default for performance.";
  if (lower.includes("help"))
    return "I can help with: • How to use gestures • Supported languages • Confidence scores explained • Camera tips • Speech playback • Dashboard analytics • Settings configuration. What would you like to know?";

  return "I can help you with gesture recognition, language settings, camera tips, and more. Try asking about specific features like 'How do gestures work?' or 'What languages are supported?'";
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your GestureSpeak AI assistant. Ask me anything about sign language recognition or how to use the platform! 🤟",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;
    const userMsg: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = getAIResponse(userMsg.content);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response, timestamp: Date.now() },
      ]);
    }, 500);
  }, [input]);

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-shadow"
        >
          <Bot className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
        </motion.button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[500px] flex flex-col rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AI Assistant</p>
                  <p className="text-xs text-emerald-400">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px] scrollbar-thin">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mt-0.5">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-cyan-500/20 text-cyan-100"
                        : "bg-white/5 text-white/80"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                      <User className="h-3 w-3 text-white/60" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEnd} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
