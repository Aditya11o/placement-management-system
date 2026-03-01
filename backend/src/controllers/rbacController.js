const Admin = require('../models/Admin');
const { ALL_PERMISSIONS } = require('../models/Admin');
const Log = require('../models/Log');

/**
 * @desc    List all admin accounts (SUPER_ADMIN only)
 * @route   GET /api/v1/rbac/admins
 */
exports.listAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}).select('-password -twofa_secret -api_keys -resetPasswordToken');
        res.status(200).json({ success: true, count: admins.length, data: admins });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get full permission manifest — all available permission keys
 * @route   GET /api/v1/rbac/permissions
 */
exports.getPermissionManifest = (req, res) => {
    const manifest = {
        sub_roles: [
            { value: 'SUPER_ADMIN', description: 'Full access — all permissions implicitly granted' },
            { value: 'PLACEMENT_COORDINATOR', description: 'Day-to-day placement ops — subset of permissions' },
            { value: 'ADMIN', description: 'Standard admin — manually configured permissions' }
        ],
        permissions: [
            { key: 'manage_students', description: 'View / approve / block / delete students' },
            { key: 'manage_recruiters', description: 'View / approve / block / delete recruiters' },
            { key: 'manage_jobs', description: 'Close or delete job postings' },
            { key: 'manage_applications', description: 'Update application statuses' },
            { key: 'manage_announcements', description: 'Create / delete announcements' },
            { key: 'view_analytics', description: 'Access the analytics dashboard' },
            { key: 'view_logs', description: 'Access audit logs' },
            { key: 'manage_api_keys', description: 'Generate and revoke API keys' },
            { key: 'export_data', description: 'Trigger CSV or database exports' },
            { key: 'manage_admins', description: 'SUPER_ADMIN only: grant/revoke permissions to other admins' }
        ]
    };
    res.status(200).json({ success: true, data: manifest });
};

/**
 * @desc    Grant permissions to an admin account
 * @route   POST /api/v1/rbac/admins/:id/permissions
 * @access  SUPER_ADMIN only
 */
exports.grantPermissions = async (req, res) => {
    try {
        const { permissions } = req.body;

        if (!Array.isArray(permissions) || permissions.length === 0) {
            return res.status(400).json({ success: false, message: 'permissions must be a non-empty array' });
        }

        const invalid = permissions.filter(p => !ALL_PERMISSIONS.includes(p));
        if (invalid.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid permission keys: ${invalid.join(', ')}`,
                validPermissions: ALL_PERMISSIONS
            });
        }

        const target = await Admin.findById(req.params.id).select('sub_role permissions name email');
        if (!target) return res.status(404).json({ success: false, message: 'Admin not found' });

        // SUPER_ADMIN accounts don't need explicit grants — warn the caller
        if (target.sub_role === 'SUPER_ADMIN') {
            return res.status(400).json({
                success: false,
                message: 'SUPER_ADMIN already has all permissions implicitly. No grant needed.'
            });
        }

        // Merge — add only permissions not already present
        const newPerms = [...new Set([...target.permissions, ...permissions])];
        target.permissions = newPerms;
        await target.save();

        await Log.create({
            user_id: req.user.id,
            user_role: 'ADMIN',
            action: 'GRANT_PERMISSIONS',
            target_id: target._id,
            description: `Granted: ${permissions.join(', ')} to ${target.email}`
        });

        res.status(200).json({
            success: true,
            message: `Granted ${permissions.length} permission(s) to ${target.email}`,
            data: { id: target._id, email: target.email, sub_role: target.sub_role, permissions: target.permissions }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Revoke permissions from an admin account
 * @route   DELETE /api/v1/rbac/admins/:id/permissions
 * @access  SUPER_ADMIN only
 */
exports.revokePermissions = async (req, res) => {
    try {
        const { permissions } = req.body;

        if (!Array.isArray(permissions) || permissions.length === 0) {
            return res.status(400).json({ success: false, message: 'permissions must be a non-empty array' });
        }

        const target = await Admin.findById(req.params.id).select('sub_role permissions name email');
        if (!target) return res.status(404).json({ success: false, message: 'Admin not found' });

        if (target.sub_role === 'SUPER_ADMIN') {
            return res.status(400).json({
                success: false,
                message: 'Cannot revoke permissions from SUPER_ADMIN accounts'
            });
        }

        // Prevent an admin from revoking their own permissions
        if (target._id.toString() === req.user.id) {
            return res.status(403).json({ success: false, message: 'Cannot revoke your own permissions' });
        }

        target.permissions = target.permissions.filter(p => !permissions.includes(p));
        await target.save();

        await Log.create({
            user_id: req.user.id,
            user_role: 'ADMIN',
            action: 'REVOKE_PERMISSIONS',
            target_id: target._id,
            description: `Revoked: ${permissions.join(', ')} from ${target.email}`
        });

        res.status(200).json({
            success: true,
            message: `Revoked ${permissions.length} permission(s) from ${target.email}`,
            data: { id: target._id, email: target.email, permissions: target.permissions }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Change an admin's sub_role
 * @route   PUT /api/v1/rbac/admins/:id/sub-role
 * @access  SUPER_ADMIN only
 */
exports.setSubRole = async (req, res) => {
    try {
        const { sub_role } = req.body;
        const validRoles = ['SUPER_ADMIN', 'PLACEMENT_COORDINATOR', 'ADMIN'];

        if (!validRoles.includes(sub_role)) {
            return res.status(400).json({ success: false, message: `sub_role must be one of: ${validRoles.join(', ')}` });
        }

        if (req.params.id === req.user.id) {
            return res.status(403).json({ success: false, message: 'Cannot change your own sub_role' });
        }

        // When promoting to PLACEMENT_COORDINATOR, set a sensible default permission set
        const COORDINATOR_DEFAULTS = [
            'manage_students', 'manage_recruiters', 'manage_applications',
            'manage_announcements', 'view_analytics', 'view_logs'
        ];

        const updatePayload = { sub_role };
        if (sub_role === 'PLACEMENT_COORDINATOR') {
            updatePayload.permissions = COORDINATOR_DEFAULTS;
        }

        const target = await Admin.findByIdAndUpdate(
            req.params.id,
            updatePayload,
            { new: true, runValidators: true }
        ).select('-password -twofa_secret');

        if (!target) return res.status(404).json({ success: false, message: 'Admin not found' });

        await Log.create({
            user_id: req.user.id,
            user_role: 'ADMIN',
            action: 'SET_SUB_ROLE',
            target_id: target._id,
            description: `Set sub_role to ${sub_role} for ${target.email}`
        });

        res.status(200).json({ success: true, message: `Sub-role updated to ${sub_role}`, data: target });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get current authenticated admin's own role and permissions
 * @route   GET /api/v1/rbac/me
 * @access  Private/Admin
 */
exports.getMyPermissions = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('name email sub_role permissions');
        if (!admin) return res.status(404).json({ success: false, message: 'Not found' });

        res.status(200).json({
            success: true,
            data: {
                name: admin.name,
                email: admin.email,
                sub_role: admin.sub_role,
                permissions: admin.sub_role === 'SUPER_ADMIN' ? ALL_PERMISSIONS : admin.permissions,
                isSuperAdmin: admin.sub_role === 'SUPER_ADMIN'
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
