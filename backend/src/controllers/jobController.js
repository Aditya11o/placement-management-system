const Job = require('../models/Job');
const Recruiter = require('../models/Recruiter');
const Application = require('../models/Application');
const Log = require('../models/Log');
const { calculateMatchScore } = require('../services/matchingService');
const { dispatchToRole } = require('../services/notifyDispatcher');
const { clearCache } = require('../middlewares/cacheMiddleware');
const { checkEligibility } = require('../services/eligibilityService');

exports.createJob = async (req, res) => {
    try {
        // Automatically inject recruiter's id and company name from standard token fields
        const jobData = { ...req.body };
        delete jobData.is_approved;
        delete jobData.is_featured;

        // Ensure package_lpa is set for compatibility
        if (jobData.salary_max && !jobData.package_lpa) {
            jobData.package_lpa = jobData.salary_max;
        }

        const recruiter = await Recruiter.findById(req.user._id);
        if (!recruiter.company_id) {
            return res.status(400).json({ success: false, message: 'Recruiter must be linked to a company to post jobs.' });
        }

        const job = await Job.create({
            ...jobData,
            recruiter_id: req.user._id,
            company_name: recruiter.company_name,
            company_id: recruiter.company_id
        });

        await Log.create({
            user_id: req.user._id,
            user_role: 'RECRUITER',
            action: 'CREATE_JOB',
            target_id: job._id
        });

        await clearCache('/api/v1/jobs');

        // 🚀 Broadcast to all students — new opportunity available
        dispatchToRole('STUDENT', 'new_job_posted', {
            jobId: job._id,
            title: job.title,
            company: job.company_name,
            deadline: job.deadline,
            timestamp: new Date()
        });

        res.status(201).json({ success: true, data: job });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all jobs for logged in recruiter (Shared Company Workspace)
// @route   GET /api/v1/jobs/recruiter
// @access  Private (Recruiter)
exports.getRecruiterJobs = async (req, res) => {
    try {
        const recruiter = await Recruiter.findById(req.user._id);
        if (!recruiter.company_id) {
            return res.status(200).json({ success: true, data: [] });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await Job.countDocuments({ company_id: recruiter.company_id });
        const jobs = await Job.find({ company_id: recruiter.company_id })
            .sort('-created_at')
            .skip(startIndex)
            .limit(limit)
            .lean();

        // --- Optimization: Prevent N+1 Query ---
        // Instead of counting applications for each job in a loop (Standard N+1 issue),
        // we use a single aggregation to get counts for all fetched jobs at once.

        const jobIds = jobs.map(job => job._id);

        const counts = await Application.aggregate([
            { $match: { job_id: { $in: jobIds } } },
            { $group: { _id: '$job_id', count: { $sum: 1 } } }
        ]);

        // Map counts back to jobs
        const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));
        const jobsWithCount = jobs.map(job => ({
            ...job,
            applicationCount: countMap.get(job._id.toString()) || 0
        }));
        // ---------------------------------------

        res.status(200).json({ 
            success: true, 
            count: jobsWithCount.length,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: jobsWithCount 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update job
// @route   PUT /api/v1/jobs/:id
// @access  Private (Recruiter)
exports.updateJob = async (req, res) => {
    try {
        const recruiter = await Recruiter.findById(req.user._id);
        let job = await Job.findById(req.params.id);

        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        // Check ownership (must belong to the same company)
        if (job.company_id.toString() !== recruiter.company_id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this job' });
        }

        const updateData = { ...req.body };
        
        // Prevent manual reactivation if deadline is passed
        if (updateData.status === 'ACTIVE') {
            const newDeadline = updateData.deadline ? new Date(updateData.deadline) : new Date(job.deadline);
            if (newDeadline < new Date()) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cannot set job to ACTIVE with a past deadline. Please extend the deadline first.' 
                });
            }
        }

        delete updateData.is_approved;
        delete updateData.is_featured;

        job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

        await Log.create({
            user_id: req.user._id,
            user_role: 'RECRUITER',
            action: 'UPDATE_JOB',
            target_id: job._id
        });

        await clearCache('/api/v1/jobs');

        res.json({ success: true, data: job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



// Eligibility Engine: Get jobs student is allowed to apply for
exports.getEligibleJobs = async (req, res, next) => {
    try {
        const student = req.user;

        // We only want to evaluate ACTIVE and APPROVED jobs.
        req.advancedFilter = { status: 'ACTIVE', is_approved: true };

        // Extract data passed by advancedResults
        const allJobs = res.advancedResults.data;

        // Advanced Eligibility Engine Filtering
        const filteredJobs = allJobs.filter(job => {
            const result = checkEligibility(student, job);
            return result.isEligible;
        });

        // Update the advancedResults payload
        res.advancedResults.data = filteredJobs;
        res.advancedResults.count = filteredJobs.length;

        // Send modified payload
        res.status(200).json(res.advancedResults);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getJobById = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        let matchScore = null;
        if (req.user && req.user.role === 'STUDENT') {
            // Increment views atomically
            job = await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
            matchScore = await calculateMatchScore(req.user, job);
        }

        res.json({ success: true, matchScore, data: job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get top recommended jobs for a student
 * @route   GET /api/v1/jobs/recommended
 * @access  Private/Student
 */
exports.getRecommendedJobs = async (req, res) => {
    try {
        const student = req.user;
        // Cap job pool to 200 most recent active and approved jobs to avoid memory/API pressure
        const activeJobs = await Job.find({ status: 'ACTIVE', is_approved: true }).sort({ created_at: -1 }).limit(200);

        const scoredJobs = await Promise.all(activeJobs.map(async job => {
            const score = await calculateMatchScore(student, job);
            return {
                ...job.toObject(),
                matchScore: score
            };
        }));

        // Sort descending by score
        scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

        // Return top 5
        const topJobs = scoredJobs.slice(0, 5);

        res.status(200).json({
            success: true,
            count: topJobs.length,
            data: topJobs
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
