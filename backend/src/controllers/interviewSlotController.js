const InterviewSlot = require('../models/InterviewSlot');
const Job = require('../models/Job');
const Log = require('../models/Log');

/**
 * @desc    Create availability slots for a job
 * @route   POST /api/v1/interviews/slots
 * @access  Private/Recruiter
 */
exports.createSlots = async (req, res, next) => {
    try {
        const { job_id, slots } = req.body;

        const job = await Job.findById(job_id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.recruiter_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized for this job' });
        }

        const createdSlots = await InterviewSlot.insertMany(
            slots.map(slot => ({
                ...slot,
                job_id,
                recruiter_id: req.user._id
            }))
        );

        await Log.create({
            user_id: req.user._id, user_role: 'RECRUITER',
            action: 'CREATE_INTERVIEW_SLOTS', target_id: job_id
        });

        res.status(201).json({ success: true, data: createdSlots });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'One or more slots overlap with existing availability' });
        }
        next(err);
    }
};

/**
 * @desc    Get slots for a specific job (available/booked)
 * @route   GET /api/v1/interviews/slots/:jobId
 * @access  Private
 */
exports.getJobSlots = async (req, res, next) => {
    try {
        const filter = { job_id: req.params.jobId };
        
        // Students only see available slots
        if (req.user.role === 'STUDENT') {
            filter.is_booked = false;
            filter.start_time = { $gt: new Date() };
        }

        const slots = await InterviewSlot.find(filter).sort({ start_time: 1 });
        res.status(200).json({ success: true, count: slots.length, data: slots });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete an availability slot
 * @route   DELETE /api/v1/interviews/slots/:id
 * @access  Private/Recruiter
 */
exports.deleteSlot = async (req, res, next) => {
    try {
        const slot = await InterviewSlot.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ success: false, message: 'Slot not found' });
        }

        if (slot.recruiter_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (slot.is_booked) {
            return res.status(400).json({ success: false, message: 'Cannot delete a booked slot' });
        }

        await slot.remove();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
