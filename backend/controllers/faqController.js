const FAQ = require('../models/FAQ');

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
const getFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find({}).sort({ order: 1, createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    next(error);
  }
};

// @desc    Create FAQ (Admin only)
// @route   POST /api/faqs
// @access  Private/Admin
const createFAQ = async (req, res, next) => {
  try {
    const { question, answer, category, order } = req.body;
    const faq = await FAQ.create({ question, answer, category, order });
    res.status(201).json(faq);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFAQs,
  createFAQ,
};
