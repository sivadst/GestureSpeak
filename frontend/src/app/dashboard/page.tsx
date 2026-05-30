"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  Hand,
  Clock,
  Activity,
  Trophy,
} from "lucide-react";

interface Stats {
  total_translations: number;
  translations_today: number;
  unique_gestures: number;
  avg_confidence: number;
  top_gestures: { gesture: string; count: number }[];
  recent_translations: any[];
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const statCards = [
    {
      label: "Total Translations",
      value: stats?.total_translations || 0,
      icon: BarChart3,
      color: "from-cyan-500 to-blue-600",
      shadow: "shadow-cyan-500/20",
    },
    {
      label: "Today",
      value: stats?.translations_today || 0,
      icon: Clock,
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
    },
    {
      label: "Unique Gestures",
      value: stats?.unique_gestures || 0,
      icon: Hand,
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20",
    },
    {
      label: "Avg Confidence",
      value: `${Math.round((stats?.avg_confidence || 0) * 100)}%`,
      icon: TrendingUp,
      color: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20",
    },
  ];

  return (
    <div className="grid-bg min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-white/50 mt-1">
            {user
              ? `Welcome back, ${user.full_name || user.username}!`
              : "Sign in to track your translation analytics"}
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/40">{s.label}</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {s.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} shadow-lg ${s.shadow}`}
                    >
                      <s.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
                {/* Decorative gradient line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.color}`}
                />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top gestures */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  Top Gestures
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.top_gestures && stats.top_gestures.length > 0 ? (
                  <div className="space-y-3">
                    {stats.top_gestures.map((g, i) => {
                      const maxCount = stats.top_gestures[0].count;
                      const pct = Math.round((g.count / maxCount) * 100);
                      return (
                        <div key={g.gesture} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm text-white/80">
                              <span className="text-lg">
                                {gestureEmojis[g.gesture] || "🤷"}
                              </span>
                              {g.gesture.replace("_", " ")}
                            </span>
                            <span className="text-sm text-white/40">
                              {g.count} uses
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.5 + i * 0.1 }}
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-white/10 mx-auto mb-3" />
                    <p className="text-white/40">No data yet</p>
                    <p className="text-white/20 text-sm mt-1">
                      Start translating to see analytics
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recent_translations &&
                stats.recent_translations.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recent_translations.slice(0, 8).map((t: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                      >
                        <span className="text-lg">
                          {gestureEmojis[t.gesture_name] || "🤷"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/70 truncate">
                            {t.output_text || t.gesture_name}
                          </p>
                          <p className="text-xs text-white/30">
                            {new Date(t.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            t.confidence >= 0.8 ? "success" : "warning"
                          }
                        >
                          {Math.round(t.confidence * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/40 text-sm">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
