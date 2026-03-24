const express = require('express');
const { getStudentResume } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/resume', protect, getStudentResume);

module.exports = router;
