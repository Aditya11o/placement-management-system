const express = require('express');
const {
    getOverviewStats,
    getPlacementStats,
    getBranchPlacementStats,
    getTopCompanies,
    getTrends,
    getFunnel,
    getSalaryStats,
    getPredictiveAnalytics,
    getCohortAnalysis,
    getEngagementStats,
    getPlacementReadiness,
    getSeasonComparison,
    getRiskAssessment,
    getGeographicStats,
    getDashboardExtendedStats,
    getAIStrategicInsights
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// All analytics routes are strictly protected and require ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

// ── Shared date range parameter definition (reusable across all endpoints) ─────
/**
 * @swagger
 * components:
 *   parameters:
 *     fromDate:
 *       in: query
 *       name: from
 *       schema:
 *         type: string
 *         format: date
 *         example: "2026-01-01"
 *       description: Start date for filtering (inclusive). ISO 8601 format.
 *     toDate:
 *       in: query
 *       name: to
 *       schema:
 *         type: string
 *         format: date
 *         example: "2026-03-01"
 *       description: End date for filtering (inclusive, end of day). ISO 8601 format.
 */

/**
 * @swagger
 * /api/v1/analytics/overview:
 *   get:
 *     summary: High-level overview metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/fromDate'
 *       - $ref: '#/components/parameters/toDate'
 *     responses:
 *       200:
 *         description: Overview stats for the given date range
 */
router.get('/overview', getOverviewStats);

/**
 * @swagger
 * /api/v1/analytics/placements:
 *   get:
 *     summary: Placement success metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/fromDate'
 *       - $ref: '#/components/parameters/toDate'
 *     responses:
 *       200:
 *         description: Placement rate and counts for the given date range
 */
router.get('/placements', getPlacementStats);

/**
 * @swagger
 * /api/v1/analytics/branch-placements:
 *   get:
 *     summary: Placement statistics by branch
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/fromDate'
 *       - $ref: '#/components/parameters/toDate'
 *     responses:
 *       200:
 *         description: Per-branch placement stats sorted by rate
 */
router.get('/branch-placements', getBranchPlacementStats);

/**
 * @swagger
 * /api/v1/analytics/top-companies:
 *   get:
 *     summary: Top recruiting companies by hires
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/fromDate'
 *       - $ref: '#/components/parameters/toDate'
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Max number of companies to return
 *     responses:
 *       200:
 *         description: Ranked list of companies
 */
router.get('/top-companies', getTopCompanies);

/**
 * @swagger
 * /api/v1/analytics/trends:
 *   get:
 *     summary: Monthly time-series data for line charts
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returns four monthly data series for the given date range (defaults to last 12 months):
 *       - **applications** — number of applications submitted per month
 *       - **placements** — number of students placed (SELECTED) per month
 *       - **jobsPosted** — number of job listings created per month
 *       - **studentRegistrations** — number of new students registered per month
 *
 *       Each data point has the shape `{ label: "Jan 2026", year: 2026, month: 1, count: 42 }`.
 *     parameters:
 *       - $ref: '#/components/parameters/fromDate'
 *       - $ref: '#/components/parameters/toDate'
 *     responses:
 *       200:
 *         description: Monthly trend series
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 dateRange:
 *                   type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     applications:
 *                       type: array
 *                     placements:
 *                       type: array
 *                     jobsPosted:
 *                       type: array
 *                     studentRegistrations:
 *                       type: array
 */
router.get('/trends', getTrends);

/**
 * @swagger
 * /api/v1/analytics/funnel:
 *   get:
 *     summary: Application pipeline funnel breakdown
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returns counts and percentages at each stage of the application funnel:
 *       `SUBMITTED → REVIEWED → SHORTLISTED → SELECTED` (and `REJECTED`).
 *       Use this to identify where candidates drop off. Accepts optional date range.
 *     parameters:
 *       - $ref: '#/components/parameters/fromDate'
 *       - $ref: '#/components/parameters/toDate'
 *     responses:
 *       200:
 *         description: Funnel stage breakdown with counts and percentages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 250
 *                     funnel:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           stage:
 *                             type: string
 *                             example: SHORTLISTED
 *                           count:
 *                             type: integer
 *                             example: 45
 *                           percent:
 *                             type: number
 *                             example: 18.0
 */
router.get('/funnel', getFunnel);

/**
 * @swagger
 * /api/v1/analytics/salary-stats:
 *   get:
 *     summary: Salary distribution statistics by branch
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/fromDate'
 *       - $ref: '#/components/parameters/toDate'
 *     responses:
 *       200:
 *         description: Salary distribution (Min/Max/Avg) per branch
 */
router.get('/salary-stats', getSalaryStats);

/**
 * @swagger
 * /api/v1/analytics/predictive:
 *   get:
 *     summary: Get predictive analytics (rising skills and branch demand)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Predictive metrics
 */
router.get('/predictive', getPredictiveAnalytics);

/**
 * @desc    Compare batches (graduation years)
 * @route   GET /api/v1/analytics/cohorts
 */
router.get('/cohorts', getCohortAnalysis);

/**
 * @desc    Recruiter engagement metrics
 * @route   GET /api/v1/analytics/engagement
 */
router.get('/engagement', getEngagementStats);

/**
 * @desc    Student placement readiness scoring
 * @route   GET /api/v1/analytics/placement-readiness
 */
router.get('/placement-readiness', getPlacementReadiness);

/**
 * @desc    Get placement comparison across seasons (graduation years)
 * @route   GET /api/v1/analytics/seasons
 */
router.get('/seasons', getSeasonComparison);

/**
 * @desc    Get at-risk student assessment
 * @route   GET /api/v1/analytics/risk-assessment
 */
router.get('/risk-assessment', getRiskAssessment);

/**
 * @desc    Get geographic distribution of job offers
 * @route   GET /api/v1/analytics/geography
 */
router.get('/geography', getGeographicStats);

/**
 * @desc    Get extended dashboard stats
 */
router.get('/dashboard-extended', getDashboardExtendedStats);

/**
 * @desc    Get AI strategic insights
 */
router.get('/ai-insights', getAIStrategicInsights);

module.exports = router;
