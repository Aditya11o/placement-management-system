const express = require('express');
const { chatWithAI, getResumeFeedback, generateInterviewPrep } = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// All AI routes are protected
router.use(protect);

router.post('/chat', chatWithAI);
router.post('/resume-feedback', authorize('STUDENT'), getResumeFeedback);
router.post('/interview-prep', generateInterviewPrep);

module.exports = router;
