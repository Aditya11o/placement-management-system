const { check } = require('express-validator');

exports.validatePermissionChange = [
    check('permissions', 'Permissions must be an array of strings').isArray(),
    check('permissions.*', 'Each permission must be a non-empty string').isString().not().isEmpty()
];

exports.validateSubRoleUpdate = [
    check('sub_role', 'Valid sub-role is required (SUPER_ADMIN, PLACEMENT_COORDINATOR, or ADMIN)').isIn(['SUPER_ADMIN', 'PLACEMENT_COORDINATOR', 'ADMIN'])
];
