const { check } = require('express-validator');

exports.validateInterviewScheduling = [
    check('application_id', 'Valid Application ID is required').isMongoId(),
    check('scheduled_at', 'Valid ISO 8601 date is required').isISO8601(),
    check('location_type', 'Location type must be VIRTUAL, IN_PERSON, or PHONE').isIn(['VIRTUAL', 'IN_PERSON', 'PHONE']),
    check('location_details', 'Location details are required').not().isEmpty().trim().escape(),
    check('notes', 'Notes must be a string').optional().isString()
];

exports.validateInterviewResponse = [
    check('status', 'Valid response status is required (CONFIRMED or REJECTED)').isIn(['CONFIRMED', 'REJECTED'])
];

exports.validateInterviewStatusUpdate = [
    check('status', 'Valid status is required (COMPLETED or CANCELED)').isIn(['COMPLETED', 'CANCELED'])
];
