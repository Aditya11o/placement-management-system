const { check } = require('express-validator');

exports.validateUserStatusUpdate = [
    check('id', 'Valid user ID is required').isMongoId(),
    check('role', 'Valid role is required (STUDENT or RECRUITER)').isIn(['STUDENT', 'RECRUITER']),
    check('status', 'Valid status is required (PENDING, APPROVED, or BLOCKED)').isIn(['PENDING', 'APPROVED', 'BLOCKED'])
];

exports.validateExportRequest = [
    check('type', 'Valid export type is required (students or applications)').isIn(['students', 'applications'])
];

exports.validateApiKeyGeneration = [
    check('name', 'API key name is required').not().isEmpty().trim().escape()
];
