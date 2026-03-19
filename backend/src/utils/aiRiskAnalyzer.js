const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');
const config = require('../config/config');

/**
 * Analyzes a student's risk profile using Gemini AI.
 * @param {Object} student - Student profile data (name, branch, cgpa, skills, etc.)
 * @param {Array} applications - Array of application objects for the student
 * @returns {Promise<Object>} - Object containing riskLevel, reasoning, and suggestedInterventions
 */
exports.analyzeStudentRisk = async (student, applications) => {
    try {
        if (!config.get('gemini.api_key')) {
            logger.warn('Skipping AI Risk Analysis: GEMINI_API_KEY is not configured');
            return null;
        }

        const genAI = new GoogleGenerativeAI(config.get('gemini.api_key'));
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        // Prepare context
        const context = {
            student: {
                name: student.name,
                branch: student.branch,
                cgpa: student.cgpa,
                skills: student.skills || [],
                backlogs: student.backlogs_active || 0,
                resumeVersions: student.resume_versions?.length || 0
            },
            applications: applications.map(app => ({
                status: app.status,
                appliedAt: app.applied_at,
                jobTitle: app.job_id?.title || 'Unknown'
            }))
        };

        const prompt = `
        You are an expert Career Counselor and Placement Officer. Your task is to perform a deep "Career Risk Assessment" for a student in a Placement Management System.
        
        ### Student Data (JSON)
        ${JSON.stringify(context)}

        ### Instructions
        1. Analyze the student's current standing based on their academic performance, skill set, and application history.
        2. Identify the core "Risk Level" (LOW, MEDIUM, HIGH, CRITICAL).
        3. Provide a data-driven "Reasoning" (concise, professional).
        4. Suggest 3-4 concrete "Intervention Strategies" the placement office should take to help this student (e.g., "Schedule Mock Technical Interview focusing on Javascript", "Resume refactor to highlight ML projects", "One-on-one counseling for confidence building").
        5. Return ONLY a pure JSON object. No markdown.

        ### Expected Output Format
        {
            "riskLevel": "HIGH",
            "reasoning": "Despite a strong CGPA, the student has 0 applications and no resume uploaded, indicating a total lack of engagement or awareness of the placement cycle.",
            "suggestedInterventions": [
                "Mandatory resume building workshop",
                "Personalized outreach to understand engagement barriers",
                "Assignment of a senior student mentor"
            ]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawOutput = response.text() || '{}';

        return JSON.parse(rawOutput);

    } catch (err) {
        logger.error(`AI Student Risk Analysis Failed: ${err.message}`);
        return null;
    }
};
