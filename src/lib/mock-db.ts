
import bcrypt from "bcryptjs";

const defaultPasswordHash = "$2a$10$X8C5H5f6a9c8yZ6y0v5xQ.u/xM5m1Y9z1uO9R1tW.8q/Uq.6c3nL6"; 

export const mockUsers = [
  { id: "1", email: "admin@driveportal.com", password: defaultPasswordHash, role: "ADMIN", name: "System Admin" },
  { id: "2", email: "user@driveportal.com", password: defaultPasswordHash, role: "USER", name: "Standard User" }
];

export const mockFolders = [
  { id: "f1", name: "Marketing Assets", createdBy: "1", createdAt: new Date().toISOString() },
  { id: "f2", name: "Finance Reports", createdBy: "1", createdAt: new Date().toISOString() }
];

export const mockFiles = [
  { id: "file1", name: "Brand_Guidelines.pdf", folderId: "f1", size: 1024 * 1024 * 2.5, type: "application/pdf", url: "https://example.com/file1.pdf" },
  { id: "file2", name: "Q1_Budget.xlsx", folderId: "f2", size: 1024 * 500, type: "application/vnd.ms-excel", url: "https://example.com/file2.xlsx" }
];

export const mockPermissions = [
  { targetId: "file1", type: "FILE", userId: "2", role: "VIEW" },
  { targetId: "f2", type: "FOLDER", userId: "2", role: "VIEW" }
];
