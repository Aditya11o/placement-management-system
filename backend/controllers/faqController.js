const prisma = require('../utils/prisma');

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
const getFAQs = async (req, res, next) => {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(faqs.map(f => ({ ...f, _id: f.id })));
  } catch (error) {
    next(error);
  }
};

// @desc    Create FAQ (Admin only)
// @route   POST /api/faqs
// @access  Private/Admin
const createFAQ = async (req, res, next) => {
  try {
    const { question, answer, category } = req.body;
    const faq = await prisma.fAQ.create({
      data: { question, answer, category }
    });
    res.status(201).json({ ...faq, _id: faq.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFAQs,
  createFAQ,
};
