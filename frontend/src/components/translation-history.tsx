"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Volume2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";

interface HistoryEntry {
  gesture: string;
  text: string;
  confidence: number;
  language: string;
  timestamp: number;
}

interface TranslationHistoryProps {
  entries: HistoryEntry[];
  onClear?: () => void;
}

const gestureEmojis: Record<string, string> = {
  Closed_Fist: "✊",
  Open_Palm: "🖐️",
  Pointing_Up: "☝️",
  Thumb_Down: "👎",
  Thumb_Up: "👍",
  Victory: "✌️",
  ILoveYou: "🤟",
};

export default function TranslationHistory({
  entries,
  onClear,
}: TranslationHistoryProps) {
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  const speakEntry = useCallback((text: string, lang: string, idx: number) => {
    setSpeakingIdx(idx);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "en" ? "en-US" : lang;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    window.speechSynthesis.speak(utterance);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-cyan-400" />
            Translation History
          </CardTitle>
          {entries.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear} className="text-white/40 hover:text-red-400 gap-1">
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-10 w-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No translations yet</p>
            <p className="text-white/20 text-xs mt-1">
              Start the camera to begin recognizing gestures
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
            {entries.map((entry, i) => (
              <motion.div
                key={`${entry.timestamp}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
              >
                <span className="text-xl">
                  {gestureEmojis[entry.gesture] || "🤷"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {entry.text || entry.gesture}
                  </p>
                  <p className="text-xs text-white/30">
                    {new Date(entry.timestamp * 1000).toLocaleTimeString()}
                  </p>
                </div>
                <Badge
                  variant={
                    entry.confidence >= 0.8
                      ? "success"
                      : entry.confidence >= 0.5
                      ? "warning"
                      : "danger"
                  }
                >
                  {Math.round(entry.confidence * 100)}%
                </Badge>
                <button
                  onClick={() => speakEntry(entry.text, entry.language, i)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-cyan-400 hover:bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Volume2
                    className={`h-3.5 w-3.5 ${speakingIdx === i ? "animate-pulse text-cyan-400" : ""}`}
                  />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
