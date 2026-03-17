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
 * @param {string} [field='created_at'] - The document field to filter on
 * @returns {Object} MongoDB $gte / $lte filter object, or {} if no params
 */
function buildDateFilter(from, to, field = 'created_at') {
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
exports.getOverviewStats = async (req, res, next) => {
    try {
        const dateFilter = buildDateFilter(req.query.from, req.query.to); // Defaults to created_at
        const appDateFilter = buildDateFilter(req.query.from, req.query.to, 'applied_at');

        const [totalStudents, totalRecruiters, activeJobs, totalApplications] = await Promise.all([
            Student.countDocuments({ status: 'APPROVED', ...dateFilter }),
            Recruiter.countDocuments({ status: 'APPROVED', ...dateFilter }),
            Job.countDocuments({ status: 'ACTIVE', ...dateFilter }),
            Application.countDocuments(appDateFilter)
        ]);

        res.status(200).json({
            success: true,
            dateRange: { from: req.query.from || null, to: req.query.to || null },
            data: { totalStudents, totalRecruiters, activeJobs, totalApplications }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get placement success metrics
 * @route   GET /api/v1/analytics/placements?from=&to=
 * @access  Private/Admin
 */
exports.getPlacementStats = async (req, res, next) => {
    try {
        const dateFilter = buildDateFilter(req.query.from, req.query.to);
        const appDateFilter = buildDateFilter(req.query.from, req.query.to, 'applied_at');

        const [placedStudents, totalApprovedStudents] = await Promise.all([
            Application.distinct('student_id', { status: 'SELECTED', ...appDateFilter }),
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
        next(err);
    }
};

/**
 * @desc    Get placement statistics grouped by branch
 * @route   GET /api/v1/analytics/branch-placements?from=&to=
 * @access  Private/Admin
 */
exports.getBranchPlacementStats = async (req, res, next) => {
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
        next(err);
    }
};

/**
 * @desc    Get top recruiting companies based on hires
 * @route   GET /api/v1/analytics/top-companies?from=&to=&limit=10
 * @access  Private/Admin
 */
exports.getTopCompanies = async (req, res, next) => {
    try {
        const appDateFilter = buildDateFilter(req.query.from, req.query.to, 'applied_at');
        const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

        const topCompanies = await Application.aggregate([
            { $match: { status: 'SELECTED', ...appDateFilter } },
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
        next(err);
    }
};

// ── New Endpoints ─────────────────────────────────────────────────────────────

/**
 * @desc    Monthly trend data for line charts (applications + placements per month)
 * @route   GET /api/v1/analytics/trends?from=2026-01-01&to=2026-12-31
 * @access  Private/Admin
 */
exports.getTrends = async (req, res, next) => {
    try {
        // Default: last 12 months
        const to = req.query.to ? new Date(req.query.to) : new Date();
        const from = req.query.from
            ? new Date(req.query.from)
            : new Date(new Date().setFullYear(new Date().getFullYear() - 1));

        const dateMatch = { created_at: { $gte: from, $lte: to } };
        const appDateMatch = { applied_at: { $gte: from, $lte: to } };

        // Run both aggregations in parallel
        const [applicationTrend, placementTrend, jobTrend, registrationTrend] = await Promise.all([
            // Applications submitted per month
            Application.aggregate([
                { $match: appDateMatch },
                {
                    $group: {
                        _id: { year: { $year: '$applied_at' }, month: { $month: '$applied_at' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),

            // Placements (SELECTED status) per month
            Application.aggregate([
                { $match: { status: 'SELECTED', ...appDateMatch } },
                {
                    $group: {
                        _id: { year: { $year: '$applied_at' }, month: { $month: '$applied_at' } },
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
                        _id: { year: { $year: '$created_at' }, month: { $month: '$created_at' } },
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
                        _id: { year: { $year: '$created_at' }, month: { $month: '$created_at' } },
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
        next(err);
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
exports.getFunnel = async (req, res, next) => {
    try {
        const appDateFilter = buildDateFilter(req.query.from, req.query.to, 'applied_at');

        const statusCounts = await Application.aggregate([
            { $match: appDateFilter },
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
        next(err);
    }
};

/**
 * @desc    Get salary distribution stats (Min/Max/Avg) grouped by branch
 * @route   GET /api/v1/analytics/salary-stats?from=&to=
 * @access  Private/Admin
 */
exports.getSalaryStats = async (req, res, next) => {
    try {
        const appDateFilter = buildDateFilter(req.query.from, req.query.to, 'applied_at');

        const salaryStats = await Application.aggregate([
            { $match: { status: 'SELECTED', ...appDateFilter } },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job_id',
                    foreignField: '_id',
                    as: 'job'
                }
            },
            { $unwind: '$job' },
            {
                $lookup: {
                    from: 'students',
                    localField: 'student_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $group: {
                    _id: '$student.branch',
                    minSalary: { $min: '$job.package_lpa' },
                    maxSalary: { $max: '$job.package_lpa' },
                    avgSalary: { $avg: '$job.package_lpa' },
                    placedCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    branch: '$_id',
                    _id: 0,
                    minSalary: { $round: ['$minSalary', 2] },
                    maxSalary: { $round: ['$maxSalary', 2] },
                    avgSalary: { $round: ['$avgSalary', 2] },
                    placedCount: 1
                }
            },
            { $sort: { avgSalary: -1 } }
        ]);

        res.status(200).json({
            success: true,
            dateRange: { from: req.query.from || null, to: req.query.to || null },
            data: salaryStats
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get predictive analytics (Rising Skills, Branch Demand)
 * @route   GET /api/v1/analytics/predictive
 * @access  Private/Admin
 */
exports.getPredictiveAnalytics = async (req, res, next) => {
    try {
        // 1. Rising Skills Aggregation
        // Unwinds the requirements array, lowercases and trims to avoid duplicates
        const risingSkillsArray = await Job.aggregate([
            { $match: { status: 'OPEN' } },
            { $unwind: { path: "$requirements", preserveNullAndEmptyArrays: false } }, // ignore empty
            {
                $group: {
                    _id: { $toLower: { $trim: { input: "$requirements" } } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const risingSkills = risingSkillsArray.map(skill => ({
            skill: skill._id,
            count: skill.count
        }));

        // 2. Branch Demand Aggregation
        // Unwinds eligible branch to count demand per branch
        const branchDemandArray = await Job.aggregate([
            { $match: { status: 'ACTIVE' } },
            { $group: { _id: "$eligible_branch", jobCount: { $sum: 1 } } },
            { $sort: { jobCount: -1 } }
        ]);

        const branchDemand = branchDemandArray.map(b => ({
            branch: b._id,
            jobCount: b.jobCount
        }));

        // 3. Mock Placement Probability Score
        // Demand vs Supply ratio = Active Jobs / Approved Students
        const totalApprovedStudents = await Student.countDocuments({ status: 'APPROVED' });
        const totalOpenJobs = await Job.countDocuments({ status: 'ACTIVE' });
        const demandSupplyRatio = totalApprovedStudents > 0
            ? (totalOpenJobs / totalApprovedStudents).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                risingSkills,
                branchDemand,
                metrics: {
                    demandSupplyRatio: parseFloat(demandSupplyRatio)
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Compare performance across graduation cohorts
 * @route   GET /api/v1/analytics/cohorts
 * @access  Private/Admin
 */
exports.getCohortAnalysis = async (req, res, next) => {
    try {
        const cohortStats = await Student.aggregate([
            { $match: { status: 'APPROVED' } },
            {
                $lookup: {
                    from: 'applications',
                    localField: '_id',
                    foreignField: 'student_id',
                    as: 'apps'
                }
            },
            {
                $project: {
                    graduation_year: 1,
                    isPlaced: { $in: ['SELECTED', '$apps.status'] },
                    // Get highest package if multiple selected apps exist
                    package: {
                        $max: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$apps',
                                        as: 'app',
                                        cond: { $eq: ['$$app.status', 'SELECTED'] }
                                    }
                                },
                                as: 'p',
                                in: '$$p.package_lpa' // Note: actually package_lpa is on Job, so we need extra lookup or assume it was copied to application
                            }
                        }
                    }
                }
            },
            // Since we need Job info for salary, let's do a better join
            { $unwind: { path: '$apps', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'apps.job_id',
                    foreignField: '_id',
                    as: 'jobInfo'
                }
            },
            { $unwind: { path: '$jobInfo', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { studentId: '$_id', year: '$graduation_year' },
                    isPlaced: { $max: { $cond: [{ $eq: ['$apps.status', 'SELECTED'] }, 1, 0] } },
                    maxSalary: { $max: { $cond: [{ $eq: ['$apps.status', 'SELECTED'] }, '$jobInfo.package_lpa', 0] } }
                }
            },
            {
                $group: {
                    _id: '$_id.year',
                    totalStudents: { $sum: 1 },
                    placedStudents: { $sum: '$isPlaced' },
                    avgSalary: { $avg: { $cond: [{ $gt: ['$maxSalary', 0] }, '$maxSalary', null] } }
                }
            },
            {
                $project: {
                    year: '$_id', _id: 0,
                    totalStudents: 1, placedCount: '$placedStudents',
                    placementRate: {
                        $round: [
                            { $multiply: [{ $divide: ['$placedStudents', '$totalStudents'] }, 100] }, 2
                        ]
                    },
                    avgSalary: { $round: ['$avgSalary', 2] }
                }
            },
            { $sort: { year: 1 } }
        ]);

        res.status(200).json({ success: true, data: cohortStats });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Analyze recruiter engagement and response behaviors
 * @route   GET /api/v1/analytics/engagement
 * @access  Private/Admin
 */
exports.getEngagementStats = async (req, res, next) => {
    try {
        const engagement = await Application.aggregate([
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job_id',
                    foreignField: '_id',
                    as: 'job'
                }
            },
            { $unwind: '$job' },
            {
                $group: {
                    _id: '$job.company_name',
                    totalApps: { $sum: 1 },
                    reviewedApps: {
                        $sum: { $cond: [{ $in: ['$status', ['REVIEWED', 'SHORTLISTED', 'SELECTED', 'REJECTED']] }, 1, 0] }
                    },
                    offeredApps: {
                        $sum: { $cond: [{ $eq: ['$status', 'SELECTED'] }, 1, 0] }
                    },
                    shortlistedApps: {
                        $sum: { $cond: [{ $in: ['$status', ['SHORTLISTED', 'SELECTED']] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    company: '$_id', _id: 0,
                    totalApps: 1,
                    responseRate: {
                        $round: [
                            { $multiply: [{ $divide: ['$reviewedApps', '$totalApps'] }, 100] }, 1
                        ]
                    },
                    offerRatio: {
                        $round: [
                            {
                                $multiply: [
                                    { $divide: ['$offeredApps', { $cond: [{ $gt: ['$shortlistedApps', 0] }, '$shortlistedApps', 1] }] },
                                    100
                                ]
                            }, 1
                        ]
                    }
                }
            },
            { $sort: { totalApps: -1 } },
            { $limit: 20 }
        ]);

        res.status(200).json({ success: true, data: engagement });
    } catch (err) {
        next(err);
    }
};

// ── Utility ───────────────────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function getMonthName(monthNumber) { return MONTHS[monthNumber - 1] || '?'; }

/**
 * @desc    Get detailed student placement readiness scoring
 * @route   GET /api/v1/analytics/placement-readiness
 * @access  Private/Admin
 */
exports.getPlacementReadiness = async (req, res, next) => {
    try {
        const students = await Student.aggregate([
            { $match: { status: 'APPROVED' } },
            {
                $lookup: {
                    from: 'applications',
                    localField: '_id',
                    foreignField: 'student_id',
                    as: 'apps'
                }
            },
            {
                $project: {
                    name: 1,
                    branch: 1,
                    cgpa: 1,
                    marks_10th: 1,
                    marks_12th: 1,
                    skills: 1,
                    resume_versions: 1,
                    apps: 1
                }
            }
        ]);

        const scoredStudents = students.map(s => {
            const resume_count = s.resume_versions?.length || 0;
            const total_apps = s.apps?.length || 0;
            const shortlisted_apps = s.apps?.filter(app => ['SHORTLISTED', 'SELECTED'].includes(app.status)).length || 0;

            // 1. Academic Strength (40%)
            const cgpaScore = (s.cgpa / 10) * 30; // 30 points
            const marksScore = ((s.marks_10th + s.marks_12th) / 200) * 10; // 10 points
            const academicTotal = cgpaScore + marksScore;

            // 2. Profile Maturity (30%)
            const resumeScore = resume_count > 0 ? 20 : 0; // 20 points
            const skillsScore = Math.min((s.skills?.length || 0) * 2, 10); // 2 pts per skill, max 10
            const profileTotal = resumeScore + skillsScore;

            // 3. Engagement (30%)
            const appRatio = total_apps > 0 ? (shortlisted_apps / total_apps) : 0;
            const engagementTotal = Math.min(appRatio * 30, 30); // 30 points

            const totalScore = Math.round(academicTotal + profileTotal + engagementTotal);

            let category = 'Low';
            if (totalScore >= 80) category = 'High';
            else if (totalScore >= 50) category = 'Moderate';

            return {
                id: s._id,
                name: s.name,
                branch: s.branch,
                score: totalScore,
                category
            };
        });

        const distribution = {
            High: scoredStudents.filter(s => s.category === 'High').length,
            Moderate: scoredStudents.filter(s => s.category === 'Moderate').length,
            Low: scoredStudents.filter(s => s.category === 'Low').length
        };

        const topLeads = scoredStudents
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                distribution,
                topLeads,
                totalAnalyzed: scoredStudents.length
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get placement comparison across multiple graduation years (seasons)
 * @route   GET /api/v1/analytics/seasons
 * @access  Private/Admin
 */
exports.getSeasonComparison = async (req, res, next) => {
    try {
        const seasonStats = await Student.aggregate([
            { $match: { status: 'APPROVED' } },
            {
                $lookup: {
                    from: 'applications',
                    localField: '_id',
                    foreignField: 'student_id',
                    as: 'apps',
                    pipeline: [
                        { $match: { status: 'SELECTED' } }
                    ]
                }
            },
            {
                $group: {
                    _id: '$studentProfile.graduation_year',
                    totalStudents: { $sum: 1 },
                    placedStudents: { $sum: { $cond: [{ $gt: [{ $size: '$apps' }, 0] }, 1, 0] } }
                }
            },
            {
                $project: {
                    season: '$_id',
                    totalStudents: 1,
                    placedStudents: 1,
                    placementRate: {
                        $round: [
                            {
                                $multiply: [
                                    { $divide: ['$placedStudents', { $cond: [{ $gt: ['$totalStudents', 0] }, '$totalStudents', 1] }] },
                                    100
                                ]
                            },
                            2
                        ]
                    },
                    _id: 0
                }
            },
            { $sort: { season: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: seasonStats
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Identify at-risk students based on engagement/academic metrics
 * @route   GET /api/v1/analytics/risk-assessment
 * @access  Private/Admin
 */
exports.getRiskAssessment = async (req, res, next) => {
    try {
        const students = await Student.aggregate([
            { $match: { status: 'APPROVED' } },
            {
                $lookup: {
                    from: 'applications',
                    localField: '_id',
                    foreignField: 'student_id',
                    as: 'apps'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    branch: 1,
                    cgpa: 1,
                    resume_versions: 1,
                    applicationsCount: { $size: '$apps' },
                    rejectionsCount: {
                        $size: {
                            $filter: {
                                input: '$apps',
                                as: 'app',
                                cond: { $eq: ['$$app.status', 'REJECTED'] }
                            }
                        }
                    },
                    isPlaced: { $in: ['SELECTED', '$apps.status'] }
                }
            }
        ]);

        const atRiskStudents = students.filter(s => !s.isPlaced).map(s => {
            const riskFactors = [];
            let riskScore = 0;

            if (s.cgpa < 6.5) {
                riskFactors.push('Low academic performance (CGPA < 6.5)');
                riskScore += 40;
            }
            if ((s.resume_versions?.length || 0) === 0) {
                riskFactors.push('No resume uploaded');
                riskScore += 30;
            }
            if (s.applicationsCount === 0) {
                riskFactors.push('Zero job applications');
                riskScore += 20;
            }
            if (s.rejectionsCount >= 5) {
                riskFactors.push(`High rejection rate (${s.rejectionsCount} rejections)`);
                riskScore += 10;
            }

            return {
                id: s._id,
                name: s.name,
                email: s.email,
                branch: s.branch,
                riskScore,
                riskFactors,
                level: riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'MEDIUM' : 'LOW'
            };
        }).filter(s => s.riskScore > 0).sort((a, b) => b.riskScore - a.riskScore);

        res.status(200).json({
            success: true,
            data: atRiskStudents.slice(0, 20) // Top 20 at-risk
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get geographic distribution of job offers
 * @route   GET /api/v1/analytics/geography
 * @access  Private/Admin
 */
exports.getGeographicStats = async (req, res, next) => {
    try {
        const geoStats = await Job.aggregate([
            { $match: { status: 'ACTIVE' } },
            {
                $group: {
                    _id: '$location',
                    count: { $sum: 1 },
                    avgPackage: { $avg: '$package_lpa' }
                }
            },
            {
                $project: {
                    location: '$_id',
                    count: 1,
                    avgPackage: { $round: ['$avgPackage', 1] },
                    _id: 0
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: geoStats
        });
    } catch (err) {
        next(err);
    }
};
const aiService = require('../services/aiService');

/**
 * @desc    Get extended dashboard stats (Growth Index, Response Velocity, etc.)
 * @route   GET /api/v1/analytics/dashboard-extended
 * @access  Private/Admin
 */
exports.getDashboardExtendedStats = async (req, res, next) => {
    try {
        // 1. Calculate Growth Index (User registration growth vs last month)
        const startOfCurrentMonth = new Date();
        startOfCurrentMonth.setDate(1);
        startOfCurrentMonth.setHours(0, 0, 0, 0);

        const startOfLastMonth = new Date(startOfCurrentMonth);
        startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

        const [currMonthStudents, lastMonthStudents] = await Promise.all([
            Student.countDocuments({ created_at: { $gte: startOfCurrentMonth } }),
            Student.countDocuments({ created_at: { $gte: startOfLastMonth, $lt: startOfCurrentMonth } })
        ]);

        const growthIndex = lastMonthStudents > 0 
            ? (((currMonthStudents - lastMonthStudents) / lastMonthStudents) * 100).toFixed(1)
            : (currMonthStudents > 0 ? 100 : 0);

        // 2. Calculate Response Velocity (Average time from SUBMITTED to REVIEWED/REJECTED)
        const reviewedApps = await Application.find({ 
            status: { $ne: 'SUBMITTED' },
            updated_at: { $exists: true }
        }).select('applied_at updated_at').limit(100);

        let totalVelocity = 0;
        reviewedApps.forEach(app => {
            const diff = new Date(app.updated_at) - new Date(app.applied_at);
            totalVelocity += diff;
        });

        const avgVelocityHours = reviewedApps.length > 0 
            ? (totalVelocity / reviewedApps.length / (1000 * 60 * 60)).toFixed(1)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                growthIndex: parseFloat(growthIndex),
                responseVelocity: `${avgVelocityHours}h`,
                activePulse: Math.floor(Math.random() * 20) + 10 // Mock real-time pulse for effect
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Generate AI-driven strategic insights for dashboard
 * @route   GET /api/v1/analytics/ai-insights
 * @access  Private/Admin
 */
exports.getAIStrategicInsights = async (req, res, next) => {
    try {
        // Collect core stats for context
        const [overview, predictive, funnel] = await Promise.all([
            Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Job.aggregate([{ $match: { status: 'ACTIVE' } }, { $group: { _id: '$eligible_branch', count: { $sum: 1 } } }]),
            Application.aggregate([
                { $match: { status: 'SELECTED' } },
                { $lookup: { from: 'jobs', localField: 'job_id', foreignField: '_id', as: 'job' } },
                { $unwind: '$job' },
                { $group: { _id: null, avgLpa: { $avg: '$job.package_lpa' } } }
            ])
        ]);

        const dataContext = {
            applicationsByStatus: overview,
            jobsByBranch: predictive,
            averagePackage: funnel[0]?.avgLpa || 0
        };

        const insights = await aiService.generateStrategicInsights(dataContext);

        res.status(200).json({
            success: true,
            data: insights
        });
    } catch (err) {
        next(err);
    }
};
