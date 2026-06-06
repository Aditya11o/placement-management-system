# API Reference Documentation

## 1. Overview

The Placement Management System (PMS) Backend provides a RESTful API built with **Express.js (Node.js)** and integrated with **Prisma ORM**.

* **Base URL:** `/api/v1` (Fallback compatibility alias `/api` is supported)
* **Content-Type:** `application/json` (unless defined otherwise for file uploads: `multipart/form-data`)
* **Authentication:** Bearer Token (JWT) sent in HTTP-only cookies (`token` / `refreshToken`) or via the `Authorization` header.
* **CSRF Protection:** Non-test requests require a valid double-submit CSRF cookie.
* **Rate Limiting:** `/api/` has a rate limit of 10,000 requests per 15 minutes. `/api/auth/login` is limited to 5 attempts per 15 minutes.

---

## 2. Health & Diagnostic Check

### `GET /api/v1/health`

Checks system health status.

**Response (200 OK):**

```json
{
  "status": "ok",
  "version": "v1",
  "uptime": 12345,
  "timestamp": "2026-06-06T10:00:00.000Z"
}
```

---

## 3. Endpoints by Module

### 3.1 Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register student or recruiter account | No |
| `POST` | `/auth/login` | Login and receive HTTP-only JWT cookies | No |
| `POST` | `/auth/verify-otp` | Verify login OTP for accounts | No |
| `POST` | `/auth/refresh` | Refresh access tokens using rotating refresh token | No |
| `POST` | `/auth/logout` | Clear authorization cookies / logout | Yes |
| `POST` | `/auth/forgot-password` | Request OTP for password recovery | No |
| `POST` | `/auth/reset-password` | Reset password using verified reset OTP | No |
| `PUT` | `/auth/update-password` | Update current authenticated password | Yes |
| `DELETE` | `/auth/deactivate` | Deactivate own user account | Yes |

---

### 3.2 User Profile Management (`/api/v1/profile`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile/me` | Fetch authenticated user's profile and links | Any |
| `PUT` | `/profile/` | Update basic user data and avatar photo | Any |
| `POST` | `/profile/resumes` | Append resume profile record link | Student |
| `DELETE` | `/profile/resumes/:id` | Remove resume profile record link | Student |
| `POST` | `/profile/verify-skill` | Request admin verification for skills | Student |
| `POST` | `/profile/student/resume` | Link primary generated/uploaded resume path | Student |
| `POST` | `/profile/projects` | Create a new student project item | Student |
| `PUT` | `/profile/projects/:projectId` | Edit an existing project item details | Student |
| `DELETE` | `/profile/projects/:projectId` | Delete a project item | Student |
| `POST` | `/profile/upload-resume` | Upload resume file directly to cloud storage | Student |
| `GET` | `/profile/student/profile/:id` | Fetch detailed student profile by id | Admin, Recruiter |
| `GET` | `/profile/student/skills/:id` | Retrieve skills portfolio details | Any |
| `GET` | `/profile/student/projects/:id` | Retrieve student projects listing | Any |
| `GET` | `/profile/student/academic/:id` | Retrieve academic record scores details | Admin |

---

### 3.3 Student Operations (`/api/v1/students`)

Student helper dashboard and settings management.

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/students/resumes` | Fetch list of resumes (same as `/resume`) | Student |
| `POST` | `/students/upload-resume` | Upload new resume | Student |
| `POST` | `/students/build-resume` | Save built resume structured JSON | Student |
| `PATCH` | `/students/resume/:id/primary` | Mark specific resume id as default | Student |
| `DELETE` | `/students/resume/:id` | Remove a resume record | Student |
| `GET` | `/students/dashboard` | Fetch student metrics & applications count | Student |
| `GET` | `/students/skill-gap` | Analyze matching job market skill requirements | Student |
| `GET` | `/students/watchlist` | Retrieve watchlisted saved jobs | Student |
| `POST` | `/students/watchlist/:jobId` | Toggle a job on or off the watchlist | Student |
| `DELETE` | `/students/watchlist/:jobId` | Toggle a job on or off the watchlist | Student |
| `PUT` | `/students/change-password` | Update current student password | Student |
| `GET` | `/students/notification-settings` | Fetch email/app alert settings | Student |
| `PUT` | `/students/notification-settings` | Update email/app alert settings | Student |
| `GET` | `/students/privacy-settings` | Fetch visibility and sharing metrics settings | Student |
| `PUT` | `/students/privacy-settings` | Update visibility and sharing metrics settings | Student |
| `GET` | `/students/archives` | View historical graduation placements aggregates | Student |
| `PUT` | `/students/deactivate` | Deactivate account status | Student |
| `DELETE` | `/students/delete-account` | Permanently remove student profile and user data | Student |

---

### 3.4 Job Management (`/api/v1/jobs`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/jobs` | List all postings eligible for student/visitor | Any |
| `POST` | `/jobs` | Post a new job opportunity vacancy | Recruiter, Admin |
| `GET` | `/jobs/admin` | Fetch all job opportunities audit list | Recruiter, Admin |
| `GET` | `/jobs/stats` | Fetch recruitment activity analysis stats | Recruiter |
| `GET` | `/jobs/roi` | Fetch ROI recruiter analysis report metrics | Recruiter |
| `GET` | `/jobs/my` | List all opportunities posted by recruiter | Recruiter |
| `GET` | `/jobs/matched` | Fetch jobs matching student eligibility criteria | Student |
| `GET` | `/jobs/watchlist` | Retrieve bookmarked jobs list | Student |
| `POST` | `/jobs/watchlist/:id` | Toggle job bookmark | Student |
| `GET` | `/jobs/:id` | Fetch specific job details | Any |
| `PUT` | `/jobs/:id` | Update job parameters and filters | Recruiter, Admin |
| `DELETE` | `/jobs/:id` | Archive or delete a job opportunity | Recruiter, Admin |
| `GET` | `/jobs/:id/analytics` | Fetch applications views & submissions metrics | Recruiter, Admin |
| `PATCH` | `/jobs/:id/status` | Modify post status (open, closed, paused) | Recruiter, Admin |

