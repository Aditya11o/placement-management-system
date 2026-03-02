# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-03-02

### Added
- **Graceful Shutdown**: Implemented `SIGTERM`/`SIGINT` handlers in `server.js` to cleanly close HTTP server, MongoDB, Redis, and BullMQ workers.
- **Configuration Management**: Integrated `convict` for robust environment variable validation and centralization.
- **Database Optimization**: Added indexes to `Student`, `Job`, `Application`, and `Recruiter` models to improve query performance.
- **Input Validation**: Consistent application of `express-validator` across all administrative and RBAC routes.
- **API Versioning**: Enforced `/api/v1/` prefix for all functional endpoints.

### Changed
- Refactored `server.js` for better modularity and error handling.
- Optimized Redis connection logic with standard retry strategies.

### Security
- Added `express-mongo-sanitize`, `xss-clean`, and `hpp` for enhanced protection.
- Stricter Global Rate Limiting with Redis-backed 24-hour IP banning for abusers.
- 2FA integration for Admin and Recruiter logins.

## [1.0.0] - 2025-01-01
- Initial release of the Placement Management System Backend.
