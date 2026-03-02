const { check } = require('express-validator');

exports.validateAnnouncementCreation = [
    check('title', 'Title is required').not().isEmpty().trim().escape(),
    check('message', 'Message is required').not().isEmpty().trim().escape()
];
