"use client";

import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/navbar";
import AIAssistant from "@/components/ai-assistant";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <AIAssistant />
    </AuthProvider>
  );
}
