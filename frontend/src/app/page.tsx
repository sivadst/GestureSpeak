"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import WebcamFeed from "@/components/webcam-feed";
import GestureResultPanel from "@/components/gesture-result-panel";
import TranslationHistory from "@/components/translation-history";
import LanguageSwitcher from "@/components/language-switcher";
import GestureReference from "@/components/gesture-reference";
import { useGestureWebSocket } from "@/hooks/use-gesture-ws";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Globe, Waves } from "lucide-react";

interface HistoryEntry {
  gesture: string;
  text: string;
  confidence: number;
  language: string;
  timestamp: number;
}

export default function HomePage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [language, setLanguage] = useState("en");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const handleGestureResult = useCallback((result: any) => {
    if (result.gesture && result.gesture !== "None" && result.confidence > 0.5) {
      setHistory((prev) => {
        // Avoid duplicate consecutive entries
        if (prev.length > 0 && prev[0].gesture === result.gesture) return prev;
        return [
          {
            gesture: result.gesture,
            text: result.text,
            confidence: result.confidence,
            language: result.language,
            timestamp: result.timestamp,
          },
          ...prev,
        ].slice(0, 100);
      });
    }
  }, []);

  const { isConnected, lastResult, sendFrame, simulate } =
    useGestureWebSocket({
      language,
      enabled: cameraActive,
      onResult: handleGestureResult,
    });

  const handleFrame = useCallback(
    (frame: string) => {
      sendFrame(frame);
    },
    [sendFrame]
  );

  // If no camera, use simulation
  const handleCameraToggle = useCallback(() => {
    setCameraActive((prev) => !prev);
  }, []);

  return (
    <div className="grid-bg min-h-[calc(100vh-4rem)]">
      {/* Hero header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 sm:px-6 pt-8 pb-4 max-w-7xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text">
              Sign Language Translator
            </h1>
            <p className="text-white/50 mt-1 text-sm sm:text-base">
              Real-time AI-powered gesture recognition and translation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="info" className="gap-1.5">
              <Zap className="h-3 w-3" />
              AI Powered
            </Badge>
            <Badge variant="success" className="gap-1.5">
              <Shield className="h-3 w-3" />
              Privacy First
            </Badge>
          </div>
        </div>
      </motion.section>

      {/* Main content grid */}
      <section className="px-4 sm:px-6 pb-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Webcam */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="space-y-4">
              <WebcamFeed
                onFrame={handleFrame}
                isActive={cameraActive}
                onToggle={handleCameraToggle}
                fps={5}
                showLandmarks={true}
                landmarks={lastResult?.landmarks || []}
              />

              {/* Quick simulate button for demo */}
              {cameraActive && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={simulate}
                  className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Waves className="h-4 w-4" />
                  Simulate Gesture (Demo)
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Center column - Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-4"
          >
            <GestureResultPanel
              gesture={lastResult?.gesture || "None"}
              confidence={lastResult?.confidence || 0}
              text={lastResult?.text || ""}
              language={language}
              isConnected={isConnected}
              simulated={lastResult?.simulated}
            />
            <TranslationHistory
              entries={history}
              onClear={() => setHistory([])}
            />
          </motion.div>

          {/* Right column - Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 space-y-4"
          >
            <LanguageSwitcher
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
            <GestureReference />
          </motion.div>
        </div>
      </section>

      {/* Feature highlight strip */}
      <section className="border-t border-white/5 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, label: "Real-time", desc: "5 FPS processing" },
              { icon: Globe, label: "6 Languages", desc: "Multi-lingual" },
              { icon: Shield, label: "Private", desc: "On-device AI" },
              { icon: Waves, label: "WebSocket", desc: "Live streaming" },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 mb-2">
                  <f.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <p className="text-sm font-medium text-white/80">{f.label}</p>
                <p className="text-xs text-white/40">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
