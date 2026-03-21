# **Software Requirement Specification (SRS)**

# **Project: Placement Management System (PMS)**

### **1\. Introduction**

#### **1.1 Purpose**

The purpose of this document is to provide a detailed description of the Software Requirement Specification (SRS) for the **Placement Management System (PMS)**. This document outlines the functional and non-functional requirements, system features, and external interface requirements to serve as a guide for developers, testers, and stakeholders involved in the project.

#### **1.2 Scope**

The PMS is a web-based automation platform designed to bridge the gap between students looking for career opportunities, recruiters seeking talent, and university administrators managing the placement lifecycle. The system covers student profile management, job posting, application tracking, real-time notifications, and administrative controls. It aims to eliminate manual paperwork and provide a transparent, efficient recruitment process.

#### **1.3 Definitions, Acronyms, and Abbreviations**

* **PMS:** Placement Management System  
* **TPC:** Training and Placement Cell  
* **RBAC:** Role-Based Access Control  
* **JWT:** JSON Web Token (used for secure authentication)  
* **Admin:** The University Placement Officer or System Administrator  
* **Recruiter:** Corporate HR or Hiring Manager  
* **MERN:** MongoDB Express React Node.js (The core tech stack)

#### **1.4 Overview**

This SRS follows a structured format starting with a high-level description of the product, followed by specific requirements. Section 2 describes the product perspective and user classes, Section 3 details functional requirements for each module, and Sections 4-6 cover performance, interfaces, and system constraints.

### **2\. Overall Description**

#### **2.1 Product Perspective**

The Placement Management System is an independent, self-contained web platform. It interacts with cloud services (Cloudinary) for file storage and uses a centralized MongoDB database for data persistence. It is designed with a micro-services-ready architecture, separating the React-based frontend from the Express/Node.js backend.

#### **2.2 Product Functions**

* The major functions of the system include:  
* User registration and authentication (Student, Admin, Recruiter).  
* Dynamic profile creation and resume management for students.  
* Job posting and lifecycle management for recruiters.  
* Automated application workflow (Apply \-\> Shortlist \-\> Result).  
* Administrative oversight and user verification.  
* Real-time communication and global announcements.

#### **2.3 User Classes and Characteristics**

* **Students:** Primary users who create profiles, upload resumes, and apply for jobs. They require a user-friendly, responsive interface.  
* **Administrators:** Power users responsible for verifying registrations, managing university branding, and broadcasting announcements.  
* **Recruiters:** Corporate users who post job descriptions, screen applications, and shortlist candidates.

#### **2.4 Operating Environment**

* **Client side:** Any modern web browser (Chrome, Firefox, Safari, Edge).  
* **Server side:** Node.js runtime environment.  
* **Database:** MongoDB Atlas or local MongoDB instance.  
* **Hosting:** Compatible with cloud providers like AWS, Vercel, or Docker-based environments.

#### **2.5 Assumptions and Constraints**

* Users are assumed to have basic internet connectivity.  
* Document uploads (resumes) must be in standard PDF or Word formats.  
* The system is constrained by the processing limits of the hosting environment and database storage quotas.

### **3\. Functional Requirements**

#### **3.1 Student Module**

* **Registration/Login**  
* **Student Dashboard**  
* **Profile Management**  
* **Job Apply System**  
* **Application Status Tracking**  
* **Interview Schedule**  
* **Notifications**  
* **Settings**

#### **3.2 Admin Module**

* **Login**  
* **Admin Dashboard**  
* **Manage Students**  
* **Manage Recruiters**  
* **Manage Jobs**  
* **Applications**  
* **Interviews**  
* **Reports**  
* **Notifications**  
* **Settings**

#### **3.3 Recruiter/Job Management Module**

* **Registration/Login**  
* **Dashboard**  
* **Company Profile**  
* **Post Job**  
* **Manage Jobs**  
* **Applicants**  
* **Shortlisted**  
* **Interview Schedule**  
* **Notifications**  
* **Settings**

#### **3.4 Messaging & Notifications**

* **Internal Chat:** Capability for students and recruiters to exchange messages regarding jobs.  
* **Live Toasts:** Instant UI notifications for application status changes using Socket.io.  
* **Broadcasts:** Essential alerts sent by the Admin to the entire student body.

### **4\. Non-Functional Requirements**

#### **4.1 Performance**

* The system should handle at least 500 concurrent users without significant latency.  
* Page load times should not exceed 2 seconds for standard dashboards.

#### **4.2 Security**

* All passwords must be hashed using bcrypt before storage.  
* Role-Based Access Control (RBAC) must prevent unauthorized access to Admin/Recruiter panels.  
* Sensitive data must be transmitted over HTTPS.

#### **4.3 Usability**

* The UI must be responsive (adaptive to mobile, tablet, and desktop).  
* Navigation should be intuitive, requiring minimal user training.

#### **4.4 Reliability**

* The system should aim for 99.5% uptime.  
* Database backups should be scheduled regularly to prevent data loss.

### **5\. System Features**

#### **5.1 Smart Job Feed**

The system uses a matching algorithm to highlight jobs that fit a student's CGPA and branch, improving the relevance of listings.

#### **5.2 Dynamic Branding**

The Admin can modify the "look and feel" of the portal (Logo/Colors) in real-time, allowing the software to be "white-labeled" for different departments or colleges.

### **6\. External Interface Requirements**

#### **6.1 User Interface**

* Built using React and Tailwind CSS for a premium, modern aesthetic.  
* Consistent layout with a sidebar for navigation and a main content area.

#### **6.2 Database Interface**

Mongoose ODM is used to interact with the MongoDB database, ensuring schema validation and efficient queries.

#### **6.3 Software Interfaces**

* Cloudinary API: For efficient image and document hosting.  
* Gemini AI API: (Optional implementation) For resume parsing and smart matching.

### **7\. Future Enhancements**

* AI-powered resume feedback system.  
* Automated interview scheduling with calendar integration.  
* SMS gateway for offline notifications.  
* Advanced analytics dashboard for placement trends across years.