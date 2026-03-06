const { GoogleGenAI } = require('@google/genai');
const logger = require('./logger');
const config = require('../config/config');

/**
 * Ranks a list of students against a specific job description using Gemini AI.
 * @param {Object} job - The job posting details (title, description, required skills, etc.)
 * @param {Array} students - Array of eligible student objects (id, name, skills, cgpa, etc.)
 * @returns {Promise<Array>} - Array of objects: { studentId, score, reasoning }
 */
exports.rankCandidatesForJob = async (job, students) => {
    try {
        if (!config.get('gemini.api_key')) {
            logger.warn('Skipping AI Matching: GEMINI_API_KEY is not configured in configuration');
            return [];
        }

        if (!students || students.length === 0) return [];

        // Initialize Gemini SDK lazily
        const ai = new GoogleGenAI({});

        // Prepare minimized data payloads to save tokens
        const jobContext = `
        Role: ${job.title}
        Company: ${job.company?.name || 'Unknown'}
        Type: ${job.job_type}
        Salary/Package (LPA): ${job.package_lpa || 'Not specified'}
        Job Description: ${job.description.substring(0, 1500)} // Limiting to core requirements
        `;

        const studentsContext = students.map(s => ({
            id: s._id.toString(),
            cgpa: s.cgpa || 0,
            skills: s.skills || [],
            branch: s.branch || 'Unknown'
        }));

        const prompt = `
        You are an elite automated Applicant Tracking System (ATS). Your task is to analyze a pool of candidates against a specific Job Description.
        
        ### Job Context
        ${jobContext}

        ### Candidate Pool (JSON)
        ${JSON.stringify(studentsContext)}

        ### Instructions
        1. Evaluate each candidate's suitability for the Job Context based primarily on their skills, but also consider their CGPA and branch relevance.
        2. Assign a "matchScore" between 0 and 100 for each candidate.
        3. Provide a single, concise sentence "reasoning" for the score (e.g., "Strong React skills match core requirements, but lacks backend experience.").
        4. Return ONLY a pure JSON array of objects. Do not include markdown formatting like \`\`\`json or trailing text.

        ### Expected Output Format
        [
            { "studentId": "id_string_here", "score": 85, "reasoning": "Excellent match due to complete overlap in desired Python skills." },
            ...
        ]
        `;

        // Query Gemini, requesting JSON format
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                // Ensure the model knows we want JSON (supported directly by 1.5-flash)
                responseMimeType: "application/json",
            }
        });

        const rawOutput = response.text || '[]';

        let rankedResults = [];
        try {
            rankedResults = JSON.parse(rawOutput);
        } catch (parseErr) {
            logger.error(`AI Matcher JSON Parse Failed. Raw Output: ${rawOutput}`);
            throw parseErr;
        }

        logger.info(`Successfully ranked ${rankedResults.length}/${students.length} candidates for job ${job._id}`);
        return rankedResults;

    } catch (err) {
        logger.error(`AI Candidate Matching Failed: ${err.message}`);
        // Return null/empty array to gracefully degrade instead of crashing the endpoint
        return [];
    }
};
