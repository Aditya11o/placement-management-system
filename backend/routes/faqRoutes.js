const express = require('express');
const router = express.Router();
const { getFAQs, createFAQ } = require('../controllers/faqController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getFAQs)
  .post(protect, admin, createFAQ);

module.exports = router;
