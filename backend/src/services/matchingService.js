/**
 * matchingService.js
 * Calculates a match score (0-100) between a Student's profile and a Job's requirements.
 * Deterministic rule-based implementation.
 */

const logger = require('../utils/logger');

// Weightings for the final score out of 100
const WEIGHTS = {
    ACADEMIC: 30,
    BRANCH: 20,
    SKILLS: 50
};

/**
 * Calculates academic score out of 100%
 */
const calculateAcademicScore = (student, job) => {
    let score = 0;

    // CGPA criteria (up to 40% of academic score)
    const minCgpa = job.min_cgpa || 0;
    if (student.cgpa >= minCgpa) {
        score += 40;
        if (student.cgpa > minCgpa + 1.0) score += 10;
        else if (student.cgpa > minCgpa + 0.5) score += 5;
    }

    // 10th Marks criteria (up to 25% of academic score)
    const min10th = job.min_marks_10th || 0;
    if (student.marks_10th >= min10th) {
        score += 25;
    }

    // 12th Marks criteria (up to 25% of academic score)
    const min12th = job.min_marks_12th || 0;
    if (student.marks_12th >= min12th) {
        score += 25;
    }

    return Math.min(100, Math.max(0, score));
};

/**
 * Calculates branch eligibility score out of 100%
 */
const calculateBranchScore = (student, job) => {
    if (!job.eligible_branch) return 100;
    const allowedBranches = job.eligible_branch.split(',').map(b => b.trim().toUpperCase());
    if (allowedBranches.includes('ALL') || (student.branch && allowedBranches.includes(student.branch.toUpperCase()))) {
        return 100;
    }
    return 0;
};

/**
 * Calculates skill string matching score out of 100%
 */
const calculateSkillScore = (student, job) => {
    if (!student.skills || student.skills.length === 0) return 0;

    const jobText = `${job.title} ${job.description || ''}`.toLowerCase();
    let matchedSkillsCount = 0;

    student.skills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (jobText.includes(skillLower)) {
            matchedSkillsCount++;
        }
    });

    const matchPercentage = (matchedSkillsCount / student.skills.length) * 100;
    return Math.min(100, Math.max(0, matchPercentage));
};

/**
 * Calculates the total Match Score
 * @param {Object} student 
 * @param {Object} job 
 * @returns {Number} 0-100
 */
exports.calculateMatchScore = async (student, job) => {
    try {
        const academicScore = calculateAcademicScore(student, job);
        const branchScore = calculateBranchScore(student, job);
        const skillScore = calculateSkillScore(student, job);

        const matchScore =
            (academicScore * (WEIGHTS.ACADEMIC / 100)) +
            (branchScore * (WEIGHTS.BRANCH / 100)) +
            (skillScore * (WEIGHTS.SKILLS / 100));

        return Math.round(matchScore);
    } catch (err) {
        logger.error(`Error calculating match score: ${err.message}`);
        return 0;
    }
};
