# Database Design & Schema Documentation

## 1. Overview

The **Placement Management System (PMS)** utilizes **PostgreSQL** as the primary relational database, interfaced via **Prisma ORM**. The database design is structured, normalized, and implements role-based profile splitting from the central authorization entity. It makes strategic use of JSON columns for complex arrays (like student projects and historical workflows) while maintaining relational integrity through foreign keys and indexing.

---

## 2. Enums (Data Types)

The database defines strict enum constraints for standardized tracking:

* **`Role`**: `student`, `recruiter`, `admin`, `alumni`, `mentor`
* **`AdminLevel`**: `SUPER_ADMIN`, `DEPT_ADMIN`, `PLACEMENT_OFFICER`
* **`UserStatus`**: `active`, `inactive`, `blacklisted`, `pending`
* **`JobType`**: `Full_time`, `Internship`, `Contract`, `PPO`
* **`JobStatus`**: `open`, `closed`, `paused`, `archived`
* **`DriveStatus`**: `UPCOMING`, `ACTIVE`, `COMPLETED`
* **`ApplicationStatus`**: `Applied`, `Shortlisted`, `Rejected`, `Selected`, `Under_Review`, `Scheduled`, `Placed`, `Accepted`, `Declined`, `Draft`, `Withdrawn`
* **`PlacementStatus`**: `Unplaced`, `Placed`, `Interned`
* **`SkillVerificationStatus`**: `Pending`, `Verified`, `Rejected`
* **`StudentStatus`**: `active`, `inactive`, `blacklisted`, `pending`
* **`EventCategory`**: `HOLIDAY`, `EXAM`, `PLACEMENT`, `WORKSHOP`, `OTHER`
* **`EventPriority`**: `HIGH`, `MEDIUM`, `LOW`

---

## 3. Core Entities & Table Structure

### 3.1 Authentication & Accounts

#### **`User`**

Acts as the central authentication table for all role types.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique user identifier |
| `name` | String | | Full name |
| `email` | String | Unique | Login email |
| `password` | String | Hashed | Bcrypt hashed password |
| `role` | Enum.Role | Default: `student` | Determines access level |
| `profilePhoto` | String? | Default: `""` | Avatar URL |
| `isVerified` | Boolean | Default: `false` | Email verification flag |
| `status` | Enum.UserStatus | Default: `active` | User account status |
| `otp` | String? | | One-time password for verification/reset |
| `otpExpires` | DateTime? | | OTP expiration timestamp |
| `loginAttempts` | Int | Default: `0` | Lockout protection |
| `lockUntil` | BigInt? | | Expiry of account lockout |
| `reset_token` | String? | | Password reset token |
| `reset_token_expiry` | DateTime? | | Password reset token expiry |
| `inviteToken` | String? | Unique | Registration invitation token |
| `inviteTokenExpires` | DateTime? | | Invitation expiration timestamp |
| `createdAt` / `updatedAt` | DateTime | Auto | Timestamps |

---

### 3.2 Profiles (One-to-One with User)

#### **`StudentProfile`**

Stores detailed academic and personal information of a student.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique identifier |
| `userId` | String | Unique, FK to `User(id)` | Cascades on delete |
| `rollNo` | String? | | Student roll number |
| `course` | String? | | e.g. B.Tech |
| `branch` | String? | | e.g. CSE |
| `cgpa` | Float? | | Cumulative GPA |
| `phone` | String? | | Contact number |
| `dob` | DateTime? | | Date of birth |
| `gender` | String? | | Gender |
| `address` / `city` / `state` | String? | | Contact location details |
| `department` | String? | | Home department |
| `passingYear` | Int? | | Year of graduation |
| `tenthPercentage` | Float? | | 10th Standard Marks % |
| `twelfthPercentage` | Float? | | 12th Standard Marks % |
| `linkedin` / `github` / `portfolio` | String? | | Professional links |
| `skills` | String[] | | Extracted / declared skills |
| `projects` | JSON? | | Array of `{title, description, technologies, link, startDate, endDate}` |
| `resumePath` | String? | | Default resume path |
| `profilePhoto` | String? | | Copy of profile photo URL |
| `profileCompletion` | Int | Default: `0` | Completion percentage (0-100) |
| `readinessScore` | Int | Default: `0` | System readiness score index |
| `preferredLocations` | String[] | | Preferred work locations |
| `preferredRoles` | String[] | | Target job roles |
| `academicVerified` | Boolean | Default: `false` | Verified by admin |
| `verificationAt` | DateTime? | | Timestamp of admin verification |
| `activeBacklogs` | Int | Default: `0` | Count of active backlogs |
| `totalBacklogs` | Int | Default: `0` | Total backlogs historically |
| `placementStatus` | Enum.PlacementStatus | Default: `Unplaced` | Placed / Unplaced / Interned status |

