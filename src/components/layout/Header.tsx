"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Bell, Menu, ChevronDown, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useMobileMenu } from "@/contexts/MobileMenuContext";

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { toggle } = useMobileMenu();
  const section = pathname === "/" ? "Dashboard" : pathname.replace("/", "").replace("-", " ");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsProfileOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  if (["/login", "/register"].includes(pathname)) return null;

  return (
    <header className="h-16 border-b border-border/70 bg-background/80 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={toggle}
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="block">
          <p className="hidden md:block text-xs uppercase tracking-[0.14em] text-muted-foreground">DrivePortal</p>
          <h2 className="text-sm font-medium capitalize">{section}</h2>
        </div>
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search files, folders..." 
            className="pl-9 pr-4 py-2 bg-secondary/35 border border-border/60 focus:border-primary/40 focus:bg-background rounded-full text-sm outline-none transition-colors w-64"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/40">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full"></span>
        </button>
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 pr-2 pl-1.5 py-1 hover:bg-secondary/30 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-primary/90 flex items-center justify-center text-white text-xs font-medium">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/70 bg-background/95 backdrop-blur-md shadow-xl p-2">
              <div className="px-2 py-2 border-b border-border/60">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <span className="inline-flex mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold tracking-wider">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="w-full mt-1 flex items-center gap-2 px-2 py-2 text-sm rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
