const { check } = require('express-validator');

exports.validatePermissionChange = [
    check('permissions', 'Permissions must be an array of strings').isArray(),
    check('permissions.*', 'Each permission must be a non-empty string').isString().not().isEmpty()
];

exports.validateSubRoleUpdate = [
    check('sub_role', 'Valid sub-role is required (SUPER_ADMIN, PLACEMENT_COORDINATOR, or ADMIN)').isIn(['SUPER_ADMIN', 'PLACEMENT_COORDINATOR', 'ADMIN'])
];

exports.validateAdminCreation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('sub_role', 'Valid sub-role is required').isIn(['SUPER_ADMIN', 'PLACEMENT_COORDINATOR', 'ADMIN'])
];