#### **`ReadinessHistory`**

Tracks student readiness score progression over time.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique identifier |
| `studentId` | String | FK to `StudentProfile(id)` | Target student |
| `score` | Int | | Readiness score value |
| `date` | DateTime | Default: `now()` | Date captured |

#### **`RecruiterProfile`**

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique identifier |
| `userId` | String | Unique, FK to `User(id)` | Central User Reference |
| `companyName` | String? | | Corporate identity name |
| `companyWebsite` | String? | | Corporate website URL |
| `companyLogo` | String? | | Corporate logo asset |
| `position` | String? | | Recruiter's title/designation |
| `location` | String? | | Company operations location |
| `phone` | String? | | Work phone number |
| `linkedIn` / `twitter` | String? | | Company social links |

#### **`AlumniProfile`**

Tracks graduates available for mentorship.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique identifier |
| `userId` | String | Unique, FK to `User(id)` | Central User Reference |
| `graduationYear` | Int? | | Year graduated |
| `company` | String? | | Currently working company |
| `designation` | String? | | Current job role |
| `expertise` | String[] | | Domain skill areas |
| `isAvailableForMentorship` | Boolean | Default: `true` | mentoring active flag |
| `linkedin` / `github` | String? | | Professional links |

#### **`AdminProfile`**

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique identifier |
| `userId` | String | Unique, FK to `User(id)` | Central User Reference |
| `employeeId` | String? | | Institutional employee identity |
| `department` | String? | | Supervised department |
| `level` | Enum.AdminLevel | Default: `SUPER_ADMIN` | Administration rank |
| `scope` | String? | | Allowed department bounds |

#### **`MentorProfile`**

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique identifier |
| `userId` | String | Unique, FK to `User(id)` | Central User Reference |
| `expertise` | String[] | | Mentor skillset specialties |
| `isActive` | Boolean | Default: `true` | Active helper flag |
| `bio` | String? | | Bio / introduction text |

---

### 3.3 Recruitment Operations

#### **`Job`**

Represents a job posting by a recruiter or admin.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique identifier |
| `jobId` | String | Unique | Display/Job Code reference |
| `recruiterId` | String | FK to `RecruiterProfile(id)` | Posting owner |
| `title` | String | | Role title |
| `description` | String | | Job details and roles |
| `companyName` | String | | Corporate name |
| `location` / `salary` | String | | Work location and package details |
| `jobType` | Enum.JobType | | Full-time, Internship, etc. |
| `minCGPA` | Float | Default: `0` | Academic cut-off cgpa |
| `min10th` / `min12th` | Float | Default: `0` | High-school cut-off percentages |
| `maxBacklogs` | Int | Default: `0` | Allowed backlog limit |
| `targetCourses` | String[] | | Allowed courses (e.g. `["B.Tech"]`) |
| `branches` | String[] | | Allowed branches (e.g. `["CSE"]`) |
| `genderPreference` | String | Default: `all` | Gender eligibility filters |
| `requiredSkills` | String[] | | Prerequisites skills list |
| `deadline` | DateTime | | Expiry of posting |
| `status` | Enum.JobStatus | Default: `open` | Active posting status |
| `selectionProcess` | JSON? | | Process workflow (stages array) |
| `applicationsCount` | Int | Default: `0` | Number of applications |
| `viewsCount` | Int | Default: `0` | Views counters |
| `screeningQuestions` | JSON? | | Custom application questionnaire |
| `isAlumniPost` | Boolean | Default: `false` | Alumni referral post indicator |
| `alumniId` | String? | FK to `AlumniProfile(id)` | Linking referral alumni |
| `placementDriveId` | String? | FK to `PlacementDrive(id)` | Active campaign link |

#### **`Application`**

Binds a student to a job with standard workflows.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique identifier |
| `studentId` | String | FK to `StudentProfile(id)` | Submitting student |
| `jobId` | String | FK to `Job(id)` | Target vacancy |
| `resume` / `resumeId` | String? | | PDF link & Cloudinary ID used |
| `status` | Enum.ApplicationStatus | Default: `Applied` | Current application standing |
| `currentStage` | String | Default: `"Applied"` | Human-readable stage description |
| `currentStageIndex` | Int | Default: `0` | Index in job's selectionProcess stages |
| `isTerminal` | Boolean | Default: `false` | Completed (Accepted/Rejected/etc.) |
| `statusHistory` | JSON? | | Audit trail of updates |
| `offerLetter` | String? | | Link to uploaded offer letter PDF |
| `feedback` | String? | | Feedback comments from recruiter |
| `interviewDate` | DateTime? | | Interview datetime |
| `interviewLink` | String? | | Meeting details URL |
| `evaluation` / `answers` | JSON? | | Custom feedback grades & responses |

