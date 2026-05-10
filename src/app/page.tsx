"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Archive, 
  Download,
  FolderOpen
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type FileNode = { id: string, name: string, type: string, size: number, folderId: string };

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recentFiles, setRecentFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.role === "USER") {
      router.push("/files");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetch("/api/admin/files")
        .then(res => res.json())
        .then(data => setRecentFiles(data.files || []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || user?.role !== "ADMIN" || loading) return <div className="p-12">Loading workspace...</div>;

  const stats = [
    { name: "Total Files", value: recentFiles.length.toString(), icon: FileText, color: "from-blue-500 to-indigo-500" },
    { name: "Total Folders", value: "2", icon: FolderOpen, color: "from-emerald-500 to-teal-500" },
    { name: "Total Storage", value: `${(recentFiles.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB`, icon: Archive, color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="space-y-7 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back, {user?.name}.</h1>
        <p className="text-sm text-muted-foreground">Overview of your DrivePortal workspace and recent files.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-5 rounded-xl bg-background/60 border border-border/70 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <h3 className="text-xl font-bold mt-0.5">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Files */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All System Files</h2>
            <button className="text-sm text-primary hover:underline font-medium">View all</button>
          </div>
          
          <div className="bg-background/60 border border-border/70 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="divide-y divide-border/50">
              {recentFiles.map((file, i) => (
                <motion.div 
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.05) }}
                  className="flex items-center justify-between p-4 hover:bg-secondary/25 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-secondary/40 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground/90 group-hover:text-primary transition-colors">{file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{file.type}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                        <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => window.open(`/api/files/download?fileId=${file.id}`, "_blank")}
                        className="p-2 hover:bg-secondary/60 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {recentFiles.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No files uploaded to the system yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions / Folders */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-2 p-5 rounded-xl bg-background/60 border border-border/70 text-center"
          >
            <h3 className="font-semibold text-base mb-2">Upload Files</h3>
            <p className="text-sm text-muted-foreground mb-4">Go to Admin Setup to upload files and assign permissions.</p>
            <button 
              onClick={() => router.push('/admin')}
              className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
            >
              Go to Admin
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
