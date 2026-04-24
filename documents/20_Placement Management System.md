# **A SYNOPSIS ON**

# **PLACEMENT MANAGEMENT SYSTEM (PMS)**

**Submitted in partial fulfillment of the requirement for the award of the degree of**
### **BACHELOR OF TECHNOLOGY**
### **IN COMPUTER SCIENCE & ENGINEERING**

**Submitted by:**
1. **Aditya Halder** (University Roll No: [Full Roll No ending in 20])
2. **[Student Name 2]** (University Roll No: [Full Roll No])
3. **[Student Name 3]** (University Roll No: [Full Roll No])
4. **[Student Name 4]** (University Roll No: [Full Roll No])

**Under the Guidance of:**
**[Guide Name]**
[Designation]
Department of Computer Science and Engineering

**The Neotia University**
Diamond Harbour Road, Sarisha, 24 Parganas (s), Kolkata, West Bengal 743368
**April - 2026**

---

### **CANDIDATE’S DECLARATION**

I hereby certify that the work which is being presented in the Synopsis entitled **“Placement Management System”** in partial fulfillment of the requirements for the award of the Degree of Bachelor of Technology in Computer Science and Engineering in the Department of Computer Science and Engineering of The Neotia University, Kolkata shall be carried out by the undersigned under the supervision of **[Guide Name]**, [Designation], Department of Computer Science and Engineering, The Neotia University, Kolkata.

| Name | University Roll No | Signature |
| :--- | :--- | :--- |
| Aditya Halder | [Roll No 20] | |
| [Student Name 2] | [Roll No] | |
| [Student Name 3] | [Roll No] | |
| [Student Name 4] | [Roll No] | |

The above mentioned students shall be working under the supervision of the undersigned on the **“Placement Management System”**.

<br><br>

**Signature of Supervisor** &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; **Signature of Head of the Department**

---

### **INTERNAL EVALUATION (By DPRC Committee)**

**Status of the Synopsis:** Accepted / Rejected
**Any Comments:**
**Name of the Committee Members:**
1.
2.

**Signature with Date:**
1.
2.

---

### **Table of Contents**

| Chapter No. | Description | Page No. |
| :--- | :--- | :--- |
| **Chapter 1** | Introduction and Problem Statement | |
| **Chapter 2** | Background/ Literature Survey | |
| **Chapter 3** | Objectives | |
| **Chapter 4** | Hardware and Software Requirements | |
| **Chapter 5** | Possible Approach/ Algorithms | |
| **References** | | |

---

### **Chapter 1: Introduction and Problem Statement**

#### **1.1 Introduction**
The Placement Management System (PMS) is an advanced web-based application designed to modernize the campus recruitment process within educational institutions. In an era of digital transformation, traditional manual placement tracking is no longer viable for handling the increasing volume of student data and corporate requirements. 

This project proposes a centralized, high-performance platform that automates the lifecycle of recruitment, from student onboarding to final selection. The system acts as a "Digital Curator"—a premium, automated placement ecosystem bridging the gap between talent and opportunity with an editorial-grade user experience.

#### **1.2 Problem Statement**
Many colleges still rely on fragmented systems, such as physical files and unorganized spreadsheets, to manage placement activities. This results in:
*   **Inefficient Data Handling:** Difficulty in manually verifying student eligibility and academic records.
*   **Communication Gaps:** Students often miss critical deadlines or job updates due to the lack of real-time, persistent notifications.
*   **Resume Inconsistency:** Recruiters struggle with non-standardized resumes, making manual screening tedious and often resulting in the oversight of qualified candidates.

---

### **Chapter 2: Background / Literature Survey**

In the present times, research work is going on in context of automating institutional workflows. Traditional Training and Placement Cell (TPC) operations are often siloed, leading to data redundancy and security vulnerabilities. 

Existing solutions often focus on basic CRUD (Create, Read, Update, Delete) operations without considering the user experience of recruiters or the specific branding needs of universities. Most systems lack integrated resume builders, forcing students to use external tools which leads to inconsistent formatting. This project aims to bridge these gaps by providing a unified, secure, and aesthetically superior platform that follows the "Academic Authority" design system.

---

### **Chapter 3: Objectives**

The primary objectives of the PMS are:
1. To automate the student registration, profile management, and academic verification process.
2. To provide an **Integrated Resume Builder** for standardized, recruiter-ready profile generation based on profile data.
3. To implement a **Smart Job Feed** with dynamic filtering based on student eligibility criteria (CGPA, Branch).
4. To offer an administrative command center for university-wide oversight, drive management, and branding control.
5. To ensure enterprise-grade security and data integrity using modern authentication (JWT/RBAC) and data sanitization.

---

### **Chapter 4: Hardware and Software Requirements**

#### **4.1 Software Requirements**
*   **Runtime Environment:** Node.js (v18+)
*   **Frontend Framework:** React.js (Vite) with TypeScript
*   **Backend Framework:** Express.js (v5)
*   **Database:** PostgreSQL with Prisma ORM
*   **Styling:** Tailwind CSS (Custom Design System)
*   **Cloud Services:** Cloudinary (Document & Image hosting)
*   **Security Tools:** Helmet, BcryptJS, JWT, XSS-Clean

#### **4.2 Hardware Requirements**
*   **Processor:** Intel Core i5 or equivalent (Minimum)
*   **RAM:** 8 GB (Minimum)
*   **Storage:** 20 GB free space
*   **Internet:** Stable broadband connection for cloud service integration

---

### **Chapter 5: Possible Approach / Algorithms**

#### **5.1 Methodology**
The project utilizes the **PERN stack** (PostgreSQL, Express, React, Node.js) for a decoupled, scalable architecture. The frontend is built with React and TypeScript to ensure type safety and a dynamic UI. The backend uses Node.js and Express to handle complex business logic and API requests.

#### **5.2 Key Algorithms and Logic**
*   **Smart Eligibility Filtering:** A backend algorithm that cross-references job requirements (minimum CGPA, allowed branches) against student profiles to dynamically generate a personalized job feed.
*   **Role-Based Access Control (RBAC):** Middleware-level logic that ensures users (Students, Admins, Recruiters) can only access authorized endpoints and data.
*   **Resume Generation Logic:** A module that maps structured JSON data from the student profile to an A4-optimized HTML/CSS template for PDF generation.
*   **Real-time Pipeline:** Utilization of Socket.io for instant status updates and push notifications across all user roles.

---

### **References**

1.  N. K. Kanhere and S. T. Birchfied, “Real-time incremental segmentation and tracking of vehicles at low camera angles using stable features,” IEEE Trans. Intell. Transp. Syst., vol. 9, no. 1, pp. 148-160, March 2008.
2.  T. H. Cormen, C. E. Leiserson, R. L. Rivest and C. Stein, “Introduction to Algorithms”, 2nd ed., The MIT Press, McGraw-Hill Book Company, 2001.
3.  Open Source Computer Vision (OpenCV) [Online]. Accessed on 21st April 2026: http://opencv.willowgarage.com/wiki/
4.  Prisma Documentation, "Data Modeling and ORM," [Online]. Available: https://www.prisma.io/docs/
5.  React Documentation, "Modern Web UI Development," [Online]. Available: https://react.dev/
