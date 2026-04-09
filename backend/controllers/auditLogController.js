const prisma = require('../utils/prisma');

/**
 * @desc    Helper to create an audit log
 * @param   {Object} params - Audit log parameters
 */
const createAuditLog = async ({ userId, action, type = 'GENERAL', targetId = null, targetType = null, details = null, ipAddress = null }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        type,
        targetId,
        targetType,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

// @desc    Get all audit logs (Admin only)
// @route   GET /api/audit
// @access  Private/Admin
const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, type, userId } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(limit),
        include: {
          user: {
            select: { name: true, email: true, role: true }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    // Adapt for frontend if needed (some views expect _id)
    const adaptedLogs = logs.map(log => ({
      ...log,
      _id: log.id,
      admin: log.user
    }));

    res.json({
      logs: adaptedLogs,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's audit logs
// @route   GET /api/audit/my
// @access  Private
const getMyAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (type) where.type = type;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(limit),
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      logs: logs.map(l => ({ ...l, _id: l.id })),
      page: Number(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  getMyAuditLogs
};
