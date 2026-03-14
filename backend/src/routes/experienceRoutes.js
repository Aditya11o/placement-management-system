const express = require('express');
const { shareExperience, getExperiences, voteExperience, getPrepKit } = require('../controllers/experienceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

// Anyone authenticated can view experiences
router.get('/', getExperiences);

// Only students can share and vote
router.post('/', authorize('STUDENT'), shareExperience);
router.post('/:id/vote', authorize('STUDENT'), voteExperience);
router.get('/prep-kit/:companyName', getPrepKit);

module.exports = router;
