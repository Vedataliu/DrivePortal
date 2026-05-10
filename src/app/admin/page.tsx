"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, FolderPlus, FileUp, X, Trash2, Folder, File, Key, AlertTriangle } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function AdminPage() {
  const [activeModal, setActiveModal] = useState<"group" | "folder" | "permission" | "member" | null>(null);
  const { showToast } = useToast();

  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  // Form States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Modal Inputs
  const [folderName, setFolderName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [permissionTargetType, setPermissionTargetType] = useState<"FILE" | "FOLDER">("FILE");
  const [permissionTargetId, setPermissionTargetId] = useState("");
  const [permissionUserId, setPermissionUserId] = useState("");
  const [permissionGroupId, setPermissionGroupId] = useState("");
  const [memberGroupId, setMemberGroupId] = useState("");
  const [memberUserId, setMemberUserId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "file" | "folder"; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const [uRes, gRes, foRes, fiRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/groups"),
        fetch("/api/admin/folders"),
        fetch("/api/admin/files")
      ]);
      if (uRes.ok) setUsers((await uRes.json()).users);
      if (gRes.ok) setGroups((await gRes.json()).groups);
      if (foRes.ok) setFolders((await foRes.json()).folders);
      if (fiRes.ok) setFiles((await fiRes.json()).files);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("folderId", "root"); // or a selected folder state

    try {
      const res = await fetch("/api/admin/files", { method: "POST", body: formData });
      if (res.ok) {
        setMessage("File uploaded successfully");
        showToast({ type: "success", title: "File uploaded", description: "The file is ready for permission assignment." });
        fetchData();
      } else {
        setMessage("Upload failed");
        showToast({ type: "error", title: "Upload failed", description: "Please try again with another file." });
      }
    } catch (err) {
      setMessage("Error uploading file");
      showToast({ type: "error", title: "Upload error", description: "An unexpected error occurred while uploading." });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName })
      });
      if (res.ok) {
        setFolderName("");
        setActiveModal(null);
        showToast({ type: "success", title: "Folder created" });
        fetchData();
      } else {
        showToast({ type: "error", title: "Failed to create folder" });
      }
    } catch (err) {
      console.error(err);
      showToast({ type: "error", title: "Create folder failed", description: "Unexpected error." });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName })
      });
      if (res.ok) {
        setGroupName("");
        setActiveModal(null);
        showToast({ type: "success", title: "Group created" });
        fetchData();
      } else {
        showToast({ type: "error", title: "Failed to create group" });
      }
    } catch (err) {
      console.error(err);
      showToast({ type: "error", title: "Create group failed", description: "Unexpected error." });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPermission = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: permissionTargetId,
          targetType: permissionTargetType,
          userId: permissionUserId || null,
          groupId: permissionGroupId || null,
          role: "VIEW"
        })
      });
      if (res.ok) {
        setPermissionTargetId("");
        setPermissionUserId("");
        setPermissionGroupId("");
        setActiveModal(null);
        showToast({ type: "success", title: "Permission assigned", description: "Access was granted successfully." });
      } else {
        const d = await res.json();
        showToast({ type: "error", title: "Failed to assign permission", description: d.error || "Please check selected values." });
      }
    } catch (err) {
      console.error(err);
      showToast({ type: "error", title: "Assign permission failed", description: "Unexpected error." });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMemberToGroup = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/groups/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: memberGroupId, userId: memberUserId }),
      });

      if (res.ok) {
        setMemberGroupId("");
        setMemberUserId("");
        setActiveModal(null);
        showToast({ type: "success", title: "User added to group" });
        fetchData();
      } else {
        const data = await res.json();
        showToast({ type: "error", title: "Failed to add member", description: data.error || "Please try again." });
      }
    } catch (error) {
      console.error(error);
      showToast({ type: "error", title: "Add member failed", description: "Unexpected error." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = (id: string, name: string) => {
    setDeleteTarget({ id, type: "folder", name });
  };

  const handleDeleteFile = (id: string, name: string) => {
    setDeleteTarget({ id, type: "file", name });
  };

  const confirmDeleteTarget = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const endpoint = deleteTarget.type === "folder" ? `/api/admin/folders/${deleteTarget.id}` : `/api/admin/files/${deleteTarget.id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        showToast({ type: "success", title: `${deleteTarget.type === "folder" ? "Folder" : "File"} deleted` });
        setDeleteTarget(null);
        fetchData();
      } else {
        showToast({ type: "error", title: `Failed to delete ${deleteTarget.type}` });
      }
    } catch (err) {
      console.error(err);
      showToast({ type: "error", title: "Delete failed", description: "Unexpected error." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-8 relative">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Setup</h1>
        <p className="text-muted-foreground">Manage users, groups, and permissions securely via RBAC.</p>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { id: "group", name: "Create Group", icon: Users, desc: "Group users for bulk access.", color: "text-purple-500", bg: "bg-purple-500/10" },
          { id: "member", name: "Assign User to Group", icon: UserPlus, desc: "Link standard users to groups.", color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { id: "folder", name: "Create Folder", icon: FolderPlus, desc: "Create structural folders.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { id: "permission", name: "Assign Access", icon: Key, desc: "Manage view permissions.", color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((action, i) => (
          <motion.div
            key={action.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            onClick={() => setActiveModal(action.id as any)}
            className="p-5 rounded-xl bg-background/60 border border-border/70 hover:border-primary/35 transition-colors cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-105`}>
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <h3 className="font-semibold text-base">{action.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{action.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Global Upload */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl border border-dashed border-border/80 bg-background/60 hover:bg-background/80 transition-colors flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[280px]"
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleUpload}
            disabled={loading}
          />
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileUp className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{loading ? "Uploading..." : "Global File Upload"}</h3>
          <p className="text-sm text-muted-foreground max-w-[250px] mb-4">
            Drag and drop files here or click to browse.
          </p>
          {message && <p className="text-sm font-medium text-emerald-500">{message}</p>}
          <button className="mt-2 px-6 py-2 bg-background border border-border rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-all pointer-events-none">
            {loading ? "Please wait..." : "Select Files"}
          </button>
        </motion.div>

        {/* File and Folder Management List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-background/60 border border-border/70 backdrop-blur-sm max-h-[400px] overflow-y-auto"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" /> System Items
          </h2>

          <div className="space-y-3">
            {folders.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-background/80 border border-border/70 transition-colors hover:bg-background">
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-sm">{f.name}</span>
                </div>
                <button onClick={() => handleDeleteFolder(f.id, f.name)} className="text-red-500/70 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {files.map(file => (
              <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-background/80 border border-border/70 transition-colors hover:bg-background">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteFile(file.id, file.name)} className="text-red-500/70 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {folders.length === 0 && files.length === 0 && (
              <div className="text-center text-sm text-muted-foreground p-4">No folders or files found.</div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteTarget(null)}
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background/95 p-6 shadow-xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-1">Confirm delete</h3>
                  <p className="text-sm text-muted-foreground">
                    Delete <span className="font-medium text-foreground">{deleteTarget.name}</span>? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary/40 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTarget}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="bg-card w-full max-w-md p-6 rounded-xl border border-border shadow-xl relative"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>

              {activeModal === "folder" && (
                <>
                  <h3 className="text-xl font-semibold mb-4">Create Folder</h3>
                  <input
                    type="text" value={folderName} onChange={e => setFolderName(e.target.value)}
                    placeholder="Folder Name" className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none mb-4"
                  />
                  <button onClick={handleCreateFolder} disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">
                    {loading ? "Creating..." : "Create Folder"}
                  </button>
                </>
              )}

              {activeModal === "group" && (
                <>
                  <h3 className="text-xl font-semibold mb-4">Create User Group</h3>
                  <input
                    type="text" value={groupName} onChange={e => setGroupName(e.target.value)}
                    placeholder="Group Name" className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none mb-4"
                  />
                  <button onClick={handleCreateGroup} disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">
                    {loading ? "Creating..." : "Create Group"}
                  </button>
                </>
              )}

              {activeModal === "member" && (
                <>
                  <h3 className="text-xl font-semibold mb-4">Assign User to Group</h3>
                  <div className="space-y-4">
                    <select
                      value={memberUserId}
                      onChange={(e) => setMemberUserId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border outline-none"
                    >
                      <option value="">Select Standard User...</option>
                      {users
                        .filter((u) => u.role === "USER")
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name || u.email}
                          </option>
                        ))}
                    </select>

                    <select
                      value={memberGroupId}
                      onChange={(e) => setMemberGroupId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border outline-none"
                    >
                      <option value="">Select Group...</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleAssignMemberToGroup}
                      disabled={loading || !memberUserId || !memberGroupId}
                      className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50"
                    >
                      {loading ? "Assigning..." : "Assign to Group"}
                    </button>
                  </div>
                </>
              )}

              {activeModal === "permission" && (
                <>
                  <h3 className="text-xl font-semibold mb-4">Assign View Permission</h3>
                  <div className="space-y-4">
                    <select value={permissionTargetType} onChange={e => setPermissionTargetType(e.target.value as any)} className="w-full px-4 py-3 rounded-xl bg-background border border-border outline-none">
                      <option value="FILE">File</option>
                      <option value="FOLDER">Folder</option>
                    </select>

                    <select value={permissionTargetId} onChange={e => setPermissionTargetId(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background border border-border outline-none">
                      <option value="">Select {permissionTargetType === "FILE" ? "File" : "Folder"}...</option>
                      {(permissionTargetType === "FILE" ? files : folders).map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>

                    <p className="text-sm text-muted-foreground text-center">Assign To:</p>

                    <select value={permissionUserId} onChange={e => { setPermissionUserId(e.target.value); setPermissionGroupId(""); }} className="w-full px-4 py-3 rounded-xl bg-background border border-border outline-none">
                      <option value="">Select User (Optional)...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name || u.email}</option>
                      ))}
                    </select>

                    <p className="text-xs text-center text-muted-foreground">OR</p>

                    <select value={permissionGroupId} onChange={e => { setPermissionGroupId(e.target.value); setPermissionUserId(""); }} className="w-full px-4 py-3 rounded-xl bg-background border border-border outline-none">
                      <option value="">Select Group (Optional)...</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>

                    <button onClick={handleAssignPermission} disabled={loading || !permissionTargetId || (!permissionUserId && !permissionGroupId)} className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50">
                      {loading ? "Assigning..." : "Assign Permission"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
