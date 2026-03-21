# **Project Scope Document**

### **1\. Introduction**

The **Placement Management System (PMS)** is a comprehensive web-based platform designed to automate and optimize the campus recruitment lifecycle. The system serves as a digital bridge between students, university administrators, and corporate recruiters, replacing traditional manual processes with a streamlined, data-driven workflow.

### **2\. Objectives of the System**

* **Centralization:** To provide a unified repository for student records, job listings, and application history.  
* **Automation:** To reduce administrative burden by automating student eligibility checks and shortlisting.  
* **Transparency:** To offer real-time tracking of application statuses for students and recruiters.  
* **Communication:** To facilitate seamless information exchange through instant notifications and messaging hubs.

### **3\. Scope of the Project**

The project covers the development of a full-stack application that manages the end-to-end placement process, from user registration and job posting to candidate selection and analytics. It focuses on enhancing the user experience through modern UI/UX principles and ensuring data integrity via a secure backend.

### **4\. Features Included (In-Scope)**

* **Student Dashboard:** Profile management, resume uploads, and a smart job feed.  
* **Recruiter Portal:** Job lifecycle management (post/update/close) and candidate screening.  
* **Administrative Command Center:** User verification, university branding customization, and bulk data imports.  
* **Application Tracking:** Real-time status updates (Applied, Shortlisted, Selected, Rejected).  
* **Messaging & Notifications:** Global broadcasts, real-time toasts, and student-recruiter communication.  
* **Analytics:** Recharts-driven visual representation of placement statistics.

### **5\. Features Not Included (Out of Scope)**

* **External Job Scraping:** The system will not automatically pull jobs from LinkedIn or Indeed.  
* **Video Conferencing:** Built-in interview rooms are not included; external links (Zoom/Meet) will be used.  
* **Payment Gateway:** No financial transactions or subscription models for recruiters are implemented.  
* **Mobile App:** The current scope is limited to a responsive web application.

### **6\. Target Users**

* **Students:** Job seekers looking for campus opportunities and tracking their career progress.  
* **Administrators:** TPC officers managing the platform, verifying users, and generating reports.  
* **Recruiters:** HR professionals posting vacancies and identifying top talent.

### **7\. System Modules**

#### **7.1. Authentication Module**

This module handles secure user authentication and authorization. It provides login functionality for Students, Recruiters, and Admin using secure authentication mechanisms. Role-Based Access Control (RBAC) is implemented to restrict access to different system features based on user roles.

**Main Functions:**

* User Registration  
* User Login & Logout  
* Password Encryption  
* Role-Based Access Control (Student / Recruiter / Admin)  
* Session Management

#### **7.2. Profile Module**

This module manages user profile information including academic details, personal details, skills, projects, and resumes. Students can update their academic and professional profiles, while recruiters can manage company profiles.

**Main Functions:**

* Student Profile Management  
* Academic Record Management  
* Skills & Projects Management  
* Resume Upload & Update  
* Recruiter Company Profile Management

#### **7.3. Job Management Module**

This module is used by recruiters to create and manage job postings. Admin can review and approve job postings before they become visible to students.

**Main Functions:**

* Post Job  
* Edit/Delete Job  
* Define Eligibility Criteria (CGPA, Course, Skills)  
* Application Deadline Management  
* Job Approval by Admin  
* Job Status Management (Open/Closed)

#### **7.4. Application Module**

This module manages the job application process. Students can apply for jobs, and recruiters can review applications, shortlist candidates, and update application status.

**Main Functions:**

* Apply for Job  
* Track Application Status  
* Shortlist Candidates  
* Reject Candidates  
* Interview Scheduling  
* Final Selection

**Application Status Flow:**

Applied → Under Review → Shortlisted → Interview Scheduled → Selected / Rejected

#### **7.5. Notification Module**

This module sends notifications to students and recruiters regarding important updates such as job postings, application status changes, interview schedules, and announcements.

**Main Functions:**

* Job Notifications  
* Application Status Notifications  
* Interview Reminders  
* Selection Notifications  
* Admin Announcements  
* Mark Notification as Read

