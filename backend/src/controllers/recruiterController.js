const Recruiter = require('../models/Recruiter');
const Job = require('../models/Job');
const Application = require('../models/Application');
const logger = require('../utils/logger');

/**
 * @desc    Get detailed recruiter performance analytics for Admin
 * @route   GET /api/v1/admin/recruiters/performance
 * @access  Private/Admin
 */
exports.getRecruiterPerformance = async (req, res, next) => {
    try {
        const recruiters = await Recruiter.find({ status: 'APPROVED' })
            .select('company_name contact_person email logo_url created_at')
            .lean();

        const performanceData = await Promise.all(recruiters.map(async (r) => {
            // 1. Basic Stats
            const jobs = await Job.find({ recruiter_id: r._id }).select('_id status created_at').lean();
            const jobIds = jobs.map(j => j._id);
            
            const applications = await Application.find({ job_id: { $in: jobIds } }).select('status applied_at updated_at').lean();
            
            const totalOffers = applications.filter(a => a.status === 'SELECTED').length;
            const totalInterviews = applications.filter(a => ['INTERVIEWING', 'SHORTLISTED', 'SELECTED'].includes(a.status)).length;
            
            // 2. Calculate Velocity (Average time to Hire)
            const hires = applications.filter(a => a.status === 'SELECTED');
            let avgHiringDays = 0;
            if (hires.length > 0) {
                const totalDays = hires.reduce((acc, h) => {
                    const diff = new Date(h.updated_at) - new Date(h.applied_at);
                    return acc + (diff / (1000 * 60 * 60 * 24));
                }, 0);
                avgHiringDays = Math.round(totalDays / hires.length);
            }

            // 3. Heuristic Rating
            const conversionRate = totalInterviews > 0 ? Math.round((totalOffers / totalInterviews) * 100) : 0;
            
            // 4. Heuristic Persona (Non-AI)
            let personaType = 'Standard';
            let trait = 'Reliable Partner';
            let color = 'blue';

            if (conversionRate > 35 && avgHiringDays < 14) {
                personaType = 'High Velocity';
                trait = 'Fast Decision Maker';
                color = 'emerald';
            } else if (jobs.length > 5 && totalOffers > 10) {
                personaType = 'Volume Recruiter';
                trait = 'Strategic Talent Hub';
                color = 'indigo';
            } else if (conversionRate < 10 && jobs.length > 0) {
                personaType = 'Critical Reviewer';
                trait = 'Highly Selective';
                color = 'amber';
            }

            return {
                id: r._id,
                company: r.company_name,
                contact: r.contact_person,
                email: r.email,
                avatar: r.logo_url,
                stats: {
                    activeJobs: jobs.filter(j => j.status === 'ACTIVE').length,
                    totalHires: hires.length,
                    avgHiringDays: avgHiringDays || 'N/A',
                    conversionRate: `${conversionRate}%`
                },
                persona: {
                    type: personaType,
                    trait: trait,
                    color: color
                }
            };
        }));

        res.status(200).json({
            success: true,
            data: performanceData.sort((a, b) => b.stats.totalHires - a.stats.totalHires)
        });
    } catch (err) {
        next(err);
    }
};
