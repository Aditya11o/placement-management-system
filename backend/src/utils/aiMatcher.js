const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');
const config = require('../config/config');

/**
 * Ranks a list of students against a specific job description using a hybrid logic.
 * 1. Heuristic keyword overlap (Pre-filter)
 * 2. Gemini AI deep analysis (Final ranking)
 * 
 * @param {Object} job - Job document
 * @param {Array} students - Array of Student documents
 * @returns {Promise<Array>} - Standardized ranked candidates: [{ student, matchScore, matchReason }]
 */
exports.rankCandidatesForJob = async (job, students) => {
    try {
        if (!students || students.length === 0) return [];

        // 1. Initial Heuristic Scoring (Keyword Overlap)
        const jobKeywords = (job.title + ' ' + (job.description || '') + ' ' + (job.skills_required || []).join(' ')).toLowerCase();
        
        const heuristicRanked = students.map(student => {
            let score = 0;
            const studentSkills = (student.skills || []).join(' ').toLowerCase();
            
            // Skill overlap scoring
            (student.skills || []).forEach(skill => {
                if (jobKeywords.includes(skill.toLowerCase())) {
                    score += 15; // Weighted higher for specific skill matches
                }
            });

            // Academic boost (max 20 points from CGPA)
            score += Math.min((student.cgpa || 0) * 2, 20);

            return {
                student,
                score,
                studentId: student._id.toString()
            };
        });

        // Take top 10 for AI analysis to save tokens
        const topCandidates = heuristicRanked
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        // 2. AI Analysis with Gemini (if API Key is available)
        if (config.get('gemini.api_key')) {
            try {
                const genAI = new GoogleGenerativeAI(config.get('gemini.api_key'));
                const model = genAI.getGenerativeModel({ 
                    model: 'gemini-1.5-flash',
                    generationConfig: { responseMimeType: "application/json" }
                });

                const candidatesData = topCandidates.map(c => ({
                    id: c.studentId,
                    name: c.student.name,
                    skills: c.student.skills,
                    cgpa: c.student.cgpa,
                    branch: c.student.branch
                }));

                const prompt = `
                    Analyze these candidates for the following job:
                    Title: ${job.title}
                    Requirements: ${job.description.substring(0, 1000)}
                    
                    Candidates:
                    ${JSON.stringify(candidatesData)}
                    
                    Task: Rank them 0-100 based on fit. Provide a 1-sentence reasoning.
                    Return JSON: [{"id": "...", "score": 0-100, "reasoning": "..."}]
                `;

                const result = await model.generateContent(prompt);
                const aiResponse = JSON.parse(result.response.text());
                
                return topCandidates.map(c => {
                    const aiInfo = aiResponse.find(r => r.id === c.studentId);
                    return {
                        student: c.student,
                        matchScore: aiInfo ? aiInfo.score : Math.min(Math.round(c.score), 100),
                        matchReason: aiInfo ? aiInfo.reasoning : "Strong baseline match based on skill overlap."
                    };
                }).sort((a, b) => b.matchScore - a.matchScore);
            } catch (aiErr) {
                logger.error("AI Matching Stage 2 Failed (Gemini):", aiErr);
                // Fallback to heuristic results if AI fails
            }
        }

        // Fallback or No API Key: Use heuristic scores
        return topCandidates.map(c => ({
            student: c.student,
            matchScore: Math.min(Math.round(c.score), 100),
            matchReason: "Ranked based on skill alignment and academic performance (AI processing skipped)."
        })).sort((a, b) => b.matchScore - a.matchScore);

    } catch (err) {
        logger.error(`Unified Matching Failed: ${err.message}`);
        return [];
    }
};
