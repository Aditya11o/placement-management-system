const Job = require('../models/Job');
const Log = require('../models/Log');
const { calculateMatchScore } = require('../services/matchingService');
const { dispatchToRole } = require('../services/notifyDispatcher');

exports.createJob = async (req, res) => {
    try {
        // Automatically inject recruiter's id and company name from standard token fields
        const job = await Job.create({
            ...req.body,
            recruiter_id: req.user._id,
            company_name: req.user.company_name
        });

        await Log.create({
            user_id: req.user._id,
            user_role: 'RECRUITER',
            action: 'CREATE_JOB',
            target_id: job._id
        });

        const { clearCache } = require('../middlewares/cacheMiddleware');
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
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getRecruiterJobs = async (req, res, next) => {
    try {
        req.advancedFilter = { recruiter_id: req.user._id };
        res.status(200).json(res.advancedResults);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        if (job.recruiter_id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this job' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        await Log.create({
            user_id: req.user._id,
            user_role: 'RECRUITER',
            action: 'UPDATE_JOB',
            target_id: job._id
        });

        const { clearCache } = require('../middlewares/cacheMiddleware');
        await clearCache('/api/v1/jobs');

        res.json({ success: true, data: job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const { checkEligibility } = require('../services/eligibilityService');

// Eligibility Engine: Get jobs student is allowed to apply for
exports.getEligibleJobs = async (req, res, next) => {
    try {
        const student = req.user;

        // We only want to evaluate ACTIVE jobs.
        req.advancedFilter = { status: 'ACTIVE' };

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
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        let matchScore = null;
        if (req.user && req.user.role === 'STUDENT') {
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
        // Cap job pool to 200 most recent active jobs to avoid memory/API pressure
        const activeJobs = await Job.find({ status: 'ACTIVE' }).sort({ created_at: -1 }).limit(200);

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
