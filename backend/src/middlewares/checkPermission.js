const Admin = require('../models/Admin');

/**
 * checkPermission(permission) — Authorization middleware for granular admin access control.
 *
 * Usage in routes:
 *   router.put('/users/status', checkPermission('manage_students'), updateUserStatus);
 *
 * Rules:
 *   1. SUPER_ADMIN → always passes (implicit all-access)
 *   2. Others      → must have the specific permission key in their `permissions[]` array
 *
 * This middleware runs AFTER `protect` and `authorize('ADMIN')` — it expects `req.user`
 * to already be populated with the authenticated admin's document (including `sub_role`
 * and `permissions`).
 *
 * @param {string} permission - One of ALL_PERMISSIONS keys (e.g. 'manage_recruiters')
 */
const checkPermission = (permission) => async (req, res, next) => {
    try {

        // API Key sessions don't have a sub_role — treat as full-access (legacy compat)
        if (req.isApiKeySession) return next();

        // Fetch the full Admin document (req.user from JWT only has id + role)
        const admin = await Admin.findById(req.user.id).select('sub_role permissions');

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin account not found' });
        }

        if (!admin.hasPermission(permission)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required permission: '${permission}'`,
                yourRole: admin.sub_role,
                yourPermissions: admin.permissions
            });
        }

        // Attach full admin to req for downstream use
        req.admin = admin;
        next();
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = checkPermission;
