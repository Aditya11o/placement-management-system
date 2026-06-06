# Software Requirement Specification (SRS) for Placement Management System (PMS)

## 1. Introduction

### 1.1 Purpose

The purpose of this document is to provide a detailed description of the Software Requirement Specification (SRS) for the **Placement Management System (PMS)**. This document outlines the functional and non-functional requirements, system features, and external interface requirements to serve as a guide for developers, testers, and stakeholders.

### 1.2 Scope

The PMS is a web-based automation platform designed to bridge the gap between students, corporate recruiters, mentors, alumni, and university administrators. The system covers the core recruitment lifecycle, including profile management, job posting, eligibility criteria definition, application tracking, interview slot selection, mock interviews, direct messaging, peer experience forums, and mentorship scheduling. It aims to eliminate manual paperwork and provide a transparent, efficient, and data-driven recruitment process.

### 1.3 Definitions, Acronyms, and Abbreviations

* **PMS:** Placement Management System
* **TPC:** Training and Placement Cell
* **RBAC:** Role-Based Access Control
* **JWT:** JSON Web Token (used for secure authentication)
* **CSRF:** Cross-Site Request Forgery
* **Admin:** University Placement Officer or System Administrator
* **Recruiter:** Corporate HR or Hiring Manager
* **Mentor:** Academic or industry expert training students
* **Alumni:** Graduates sharing placement experiences and providing referrals
* **PERN:** PostgreSQL, Express, React, Node.js

### 1.4 Overview

This SRS follows a structured format, starting with a high-level product description, followed by detailed functional requirements for each module, and concluding with performance, security, and interface specifications.

---

## 2. Overall Description

### 2.1 Product Perspective

The PMS is an independent, self-contained web platform. It interacts with cloud services (Cloudinary) for file hosting and utilizes a centralized PostgreSQL database for data persistence. The architecture is a decoupled PERN stack.

### 2.2 Product Functions

* User registration and authentication with specific role-based access.
* **Integrated Resume Builder** for standardized profile generation.
* Job lifecycle management (Posting -> Screening -> Shortlisting -> Selection).
* Alumni referral jobs management.
* Mentor availability and mock interview coordinates booking.
* Support desk ticketing pipelines.
* Automated administrative oversight, verifications, and compliance controls.

### 2.3 User Classes and Characteristics

* **Students:** Primary users searching for jobs, building profiles, practicing mocks, and tracking applications.
* **Administrators:** Power users responsible for system configuration, user verification, compliance audits, and system settings.
* **Recruiters:** Corporate users managing job postings, pipeline stages, and applicant screening.
* **Alumni:** Former graduates offering referrals, sharing interview experiences, and accepting student mentorship bookings.
* **Mentors:** Dedicated helpers scheduling mock interviews and evaluating student readiness.

### 2.4 Operating Environment

* **Client side:** Modern web browsers (Chrome, Firefox, Safari, Edge).
* **Server side:** Node.js runtime environment (v18+).
* **Database:** PostgreSQL.
* **Hosting:** AWS, Vercel, or Docker-based environments.

### 2.5 Assumptions and Constraints

* Users have stable internet connectivity.
* Resumes must be in PDF or Word formats (if uploaded manually).
* System performance is subject to hosting environment limits.

---

## 3. Functional Requirements

### 3.1 Student Module

* **Dashboard:** Real-time overview of applications status, recent jobs, and active reminders.
* **Profile Management:** Comprehensive academic details (CGPA, backlogs), personal metrics, and professional links.
* **Resume Builder:** Tool to generate standardized professional resumes directly from profile data.
* **Job Feed:** Smart filtering based on eligibility (CGPA, Branch, backlogs, gender).
* **Application Tracking:** Live stage updates (Applied, Shortlisted, Selected, Rejected) with offer response mechanisms.
* **Mentorship & Practice:** Ability to book mentors for mock interviews or request bookings with alumni.
* **Peer Forums:** Read placement stories and interview tips shared by alumni or placed seniors.
* **Support Tickets:** File issues or bugs to TPC administrators directly.

### 3.2 Recruiter Module

* **Corporate Dashboard:** Analytics on job postings, candidate flows, and ROI.
* **Job Management:** Posting, editing, and status monitoring of job listings.
* **Applicant Screening:** Filter, sort, and compare candidate academic sheets and resumes.
* **Multistage Pipeline:** Configurable candidate evaluation stages (Advance / Reject) with feedback inputs.
* **Interview Scheduling:** Set slot options and link dates to candidates.
* **Offer Letters:** Upload offer letters to selected students and verify responses.

### 3.3 Admin Module

* **Mission Control:** Global view of student compliance, recruiter statuses, and general stats.
* **User Management:** Centralized audit and verification (Approve/Reject) of newly registered students and recruiters.
* **Verifications Hub:** Validate academic credentials and approve student skill badge certifications.
* **Batch Operations:** Trigger automated batch checks and send bulk notifications/emails.
* **Settings Command:** Enable/disable registrations, configure application limits, or set maintenance modes.
* **Archiver:** Compress and snapshot student records upon graduation year completion.

### 3.4 Alumni & Mentor Modules

* **Referral Job Feed:** Alumni can post jobs with referral options to student networks.
* **Experience Sharing:** Share interview experiences (company, role, questions asked, tips) with student forums.
* **Availability Planner:** Set active slots for mentorship sessions or mock interviews.
* **Feedback Portal:** Evaluate student mock interview performances and assign readiness ratings.

---

## 4. Non-Functional Requirements

### 4.1 Performance

* Support for 500+ concurrent users with sub-2s response times.
* Optimized database queries for fast data retrieval.

### 4.2 Security

* **Authentication:** JWT-based stateless authentication with password hashing (bcrypt).
* **CSRF Protection:** Double Submit Cookie token checked on all state-modifying requests.
* **RBAC:** Strict role-based permissions preventing cross-role access.
* **Middleware:** Implementation of `helmet` (security headers), `xss-clean` (input sanitization), `hpp` (parameter pollution prevention), and `express-rate-limit` (endpoint throttling) for enterprise security.

### 4.3 Usability

* **Responsive Design:** Adaptive layout for mobile, tablet, and desktop.
* **Design System:** Consistent UI based on the **"Academic Authority"** framework.

### 4.4 Reliability

* **Uptime:** Targeted 99.5% service availability.

---

## 5. System Features

### 5.1 Smart Job Matching

Matching algorithm to highlight relevant jobs based on student CGPA, branch, backlogs, and preferred roles.

### 5.2 Dynamic Branding & White-Labeling

Real-time modification of system logos and color palettes via the Admin panel.

---

## 6. External Interface Requirements

### 6.1 User Interface

Built with **React 19, TypeScript, and Tailwind CSS** for a type-safe, premium aesthetic.

### 6.2 Cloud & Database Interfaces

* **Prisma ORM:** For structured PostgreSQL database interaction.
* **Cloudinary API:** For secure image, avatar, and resume PDF hosting.
* **SMTP Service:** Nodemailer configuration for critical mail updates.