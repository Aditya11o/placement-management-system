const express = require('express');
const { registerStudent, registerRecruiter, login, getMe, forgotPassword, resetPassword, refreshToken, getSessions, logout, logoutAll, configureWebhook } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { validateStudentRegister, validateRecruiterRegister, validateLogin } = require('../validations/authValidator');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register/student:
 *   post:
 *     summary: Register a new student
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - branch
 *               - cgpa
 *               - graduation_year
 *               - phone
 *               - marks_10th
 *               - marks_12th
 *               - gender
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               branch:
 *                 type: string
 *               cgpa:
 *                 type: number
 *               graduation_year:
 *                 type: number
 *               phone:
 *                 type: string
 *               marks_10th:
 *                 type: number
 *               marks_12th:
 *                 type: number
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *     responses:
 *       201:
 *         description: Student registered successfully (Status PENDING)
 *       400:
 *         description: Validation error
 */
router.post('/register/student', registerLimiter, validateStudentRegister, validate, registerStudent);

/**
 * @swagger
 * /api/v1/auth/register/recruiter:
 *   post:
 *     summary: Register a new recruiter
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_name
 *               - contact_person
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               company_name:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recruiter registered successfully (Status PENDING)
 *       400:
 *         description: Validation error
 */
router.post('/register/recruiter', registerLimiter, validateRecruiterRegister, validate, registerRecruiter);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user and return JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [STUDENT, RECRUITER, ADMIN]
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account pending approval or blocked
 */
router.post('/login', loginLimiter, validateLogin, validate, login);

/**
 * @swagger
 * /api/v1/auth/forgotpassword:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [STUDENT, RECRUITER, ADMIN]
 *     responses:
 *       200:
 *         description: Email sent
 */
router.post('/forgotpassword', forgotPassword);

/**
 * @swagger
 * /api/v1/auth/resetpassword/{resettoken}:
 *   put:
 *     summary: Reset password via token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: resettoken
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - role
 *             properties:
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.put('/resetpassword/:resettoken', resetPassword);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get logged in user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user data
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token using HttpOnly cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/v1/auth/sessions:
 *   get:
 *     summary: Get all active sessions for the user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active sessions
 *       401:
 *         description: Not authorized
 */
router.get('/sessions', protect, getSessions);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out of current session
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logout);

/**
 * @swagger
 * /api/v1/auth/logout/all:
 *   post:
 *     summary: Log out of all active sessions
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out of all devices
 */
router.post('/logout/all', protect, logoutAll);

/**
 * @swagger
 * /api/v1/auth/webhook:
 *   put:
 *     summary: Configure Webhook URL (Recruiter)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               webhook_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook configured successfully
 *       400:
 *         description: Invalid URL
 */
router.put('/webhook', protect, configureWebhook);

module.exports = router;
