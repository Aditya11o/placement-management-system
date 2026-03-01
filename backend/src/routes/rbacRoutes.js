const express = require('express');
const {
    listAdmins, getPermissionManifest,
    grantPermissions, revokePermissions,
    setSubRole, getMyPermissions
} = require('../controllers/rbacController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');

const router = express.Router();
router.use(protect);
router.use(authorize('ADMIN'));

/**
 * @swagger
 * tags:
 *   name: RBAC
 *   description: Granular admin role and permission management
 */

/**
 * @swagger
 * /api/v1/rbac/me:
 *   get:
 *     summary: Get your own sub-role and active permissions
 *     tags: [RBAC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current admin's sub_role and permission list
 */
router.get('/me', getMyPermissions);

/**
 * @swagger
 * /api/v1/rbac/permissions:
 *   get:
 *     summary: Get full permission manifest (all valid keys and sub-roles)
 *     tags: [RBAC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Manifest of all permission keys and sub-role definitions
 */
router.get('/permissions', getPermissionManifest);

/**
 * @swagger
 * /api/v1/rbac/admins:
 *   get:
 *     summary: List all admin accounts with their sub-roles and permissions
 *     tags: [RBAC]
 *     security:
 *       - bearerAuth: []
 *     description: Requires `manage_admins` permission (SUPER_ADMIN only)
 *     responses:
 *       200:
 *         description: List of admin accounts
 *       403:
 *         description: Insufficient permissions
 */
router.get('/admins', checkPermission('manage_admins'), listAdmins);

/**
 * @swagger
 * /api/v1/rbac/admins/{id}/permissions:
 *   post:
 *     summary: Grant permissions to an admin
 *     tags: [RBAC]
 *     security:
 *       - bearerAuth: []
 *     description: Requires `manage_admins` permission (SUPER_ADMIN only).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Target admin's MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["manage_jobs", "export_data"]
 *     responses:
 *       200:
 *         description: Permissions granted
 *       400:
 *         description: Invalid permissions or target is SUPER_ADMIN
 *   delete:
 *     summary: Revoke permissions from an admin
 *     tags: [RBAC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["manage_jobs"]
 *     responses:
 *       200:
 *         description: Permissions revoked
 *       403:
 *         description: Cannot alter SUPER_ADMIN or own permissions
 */
router.post('/admins/:id/permissions', checkPermission('manage_admins'), grantPermissions);
router.delete('/admins/:id/permissions', checkPermission('manage_admins'), revokePermissions);

/**
 * @swagger
 * /api/v1/rbac/admins/{id}/sub-role:
 *   put:
 *     summary: Change an admin's sub-role
 *     tags: [RBAC]
 *     security:
 *       - bearerAuth: []
 *     description: Requires `manage_admins` permission. Promoting to PLACEMENT_COORDINATOR auto-sets a default permission set.
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - sub_role
 *             properties:
 *               sub_role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, PLACEMENT_COORDINATOR, ADMIN]
 *     responses:
 *       200:
 *         description: Sub-role updated
 *       403:
 *         description: Cannot change your own sub-role
 */
router.put('/admins/:id/sub-role', checkPermission('manage_admins'), setSubRole);

module.exports = router;
