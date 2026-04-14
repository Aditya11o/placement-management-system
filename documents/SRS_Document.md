# **Software Requirement Specification (SRS)**

# **Project: Placement Management System (PMS)**

### **1\. Introduction**

#### **1.1 Purpose**

The purpose of this document is to provide a detailed description of the Software Requirement Specification (SRS) for the **Placement Management System (PMS)**. This document outlines the functional and non-functional requirements, system features, and external interface requirements to serve as a guide for developers, testers, and stakeholders.

#### **1.2 Scope**

The PMS is a web-based automation platform designed to bridge the gap between students, recruiters, and university administrators. The system covers the core recruitment lifecycle, including profile management, job posting, and application tracking. It aims to eliminate manual paperwork and provide a transparent, efficient, and data-driven recruitment process.

#### **1.3 Definitions, Acronyms, and Abbreviations**

* **PMS:** Placement Management System  
* **TPC:** Training and Placement Cell  
* **RBAC:** Role-Based Access Control  
* **JWT:** JSON Web Token (used for secure authentication)  
* **Admin:** University Placement Officer or System Administrator  
* **Recruiter:** Corporate HR or Hiring Manager  
* **PERN:** PostgreSQL, Express, React, Node.js  

#### **1.4 Overview**

This SRS follows a structured format, starting with a high-level product description, followed by detailed functional requirements for each module, and concluding with performance, security, and interface specifications.

### **2\. Overall Description**

#### **2.1 Product Perspective**

The PMS is an independent, self-contained web platform. It interacts with cloud services (Cloudinary) for file hosting and utilizes a centralized PostgreSQL database for data persistence. The architecture is a decoupled PERN stack.

#### **2.2 Product Functions**

* User registration and authentication with specific role-based access.  
* **Integrated Resume Builder** for standardized profile generation.  
* Job lifecycle management (Posting -> Screening -> Shortlisting -> Selection).  
* Automated administrative oversight and control.

#### **2.3 User Classes and Characteristics**

* **Students:** Primary users searching for jobs and building professional profiles.  
* **Administrators:** Power users responsible for system configuration and user verification.  
* **Recruiters:** Corporate users managing job postings and applicant screening.

#### **2.4 Operating Environment**

* **Client side:** Modern web browsers (Chrome, Firefox, Safari, Edge).  
* **Server side:** Node.js runtime environment.  
* **Database:** PostgreSQL.  
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
* **User Management:** Verification and management of Students and Recruiters.  
* **Job & Application Auditing:** Centralized monitoring of the entire recruitment flow.  
* **System Settings:** Branding control and placement drive management.

#### **3.3 Recruiter Module**

* **Corporate Dashboard:** Analytics on job postings and applicant trends.  
* **Job Management:** Posting and editing detailed job descriptions.  
* **Applicant Screening:** Comparison of candidates and manual eligibility checks.  
* **Shortlisting Workflow:** Multi-stage workflow from screening to final result.  
* **Interview Scheduling:** Tools to coordinate and broadcast interview dates.



### **4\. Non-Functional Requirements**

#### **4.1 Performance**

* Support for 500+ concurrent users with sub-2s response times.  
* Optimized database queries for fast data retrieval.

#### **4.2 Security**

* **Authentication:** JWT-based stateless authentication with password hashing (bcrypt).  
* **RBAC:** Strict role-based permissions preventing cross-role access.  
* **Middleware:** Implementation of `helmet`, `xss-clean`, and `express-rate-limit` for enterprise security.

#### **4.3 Usability**

* **Responsive Design:** Adaptive layout for mobile, tablet, and desktop.  
* **Design System:** Consistent UI based on the **"Academic Authority"** framework.

#### **4.4 Reliability**

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
* **Prisma ORM:** For structured PostgreSQL database interaction.  
* **Cloudinary API:** For secure image and document hosting.

### **7\. Future Enhancements**

* AI-powered resume feedback and gap analysis.  
* Automated calendar integration for interview scheduling.  
* SMS gateway for critical offline notifications.  
* Cross-year placement trend visualizations and reporting.