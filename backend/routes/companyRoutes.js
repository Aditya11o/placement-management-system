const express = require('express');
const router = express.Router();
const { getCompanyScorecard, getCompanyList } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/list', protect, getCompanyList);
router.get('/:name/scorecard', protect, getCompanyScorecard);

module.exports = router;
