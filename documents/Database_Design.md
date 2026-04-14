# Database Design & Schema Documentation

## 1. Overview
The **Placement Management System (PMS)** utilizes **PostgreSQL** as the primary relational database, interfaced via **Prisma ORM**. The database is normalized and extensively uses foreign keys, enums, and JSON columns for flexibility where structured arrays are needed (like project details or staging histories).

---

## 2. Enums (Data Types)
The database defines strict enum constraints for standardized status and role tracking.

- **`Role`**: `student`, `recruiter`, `admin`, `alumni`, `mentor`
- **`AdminLevel`**: `SUPER_ADMIN`, `DEPT_ADMIN`, `PLACEMENT_OFFICER`
- **`UserStatus` / `StudentStatus`**: `active`, `inactive`, `blacklisted`, `pending`
- **`JobType`**: `Full_time`, `Internship`, `Contract`, `PPO`
- **`JobStatus`**: `open`, `closed`, `paused`, `archived`
- **`ApplicationStatus`**: `Applied`, `Shortlisted`, `Rejected`, `Selected`, `Under_Review`, `Scheduled`, `Placed`, `Accepted`, `Declined`, `Draft`
- **`PlacementStatus`**: `Unplaced`, `Placed`, `Interned`

---

## 3. Core Entities (Tables)

### 3.1 `User` (Authentication & Base Account)
Acts as the central authentication table for all role types.
| Column | Type | Constraints / Defaults | Description |
| --- | --- | --- | --- |
| `id` | String | Primary Key (UUID) | Unique user identifier |
| `name` | String | | Full name |
| `email` | String | Unique | Login email |
| `password` | String | Hashed | Bcrypt hashed password |
| `role` | Enum.Role | Default: `student` | Determines access level |
| `isVerified` | Boolean | Default: `false` | Email verification flag |

### 3.2 Profiles (One-to-One with User)

**`StudentProfile`**
Stores detailed academic and personal information of a student.
| Column | Type | Description |
| --- | --- | --- |
| `id` / `userId` | String | Link to `User(id)` |
| `rollNo` / `course` | String | Academic identifiers |
| `cgpa` | Float | Cumulative GPA |
| `skills` | String[] | Array of hard/soft skills |
| `projects` | JSON | Array of project objects |
| `placementStatus` | Enum | Current hiring status |

**`RecruiterProfile`**
| Column | Type | Description |
| --- | --- | --- |
| `userId` | String | Link to `User(id)` |
| `companyName` | String | Registered company name |
| `position` | String | Recruiter's designation |

**`AdminProfile`**
| Column | Type | Description |
| --- | --- | --- |
| `level` | Enum | E.g., `SUPER_ADMIN` |
| `scope` | String | Department specific access |

---

### 3.3 Recruitment & Workflow

**`Job`**
Represents a job or internship posting.
| Column | Type | Description |
| --- | --- | --- |
| `jobId` | String | Unique external display ID |
| `recruiterId` | String | Link to `RecruiterProfile` |
| `title` / `company` | String | Job title and company |
| `minCGPA` | Float | Filter requirement |
| `deadline` | DateTime | End date for applications |
| `selectionProcess`| JSON | Configurable hiring steps |

**`Application`**
Tracks a student's application to a specific job. **(Unique constraint on `studentId` + `jobId`)**
| Column | Type | Description |
| --- | --- | --- |
| `studentId` | String | Applicant |
| `jobId` | String | Target Job |
| `status` | Enum | Current standing (e.g., `Selected`) |
| `currentStage` | String | Text descriptor of selection round |

**`Interview`**
| Column | Type | Description |
| --- | --- | --- |
| `applicationId` | String | Link to `Application` |
| `date` | DateTime | Scheduled date |
| `link` | String | Virtual meeting URL |

---

### 3.4 Auxiliary & Mentorship Entities

**`Experience`**
Students or alumni sharing interview experiences.
- Contains: `companyName`, `role`, `questions` (Array), `tips` (Text), `isVerified` (Boolean).

**`MentorshipBooking`**
Records meeting requests between Students and Alumni.
- Relates `studentId` to `alumniId` with a `requestedDate`, `status`, and `meetingLink`.

**`PlacementDrive`**
Groups multiple jobs under a specific university drive campaign.
- Contains: `name`, `startDate`, `endDate`, `status`.

---

### 3.5 System Tools

**`AuditLog`**
Immutable log for tracking sensitive actions within the system.
| Column | Type | Description |
| --- | --- | --- |
| `userId` | String | Who performed the action |
| `action` | String | e.g., 'DELETED_USER' |
| `targetType` | String | e.g., 'JOB' |
| `ipAddress` | String | Request source |

**`Notification` & `Message`**
- `Notification`: Stores system alerts linked to a `User`.
- `Message`: Connects `senderId` and `recipientId` with `content` for direct Socket.io chat history.

---

## 4. Key Relationships & Cascade Policies
- **Cascade Delete (`onDelete: Cascade`):** Deleting a `User` automatically wipes their associated profiles, applications, mock interviews, and notifications to maintain GDPR compliance and database hygiene.
- **Set Null (`onDelete: SetNull`):** If a user who added a Global Resource is deleted, the resource's `addedById` becomes null, preserving institutional knowledge.
