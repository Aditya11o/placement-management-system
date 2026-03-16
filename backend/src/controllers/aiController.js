const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');
const logger = require('../utils/logger');
const Student = require('../models/Student');
const Job = require('../models/Job');

// Lazy model initialization to handle API key variations and ensure late-binding of config
let _model = null;
const getModel = () => {
    if (_model) return _model;
    
    const apiKey = config.get('gemini.api_key');
    if (!apiKey) return null;

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash as discovered from the API models list
    _model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    return _model;
};

/**
 * @desc    Chat with AI Assistant (Alex AI)
 * @route   POST /api/v1/ai/chat
 * @access  Private
 */
exports.chatWithAI = async (req, res, next) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Please provide a message' });
        }

        const apiKey = config.get('gemini.api_key');
        if (!apiKey) {
            logger.error('Gemini API Key is missing');
            return res.status(500).json({ 
                success: false, 
                message: 'AI Assistant initialization failed. Please contact admin.',
                error: 'MISSING_API_KEY'
            });
        }

        // Fetch student profile for context if current user is a student
        let profileContext = "";
        if (req.user.role === 'STUDENT') {
            const student = await Student.findById(req.user._id).lean();
            if (student) {
                profileContext = `\nYou are talking to ${student.name}, a student in the ${student.branch} branch with a CGPA of ${student.cgpa}. 
                Their skills include: ${student.skills?.join(', ') || 'Not specified'}.
                They are in their ${student.graduation_year} graduation year.
                Use this context to provide personalized career advice if asked.`;
            }
        }

        const systemPrompt = `You are Alex AI, a professional career assistant for the Placement Management System (PMS). 
        Your goal is to help students with placement preparation, resume building, and finding suitable job opportunities.
        Be encouraging, professional, and concise.${profileContext}`;

        // Ensure history objects match the expected format { role, parts: [{ text }] }
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: Array.isArray(msg.parts) ? msg.parts : [{ text: String(msg.parts) }]
        }));

        const model = getModel();
        if (!model) {
            throw new Error('AI Model initialization failed');
        }

        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        // First message in a new chat gets the system prompt as a separate context instruction
        const finalMessage = history && history.length > 0 
            ? message 
            : `CONTEXT: ${systemPrompt}\n\nUSER MESSAGE: ${message}`;

        const result = await chat.sendMessage(finalMessage);
        const responseText = result.response.text();

        res.json({
            success: true,
            data: responseText
        });
    } catch (err) {
        const errorMsg = `Gemini Chat Error: ${err.message}`;
        logger.error(errorMsg);
        
        // Return a more descriptive error status but hide sensitive details in production
        const isDev = config.get('env') === 'development';
        res.status(500).json({ 
            success: false, 
            message: 'I am having trouble connecting to my brain right now.',
            error: isDev ? err.message : 'SERVICE_UNAVAILABLE'
        });
    }
};

/**
 * @desc    Get AI feedback on Resume
 * @route   POST /api/v1/ai/resume-feedback
 * @access  Private (Student)
 */
exports.getResumeFeedback = async (req, res, next) => {
    try {
        const { resumeText } = req.body;

        if (!resumeText) {
            return res.status(400).json({ success: false, message: 'Please provide resume text' });
        }

        const prompt = `Act as a senior HR recruiter. Analyze the following resume text and provide:
        1. A score out of 100.
        2. Top 3 strengths.
        3. Top 3 areas for improvement.
        4. Specific advice for placement in top tech companies like Google, Amazon, or Microsoft.

        Resume Text:
        ${resumeText}`;

        const model = getModel();
        if (!model) {
            throw new Error('AI Model initialization failed');
        }

        const result = await model.generateContent(prompt);
        const feedback = result.response.text();

        res.json({
            success: true,
            data: feedback
        });
    } catch (err) {
        logger.error(`Gemini Resume Feedback Error: ${err.message}`);
        next(err);
    }
};

/**
 * @desc    Generate mock interview questions
 * @route   POST /api/v1/ai/interview-prep
 * @access  Private
 */
exports.generateInterviewPrep = async (req, res, next) => {
    try {
        const { jobId } = req.body;

        let jobDescription = "A general software engineering role.";
        if (jobId) {
            const job = await Job.findById(jobId).lean();
            if (job) {
                jobDescription = `Role: ${job.title}\nDescription: ${job.description}\nRequirements: ${job.requirements || 'N/A'}`;
            }
        }

        const prompt = `Based on the following job details, generate 5 technical and 3 behavioral interview questions to help the student prepare.
        Provide a brief tip for answering each category.

        Job Details:
        ${jobDescription}`;

        const model = getModel();
        if (!model) {
            throw new Error('AI Model initialization failed');
        }

        const result = await model.generateContent(prompt);
        const questions = result.response.text();

        res.json({
            success: true,
            data: questions
        });
    } catch (err) {
        logger.error(`Gemini Interview Prep Error: ${err.message}`);
        next(err);
    }
};
