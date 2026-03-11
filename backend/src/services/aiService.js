const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const config = require('../config/config');

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
