# Presentation: Placement Management System (PMS)

## Slide 1: Title Slide

### Placement Management System (PMS) - An Automated Campus Recruitment Platform

* **Sub-title:** End Semester Project Presentation (Even Semester 2026)
* **Presented By:**
  * Aditya Halder (University Roll No: [Roll No Ending in 20])
  * [Student Name 2] (University Roll No: [Roll No])
  * [Student Name 3] (University Roll No: [Roll No])
  * [Student Name 4] (University Roll No: [Roll No])
* **Under the Guidance of:** [Guide Name], [Designation]
* **Department:** Computer Science and Engineering, The Neotia University

---

## Slide 2: Problem Statement

### The Campus Recruitment Bottleneck

* **Manual Overhead:** Training and Placement Cells (TPC) heavily rely on manual spreadsheets, leading to data redundancy, tracking delays, and human errors in verify records.
* **Communication Silos:** Students miss critical application deadlines or lack visibility into active interview status updates.
* **Resume Inconsistency:** Recruiters screen non-standardized resumes, resulting in inefficient candidate evaluation.
* **Guidance Void:** Absence of structural preparations (mock interviews) and lack of direct communication channels with mentors/alumni.

---

## Slide 3: Literature Survey

### Review of Existing Systems

* **Traditional TPC Software:** Most systems focus on simple CRUD profiles management for student records without automation.
* **Third-party Resume Tools:** Students are forced to use external sites, generating highly inconsistent formatting and non-standardized PDF formats.
* **Fragmented Workflows:** Existing tools isolate recruiters from mentors. Scheduling interviews, verifying credentials, and uploading offer letters are done outside the main portal.
* **Academic Authority Style:** Traditional systems lack a cohesive design language, causing high cognitive load during long dashboard sessions.

---

## Slide 4: Research Gap

### What Is Missing in Current Solutions?

* **Lack of a Unified 5-Role Ecosystem:** No single platform brings Students, Recruiters, Admins, Mentors, and Alumni together in one integrated workspace.
* **Absence of Smart Eligibility Checks:** Systems lack automated backend query checks to filter students instantly by CGPA, branch, backlogs, and gender constraints.
* **No Integrated Readiness Index:** Student readiness scores and training progress are not tracked historically.
* **Lack of Internal Peer Forums:** Placed seniors (Alumni) have no structural way to share real-world interview logs and tips directly with juniors on the platform.

---

## Slide 5: Objective of Research

### Core Goals of the PMS Project

1. **Automated Verification:** Transition TPC operations to digital onboarding with automated bulk verification check algorithms.
2. **Integrated Resume Builder:** Standardize profile resume outputs directly from validated database attributes.
3. **Smart Eligibility Feed:** Dynamically generate matching job opportunities for students based on recruiter eligibility criteria.
4. **Mentorship Integration:** Facilitate direct alumni-student mentorship bookings and mentor-student mock interview schedulers.
5. **Audit & Enterprise Security:** Implement transaction audit logs, JWT sessions, double-submit cookie CSRF validation, and input sanitization.

---

## Slide 6: Explanation of Methodology

### System Architecture & Security Protocols

* **Full Stack (PERN Stack):** Decoupled architecture with React 19 (Vite) on the frontend and Express.js (Node.js) on the backend.
* **Relational Database:** PostgreSQL managed through Prisma ORM for structured indexing, normalizations, and cascading policies.
* **Real-time Event Engine:** Socket.io pipelines to trigger instant notifications for status changes, application updates, and chat messages.
* **Security Stack:** Custom CSRF validation middleware, HTTP-only JWT cookies, Helmet security headers, rate-limiting, and `xss-clean` input sanitization.

---

## Slide 7: Methodology - Objective-wise Implementation

### How We Achieved Our Goals

* **Eligibility Logic:** PostgreSQL checks cross-reference student records against job properties (`minCGPA`, `branches`, `maxBacklogs`) at database query execution.
* **Mentorship Bookings:** Calendar slot systems where Mentors/Alumni set availability slots (`MentorAvailability` schema) and students reserve them (`MentorshipBooking` schema).
* **Resume Builder Engine:** A template rendering component that maps structured JSON profile metrics onto standard A4 layouts for direct PDF exports.
* **Compliance Dashboard:** Admin dashboard reporting system-wide health scores based on profile completeness and verified credentials.

---

## Slide 8: Result Discussion

### Version 1.0 Workability Report

* **Fully Compiled Frontend Build:** React 19 production build compiled successfully using Vite.
* **Active Backend Integration:** All endpoints (including profile updates, job matching, admin commands, and audit logs) verified.
* **Load Support:** Built to comfortably support 500+ concurrent active sessions with sub-2s response rates.
* **Complete Lifecycle Demonstration:** Verified the flow from Job Post -> Eligible Match -> Application -> Stage Advancement -> Offer Letter Verification -> Database Archiving.

---

## Slide 9: References

1. E. Gamma, R. Helm, R. Johnson, and J. Vlissides, *Design Patterns: Elements of Reusable Object-Oriented Software*, Addison-Wesley, 1994.
2. M. Fowler, *Patterns of Enterprise Application Architecture*, Addison-Wesley, 2002.
3. Prisma Documentation, "Data Modeling and Relational Databases," [Online]. Available: <https://www.prisma.io/docs/>
4. React Documentation, "Modern Web UI Development with React 19," [Online]. Available: <https://react.dev/>
5. A. Leroux, *Building Scalable Web Applications with Node.js and Express*, O'Reilly Media, 2021.
