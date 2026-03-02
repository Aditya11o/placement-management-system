const { check } = require('express-validator');

exports.validateInterviewScheduling = [
    check('job_id', 'Valid Job ID is required').isMongoId(),
    check('student_id', 'Valid Student ID is required').isMongoId(),
    check('date', 'Valid date is required (YYYY-MM-DD)').isISO8601().toDate(),
    check('time', 'Time is required').not().isEmpty().trim().escape(),
    check('location', 'Location is required').not().isEmpty().trim().escape()
];

exports.validateInterviewResponse = [
    check('status', 'Valid response status is required (CONFIRMED or REJECTED)').isIn(['CONFIRMED', 'REJECTED'])
];

exports.validateInterviewStatusUpdate = [
    check('status', 'Valid status is required (COMPLETED or CANCELED)').isIn(['COMPLETED', 'CANCELED'])
];
