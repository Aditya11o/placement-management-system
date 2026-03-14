const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const config = require('../config/config');
const axios = require('axios');
const pdfParse = require('pdf-parse');

/**
 * Generates a professional job description using Gemini AI.
 * @param {string} title - The job title (e.g., "Software Engineer")
 * @returns {Promise<string>} - The generated job description in markdown format
 */
exports.generateJobDescription = async (title) => {
    try {
        if (!config.get('gemini.api_key')) {
            logger.warn('Skipping AI Generation: GEMINI_API_KEY is not configured');
            throw new Error('AI functionality is not configured on this server.');
        }

        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            throw new Error('A valid job title is required for AI generation.');
        }

        const genAI = new GoogleGenerativeAI(config.get('gemini.api_key'));
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        You are an expert technical recruiter and HR professional.
        Generate a comprehensive, professional, and engaging Job Description for the following role:
        
        **Role Title:** ${title}

        **Instructions:**
        1. Write in a totally professional yet modern and engaging tone.
        2. Format the output using clean Markdown (using **, bullets, etc.).
        3. Do NOT include placeholder text like "[Company Name]" or "[Location]". Keep it generic enough to be customized later, or use phrasing like "our company."
        4. Structure the description with the following sections:
           - A brief, exciting 2-3 sentence introductory overview of the role.
           - **Key Responsibilities:** (5-7 bullet points of standard daily tasks and impact).
           - **Requirements & Qualifications:** (5-7 bullet points covering education, skills, and experience usually expected for this role).
           - **What We Offer / Perks:** (4-5 bullet points of standard modern tech company perks like flexible hours, health benefits, continuous learning).
        5. Return ONLY the markdown text. No conversational filler like "Here is your description".
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawOutput = response.text() || '';

        if (!rawOutput) {
            throw new Error('AI returned an empty response.');
        }

        logger.info(`Successfully generated AI job description for title: ${title}`);
        return rawOutput.trim();

    } catch (err) {
        logger.error(`AI Job Description Generation Failed: ${err.message}`);
        throw err; // Propagate to controller for 500/400 response
    }
};

/**
 * Generates tailored interview questions based on job details.
 * @param {Object} jobData - { title, description, skills }
 * @returns {Promise<Object>} - Object containing technical and behavioral questions
 */
