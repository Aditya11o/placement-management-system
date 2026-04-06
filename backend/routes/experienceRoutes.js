const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createExperience,
  getExperiences,
  getExperienceById,
  toggleUpvote,
  addComment,
  deleteExperience
} = require('../controllers/experienceController');

// All routes are protected
router.use(protect);

router.route('/')
  .post(createExperience)
  .get(getExperiences);

router.route('/:id')
  .get(getExperienceById)
  .delete(deleteExperience);

router.patch('/:id/upvote', toggleUpvote);
router.post('/:id/comments', addComment);

module.exports = router;
