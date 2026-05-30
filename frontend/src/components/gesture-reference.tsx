"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hand } from "lucide-react";

const gestures = [
  { name: "Thumbs Up", emoji: "👍", meaning: "Yes / Agree" },
  { name: "Thumbs Down", emoji: "👎", meaning: "No / Disagree" },
  { name: "Victory", emoji: "✌️", meaning: "Peace / Hello" },
  { name: "Open Palm", emoji: "🖐️", meaning: "Hello / Stop" },
  { name: "Closed Fist", emoji: "✊", meaning: "No / Stop" },
  { name: "Pointing Up", emoji: "☝️", meaning: "Question" },
  { name: "I Love You", emoji: "🤟", meaning: "I love you" },
];

export default function GestureReference() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Hand className="h-4 w-4 text-cyan-400" />
          Gesture Reference
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-1.5">
          {gestures.map((g, i) => (
            <motion.div
              key={g.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-lg">{g.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 font-medium">{g.name}</p>
              </div>
              <span className="text-xs text-white/40">{g.meaning}</span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
