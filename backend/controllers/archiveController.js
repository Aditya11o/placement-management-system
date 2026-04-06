const prisma = require('../utils/prisma');

// @desc    Archive current academic year
// @route   POST /api/admin/archive
// @access  Private/Admin
const archiveYear = async (req, res, next) => {
  try {
    const { academicYear } = req.body;
    const existing = await prisma.archive.findUnique({ where: { academicYear } });
    if (existing) return res.status(400).json({ message: 'Academic year already archived' });

    const [totalJobs, totalApplications, placedStudents] = await Promise.all([
      prisma.job.count(),
      prisma.application.count(),
      prisma.studentProfile.count({ where: { placementStatus: 'Placed' } })
    ]);

    const placedApps = await prisma.application.findMany({
      where: { status: 'Placed' },
      include: { job: { select: { salary: true } } }
    });

    const totalSalary = placedApps.reduce((sum, app) => sum + (app.job?.salary || 0), 0);
    const averageSalary = placedApps.length > 0 ? totalSalary / placedApps.length : 0;

    const companyStats = await prisma.job.groupBy({
      by: ['companyName'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });
    const topCompanies = companyStats.map(c => c.companyName);

    const archive = await prisma.archive.create({
      data: {
        academicYear,
        totalJobs,
        totalApplications,
        placedStudents,
        averageSalary,
        topCompanies,
        closedById: req.user.id
      }
    });

    res.status(201).json({ ...archive, _id: archive.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all archives
// @route   GET /api/admin/archives
// @access  Private/Admin
const getArchives = async (req, res, next) => {
  try {
    const archives = await prisma.archive.findMany({
      orderBy: { academicYear: 'desc' }
    });
    res.json(archives.map(a => ({ ...a, _id: a.id })));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  archiveYear,
  getArchives,
};
