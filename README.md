# 🏛️ Placement Management System (PMS)

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

> **"The Digital Curator"** — A premium, automated placement ecosystem bridging the gap between talent and opportunity with an editorial-grade user experience.

---

## 🌟 Overview

The **Placement Management System (PMS)** is a comprehensive automation platform designed to streamline the entire recruitment lifecycle within academic institutions. It replaces manual paperwork with a sophisticated digital environment for students, recruiters, and university administrators.

### Key Pillars:
- 🖋️ **Editorial Precision:** Designed with "The Academic Authority" system for a focused, high-end experience.
- ⚡ **Real-Time Synergy:** Live application tracking and instant messaging via WebSockets.
- 🛡️ **Enterprise Security:** Built with heavy-duty sanitization and role-based access control.

---

## ✨ Features

### 🎓 For Students
- **Dynamic Profile Builder:** Comprehensive academic and personal profiling.
- **Smart Job Feed:** Personalized job listings matching CGPA and branch requirements.
- **Application Roadmap:** Transparent tracking of application status (Apply → Shortlist → Result).
- **Interview Hub:** Centralized schedule for mock and actual interviews.
- **Resume Builder:** Professional A4-template generation from profile data.

### 💼 For Recruiters
- **Company command center:** Manage job postings and track applicant engagement.
- **Candidate Comparison:** Data-driven tables for comparing student performance.
- **Shortlisting Engine:** One-click shortlisting for interviews.
- **Direct Messaging:** Secure chat line with potential candidates.

### 🛡️ For Administrators
- **Institutional Oversight:** Complete control over student and recruiter verifications.
- **Placement Analytics:** Real-time reports on placement rates and package statistics.
- **Audit Ecosystem:** Detailed logs of all system-wide activities.
- **Broadcast System:** Global announcements to the entire student body.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom Design Tokens)
- **Icons:** Lucide React
- **Notifications:** Custom Toast System + Socket.io

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js (v5)
- **Database:** MongoDB (Mongoose ODM)
- **Real-Time:** Socket.io
- **Security:** Helmet, BcryptJS, JWT, Express-Mongo-Sanitize, XSS-Clean
- **Utilities:** Node-Cron (Automated tasks), Nodemailer (Emails), Multer & Cloudinary (File handling)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local instance
- Cloudinary account for media storage

### 1. Clone the repository
```bash
git clone https://github.com/Aditya11o/placement-management-system.git
cd placement-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```
Run the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🎨 Design Philosophy
The PMS follows the **"Digital Curator"** North Star. We reject cluttered academic layouts in favor of:
- **Tonal Depth:** Utilizing background color shifts instead of heavy borders.
- **Authoritative Typography:** Manrope for display and Inter for data-heavy content.
- **Glassmorphism:** Elegant floating elements with backdrop-blur for a premium feel.

---

## 🤝 Contribution
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the ISC License.
