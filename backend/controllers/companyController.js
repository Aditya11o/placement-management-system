const prisma = require('../utils/prisma');

// @desc    Get detailed scorecard for a specific company
// @route   GET /api/companies/:name/scorecard
// @access  Private
const getCompanyScorecard = async (req, res, next) => {
  try {
    const { name } = req.params;

    // 1. Fetch all jobs for this company
    const jobs = await prisma.job.findMany({
      where: { companyName: { equals: name, mode: 'insensitive' } },
      include: {
        applications: {
          select: { status: true, studentId: true }
        }
      }
    });

    // 2. Fetch all experiences (reviews) for this company
    const experiences = await prisma.experience.findMany({
      where: { companyName: { equals: name, mode: 'insensitive' } },
      select: { difficulty: true, createdAt: true, title: true, experienceType: true }
    });

    if (jobs.length === 0 && experiences.length === 0) {
      return res.status(404).json({ message: 'No data found for this company.' });
    }

    // 3. Aggregate Hiring Data
    let totalApplications = 0;
    let totalSelected = 0;
    let salarySum = 0;
    let salaryCount = 0;
    const skillsMap = {};
    const branchMap = {};

    jobs.forEach(job => {
      totalApplications += job.applications.length;
      
      // Skills aggregation
      job.requiredSkills.forEach(skill => {
        skillsMap[skill] = (skillsMap[skill] || 0) + 1;
      });

      job.applications.forEach(app => {
        if (['Selected', 'Accepted', 'Placed'].includes(app.status)) {
          totalSelected++;
          
          // Add to salary if digit
          const salaryVal = parseFloat(job.salary.replace(/[^0-9.]/g, ''));
          if (!isNaN(salaryVal)) {
            salarySum += salaryVal;
            salaryCount++;
          }
        }
      });
    });

    // 4. Aggregate Difficulty Data
    const difficultyCounts = { 'Easy': 0, 'Medium': 0, 'Hard': 0 };
    experiences.forEach(exp => {
      if (difficultyCounts[exp.difficulty] !== undefined) {
        difficultyCounts[exp.difficulty]++;
      }
    });

    // 5. Final Calculations
    const selectionRate = totalApplications > 0 ? (totalSelected / totalApplications) * 100 : 0;
    const avgSalary = salaryCount > 0 ? salarySum / salaryCount : 0;

    // Sort Top Skills
    const topSkills = Object.entries(skillsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    res.json({
      companyName: name,
      stats: {
        totalJobs: jobs.length,
        totalApplications,
        totalSelected,
        selectionRate: selectionRate.toFixed(1),
        avgSalary: avgSalary.toFixed(2),
        difficulty: difficultyCounts,
        totalReviews: experiences.length
      },
      topSkills,
      recentReviews: experiences.slice(0, 3)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of companies with basic stats
// @route   GET /api/companies/list
// @access  Private
const getCompanyList = async (req, res, next) => {
  try {
    // Group all jobs by company name to get the unique list
    const companies = await prisma.job.groupBy({
      by: ['companyName'],
      _count: {
        id: true,
        applications: true
      },
      orderBy: {
        companyName: 'asc'
      }
    });

    // Enrich with logo from RecruiterProfile if available
    const enriched = await Promise.all(companies.map(async (c) => {
      const recruiter = await prisma.recruiterProfile.findFirst({
        where: { companyName: { equals: c.companyName, mode: 'insensitive' } },
        select: { companyLogo: true }
      });

      return {
        name: c.companyName,
        jobCount: c._count.id,
        logo: recruiter?.companyLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${c.companyName}`
      };
    }));

    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanyScorecard,
  getCompanyList
};
