# 🎓 Placement Management System (TNU PMS)

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC.svg)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Caching-DC382D.svg)](https://redis.io/)

A premium, full-stack placement automation platform designed for modern universities. **TNU PMS** bridges the gap between students, recruiters, and administrators, providing a seamless, AI-enhanced workflow for campus recruitments.

---

## � Table of Contents
- [🌟 Key Features](#-key-features)
- [🛠 Tech Stack](#-tech-stack)
- [🏗 System Architecture](#-system-architecture)
- [🚦 Getting Started](#-getting-started)
- [🔐 Security & Compliance](#-security--compliance)
- [📢 Communication Hub](#-communication-hub)
- [📂 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)

---

## 🌟 Key Features

### 👨‍🎓 Student Dashboard
- **Dynamic Profiles**: Manage academic records, CGPA, and personal details.
- **Smart Job Feed**: View and search job opportunities with real-time status tracking.
- **One-Click Applications**: Apply for jobs and track your journey from "Applied" to "Selected".
- **Resume Management**: Upload and maintain multiple versions of your professional resume.

### 🏢 Recruiter Portal
- **Job Lifecycle Management**: Post, update, and manage job openings (Active/Closed).
- **Candidate Shortlisting**: Screen applications and move candidates through the recruitment funnel.
- **Company Branding**: Manage company profiles and registration data.
- **Direct Communication**: Receive instant alerts when students apply.

### 🛠 Administrative Command Center
- **Dynamic Branding**: Custom University Logo and Primary Theme color pickers.
- **User Verification**: Approve/Reject Student and Recruiter registrations.
- **Bulk Operations**: Intelligent CSV/Excel import for mass student onboarding.
- **Global Announcements**: Broadcast urgent notifications with real-time global toasts.
- **Webhooks**: Integration with Slack/Discord for placement alerts.

---

## � Tech Stack

### Frontend (The Visual Experience)
- **Core**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Modern Utility-first architecture)
- **State & Data**: [TanStack Query v5](https://tanstack.com/query/latest) (Server State), [React Hook Form](https://react-hook-form.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)

### Backend (The Logic Engine)
- **Runtime**: [Node.js 20+](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose 8](https://mongoosejs.com/)
- **Caching**: [Redis](https://redis.io/) (High-performance query caching)
- **Background Jobs**: [BullMQ](https://docs.bullmq.io/) (Handling exports & email queues)
- **AI Integration**: [Google Gemini AI](https://ai.google.dev/) (Semantic matching)

### Infrastructure & Security
- **File Storage**: [Cloudinary](https://cloudinary.com/) (For Logos and Resumes)
- **Authentication**: [JWT](https://jwt.io/) with HttpOnly Cookies & Speakeasy 2FA
- **Real-time**: [Socket.io](https://socket.io/) (Broadcasts & Notifications)

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- MongoDB (Local or Atlas)
- Redis Server (Required for Caching/Queues)
- Cloudinary Account (For image uploads)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/Aditya11o/placement-management-system.git
cd placement-management-system

# Install Backend Dependencies
cd backend && npm install

# Install Frontend Dependencies
cd ../frontend && npm install
```

### 2. Environment Variables (`backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_uri
REDIS_URL=your_redis_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
```

### 3. Running Locally
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## 🔐 Security & Compliance
- **Audit Logging**: Comprehensive internal tracking of all Administrative changes.
- **Rate Limiting**: Protection against Brute-force and DDoS attacks.
- **Soft Delete**: Professional-grade data persistence for audit trails.
- **API Security**: Dual-layer authentication (Standard JWT + Granular API Keys).

---

## 🎯 Project Roadmap
- [x] Global Announcement System
- [x] Dynamic University Branding
- [x] Webhook Integrations (Slack/Discord)
- [ ] AI Resume Scoring & Feedback
- [ ] Direct Peer-to-Peer Messaging
- [ ] Automated Interview Scheduling

---

## 🤝 Contributing
Nexus PMS and its core architecture are open for improvements! 
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed with ❤️ for the University Ecosystem.*
