"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Globe, LogOut, Shield, Hand } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="grid-bg min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 mb-4">Sign in to view your profile</p>
            <Button onClick={() => router.push("/login")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid-bg min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile header */}
          <Card className="mb-6 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-violet-600/20" />
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 border-4 border-slate-950 shadow-xl text-3xl font-bold text-white">
                  {(user.full_name || user.username).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">
                    {user.full_name || user.username}
                  </h1>
                  <p className="text-white/40 text-sm">@{user.username}</p>
                </div>
                <Badge variant="success" className="gap-1.5">
                  <Shield className="h-3 w-3" />
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                    <Mail className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Email</p>
                    <p className="text-sm text-white/80">{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                    <Globe className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Language</p>
                    <p className="text-sm text-white/80">
                      {user.preferred_language === "en"
                        ? "English"
                        : user.preferred_language}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Member Since</p>
                    <p className="text-sm text-white/80">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Hand className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Account ID</p>
                    <p className="text-sm text-white/80">#{user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
