const express = require('express');
const { updateStreak, checkBadges, getStats } = require('../controllers/gamificationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('STUDENT'));

router.get('/stats', getStats);
router.post('/update-streak', updateStreak);
router.post('/check-badges', checkBadges);

module.exports = router;
