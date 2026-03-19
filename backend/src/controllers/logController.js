const Log = require('../models/Log');
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Admin = require('../models/Admin');

// ── Helpers ───────────────────────────────────────────────────────────────────
const PAGE_DEFAULT = 1;
const LIMIT_DEFAULT = 25;
const LIMIT_MAX = 100;

/** Build a MongoDB filter from common query params */
function buildFilter(query) {
    const filter = {};

    // Filter by user
    if (query.user_id) filter.user_id = query.user_id;
    if (query.user_role) filter.user_role = query.user_role.toUpperCase();
    if (query.target_id) filter.target_id = query.target_id;

    // Filter by action (exact or partial match)
    if (query.action) {
        filter.action = { $regex: query.action.toUpperCase(), $options: 'i' };
    }

    // Filter by IP
    if (query.ip) filter.ip_address = query.ip;

    // Date range on created_at
    if (query.from || query.to) {
        filter.created_at = {};
        if (query.from) filter.created_at.$gte = new Date(query.from);
        if (query.to) {
            const to = new Date(query.to);
            to.setHours(23, 59, 59, 999);
            filter.created_at.$lte = to;
        }
    }

    // Free-text search across description + action
    if (query.search) {
        const re = { $regex: query.search, $options: 'i' };
        filter.$or = [{ description: re }, { action: re }];
    }

    return filter;
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * @desc    Get paginated, filterable activity feed
 * @route   GET /api/v1/logs
 * @access  Private / Admin (requires view_logs permission)
 *
 * Query params:
 *   page, limit, user_id, user_role, action, target_id,
 *   from, to, search, ip, sort (default: -created_at)
 */
exports.getLogs = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || PAGE_DEFAULT);
        const limit = Math.min(LIMIT_MAX, parseInt(req.query.limit, 10) || LIMIT_DEFAULT);
        const skip = (page - 1) * limit;
        const sort = req.query.sort ? req.query.sort.replace(',', ' ') : '-created_at';

        const filter = buildFilter(req.query);

        const [logs, total] = await Promise.all([
            Log.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Log.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            pagination: {
                page, limit, total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            filters: {
                user_id: req.query.user_id || null,
                user_role: req.query.user_role || null,
                action: req.query.action || null,
                from: req.query.from || null,
                to: req.query.to || null,
                search: req.query.search || null
            },
            count: logs.length,
            data: logs
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get a single log entry by ID
 * @route   GET /api/v1/logs/:id
 * @access  Private / Admin
 */
exports.getLogById = async (req, res, next) => {
    try {
        const log = await Log.findById(req.params.id).lean();
        if (!log) return res.status(404).json({ success: false, message: 'Log entry not found' });

        // Enrich with actor identity
        const actor = await resolveActor(log.user_id, log.user_role);
        res.status(200).json({ success: true, data: { ...log, actor } });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get action-type frequency breakdown + recent activity
 * @route   GET /api/v1/logs/stats
 * @access  Private / Admin
 *
 * Returns:
 *  - actionBreakdown: { action, count }[]
 *  - roleBreakdown:   { role, count }[]
 *  - dailyActivity:   { date, count }[]  (last 30 days)
 *  - topUsers:        { user_id, user_role, count }[]
 */
exports.getLogStats = async (req, res, next) => {
    try {
        const dateFilter = buildFilter(req.query);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [actionBreakdown, roleBreakdown, dailyActivity, topUsers] = await Promise.all([

            // Count by action type
            Log.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $project: { action: '$_id', count: 1, _id: 0 } },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]),

            // Count by user role
            Log.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$user_role', count: { $sum: 1 } } },
                { $project: { role: '$_id', count: 1, _id: 0 } },
                { $sort: { count: -1 } }
            ]),

            // Daily activity — last 30 days
            Log.aggregate([
                { $match: { created_at: { $gte: thirtyDaysAgo }, ...dateFilter } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$created_at' },
                            month: { $month: '$created_at' },
                            day: { $dayOfMonth: '$created_at' }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: {
                                    $dateFromParts: {
                                        year: '$_id.year', month: '$_id.month', day: '$_id.day'
                                    }
                                }
                            }
                        },
                        count: 1
                    }
                },
                { $sort: { date: 1 } }
            ]),

            // Top 10 most active users
            Log.aggregate([
                { $match: dateFilter },
                { $group: { _id: { user_id: '$user_id', user_role: '$user_role' }, count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
                {
                    $project: {
                        _id: 0,
                        user_id: '$_id.user_id',
                        user_role: '$_id.user_role',
                        count: 1
                    }
                }
            ])
        ]);

        res.status(200).json({
            success: true,
            dateRange: { from: req.query.from || null, to: req.query.to || null },
            data: { actionBreakdown, roleBreakdown, dailyActivity, topUsers }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get the audit trail for a specific user
 * @route   GET /api/v1/logs/user/:userId
 * @access  Private / Admin
 */
exports.getUserActivityFeed = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || PAGE_DEFAULT);
        const limit = Math.min(LIMIT_MAX, parseInt(req.query.limit, 10) || LIMIT_DEFAULT);
        const skip = (page - 1) * limit;

        const filter = { user_id: req.params.userId };
        if (req.query.action) filter.action = { $regex: req.query.action, $options: 'i' };

        const [logs, total, actor] = await Promise.all([
            Log.find(filter).sort('-created_at').skip(skip).limit(limit).lean(),
            Log.countDocuments(filter),
            // Resolve who this user is
            Log.findOne({ user_id: req.params.userId }).lean().then(
                l => l ? resolveActor(l.user_id, l.user_role) : null
            )
        ]);

        res.status(200).json({
            success: true,
            actor,
            pagination: {
                page, limit, total,
                totalPages: Math.ceil(total / limit)
            },
            count: logs.length,
            data: logs
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get the combined activity timeline for a user (Actor OR Target)
 * @route   GET /api/v1/logs/user/:userId/timeline
 * @access  Private / Admin
 */
exports.getUserTimeline = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const page = Math.max(1, parseInt(req.query.page, 10) || PAGE_DEFAULT);
        const limit = Math.min(LIMIT_MAX, parseInt(req.query.limit, 10) || LIMIT_DEFAULT);
        const skip = (page - 1) * limit;

        const filter = {
            $or: [
                { user_id: userId },
                { target_id: userId }
            ]
        };

        const [logs, total] = await Promise.all([
            Log.find(filter).sort('-created_at').skip(skip).limit(limit).lean(),
            Log.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            pagination: {
                page, limit, total,
                totalPages: Math.ceil(total / limit)
            },
            count: logs.length,
            data: logs
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Log a PII "Reveal" action for audit purposes
 * @route   POST /api/v1/logs/pii-access
 * @access  Private / Admin
 */
exports.logPIIAccess = async (req, res, next) => {
    try {
        const { target_id, target_role, pii_field, reason } = req.body;

        await Log.create({
            user_id: req.user.id,
            user_role: req.user.role,
            action: 'PII_REVEAL',
            target_id,
            target_role,
            description: `Accessed PII field [${pii_field}] for ${target_role}. Reason: ${reason || 'Not specified'}`,
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        });

        res.status(201).json({ success: true, message: 'PII access logged' });
    } catch (err) {
        next(err);
    }
};

// ── Private Helpers ───────────────────────────────────────────────────────────
/** Fetches actor display info (name + email) based on user_id + user_role */
async function resolveActor(userId, userRole) {
    try {
        const select = 'name email company_name';
        let actor = null;
        if (userRole === 'STUDENT') actor = await Student.findById(userId).select(select).lean();
        if (userRole === 'RECRUITER') actor = await Recruiter.findById(userId).select(select).lean();
        if (userRole === 'ADMIN') actor = await Admin.findById(userId).select(select).lean();
        return actor || null;
    } catch {
        return null;
    }
}
