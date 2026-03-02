const { GoogleGenAI } = require('@google/genai');
const pdfParse = require('pdf-parse');
const logger = require('./logger');
const config = require('../config/config');

/**
 * Parses a PDF buffer, extracts raw text, and queries Gemini to return an array of professional skills.
 * @param {Buffer} pdfBuffer - The raw PDF file buffer
 * @returns {Promise<Array<String>>} - A list of extracted skills
 */
exports.extractSkillsFromResume = async (pdfBuffer) => {
    try {
        if (!config.get('gemini.api_key')) {
            logger.warn('Skipping Resume Parsing: GEMINI_API_KEY is not configured in configuration');
            return [];
        }

        // Initialize Gemini SDK lazily, only if key exists
        const ai = new GoogleGenAI({});

        // 1. Extract raw text from PDF
        logger.info(`pdfParse runtime type: ${typeof pdfParse}`);
        logger.info(`pdfParse keys: ${Object.keys(pdfParse).join(', ')}`);

        let parseFunc = pdfParse;
        if (typeof pdfParse !== 'function') {
            parseFunc = pdfParse.default || pdfParse.pdf;
        }

        if (typeof parseFunc !== 'function') {
            throw new Error(`Could not resolve pdf-parse function. Root type: ${typeof pdfParse}. Keys: ${Object.keys(pdfParse).join(', ')}`);
        }

        const data = await parseFunc(pdfBuffer);
        const resumeText = data.text;

        if (!resumeText || resumeText.trim().length === 0) {
            logger.warn('Resume Parsing: Could not extract text from the provided PDF.');
            return [];
        }

        // 2. Build the AI Prompt
        const prompt = `
        You are an expert technical recruiter AI. Analyze the following resume text and extract the top professional skills.
        Return ONLY a raw, comma-separated list of skills (e.g., "JavaScript, React, Python, Machine Learning"). Do not include any conversational text, pleasantries, or formatting markdown.
        
        Resume Text:
        """
        ${resumeText.substring(0, 5000)} // Limit to roughly prevent token overflow on massive documents
        """
        `;

        // 3. Query Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
        });

        // 4. Process and clean the output
        const rawOutput = response.text || '';
        if (rawOutput.length === 0) return [];

        const skills = rawOutput
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0 && skill.length < 50); // Sanity check length

        logger.info(`Successfully extracted ${skills.length} skills via Gemini AI`);
        return skills;

    } catch (err) {
        logger.error(`Resume Analysis Failed: ${err.message}`);
        // Return empty array so the main upload process doesn't completely crash if AI goes down
        return [];
    }
};
