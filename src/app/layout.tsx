import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DrivePortal",
  description: "A secure role-based file distribution portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex h-screen overflow-hidden antialiased bg-background`}>
        <AuthProvider>
          <ToastProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
              <Header />
              <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-br from-background via-background to-secondary/10 relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>
                <div className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-8 relative z-10">
                  {children}
                </div>
                <footer className="w-full border-t border-border/50 bg-secondary/10 py-4 px-5 lg:px-6 z-10 relative mt-auto">
                  <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center md:text-left">
                    <p className="flex-1">
                      This platform was developed as part of the recruitment process for <strong>Insurvas</strong>.
                    </p>
                    <div className="flex-shrink-0 font-medium opacity-70 border border-border/50 px-2.5 py-0.5 rounded-full bg-background/50">
                      May, 2026
                    </div>
                    <div className="flex-1 flex flex-col md:flex-row items-center justify-end gap-1 md:gap-4">
                      <span>Developer: <strong>Vedat Aliu</strong></span>
                      <span className="hidden md:inline">•</span>
                      <a href="https://vedataliu.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                        Portfolio: vedataliu.vercel.app
                      </a>
                    </div>
                  </div>
                </footer>
              </main>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
