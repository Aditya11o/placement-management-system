const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Job = require('../models/Job');
const Application = require('../models/Application');

// ── Shared Helper ─────────────────────────────────────────────────────────────
/**
 * Builds a MongoDB date range filter from ?from and ?to query params.
 * Both params are optional — if omitted the filter is open-ended on that side.
 *
 * @param {string} from - ISO date string (e.g. "2026-01-01")
 * @param {string} to   - ISO date string (e.g. "2026-03-01")
 * @param {string} [field='createdAt'] - The document field to filter on
 * @returns {Object} MongoDB $gte / $lte filter object, or {} if no params
 */
function buildDateFilter(from, to, field = 'createdAt') {
    const filter = {};
    if (from || to) {
        filter[field] = {};
        if (from) filter[field].$gte = new Date(from);
        if (to) {
            // Make `to` inclusive for the full day by setting time to end of day
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            filter[field].$lte = toDate;
        }
    }
    return filter;
}

// ── Existing Endpoints (now accept ?from & ?to) ───────────────────────────────

/**
 * @desc    Get high-level overview metrics
 * @route   GET /api/v1/analytics/overview?from=&to=
 * @access  Private/Admin
 */
exports.getOverviewStats = async (req, res) => {
    try {
        const dateFilter = buildDateFilter(req.query.from, req.query.to);

        const [totalStudents, totalRecruiters, activeJobs, totalApplications] = await Promise.all([
            Student.countDocuments({ status: 'APPROVED', ...dateFilter }),
            Recruiter.countDocuments({ status: 'APPROVED', ...dateFilter }),
            Job.countDocuments({ status: 'ACTIVE', ...buildDateFilter(req.query.from, req.query.to) }),
            Application.countDocuments(dateFilter)
        ]);

        res.status(200).json({
            success: true,
            dateRange: { from: req.query.from || null, to: req.query.to || null },
            data: { totalStudents, totalRecruiters, activeJobs, totalApplications }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get placement success metrics
 * @route   GET /api/v1/analytics/placements?from=&to=
 * @access  Private/Admin
 */
exports.getPlacementStats = async (req, res) => {
    try {
        const dateFilter = buildDateFilter(req.query.from, req.query.to);

        const [placedStudents, totalApprovedStudents] = await Promise.all([
            Application.distinct('student_id', { status: 'SELECTED', ...dateFilter }),
            Student.countDocuments({ status: 'APPROVED', ...dateFilter })
        ]);

        const totalPlacedCount = placedStudents.length;
        const placementRate = totalApprovedStudents > 0
            ? ((totalPlacedCount / totalApprovedStudents) * 100).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            dateRange: { from: req.query.from || null, to: req.query.to || null },
            data: {
                totalPlaced: totalPlacedCount,
                placementRate: parseFloat(placementRate),
                totalEligibleStudents: totalApprovedStudents
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get placement statistics grouped by branch
 * @route   GET /api/v1/analytics/branch-placements?from=&to=
 * @access  Private/Admin
 */
exports.getBranchPlacementStats = async (req, res) => {
    try {
        const dateFilter = buildDateFilter(req.query.from, req.query.to);

        const branchStats = await Student.aggregate([
            { $match: { status: 'APPROVED', ...dateFilter } },
            {
                $lookup: {
                    from: 'applications',
                    localField: '_id',
                    foreignField: 'student_id',
                    as: 'applications'
                }
            },
            { $addFields: { isPlaced: { $in: ['SELECTED', '$applications.status'] } } },
            {
                $group: {
                    _id: '$branch',
                    totalStudents: { $sum: 1 },
                    placedStudents: { $sum: { $cond: [{ $eq: ['$isPlaced', true] }, 1, 0] } }
                }
            },
            {
                $project: {
                    branch: '$_id', _id: 0,
                    totalStudents: 1, placedStudents: 1,
                    placementRate: {
                        $round: [
                            { $multiply: [{ $divide: ['$placedStudents', '$totalStudents'] }, 100] }, 2
                        ]
                    }
                }
            },
            { $sort: { placementRate: -1 } }
        ]);

        res.status(200).json({
            success: true,
            dateRange: { from: req.query.from || null, to: req.query.to || null },
            data: branchStats
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get top recruiting companies based on hires
 * @route   GET /api/v1/analytics/top-companies?from=&to=&limit=10
 * @access  Private/Admin
 */
exports.getTopCompanies = async (req, res) => {
    try {
        const dateFilter = buildDateFilter(req.query.from, req.query.to);
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

        const topCompanies = await Application.aggregate([
            { $match: { status: 'SELECTED', ...dateFilter } },
            { $lookup: { from: 'jobs', localField: 'job_id', foreignField: '_id', as: 'jobDetails' } },
            { $unwind: '$jobDetails' },
            { $group: { _id: '$jobDetails.company_name', totalHires: { $sum: 1 } } },
            { $project: { company_name: '$_id', totalHires: 1, _id: 0 } },
            { $sort: { totalHires: -1 } },
            { $limit: limit }
        ]);

        res.status(200).json({
            success: true,
            dateRange: { from: req.query.from || null, to: req.query.to || null },
            data: topCompanies
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── New Endpoints ─────────────────────────────────────────────────────────────

/**
 * @desc    Monthly trend data for line charts (applications + placements per month)
 * @route   GET /api/v1/analytics/trends?from=2026-01-01&to=2026-12-31
 * @access  Private/Admin
 */
exports.getTrends = async (req, res) => {
    try {
        // Default: last 12 months
        const to = req.query.to ? new Date(req.query.to) : new Date();
        const from = req.query.from
            ? new Date(req.query.from)
            : new Date(new Date().setFullYear(new Date().getFullYear() - 1));

        const dateMatch = { createdAt: { $gte: from, $lte: to } };

        // Run both aggregations in parallel
        const [applicationTrend, placementTrend, jobTrend, registrationTrend] = await Promise.all([
            // Applications submitted per month
            Application.aggregate([
                { $match: dateMatch },
                {
                    $group: {
                        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),

            // Placements (SELECTED status) per month
            Application.aggregate([
                { $match: { status: 'SELECTED', ...dateMatch } },
                {
                    $group: {
                        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),

            // Jobs posted per month
            Job.aggregate([
                { $match: dateMatch },
                {
                    $group: {
                        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),

            // Student registrations per month
            Student.aggregate([
                { $match: dateMatch },
                {
                    $group: {
                        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);

        // Normalize all series into { label: "Jan 2026", count: N } format
        const normalize = (series) =>
            series.map(({ _id, count }) => ({
                label: `${getMonthName(_id.month)} ${_id.year}`,
                year: _id.year,
                month: _id.month,
                count
            }));

        res.status(200).json({
            success: true,
            dateRange: { from: from.toISOString(), to: to.toISOString() },
            data: {
                applications: normalize(applicationTrend),
                placements: normalize(placementTrend),
                jobsPosted: normalize(jobTrend),
                studentRegistrations: normalize(registrationTrend)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Application pipeline funnel breakdown
 * @route   GET /api/v1/analytics/funnel?from=&to=
 * @access  Private/Admin
 *
 * Returns counts at each stage of the application pipeline:
 * SUBMITTED → REVIEWED → SHORTLISTED → SELECTED (and REJECTED at each stage)
 */
exports.getFunnel = async (req, res) => {
    try {
        const dateFilter = buildDateFilter(req.query.from, req.query.to);

        const statusCounts = await Application.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Reshape into a named map
        const map = {};
        statusCounts.forEach(({ _id, count }) => { map[_id] = count; });

        const total = Object.values(map).reduce((a, b) => a + b, 0);

        const stages = ['SUBMITTED', 'REVIEWED', 'SHORTLISTED', 'SELECTED', 'REJECTED'];
        const funnel = stages.map(stage => ({
            stage,
            count: map[stage] || 0,
            percent: total > 0 ? parseFloat(((map[stage] || 0) / total * 100).toFixed(1)) : 0
        }));

        res.status(200).json({
            success: true,
            dateRange: { from: req.query.from || null, to: req.query.to || null },
            data: { total, funnel }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Utility ───────────────────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function getMonthName(monthNumber) { return MONTHS[monthNumber - 1] || '?'; }
