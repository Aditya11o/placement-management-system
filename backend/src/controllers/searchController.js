const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Job = require('../models/Job');

/**
 * @desc    Global unified search for students, recruiters, and jobs
 * @route   GET /api/v1/search
 * @access  Private
 */
exports.globalSearch = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(200).json({ success: true, data: [] });
        }

        const regex = new RegExp(q, 'i');

        // Search in parallel for performance
        const [students, recruiters, jobs] = await Promise.all([
            Student.find({
                $or: [
                    { name: regex },
                    { email: regex }
                ]
            }).select('name email profile_image_url').limit(5),

            Recruiter.find({
                $or: [
                    { company_name: regex },
                    { contact_person: regex }
                ]
            }).select('company_name contact_person email profile_image_url').limit(5),

            Job.find({
                $or: [
                    { title: regex },
                    { company_name: regex }
                ]
            }).select('title company_name status').limit(5)
        ]);

        // Format results for a unified structure
        const results = [
            ...students.map(s => ({
                id: s._id,
                type: 'student',
                label: s.name,
                sublabel: s.email,
                image: s.profile_image_url,
                category: 'Students'
            })),
            ...recruiters.map(r => ({
                id: r._id,
                type: 'recruiter',
                label: r.company_name,
                sublabel: r.contact_person,
                image: r.profile_image_url,
                category: 'Companies'
            })),
            ...jobs.map(j => ({
                id: j._id,
                type: 'job',
                label: j.title,
                sublabel: j.company_name,
                status: j.status,
                category: 'Jobs'
            }))
        ];

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (err) {
        next(err);
    }
};
