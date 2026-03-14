const express = require('express');
const { getPublicPortfolio } = require('../controllers/publicController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/public/portfolio/{slug}:
 *   get:
 *     summary: Fetch a student's public portfolio by slug
 */
router.get('/portfolio/:slug', getPublicPortfolio);

module.exports = router;
