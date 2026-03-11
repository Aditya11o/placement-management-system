const { extractSkillsFromResume } = require('../src/utils/resumeAnalyzer');
const logger = require('../src/utils/logger');
const config = require('../src/config/config');

// We need to mock @google/generative-ai and pdf-parse
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: jest.fn().mockResolvedValue({
                        response: {
                            text: () => 'Node.js, React, Testing'
                        }
                    })
                })
            };
        })
    };
});

jest.mock('pdf-parse', () => {
    return jest.fn().mockResolvedValue({ text: 'This is a sample resume text with Node.js and React.' });
});

jest.mock('../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

describe('Resume Analyzer Service (AI Skill Extraction)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // Ensure API key is configured for tests unless testing the missing key branch
        config.set('gemini.api_key', 'test-api-key');
    });

    it('should successfully extract skills from a PDF buffer', async () => {
        const fakeBuffer = Buffer.from('PDF_HEADER_123');
        const skills = await extractSkillsFromResume(fakeBuffer);

        expect(skills).toEqual(['Node.js', 'React', 'Testing']);
        expect(logger.info).toHaveBeenCalledWith(expect.stringMatching(/Successfully extracted/));
    });

    it('should return an empty array if GEMINI_API_KEY is missing', async () => {
        config.set('gemini.api_key', ''); // Wipe key

        const skills = await extractSkillsFromResume(Buffer.from('...'));

        expect(skills).toEqual([]);
        expect(logger.warn).toHaveBeenCalledWith(expect.stringMatching(/GEMINI_API_KEY is not configured/));
    });

    it('should return an empty array if PDF text is empty', async () => {
        const pdfParse = require('pdf-parse');
        pdfParse.mockResolvedValueOnce({ text: '   ' });

        const skills = await extractSkillsFromResume(Buffer.from('...'));

        expect(skills).toEqual([]);
        expect(logger.warn).toHaveBeenCalledWith(expect.stringMatching(/Could not extract text/));
    });

    it('should gracefully handle Gemini AI errors', async () => {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        // Get the mock instance behavior
        GoogleGenerativeAI.mockImplementationOnce(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn().mockRejectedValue(new Error('AI Quota Exceeded'))
            })
        }));

        const skills = await extractSkillsFromResume(Buffer.from('...'));

        expect(skills).toEqual([]);
        expect(logger.error).toHaveBeenCalledWith(expect.stringMatching(/AI Quota Exceeded/));
    });

});
