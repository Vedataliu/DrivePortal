"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/contexts/ToastContext";

export default function UsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setUserToDelete(null);
        loadUsers();
        showToast({ type: "success", title: "User deleted successfully" });
      } else {
        const data = await res.json();
        showToast({ type: "error", title: "Delete failed", description: data.error || "Failed to delete user" });
      }
    } catch (err) {
      showToast({ type: "error", title: "Unexpected error", description: "An unexpected error occurred." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Users Directory</h1>
        <p className="text-muted-foreground text-sm">View all registered users in the platform.</p>
      </div>

      <div className="bg-background/60 border border-border/70 rounded-xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading users...</div>
        ) : (
          <div className="divide-y divide-border/50">
            {users.map((u, i) => (
              <motion.div 
                key={u.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.16 }}
                className="flex items-center justify-between p-4 hover:bg-secondary/25 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground/90">{u.name || "No Name"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {u.role}
                  </div>
                  {u.role !== 'ADMIN' && (
                    <button
                      onClick={() => setUserToDelete(u)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {users.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">No users found.</div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserToDelete(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background/95 border border-border p-6 rounded-xl shadow-xl z-50 backdrop-blur-md"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Delete User?</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Are you sure you want to completely delete <strong>{userToDelete.name || userToDelete.email}</strong>? 
                  This action cannot be undone and will permanently remove all their permissions.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setUserToDelete(null)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
