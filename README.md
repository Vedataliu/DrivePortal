# 📁 DrivePortal

**Note:** *This project is a Minimal Viable Product (MVP) developed as part of the recruitment process to join the **Insurvas** team.*

DrivePortal is a secure, role-based document distribution application. It acts as a centralized hub where Administrators securely distribute files, and Standard Users can only access and download the files assigned to them. 

## ✨ Key Features
- **Strict RBAC:** Administrators have full control (upload, delete, manage access). Standard users have a secure, read-only dashboard.
- **Secure Downloads:** Forced `Content-Disposition: attachment` headers prevent malicious file execution.
- **Cloud Storage:** Integrated with Supabase Storage (S3-compatible) for reliable file handling.
- **Modern UI:** Built with Next.js, React, and Tailwind CSS for a premium feel.

## 🛠️ Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS
- **Backend & DB:** Next.js API Routes, Supabase (PostgreSQL & Storage)
- **Auth:** Custom JWT-based authentication

## 🚀 Quick Start
```bash
# 1. Clone the repo
git clone https://github.com/Vedataliu/DrivePortal.git
cd DrivePortal

# 2. Install dependencies
npm install

# 3. Setup environment variables (refer to .env.example)
# Contact the author for the actual API keys

# 4. Run development server
npm run dev
```
For any questions, suggestions, or collaboration opportunities, please feel free to reach out.

Contact 🔗 https://vedataliu.vercel.app/ | 📧 Email: vedataliu1@gmail.com 
