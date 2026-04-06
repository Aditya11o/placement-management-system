const prisma = require('../utils/prisma');

// @desc    Get all audit logs (Admin only)
// @route   GET /api/audit
// @access  Private/Admin
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs.map(log => ({ ...log, _id: log.id, admin: log.user })));
  } catch (error) {
    next(error);
  }
};

// Utility function to create a log entry
const createAuditLog = async (userId, action, targetType, targetId, details, ipAddress) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress
      }
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

module.exports = { getAuditLogs, createAuditLog };
