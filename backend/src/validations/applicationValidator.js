const { check } = require('express-validator');

exports.validateApplicationApply = [
    check('job_id', 'Valid Job ID is required').isMongoId()
];

exports.validateApplicationStatusUpdate = [
    check('status', 'Valid status is required').isIn(['SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'SELECTED', 'REJECTED'])
];
