# **Project Scope Document**

### **1\. Introduction**

The **Placement Management System (PMS)** is a comprehensive web-based platform designed to automate and optimize the campus recruitment lifecycle. The system serves as a digital bridge between students, university administrators, and corporate recruiters, replacing traditional manual processes with a streamlined, data-driven workflow.

### **2\. Objectives of the System**

* **Centralization:** To provide a unified repository for student records, job listings, and application history.  
* **Automation:** To reduce administrative burden by automating student eligibility checks and shortlisting.  
* **Transparency:** To offer real-time tracking of application statuses for students and recruiters.

### **3\. Scope of the Project**

The project covers the development of a full-stack application managing the end-to-end placement process. It focuses on a premium user experience (UX) through the **"Academic Authority"** design system and ensures enterprise-grade security via a robust PERN stack with TypeScript.

### **4\. Features Included (In-Scope)**

* **Student Dashboard:** Profile management, **Integrated Resume Builder**, and a smart job feed.  
* **Recruiter Portal:** Job lifecycle management and advanced applicant screening analytics.  
* **Administrative Command Center:** User verification, system settings, and placement drive management.  
* **Application Tracking:** Standard status updates and workflow management.  
* **Analytics:** Visual representation of placement statistics and recruitment trends.

### **5\. Features Not Included (Out of Scope)**

* **External Job Scraping:** The system will not automatically pull jobs from external job boards.  
* **Video Conferencing:** Built-in interview rooms are not included; external links (Zoom/Meet) are utilized.  
* **Payment Gateway:** No financial transactions or subscription models are implemented in the current phase.  
* **Mobile App:** The current scope is limited to a fully responsive web application.

### **6\. Target Users**

* **Students:** Job seekers building professional profiles and tracking applications.  
* **Administrators:** TPC officers overseeing the platform and auditing activities.  
* **Recruiters:** HR professionals identifying talent and managing vacancies.

### **7\. System Modules**

#### **7.1. Authentication & Security Module**
Handles secure JWT-based authentication and Role-Based Access Control (RBAC). Implements advanced security middleware (Helmet, Rate-limiting).

#### **7.2. Profile & Resume Module**
Manages comprehensive academic and professional data.
**Key Functions:**
* Student Profile Management  
* **Integrated Resume Builder** for standardized profile generation.  
* Skill & Project Portfolio Management  
* Recruiter Company Profile Management

#### **7.3. Job & Analytics Module**
Allows recruiters to manage job postings and view recruitment trends.
**Key Functions:**
* Job Posting & Approval Workflow  
* Eligibility Criteria Definition (CGPA, Branch, Skills)  
* Real-time Recruitment Analytics

#### **7.4. Application & Interview Module**
Manages the application lifecycle from submission to final result.
**Status Flow:**
Applied → Under Review → Shortlisted → Interview Scheduled → Selected / Rejected

#### **7.7. Technical Scope**
* **Framework:** React, TypeScript, Node.js, Express.  
* **Database:** PostgreSQL with Prisma ORM.  
* **Styling:** "Academic Authority" design system with Tailwind CSS.  
* **Cloud Hosting:** Asset management via Cloudinary.

