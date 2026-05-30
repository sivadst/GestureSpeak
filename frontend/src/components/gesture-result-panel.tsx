"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2, Copy, Check, Sparkles } from "lucide-react";
import { useState, useCallback } from "react";

interface GestureResultPanelProps {
  gesture: string;
  confidence: number;
  text: string;
  language: string;
  isConnected: boolean;
  simulated?: boolean;
}

const gestureEmojis: Record<string, string> = {
  Closed_Fist: "✊",
  Open_Palm: "🖐️",
  Pointing_Up: "☝️",
  Thumb_Down: "👎",
  Thumb_Up: "👍",
  Victory: "✌️",
  ILoveYou: "🤟",
  None: "🤷",
};

export default function GestureResultPanel({
  gesture,
  confidence,
  text,
  language,
  isConnected,
  simulated,
}: GestureResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(() => {
    if (!text || isSpeaking) return;
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "en" ? "en-US" : language;
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [text, language, isSpeaking]);

  const copyText = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const confPercent = Math.round(confidence * 100);
  const confColor =
    confPercent >= 80
      ? "text-emerald-400"
      : confPercent >= 50
      ? "text-amber-400"
      : "text-red-400";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            Recognition Result
          </CardTitle>
          <Badge variant={isConnected ? "success" : "danger"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gesture Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={gesture}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/10"
          >
            <div className="text-4xl">
              {gestureEmojis[gesture] || "🤷"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-white">
                {gesture === "None" ? "No gesture" : gesture.replace("_", " ")}
              </p>
              {text && (
                <p className="text-white/60 text-sm mt-0.5 truncate">{text}</p>
              )}
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${confColor}`}>
                {confPercent}%
              </p>
              <p className="text-xs text-white/40">confidence</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Confidence bar */}
        <div className="space-y-1">
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              animate={{ width: `${confPercent}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className={`h-full rounded-full ${
                confPercent >= 80
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : confPercent >= 50
                  ? "bg-gradient-to-r from-amber-500 to-amber-400"
                  : "bg-gradient-to-r from-red-500 to-red-400"
              }`}
            />
          </div>
        </div>

        {/* Translation output */}
        {text && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-white/5 border border-white/5"
          >
            <p className="text-sm text-white/40 mb-1">Translation</p>
            <p className="text-lg text-white font-medium">{text}</p>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={speak}
                disabled={isSpeaking}
                className="gap-1.5"
              >
                <Volume2
                  className={`h-3.5 w-3.5 ${isSpeaking ? "animate-pulse text-cyan-400" : ""}`}
                />
                {isSpeaking ? "Speaking..." : "Speak"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyText}
                className="gap-1.5"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Simulated indicator */}
        {simulated && (
          <div className="text-center">
            <Badge variant="warning">Simulation Mode</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