#### **`Interview`**

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique identifier |
| `applicationId` | String | FK to `Application(id)` | Parent job application |
| `date` | DateTime | | Scheduled datetime |
| `link` | String? | | Meeting coordinates link |
| `type` | String? | | Round type (Technical, HR, etc.) |
| `status` | String? | Default: `"scheduled"` | Active scheduler state |
| `feedback` | String? | | Interview performance reports |
| `availableSlots` | JSON? | | List of date-time selection slot options |
| `selectedSlot` | String? | | Student confirmed slot choice |

---

### 3.4 Mentorship & Support

#### **`MentorshipBooking`**

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique identifier |
| `studentId` | String | FK to `User(id)` | Student requester |
| `alumniId` | String | FK to `AlumniProfile(id)` | Target graduate |
| `requestedDate` | DateTime | | Booked session date |
| `query` | String? | | Student preparation query details |
| `status` | String | Default: `"pending"` | booking state |
| `meetingLink` | String? | | Virtual meeting URL |
| `feedback` | String? | | Mentor review feedback |
| `studentFeedback` | String? | | Student review comments |
| `rating` | Int? | | Student rating (1 to 5) |

#### **`MockInterview`**

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique identifier |
| `studentId` | String | FK to `User(id)` | Student |
| `mentorId` | String | FK to `MentorProfile(id)` | Assigned trainer |
| `type` / `time` | String | | Custom interview details |
| `date` | DateTime | | Scheduled date |
| `status` | String | Default: `"scheduled"` | Interview status |
| `performance` | JSON? | | Scores per rubric metrics |
| `feedback` | String? | | Mentor detailed remarks |

#### **`Ticket`**

Supports ticketing desk workflows.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key (UUID) | Unique identifier |
| `userId` | String | FK to `User(id)` | Submitter |
| `subject` / `message` | String | | Subject description / details |
| `issueType` | String? | | Category (Technical, Academic, etc.) |
| `screenshotPath` | String? | | Visual proof asset link |
| `status` | String | Default: `"open"` | ticket lifecycle state |
| `response` | String? | | Support executive response |
| `resolvedAt` | DateTime? | | Timestamp resolved |

---

### 3.5 Miscellaneous Auxiliary Entities

* **`ReadinessHistory`**: Historical scoring charts.
* **`StudentResume`**: Manages URLs for custom student resume uploads (fields: `id`, `studentId`, `name`, `url`, `isDefault`).
* **`StudentSettings` / `RecruiterSettings`**: Configuration flags for channels (email, SMS, in-app alerts) and profiles visibility settings.
* **`MentorAvailability`**: Date and slot availability configurations.
* **`FAQ`**: System knowledge base containing `question`, `answer`, `category`.
* **`AuditLog`**: Event tracking audit logs tracking `userId`, `action`, `type`, `targetId`, `targetType`, `details`, `ipAddress`, and `createdAt`.
* **`Archive`**: Storage for compiled analytics per graduation year (`academicYear`, `placedStudents`, `topCompanies`, `averageSalary`, etc.).
* **`Resource`**: Course materials containing links, descriptions, categories, thumbnails, and instructors.
* **`SystemSettings`**: Controls flags such as `registrationEnabled`, `jobPostingEnabled`, `maintenanceMode`, and `maxApplicationsPerStudent`.
* **`SkillVerification`**: Links `studentId` with skill names and certificates verification files, marked with statuses `Pending`/`Verified`/`Rejected`.
* **`Reminder`**: Personal tasks alerts (`title`, `dueDate`, `isCompleted`, `priority`).
* **`Experience` / `Comment`**: Shared forum where student posts placements narratives (interview format, difficulties, questions list, tips, isAnonymous, isVerified, upvotes).
* **`Watchlist`**: Many-to-many lookup connecting student profiles with saved job opportunities.
* **`PlacementDrive`**: Campaign wrapper with start and end times for grouping postings.
* **`AcademicEvent`**: Global calendar listings (holidays, exams, recruitment campaigns) for planning dashboard overlays.

---

## 4. Key Relationships & Cascade Policies

* **Cascade Delete (`onDelete: Cascade`):** Ensures system cleanliness. Deleting a base `User` cascades to instantly delete their role profile, setting preferences, applications record, mock schedules, and notification items.
* **Set Null (`onDelete: SetNull`):** Retains public references. Deleting users does not destroy their uploaded `Resource` guides or system `Broadcasts`, preserving institutional archives by making `addedById` or `createdById` null.
