"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Folder, FileText, Image as ImageIcon, Download, FileArchive, FileVideo, FileAudio } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type FileNode = { id: string, name: string, type: string, size: number, folderId: string };
type FolderNode = { id: string, name: string };

export default function MyFilesPage() {
  useAuth();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/files");
        if (res.ok) {
          const data = await res.json();
          setFiles(data.files || []);
          setFolders(data.folders || []);
        }
      } catch (err) {
        console.error("Failed to load files", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownload = (fileId: string) => {
    window.open(`/api/files/download?fileId=${fileId}`, "_blank");
  };

  const getVisualForType = (type: string) => {
    if (type.includes("image")) return { icon: ImageIcon, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Image" };
    if (type.includes("pdf")) return { icon: FileText, color: "text-red-400", bg: "bg-red-500/10", label: "PDF" };
    if (type.includes("video")) return { icon: FileVideo, color: "text-violet-400", bg: "bg-violet-500/10", label: "Video" };
    if (type.includes("audio")) return { icon: FileAudio, color: "text-amber-400", bg: "bg-amber-500/10", label: "Audio" };
    if (type.includes("zip") || type.includes("rar") || type.includes("7z") || type.includes("compressed")) {
      return { icon: FileArchive, color: "text-orange-400", bg: "bg-orange-500/10", label: "Archive" };
    }
    return { icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10", label: "Document" };
  };

  return (
    <div className="space-y-6 pb-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">My Files</h1>
          <p className="text-muted-foreground text-sm">Files and folders shared with you by administrators.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          {folders.map((folder, i) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-background/60 border border-border/70 hover:bg-background/80 transition-all group flex flex-col relative overflow-hidden cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 transition-transform duration-200 group-hover:scale-105">
                  <Folder className="w-7 h-7 text-primary" />
                </div>
              </div>
              <div className="mt-auto min-w-0 w-full">
                <h3 className="font-semibold text-foreground/90 truncate mb-1 group-hover:text-primary transition-colors">
                  {folder.name}
                </h3>
                <div className="text-xs text-muted-foreground">Folder</div>
              </div>
            </motion.div>
          ))}

          {files.map((file, i) => {
            const { icon: FileIcon, color, bg, label } = getVisualForType(file.type || "");
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (folders.length + i) * 0.05 }}
                className="p-4 rounded-xl bg-background/60 border border-border/70 hover:bg-background/90 hover:border-primary/30 transition-colors group flex flex-col relative overflow-hidden"
              >
                <div className="h-24 rounded-lg border border-border/60 bg-secondary/20 flex items-center justify-center mb-4">
                  <div className={`w-14 h-14 rounded-xl ${bg} border border-border/50 flex items-center justify-center`}>
                    <FileIcon className={`w-8 h-8 ${color}`} />
                  </div>
                </div>

                <div className="flex justify-between items-start mb-3">
                  <div className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">
                    {label}
                  </div>
                  <button 
                    onClick={() => handleDownload(file.id)}
                    className="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-auto min-w-0 w-full">
                  <h3 className="font-semibold text-sm text-foreground/90 truncate mb-1 group-hover:text-primary transition-colors" title={file.name}>
                    {file.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2 mt-2 gap-2">
                    <span className="shrink-0">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span className="truncate min-w-0 text-right">{file.type || "unknown"}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {files.length === 0 && folders.length === 0 && (
            <div className="col-span-full p-12 flex-col items-center justify-center text-center border-2 border-dashed border-border/50 rounded-2xl bg-secondary/10">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 mx-auto">
                <Folder className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No files yet</h3>
              <p className="text-sm text-muted-foreground">You haven't been assigned any files.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
