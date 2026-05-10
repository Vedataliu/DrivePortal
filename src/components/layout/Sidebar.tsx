"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  ShieldAlert,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useMobileMenu } from "@/contexts/MobileMenuContext";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isOpen, setIsOpen } = useMobileMenu();

  if (["/login", "/register"].includes(pathname)) return null;

  const isAdmin = user?.role === "ADMIN";

  const navItems = [
    ...(isAdmin ? [{ name: "Dashboard", href: "/", icon: LayoutDashboard }] : []),
    { name: "My Files", href: "/files", icon: FolderOpen },
    ...(isAdmin ? [
      { name: "Users", href: "/users", icon: Users },
      { name: "Admin Setup", href: "/admin", icon: ShieldAlert },
    ] : []),
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-border/70">
        <div className="flex items-center gap-2 text-primary font-semibold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            DP
          </div>
          DrivePortal
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-5 px-3.5 flex flex-col gap-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="relative group">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <div
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3.5 border-t border-border/70 mt-auto">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-medium text-muted-foreground truncate">{user?.email}</p>
          <div className="mt-1 inline-flex px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider">
            {user?.role}
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="w-64 border-r border-border/70 bg-background/70 hidden md:flex flex-col h-screen backdrop-blur-sm">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 border-r border-border/70 bg-background/95 backdrop-blur-xl z-50 flex flex-col md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
