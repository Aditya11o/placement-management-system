# **Software Requirement Specification (SRS)**

# **Project: Placement Management System (PMS)**

### **1\. Introduction**

#### **1.1 Purpose**

The purpose of this document is to provide a detailed description of the Software Requirement Specification (SRS) for the **Placement Management System (PMS)**. This document outlines the functional and non-functional requirements, system features, and external interface requirements to serve as a guide for developers, testers, and stakeholders.

#### **1.2 Scope**

The PMS is a web-based automation platform designed to bridge the gap between students, recruiters, university administrators, and industry mentors. The system covers the entire recruitment lifecycle, including profile management, job posting, application tracking, real-time notifications, and mentorship engagement. It aims to eliminate manual paperwork and provide a transparent, efficient, and data-driven recruitment process.

#### **1.3 Definitions, Acronyms, and Abbreviations**

* **PMS:** Placement Management System  
* **TPC:** Training and Placement Cell  
* **RBAC:** Role-Based Access Control  
* **JWT:** JSON Web Token (used for secure authentication)  
* **Admin:** University Placement Officer or System Administrator  
* **Recruiter:** Corporate HR or Hiring Manager  
* **MERN:** MongoDB, Express, React, Node.js  

#### **1.4 Overview**

This SRS follows a structured format, starting with a high-level product description, followed by detailed functional requirements for each module, and concluding with performance, security, and interface specifications.

### **2\. Overall Description**

#### **2.1 Product Perspective**

The PMS is an independent, self-contained web platform. It interacts with cloud services (Cloudinary) for file hosting and utilizes a centralized MongoDB database for data persistence. The architecture is a decoupled MERN stack with a focus on real-time interactivity.

#### **2.2 Product Functions**

* User registration and authentication with specific role-based access.  
* **Integrated Resume Builder** for standardized profile generation.  
* Job lifecycle management (Posting -> Screening -> Shortlisting -> Selection).  
* **Alumni & Mentor portals** for career guidance and networking.  
* Automated administrative oversight with audit logs and system backups.  
* Real-time communication via live chat and persistent notifications.

#### **2.3 User Classes and Characteristics**

* **Students:** Primary users searching for jobs and building professional profiles.  
* **Administrators:** Power users responsible for system configuration, user verification, and auditing.  
* **Recruiters:** Corporate users managing job postings and applicant screening.  
* **Alumni & Mentors:** Industry professionals providing guidance and mentorship via the platform.

#### **2.4 Operating Environment**

* **Client side:** Modern web browsers (Chrome, Firefox, Safari, Edge).  
* **Server side:** Node.js runtime environment.  
* **Database:** MongoDB Atlas / Local MongoDB.  
* **Hosting:** AWS, Vercel, or Docker-based environments.

#### **2.5 Assumptions and Constraints**

* Users have stable internet connectivity.  
* Resumes must be in PDF or Word formats (if uploaded manually).  
* System performance is subject to hosting environment limits.

### **3\. Functional Requirements**

#### **3.1 Student Module**

* **Dashboard:** Real-time overview of applications and recent jobs.  
* **Profile Management:** Comprehensive academic and professional data entry.  
* **Resume Builder:** Tool to generate standardized professional resumes.  
* **Job Feed:** Smart filtering based on eligibility (CGPA, Branch).  
* **Application Tracking:** Live status updates for all job applications.  
* **Notifications:** Instant alerts for status changes and reminders.

#### **3.2 Admin Module**

* **Command Center:** Global oversight of all platform activities.  
* **User Management:** Verification and management of Students, Recruiters, and Mentors.  
* **Job & Application Auditing:** Centralized monitoring of the entire recruitment flow.  
* **Audit Logs:** Detailed security tracking of administrative actions.  
* **System Settings:** Real-time branding control and backup management.  
* **Support Help Desk:** Management of internal support tickets.

#### **3.3 Recruiter Module**

* **Corporate Dashboard:** Analytics on job postings and applicant trends.  
* **Job Management:** Posting and editing detailed job descriptions.  
* **Applicant Screening:** Comparison of candidates and manual eligibility checks.  
* **Shortlisting Workflow:** Multi-stage workflow from screening to final result.  
* **Interview Scheduling:** Tools to coordinate and broadcast interview dates.

#### **3.4 Alumni & Mentor Module**

* **Mentor Portal:** Access to mentorship tools and student lists.  
* **Direct Messaging:** Real-time chat integration for student guidance.  
* **Career Resources:** Ability to share professional insights and resources.

#### **3.5 Messaging & Notifications**

* **Internal Chat:** Persistent messaging between relevant stakeholders.  
* **Live Toasts:** Instant UI notifications using Socket.io.  
* **Global Broadcasts:** Administrative announcements sent to all users.

### **4\. Non-Functional Requirements**

#### **4.1 Performance**

* Support for 500+ concurrent users with sub-2s response times.  
* Optimized database queries for fast data retrieval.

#### **4.2 Security**

* **Authentication:** JWT-based stateless authentication with password hashing (bcrypt).  
* **RBAC:** Strict role-based permissions preventing cross-role access.  
* **Middleware:** Implementation of `helmet`, `mongo-sanitize`, `xss-clean`, and `express-rate-limit` for enterprise security.

#### **4.3 Usability**

* **Responsive Design:** Adaptive layout for mobile, tablet, and desktop.  
* **Design System:** Consistent UI based on the **"Academic Authority"** framework.

#### **4.4 Reliability**

* **Backups:** Regular automated database backups managed by the Admin.  
* **Uptime:** Targeted 99.5% service availability.

### **5\. System Features**

#### **5.1 Smart Job Matching**
Matching algorithm to highlight relevant jobs based on student credentials.

#### **5.2 Dynamic Branding & White-Labeling**
Real-time modification of system logos and color palettes via the Admin panel.

### **6\. External Interface Requirements**

#### **6.1 User Interface**
Built with **React, TypeScript, and Tailwind CSS** for a type-safe, premium aesthetic.

#### **6.2 Cloud & Database Interfaces**
* **Mongoose ODM:** For structured MongoDB interaction.  
* **Cloudinary API:** For secure image and document hosting.  
* **Gemini AI API:** Integrated for upcoming resume parsing and smart-matching enhancements.

### **7\. Future Enhancements**

* AI-powered resume feedback and gap analysis.  
* Automated calendar integration for interview scheduling.  
* SMS gateway for critical offline notifications.  
* Cross-year placement trend visualizations and reporting.