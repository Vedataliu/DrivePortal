"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-background flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      {}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-secondary/40 border border-border/50 p-8 rounded-3xl backdrop-blur-xl relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/25">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">DrivePortal</h1>
          <p className="text-muted-foreground mt-2 text-sm text-center">
            Secure, role-based document distribution.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2"
          >
            <div className="w-1 h-1 rounded-full bg-red-400"></div>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 pl-1">Email address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@driveportal.com"
                className="w-full pl-12 pr-4 py-3 bg-background border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80 pl-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-background border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {isLoading ? "Authenticating..." : "Sign in to Workspace"}
            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-border/50 text-center space-y-3">
          <div className="bg-secondary/30 rounded-lg p-2.5 border border-border/50 text-left">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              <div className="bg-background/50 px-2 py-1.5 rounded-md border border-border/50 flex flex-col items-center text-center">
                <span className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">Admin</span>
                <span className="font-medium text-[11px] text-foreground/90 select-all mt-0.5">admin@driveportal.com</span>
              </div>
              <div className="bg-background/50 px-2 py-1.5 rounded-md border border-border/50 flex flex-col items-center text-center">
                <span className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">User</span>
                <span className="font-medium text-[11px] text-foreground/90 select-all mt-0.5">user@driveportal.com</span>
              </div>
            </div>
            <div className="bg-primary/10 px-2 py-1.5 rounded-md border border-primary/20 flex justify-center items-center gap-1.5">
              <span className="text-primary/80 text-[9px] font-bold uppercase tracking-wider">Password:</span>
              <span className="font-bold text-primary text-[11px] select-all">password123</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-foreground hover:text-primary font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
