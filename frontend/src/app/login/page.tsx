"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hand, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, username, password, fullName);
      } else {
        await login(email, password);
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-bg min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/20 mb-4">
            <Hand className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">GestureSpeak</h1>
          <p className="text-white/40 text-sm mt-1">
            AI-powered sign language platform
          </p>
        </div>

        <Card className="glow-cyan">
          <CardHeader className="text-center">
            <CardTitle>{isRegister ? "Create Account" : "Welcome Back"}</CardTitle>
            <CardDescription>
              {isRegister
                ? "Join GestureSpeak to save your translations"
                : "Sign in to your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                    <Input
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                    <Input
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2"
                >
                  {error}
                </motion.p>
              )}

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    {isRegister ? "Create Account" : "Sign In"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="text-sm text-white/40 hover:text-cyan-400 transition-colors"
              >
                {isRegister
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Create one"}
              </button>
            </div>

            {/* Guest mode */}
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <button
                onClick={() => router.push("/")}
                className="text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                Continue as guest →
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
