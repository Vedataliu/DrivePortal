import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";

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
            <MobileMenuProvider>
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <Header />
                <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-br from-background via-background to-secondary/10 relative">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>
                  <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 relative z-10">
                    {children}
                  </div>
                </main>
              </div>
            </MobileMenuProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
