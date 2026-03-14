const Student = require('../models/Student');
const logger = require('../utils/logger');

/**
 * @desc    Update student streak after activity
 * @route   POST /api/v1/gamification/update-streak
 * @access  Private (Student)
 */
exports.updateStreak = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const now = new Date();
        const lastActivity = student.gamification?.streak?.last_activity;
        
        if (!lastActivity) {
            // First ever activity
            student.gamification.streak = {
                current: 1,
                last_activity: now,
                longest: 1
            };
        } else {
            const lastDate = new Date(lastActivity);
            const diffInHours = (now - lastDate) / (1000 * 60 * 60);

            if (diffInHours < 24) {
                // Same day activity, just update timestamp
                student.gamification.streak.last_activity = now;
            } else if (diffInHours < 48) {
                // Consecutive day activity
                student.gamification.streak.current += 1;
                student.gamification.streak.last_activity = now;
                if (student.gamification.streak.current > student.gamification.streak.longest) {
                    student.gamification.streak.longest = student.gamification.streak.current;
                }
            } else {
                // Streak broken
                student.gamification.streak.current = 1;
                student.gamification.streak.last_activity = now;
            }
        }

        // Award points for activity
        student.gamification.points += 10;
        
        await student.save();

        res.status(200).json({
            success: true,
            data: student.gamification.streak
        });
    } catch (error) {
        logger.error(`Gamification Controller Error (updateStreak): ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Check and award badges based on milestones
 * @route   POST /api/v1/gamification/check-badges
 * @access  Private (Student)
 */
exports.checkBadges = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user.id);
        const Experience = require('../models/Experience');
        
        const insightsCount = await Experience.countDocuments({ student: student._id });
        const existingBadges = student.gamification.badges.map(b => b.type);
        const newBadges = [];

        // 1. Insight Guru (5 peer insights)
        if (insightsCount >= 5 && !existingBadges.includes('INSIGHT_GURU')) {
            newBadges.push({ type: 'INSIGHT_GURU' });
        }

        // 2. Profile Pro (Profile completion check - simplified)
        const isProfileComplete = !!(student.skills.length > 0 && student.resume_versions.length > 0);
        if (isProfileComplete && !existingBadges.includes('PROFILE_PRO')) {
            newBadges.push({ type: 'PROFILE_PRO' });
        }

        // 3. Streak Master (7 day streak)
        if (student.gamification.streak.current >= 7 && !existingBadges.includes('STREAK_MASTER')) {
            newBadges.push({ type: 'STREAK_MASTER' });
        }

        if (newBadges.length > 0) {
            student.gamification.badges.push(...newBadges);
            student.gamification.points += newBadges.length * 100;
            await student.save();
        }

        res.status(200).json({
            success: true,
            newBadges: newBadges.map(b => b.type),
            totalBadges: student.gamification.badges
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get gamification stats
 * @route   GET /api/v1/gamification/stats
 * @access  Private (Student)
 */
exports.getStats = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user.id).select('gamification');
        res.status(200).json({
            success: true,
            data: student.gamification
        });
    } catch (error) {
        next(error);
    }
};
