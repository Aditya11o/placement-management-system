/**
 * matchingService.js
 * Calculates a match score (0-100) between a Student's profile and a Job's requirements.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');
const logger = require('../utils/logger');

// Weightings for the final score out of 100
const WEIGHTS = {
    ACADEMIC: 30,
    BRANCH: 20,
    SKILLS: 50
};

// Initialize Gemini AI Client
let aiClient = null;
try {
    const apiKey = config.get('gemini.api_key');
    if (apiKey) {
        aiClient = new GoogleGenerativeAI(apiKey);
        logger.info('🤖 Gemini AI Client initialized for semantic matching.');
    } else {
        logger.warn('⚠️ Gemini API Key not found. Falling back to basic string matching.');
    }
} catch (err) {
    logger.warn(`⚠️ Failed to initialize Gemini AI Client: ${err.message}`);
}

// Extremely simple in-memory cache to prevent blasting the Gemini API 
// during bulk recommendations. In production, this should ideally be in Redis.
const semanticCache = new Map();

/**
 * Calculates academic score out of 100%
 * @param {Object} student 
 * @param {Object} job 
 * @returns {Number} 0-100
 */
const calculateAcademicScore = (student, job) => {
    let score = 0;

    // CGPA criteria (up to 40% of academic score)
    const minCgpa = job.min_cgpa || 0;
    if (student.cgpa >= minCgpa) {
        score += 40;
        // Bonus for exceeding by a lot (up to 10 extra points)
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

    // Normalize safely to max 100
    return Math.min(100, Math.max(0, score));
};


/**
 * Calculates branch eligibility score out of 100%
 * @param {Object} student 
 * @param {Object} job 
 * @returns {Number} 0 or 100
 */
const calculateBranchScore = (student, job) => {
    const allowedBranches = job.eligible_branch.split(',').map(b => b.trim().toUpperCase());
    if (allowedBranches.includes('ALL') || allowedBranches.includes(student.branch.toUpperCase())) {
        return 100;
    }
    return 0; // Hard disqualification for branch usually
};


/**
 * Original Basic logic: Calculates skill string matching score out of 100%
 */
const calculateSkillScoreBase = (student, job) => {
    if (!student.skills || student.skills.length === 0) return 0;

    const jobText = `${job.title} ${job.description}`.toLowerCase();
    let matchedSkillsCount = 0;

    student.skills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (jobText.includes(skillLower)) {
            matchedSkillsCount++;
        }
    });

    const matchPercentage = (matchedSkillsCount / student.skills.length) * 100;
    const normalizedScore = matchPercentage * 2;

    return Math.min(100, Math.max(0, normalizedScore));
};

/**
 * 🚀 AI-Powered Semantic Skill Matching
 * Uses Google Gemini to semantically understand if the candidate's skills fit the JD
 * @param {Object} student 
 * @param {Object} job 
 * @returns {Promise<Number>} 0-100
 */
const calculateSkillScoreSemantic = async (student, job) => {
    if (!student.skills || student.skills.length === 0) return 0;

    // Fallback immediately if AI is not configured
    if (!aiClient) return calculateSkillScoreBase(student, job);

    const cacheKey = `${student._id?.toString() || 'no-std'}|${job._id?.toString() || 'no-job'}|${student.skills?.join(',')}`;

    if (semanticCache.has(cacheKey)) {
        return semanticCache.get(cacheKey);
    }

    try {
        const prompt = `
        You are an expert technical recruiter analyzing a candidate's fit for a job.
        
        Candidate's declared skills: ${student.skills.join(', ')}
        Job Title: ${job.title}
        Job Description snippet: ${job.description ? job.description.substring(0, 500) : ''}
        
        Evaluate the semantic match between the candidate's skills and the requirements implied by the job title and description.
        For example, a candidate with "React" matches well with "Frontend Developer" even if "React" isn't explicitly in the description.
        
        Respond with ONLY a single integer between 0 and 100 representing the percentage match.
        `;

        const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textOutput = response.text().trim();
        // Extract the first number found in the output just in case the AI adds extra text
        const match = textOutput.match(/\d+/);
        let score = match ? parseInt(match[0], 10) : NaN;

        if (isNaN(score)) {
            logger.warn(`AI returned unparseable score: "${textOutput}". Falling back to basic match.`);
            score = calculateSkillScoreBase(student, job);
        } else {
            score = Math.min(100, Math.max(0, score));
        }

        semanticCache.set(cacheKey, score);
        return score;

    } catch (err) {
        logger.error(`Gemini Matching returned an error: ${err.message}. Falling back to basic match.`);
        const fallbackScore = calculateSkillScoreBase(student, job);
        semanticCache.set(cacheKey, fallbackScore);
        return fallbackScore;
    }
};

/**
 * Calculates the total Match Score (Now Asynchronous due to Semantic AI)
 * @param {Object} student Mongoose Student Document
 * @param {Object} job Mongoose Job Document
 * @returns {Promise<Number>} Integer representing 0-100 percentage
 */
exports.calculateMatchScore = async (student, job) => {
    const academicScore = calculateAcademicScore(student, job);
    const branchScore = calculateBranchScore(student, job);
    const skillScore = await calculateSkillScoreSemantic(student, job);

    const matchScore =
        (academicScore * (WEIGHTS.ACADEMIC / 100)) +
        (branchScore * (WEIGHTS.BRANCH / 100)) +
        (skillScore * (WEIGHTS.SKILLS / 100));

    return Math.round(matchScore);
};

