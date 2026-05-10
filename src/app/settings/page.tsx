"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Settings as SettingsIcon, User as UserIcon } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account preferences.</p>
      </div>

      <div className="p-6 bg-background/60 border border-border/70 rounded-xl backdrop-blur-sm max-w-2xl">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/60">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-2 inline-block px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold tracking-wider">
              ROLE: {user?.role}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-muted-foreground" />
            Preferences
          </h3>
          <p className="text-sm text-muted-foreground">Settings configuration will be available in a future update.</p>
        </div>
      </div>
    </div>
  );
}
