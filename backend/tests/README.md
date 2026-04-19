# Backend Integration Testing

This directory contains integration tests for the Placement Management System backend.

## Infrastructure
- **Jest**: Test runner and assertion library.
- **Supertest**: HTTP assertions for Express.
- **Prisma & PostgreSQL**: Relational database for integration testing.

## Test Suites
1. **`auth.test.js`**: Registration, Login, 2FA/OTP, Account Lockout, Token Refresh.
2. **`jobs.test.js`**: Job CRUD, Eligibility Filtering (CGPA/Branch), Recruiter access control.
3. **`applications.test.js`**: Application submission, Status lifecycle, Offer acceptance/rejection.
4. **`admin.test.js`**: User management, Bulk operations, Audit logging, Admin-only routes.

## Configuration
- `setup.js`: Global database connection and collection clearing logic.
- `app.js`: Refactored Express app instance (separated from `server.js` port binding).

## Running Tests
Ensure you are in the `backend` directory:

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run specific file
npx jest tests/auth.test.js
```

## Environment
Tests use `NODE_ENV=test` which:
- Disables CSRF (unless specifically being tested).
- Uses a mock Socket.io (`io`) object.
- Relaxes Rate Limiting to prevent 429 errors during execution.
- Mocks email sending to prevent external calls.
