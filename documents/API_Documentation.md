# API Reference Documentation

## 1. Overview
The Placement Management System (PMS) Backend provides a RESTful API built with **Express.js (Node.js)**. 

- **Base URL:** `/api/v1`
- **Content-Type:** `application/json` (unless defined otherwise for file uploads: `multipart/form-data`)
- **Authentication:** Bearer Token (JWT) sent in the `Authorization` header, or via HTTP-only Cookies depending on configuration.

---

## 2. Global Status & Health

### `GET /api/v1/health`
Checks the system health status.
**Response:**
```json
{
  "status": "ok",
  "version": "v1",
  "uptime": 12345,
  "timestamp": "2026-04-14T10:00:00.000Z"
}
```

---

## 3. Endpoints by Module

### 3.1 Authentication (`/api/v1/auth`)
Handles user registration, login, logout, and password resets.

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Register a new user (Student/Recruiter) | No |
| `POST` | `/auth/login` | Login and receive JWT token | No |
| `POST` | `/auth/logout` | Clear auth cookies / invalidate token | Yes |
| `POST` | `/auth/forgot-password` | Send OTP for password reset | No |
| `POST` | `/auth/reset-password` | Reset password using OTP | No |

### 3.2 Profiles (`/api/v1/profile`)
Management of Student, Recruiter, and Admin profile details.

| Method | Endpoint | Description | Auth Required | Role |
| --- | --- | --- | --- | --- |
| `GET` | `/profile/me` | Get current user's profile | Yes | Any |
| `PUT` | `/profile/me` | Update basic profile data | Yes | Any |
| `PUT` | `/profile/student` | Update specific student profile (CGPA, etc) | Yes | Student |
| `PUT` | `/profile/recruiter`| Update company details | Yes | Recruiter |

### 3.3 Job Management (`/api/v1/jobs`)
Endpoints for posting, retrieving, and managing placement opportunities.

| Method | Endpoint | Description | Auth Required | Role |
| --- | --- | --- | --- | --- |
| `GET` | `/jobs` | Get all open & eligible jobs | Yes | Student, Admin |
| `GET` | `/jobs/:id` | Get specific job details | Yes | Any |
| `POST` | `/jobs` | Create a new job posting | Yes | Recruiter, Admin |
| `PUT` | `/jobs/:id` | Update an existing job | Yes | Recruiter, Admin |
| `DELETE` | `/jobs/:id` | Archive or delete a job | Yes | Recruiter, Admin |

### 3.4 Applications (`/api/v1/applications`)
Managing the application lifecycle from apply to selection.

| Method | Endpoint | Description | Auth Required | Role |
| --- | --- | --- | --- | --- |
| `POST` | `/applications/apply` | Apply for a specific job `jobId` | Yes | Student |
| `GET` | `/applications/my-applications` | List user's applied jobs | Yes | Student |
| `GET` | `/applications/job/:jobId`| Get all applicants for a job | Yes | Recruiter |
| `PUT` | `/applications/:id/status`| Update applicant status (Shortlist/Reject) | Yes | Recruiter |

### 3.5 System Administration (`/api/v1/admin`)
High-privileged routes for system oversight.

| Method | Endpoint | Description | Auth Required | Role |
| --- | --- | --- | --- | --- |
| `GET` | `/admin/dashboard` | Get overall system stats (Users, Jobs, etc) | Yes | Admin |
| `GET` | `/admin/users` | List all users (with filters) | Yes | Admin |
| `PUT` | `/admin/verify/:id`| Verify a student or recruiter profile | Yes | Admin |
| `GET` | `/audit` | Access system audit logs | Yes | Admin |

### 3.6 Communication & Real-Time Setup
While endpoints like `/api/v1/messages` exist for fetching history, real-time messaging is handled via **Socket.io**.
- **Namespace:** `/`
- **Events:** `send_message`, `receive_message`, `new_notification`, `application_status_update`.

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/notifications` | Get unread notifications | Yes |
| `PUT` | `/notifications/:id/read` | Mark as read | Yes |
| `GET` | `/messages/:userId` | Get chat history with a specific user | Yes |

---

## 4. Standard Error Responses

All API errors follow a standardized format.

```json
{
  "message": "Error description here",
  "stack": "Stack trace (Only visible in Development mode)"
}
```

### Common HTTP Status Codes:
- `200 OK`: Request successful.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation error or missing fields.
- `401 Unauthorized`: Invalid or missing authentication token.
- `403 Forbidden`: User does not have the required role to perform this action.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Server encountered an unexpected issue.