---

### 3.5 Applications Management (`/api/v1/applications`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/applications/check-eligibility/:jobId` | Evaluate CGPA, branch, backlog criteria | Student |
| `GET` | `/applications/admin` | Audit all system applications listings | Admin |
| `GET` | `/applications/stats` | Fetch application counts (Applied, Placed) | Student |
| `GET` | `/applications/recruiter` | Fetch all applicants for recruiter jobs | Recruiter |
| `GET` | `/applications/interviews` | Fetch scheduled interviews for applicant | Student |
| `POST` | `/applications/:jobId` | Submit application for a job opportunity | Student |
| `POST` | `/applications/:jobId/draft` | Save application draft answers | Student |
| `GET` | `/applications/my` | Retrieve student's application history | Student |
| `GET` | `/applications/job/:jobId` | List applicants for a specific job | Recruiter, Admin |
| `PATCH` | `/applications/bulk-status` | Bulk update status of applicants | Recruiter |
| `GET` | `/applications/export/:jobId` | Export applicant records to CSV | Recruiter |
| `PATCH` | `/applications/:id/status` | Update single applicant status | Recruiter, Admin |
| `PATCH` | `/applications/:id/offer` | Accept / Decline a placement offer | Student |
| `PATCH` | `/applications/:id/offer-letter` | Upload signed offer letter PDF | Student, Recruiter |
| `PATCH` | `/applications/:id/withdraw` | Cancel submitted job application | Student |
| `GET` | `/applications/job/:jobId/pipeline` | Retrieve candidate flow stages data | Recruiter, Admin |
| `PATCH` | `/applications/:id/advance` | Move applicant to next interview round | Recruiter, Admin |
| `PATCH` | `/applications/:id/reject-pipeline` | Mark applicant as rejected in pipeline | Recruiter, Admin |

---

### 3.6 System Administration (`/api/v1/admin`)

