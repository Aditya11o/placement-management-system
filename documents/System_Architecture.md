# System & Technical Architecture Document

## 1. Overview

This document outlines the technical architecture, database schema, and data flow of the **Placement Management System (PMS)**. The system is built using a modern full-stack architecture (PERN stack using PostgreSQL, Express, React, and Node.js) and is designed to coordinate operations between five primary user classes: Students, Recruiters, Administrators, Mentors, and Alumni.

---

## 2. Entity-Relationship () Diagram

The following diagram represents the core database entities and their relationships based on the Prisma schema.

```mermaid
erDiagram
    %% Core User & Profiles
    USER ||--o| STUDENT_PROFILE : "has 1"
    USER ||--o| RECRUITER_PROFILE : "has 1"
    USER ||--o| ADMIN_PROFILE : "has 1"
    USER ||--o| ALUMNI_PROFILE : "has 1"
    USER ||--o| MENTOR_PROFILE : "has 1"

    %% Recruitment Flow
    PLACEMENT_DRIVE ||--o{ JOB : "groups"
    RECRUITER_PROFILE ||--o{ JOB : "posts"
    STUDENT_PROFILE ||--o{ APPLICATION : "submits"
    JOB ||--o{ APPLICATION : "receives"
    APPLICATION ||--o{ INTERVIEW : "schedules"

    %% Features
    STUDENT_PROFILE ||--o{ SKILL_VERIFICATION : "requests"
    STUDENT_PROFILE ||--o{ WATCHLIST : "saves"
    ALUMNI_PROFILE ||--o{ MENTORSHIP_BOOKING : "provides"
    STUDENT_PROFILE ||--o{ MENTORSHIP_BOOKING : "books"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ MESSAGE : "sends/receives"
    USER ||--o{ AUDIT_LOG : "triggers"
    USER ||--o{ EXPERIENCE : "shares"

    %% Entity Details (Simplified)
    USER {
        string id PK
        string name
        string email
        string role
        boolean isVerified
    }
    JOB {
        string id PK
        string title
        string companyName
        string status
        date deadline
    }
    APPLICATION {
        string id PK
        string status
        string currentStage
    }
```

---

## 3. Data Flow Diagrams (DFD)

### 3.1 DFD Level 0 (Context Diagram)

This diagram illustrates the macro-level interaction between the external entities and the Placement Management System.

```mermaid
graph LR
    %% Main System
    PMS{{"Placement Management System"}}
    
    %% Entities
    Student([Student])
    Recruiter([Recruiter])
    Admin([Administrator])
    Alumni([Alumni / Mentor])
    
    %% Flows
    Student -->|Profiles & Apps| PMS
    PMS -->|Alerts & Results| Student
    
    Recruiter -->|Jobs & Offers| PMS
    PMS -->|Resumes & Analytics| Recruiter
    
    Admin -->|Policies & Verifications| PMS
    PMS -->|Audit & Stats| Admin
    
    Alumni -->|Mentorship Availability| PMS
    PMS -->|Meeting Bookings| Alumni
```

### 3.2 DFD Level 1 (Core Processes)

This diagram details the primary internal processes of the system.

```mermaid
graph TD
    %% Users
    S[Student]
    R[Recruiter]
    A[Admin]

    %% Processes
    P1((1.0 Auth & Authz))
    P2((2.0 Profile Gen))
    P3((3.0 Job Management))
    P4((4.0 Application Engine))
    P5((5.0 Comm & Real-Time))

    %% Data Stores
    D1[(Users DB)]
    D2[(Jobs DB)]
    D3[(Applications DB)]

    %% Connections
    S --> P1
    R --> P1
    A --> P1
    P1 --> D1

    S --> |Upload Resume/Data| P2
    P2 --> D1

    R --> |Create/Manage Jobs| P3
    P3 --> D2
    A --> |Verify Jobs| P3

    D2 --> |Job List| P4
    S --> |Apply| P4
    P4 --> D3
    R --> |Shortlist/Interview| P4
    
    P4 --> |Status Triggers| P5
    P5 --> |Socket.io Events| S
    P5 --> |Emails| R
```

---

## 4. System Component Architecture

```mermaid
graph LR
    subgraph Client [Client Side / Frontend]
        UI[React 19 / Vite UI]
        State[Context API & TanStack Query]
        SktC[Socket.io Client]
    end

    subgraph Server [Backend Server]
        API[Express.js API Routes]
        Auth[JWT & CSRF Middleware]
        SktS[Socket.io Server]
        ORM[Prisma ORM]
    end

    subgraph Infrastructure [External / Cloud Services]
        DB[(PostgreSQL)]
        Cloudinary[Cloudinary / Media Storage]
        Email[Nodemailer / SMTP]
    end

    %% Flow
    UI -->|REST API JSON| API
    API -->|Data Response| UI
    
    SktC -->|WebSockets| SktS
    SktS -->|WebSockets| SktC
    
    API --> Auth
    API --> ORM
    
    ORM -->|Query| DB
    DB -->|Results| ORM
    API --> |Media Upload| Cloudinary
    API --> |Send Alerts| Email
```

---

## 5. Security Architecture

The application employs deep enterprise-grade security protocols:

* **Auth & Sessions Layer:** Stateless authentication via JSON Web Tokens (JWT) stored in HTTP-only, secure cookies with access and rotating refresh tokens.
* **CSRF Protection:** Implements cross-site request forgery protection via a double-submit cookie scheme, verified using custom CSRF validation middleware on all mutation requests.
* **API Middleware Protections:**
  * `Helmet` for setting critical HTTP security headers (e.g. X-Content-Type-Options, X-Frame-Options).
  * `Express-Rate-Limit` to mitigate brute force logins (5 attempts per window) and global server DOS (10,000 requests per 15 minutes).
  * `xss-clean` for input sanitization to filter out malicious script tags.
  * `hpp` to prevent HTTP parameter pollution attacks.
* **Role-Based Access Control (RBAC):** Strict controller-level middlewares restrict endpoint accessibility. Users are validated against five distinct roles (Student, Recruiter, Admin, Mentor, Alumni). Under the hood, database constraints restrict mutations of profiles to the record owner.
