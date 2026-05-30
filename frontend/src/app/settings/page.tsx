"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon,
  Eye,
  Volume2,
  Camera,
  Palette,
  Accessibility,
  Monitor,
  Save,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    theme: "dark",
    fontSize: 16,
    highContrast: false,
    speechRate: 1.0,
    autoSpeak: true,
    showLandmarks: true,
    showConfidence: true,
    cameraResolution: "720p",
    fps: 5,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem("gs_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ToggleSwitch = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-cyan-500" : "bg-white/10"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="grid-bg min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Settings</h1>
              <p className="text-white/50 mt-1">
                Customize your GestureSpeak experience
              </p>
            </div>
            <Button onClick={handleSave} className="gap-2">
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>

          <div className="space-y-6">
            {/* Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5 text-violet-400" />
                  Display
                </CardTitle>
                <CardDescription>
                  Customize how GestureSpeak looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Theme</p>
                    <p className="text-xs text-white/40">
                      Choose your preferred theme
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {["dark", "light", "system"].map((t) => (
                      <button
                        key={t}
                        onClick={() => updateSetting("theme", t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          settings.theme === t
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Font Size</p>
                    <p className="text-xs text-white/40">
                      {settings.fontSize}px
                    </p>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={settings.fontSize}
                    onChange={(e) =>
                      updateSetting("fontSize", parseInt(e.target.value))
                    }
                    className="w-32 accent-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">High Contrast</p>
                    <p className="text-xs text-white/40">
                      Enhanced visibility
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.highContrast}
                    onChange={(v) => updateSetting("highContrast", v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Voice */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Volume2 className="h-5 w-5 text-emerald-400" />
                  Voice & Speech
                </CardTitle>
                <CardDescription>
                  Text-to-speech configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Auto Speak</p>
                    <p className="text-xs text-white/40">
                      Automatically speak recognized gestures
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.autoSpeak}
                    onChange={(v) => updateSetting("autoSpeak", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Speech Rate</p>
                    <p className="text-xs text-white/40">
                      {settings.speechRate}x speed
                    </p>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.speechRate}
                    onChange={(e) =>
                      updateSetting("speechRate", parseFloat(e.target.value))
                    }
                    className="w-32 accent-emerald-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Camera */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="h-5 w-5 text-amber-400" />
                  Camera & Recognition
                </CardTitle>
                <CardDescription>
                  Configure webcam and AI settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Resolution</p>
                    <p className="text-xs text-white/40">Camera resolution</p>
                  </div>
                  <div className="flex gap-2">
                    {["480p", "720p", "1080p"].map((r) => (
                      <button
                        key={r}
                        onClick={() =>
                          updateSetting("cameraResolution", r)
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          settings.cameraResolution === r
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">FPS</p>
                    <p className="text-xs text-white/40">
                      {settings.fps} frames per second
                    </p>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={settings.fps}
                    onChange={(e) =>
                      updateSetting("fps", parseInt(e.target.value))
                    }
                    className="w-32 accent-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Show Landmarks</p>
                    <p className="text-xs text-white/40">
                      Display hand skeleton overlay
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.showLandmarks}
                    onChange={(v) => updateSetting("showLandmarks", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Show Confidence</p>
                    <p className="text-xs text-white/40">
                      Display confidence scores
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.showConfidence}
                    onChange={(v) => updateSetting("showConfidence", v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Accessibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Accessibility className="h-5 w-5 text-cyan-400" />
                  Accessibility
                </CardTitle>
                <CardDescription>
                  Make GestureSpeak work for everyone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Screen Reader Support",
                    "Keyboard Navigation",
                    "Reduced Motion",
                    "Large Text Mode",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                    >
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm text-white/60">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