exports.generateInterviewQuestions = async ({ title, description, skills }) => {
    try {
        if (!config.get('gemini.api_key')) {
            throw new Error('AI functionality is not configured on this server.');
        }

        const genAI = new GoogleGenerativeAI(config.get('gemini.api_key'));
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        You are an expert technical interviewer. 
        Generate 10 interview questions for a student applying for the following role:
        
        **Job Title:** ${title}
        **Description:** ${description}
        **Required Skills:** ${skills ? (Array.isArray(skills) ? skills.join(', ') : skills) : 'Standard industry skills'}

        **Instructions:**
        1. Generate exactly 5 Technical questions based on the required skills and job description.
        2. Generate exactly 5 Behavioral questions (HR/Situation-based).
        3. Format the output as a JSON object with two keys: "technical" and "behavioral", each containing an array of strings.
        4. Do NOT include any markdown formatting like \`\`\`json. Return ONLY the JSON string.
        5. Ensure questions are challenging yet suitable for a college student.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawOutput = response.text() || '';

        try {
            // Clean up potentially weird AI output (sometimes they add markdown blocks even when told not to)
            const jsonStr = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (parseErr) {
            logger.error(`Failed to parse AI interview questions: ${rawOutput}`);
            throw new Error('AI returned an invalid format. Please try again.');
        }

    } catch (err) {
        logger.error(`AI Interview Question Generation Failed: ${err.message}`);
        throw err;
    }
};

/**
 * Analyzes a resume against a job description.
 * @param {string} resumeUrl - URL to the resume PDF
 * @param {Object} jobData - { title, description, skills }
 * @returns {Promise<Object>} - Analysis results (score, suggestions, gaps)
 */
exports.analyzeResumeFit = async (resumeUrl, { title, description, skills }) => {
    try {
        if (!config.get('gemini.api_key')) {
            throw new Error('AI functionality is not configured on this server.');
        }

        // 1. Fetch PDF
        const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
        const pdfBuffer = Buffer.from(response.data);

        // 2. Extract Text
        const pdfData = await pdfParse(pdfBuffer);
        const resumeText = pdfData.text;

        if (!resumeText || resumeText.trim().length === 0) {
            throw new Error('Could not extract text from the active resume.');
        }

        const genAI = new GoogleGenerativeAI(config.get('gemini.api_key'));
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        You are an expert career coach and technical recruiter. 
        Analyze the following Resume against the Job Description.

        **Job Title:** ${title}
        **Job Description:** ${description}
        **Required Skills:** ${skills ? (Array.isArray(skills) ? skills.join(', ') : skills) : 'Standard industry skills'}

        **Student Resume Text:**
        """
        ${resumeText.substring(0, 5000)}
        """

        **Instructions:**
        1. Calculate a "match_score" (0-100) based on skills and experience alignment.
        2. Identify 3-5 specific "bullet_point_improvements". For each, provide the "original" text from the resume and a "suggested" rewrite that better maps to the job.
        3. List "top_skill_gaps" (missing technical or soft skills).
        4. Provide a 2-sentence "summary_verdict".
        5. Format the output as a JSON object with: 
           { "match_score": number, "suggestions": [{ "original": string, "suggested": string }], "gaps": [string], "verdict": string }
        6. Return ONLY the JSON string.
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = await result.response;
        const rawOutput = aiResponse.text() || '';

        const jsonStr = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (err) {
        logger.error(`AI Resume Analysis Failed: ${err.message}`);
        throw err;
    }
};

/**
 * Generates an aggregated prep kit summary from multiple interview experiences.
 * @param {string} companyName - Name of the company
 * @param {Array} experiences - Array of experience objects
 * @returns {Promise<Object>} - Aggregated summary
 */
exports.generatePrepKitSummary = async (companyName, experiences) => {
    try {
        if (!config.get('gemini.api_key')) {
            throw new Error('AI functionality is not configured on this server.');
        }

        const genAI = new GoogleGenerativeAI(config.get('gemini.api_key'));
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        You are an expert career consultant. 
        Analyze the following ${experiences.length} interview experiences for **${companyName}** and distill them into a single, high-value "Master Prep Kit".

        **Experiences Data:**
        ${JSON.stringify(experiences.map(e => ({
            role: e.role,
            difficulty: e.difficulty,
            rounds: e.rounds.map(r => ({ name: r.name, details: r.details, questions: r.questions })),
            tips: e.tips
        })))}

        **Instructions:**
        1. Identify the most common "round_patterns" (e.g., [ "Online Technical Assessment", "System Design Interview", "HR Behavioral" ]).
        2. Extract a "master_question_bank" containing the top 10 most relevant/frequent questions across all experiences.
        3. Synthesize "consolidated_tips" (5 bullet points of the best advice).
        4. Calculate an "average_difficulty" (0-100 score).
        5. Provide a 2-sentence "insight_verdict" on what ${companyName} typically focuses on (e.g., "Heavy emphasis on DSA and problem-solving speed").
        6. Format as JSON: { "round_patterns": [string], "master_questions": [string], "top_tips": [string], "difficulty_score": number, "verdict": string }
        7. Return ONLY the JSON string.
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = await result.response;
        const rawOutput = aiResponse.text() || '';

        const jsonStr = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (err) {
        logger.error(`AI Prep Kit Generation Failed: ${err.message}`);
        throw err;
    }
};

/**
 * Generates personalized "Next Best Actions" for a student.
 * @param {Object} studentData - { profile, stats, jobs }
 * @returns {Promise<Array>} - List of 3 suggested actions
 */
exports.generateNextBestActions = async ({ student, stats, jobs }) => {
    try {
        if (!config.get('gemini.api_key')) throw new Error('AI functionality is not configured.');

        const genAI = new GoogleGenerativeAI(config.get('gemini.api_key'));
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        You are a high-end career coach. Suggest the top 3 specific "Next Best Actions" for this student to maximize placement success.
        
        **Student Profile:**
        - Branch: ${student.branch}
        - Skills: ${student.skills.join(', ')}
        - Readiness Score: ${student.readiness_score || 'Not calculated'}
        
        **Current Stats:**
        - Applications: ${stats.applicationsSent}
        - Interviews: ${stats.interviewsScheduled}
        - Offers: ${stats.offersReceived}
        
        **Top Current Jobs:**
        ${JSON.stringify(jobs.slice(0, 3).map(j => ({ title: j.title, company: j.company_name, package: j.package_lpa })))}

        **Instructions:**
        1. Base actions on gaps (e.g., if applications are low, suggest applying; if skills don't match top jobs, suggest specific skills).
        2. Format as a JSON array of 3 objects: [ { "title": string, "description": string, "icon": "Briefcase" | "Target" | "Star" | "Zap", "link": string } ]
        3. Icons should be one of the 4 specified strings. Links should be valid student routes like /student/jobs, /student/profile, /student/prep-kits.
        4. Return ONLY the JSON string.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawOutput = response.text() || '';
        const jsonStr = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (err) {
        logger.error(`AI Next Action Generation Failed: ${err.message}`);
        return [];
    }
};

/**
 * Suggests trending skills for a student based on branch and market.
 * @param {string} branch - Student's branch
 * @param {Array} currentSkills - Existing skills
 * @returns {Promise<Array>} - List of suggested skills
 */
exports.generateSkillSuggestions = async (branch, currentSkills) => {
    try {
        if (!config.get('gemini.api_key')) throw new Error('AI functionality is not configured.');

        const genAI = new GoogleGenerativeAI(config.get('gemini.api_key'));
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        As a tech recruiter, suggest 5 trending skills for a ${branch} student that aren't already in their profile.
        Current Skills: ${currentSkills.join(', ')}

        Return ONLY a raw JSON array of strings: ["Skill1", "Skill2", ...]. No markdown.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawOutput = response.text() || '';
        const jsonStr = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (err) {
        logger.error(`AI Skill Suggestion Failed: ${err.message}`);
        return [];
    }
};

/**
 * Summarizes a single interview experience.
 * @param {Object} experience - Full experience data
 * @returns {Promise<string>} - 2-3 bullet point summary
 */
exports.generateExperienceSummary = async (experience) => {
    try {
        if (!config.get('gemini.api_key')) throw new Error('AI functionality is not configured.');

        const genAI = new GoogleGenerativeAI(config.get('gemini.api_key'));
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        Summarize this interview experience for ${experience.company_name} into exactly 3 concise bullet points highlighting key questions, difficulty, and the overall vibe.
        Experience: ${JSON.stringify(experience.rounds)}
        
        Return ONLY the bullet points. No conversational text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (err) {
        logger.error(`AI Experience Summary Failed: ${err.message}`);
        return "Failed to generate summary.";
    }
};

/**
 * Analyzes a student's verbal response for STAR method alignment and speech metrics.
 * @param {string} question - The question being answered
 * @param {string} transcript - The student's verbal response (from Speech-to-Text)
 * @returns {Promise<Object>} - STAR analysis and speech metrics
 */
exports.analyzeInterviewResponse = async (question, transcript) => {
    try {
        if (!config.get('gemini.api_key')) throw new Error('AI functionality is not configured.');

        const genAI = new GoogleGenerativeAI(config.get('gemini.api_key'));
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        You are a world-class executive communication coach. Analyze the following interview response for the STAR method (Situation, Task, Action, Result) and speech quality.
        
        **Interview Question:** ${question}
        **Student Response:** "${transcript}"

        **Instructions:**
        1. Evaluate if the student covered each part of the STAR method (Situation, Task, Action, Result). Return a boolean for each.
        2. Provide specific "star_feedback" on how they can better structure the response.
        3. Evaluate "speech_metrics":
           - "confidence_score": 0-100 (based on word choice and structure).
           - "filler_words": Detect frequency of "um", "uh", "err", "like", "you know".
           - "pace_feedback": Determine if the response is too fast, too slow, or just right based on word count (approx 130-150 words per minute is ideal).
        4. Format as JSON: 
           { 
             "star_status": { "S": boolean, "T": boolean, "A": boolean, "R": boolean },
             "star_feedback": string,
             "metrics": { "confidence": number, "filler_count": number, "pace_feedback": string }
           }
        5. Return ONLY the JSON string.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawOutput = response.text() || '';
        const jsonStr = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (err) {
        logger.error(`AI Interview Response Analysis Failed: ${err.message}`);
        throw err;
    }
};
/**
 * Optimizes a resume's bullet points and summary for a specific job.
 * @param {string} resumeUrl - URL to the resume PDF
 * @param {Object} jobData - { title, description, skills }
 * @returns {Promise<Object>} - Optimized resume content
 */
exports.autoTuneResume = async (resumeUrl, { title, description, skills }) => {
    try {
        if (!config.get('gemini.api_key')) throw new Error('AI functionality not configured.');

        const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
        const pdfData = await pdfParse(Buffer.from(response.data));
        const resumeText = pdfData.text;

        if (!resumeText) throw new Error('Could not parse resume text.');

        const genAI = new GoogleGenerativeAI(config.get('gemini.api_key'));
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        You are a premium resume writer. Rewrite the following resume sections to perfectly align with this job description.
        
        **Target Job:** ${title}
        **Job Details:** ${description}
        **Required Skills:** ${skills.join(', ')}

        **Original Resume:**
        ${resumeText.substring(0, 5000)}

        **Instructions:**
        1. Rewrite the "Professional Summary" to be high-impact (2-3 sentences).
        2. Identify the most relevant projects or experiences and rewrite their bullet points using the STAR method and action verbs (e.g., "Led", "Developed", "Optimized") that match the job description.
        3. Suggest a "Tailored Skills" list.
        4. Format as JSON: 
           { 
             "summary": string, 
             "optimized_sections": [ { "title": string, "bullets": [string] } ],
             "recommended_skills": [string]
           }
        5. Return ONLY the JSON string.
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = await result.response;
        const rawOutput = aiResponse.text() || '';
        const jsonStr = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (err) {
        logger.error(`AI Auto-Tune Failed: ${err.message}`);
        throw err;
    }
};