| Method | Endpoint | Description | Action Details |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/me` | Fetch admin profile data | Admin Profile retrieval |
| `PATCH` | `/admin/me` | Update admin profile data | Edit details |
| `GET` | `/admin/stats` | System overall numeric statistics | Users count, jobs, placements rate |
| `GET` | `/admin/activities` | Audit trail of database activities logs | Recent updates list |
| `GET` | `/admin/users` | Retrieve and query user profiles | Search with role & status filters |
| `PATCH` | `/admin/users/:id/verify` | Verify student or recruiter profile | Approves signup/account |
| `POST` | `/admin/students` | Admin creates student profile | Direct onboarding |
| `POST` | `/admin/recruiters` | Admin creates recruiter profile | Direct corporate onboarding |
| `POST` | `/admin/verify-batch` | Trigger batch verification engine | Evaluates matching credentials |
| `GET` | `/admin/team` | List all platform administrators | Super Admin Only |
| `POST` | `/admin/invite` | Invite email to onboarding new admin | Super Admin Only |
| `PATCH` | `/admin/team/:id` | Update admin privileges hierarchy | Super Admin Only |
| `GET` | `/admin/settings` | Read current platform config settings | Global system configurations |
| `PATCH` | `/admin/settings` | Modify registration and maintenance toggles | Super Admin Only |
| `GET` | `/admin/interviews` | View all scheduled student interviews | Audit coordination |
| `GET` | `/admin/reports/placements` | Generate institutional placement CSV | Reports exporter |
| `GET` | `/admin/analytics` | Fetch advanced enrollment and ROI metrics | Charting data sources |
| `GET` | `/admin/verifications` | Fetch pending student skill certifications | Verifications list |
| `PATCH` | `/admin/verifications/:profileId/:verificationId` | Approve/Reject student certificate | Mark skill verified |
| `GET` | `/admin/recruiters/:id/history` | Audit recruiter's job postings history | Corporate metrics history |
| `GET` | `/admin/pending-recruiters` | List recruiters waiting for onboarding approval | Pending registrations |
| `PATCH` | `/admin/recruiters/:id/approve` | Confirm company registration approval | Enable job posting |
| `PATCH` | `/admin/users/:id/unlock` | Unlock locked-out user account | Restore login rights |
| `PATCH` | `/admin/users/bulk` | Bulk change user statuses | Batch administration |
| `POST` | `/admin/users/bulk-email` | Send email notification to selected users | Announcements |
| `PATCH` | `/admin/verifications/bulk` | Bulk verify pending skill requests | Batch certification |
| `GET` | `/admin/students/compliance` | Get student profile completions analytics | Academic checks |
| `PATCH` | `/admin/students/bulk-academic-verify` | Bulk verify academic cgpa/backlogs checks | Grades validation |
| `PATCH` | `/admin/applications/:id/verify-offer` | Confirm uploaded placement offer letter | Confirm Placed status |
| `POST` | `/admin/archive` | Compress and archive current year database | Super Admin Only |
| `GET` | `/admin/archives` | List historical year archives metadata | Audit trails |
| `GET` | `/admin/health/system` | Detailed server and database resource logs | Super Admin Only |
| `POST` | `/admin/data/import/students` | Parse and import student records via CSV | Admin import |
| `GET` | `/admin/data/export/students` | Export all student database profiles to CSV | Admin export |
| `GET` | `/admin/data/export/placements` | Export placement database history to CSV | Admin export |

---

### 3.7 Interviews (`/api/v1/interviews`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/interviews/:studentId` | Get scheduled interviews list | Student, Admin |
| `GET` | `/interviews/history/:studentId` | Get past interviews logs | Student, Admin |
| `GET` | `/interviews/:studentId/export` | Download standard iCalendar .ics event | Student |
| `PATCH` | `/interviews/:id/select-slot` | Book preferred interview timeslot | Student |

---

### 3.8 Placement Drives (`/api/v1/drives`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/drives` | Get list of active and upcoming placement drives | Any |
| `POST` | `/drives` | Create a new placement drive campaign | Admin |
| `GET` | `/drives/:id` | Get drive details by ID | Any |
| `PUT` | `/drives/:id` | Edit drive schedules and details | Admin |
| `DELETE` | `/drives/:id` | Delete drive record | Admin |

---

### 3.9 Notifications & Announcements (`/api/v1/notifications`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Fetch active alerts for the current user | Any |
| `GET` | `/notifications/announcements` | Fetch active global announcements | Any |
| `GET` | `/notifications/admin` | Fetch all historical broadcasts list | Admin |
| `POST` | `/notifications/broadcast` | Create a role-targeted notification alert | Admin |
| `PUT` | `/notifications/broadcast/:id` | Modify broadcast settings | Admin |
| `DELETE` | `/notifications/broadcast/:id` | Delete broadcast alert | Admin |
| `PUT` | `/notifications/read/:id` | Mark individual notification as read | Any |
| `PUT` | `/notifications/read-all/:userId` | Mark all notifications as read | Any |

---

### 3.10 Corporate Registry (`/api/v1/companies`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/companies/list` | Fetch active hiring companies name checklist | Any |
| `GET` | `/companies/:name/scorecard` | Fetch placements, jobs, and salary metrics stats | Any |

---

### 3.11 File Upload Utility (`/api/v1/upload`)

| Method | Endpoint | Description | Details |
| :--- | :--- | :--- | :--- |
| `POST` | `/upload` | Streaming file upload to Cloudinary CDN | Required body: Form-Data with key `file` (PDF, PNG, JPG). Returns secure CDN URL. |

---

## 4. Standard Error Structure

All API errors return a standard JSON response format:

```json
{
  "message": "Detailed description of validation or runtime issue",
  "stack": "Stack trace (null in production environment)"
}
```

### Response Status Codes

* `200 OK`: Request succeeded.
* `201 Created`: Resource successfully written.
* `400 Bad Request`: Validation failure (e.g. invalid fields).
* `401 Unauthorized`: Token missing or session expired.
* `403 Forbidden`: Insufficient role rights to view path.
* `404 Not Found`: Resource ID not located.
* `500 Internal Server Error`: Unexpected backend database exception.
