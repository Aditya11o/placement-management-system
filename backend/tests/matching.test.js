const { calculateMatchScore } = require('../src/services/matchingService');

jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: {
            generateContent: jest.fn().mockResolvedValue({
                text: '100' // Mock semantic skill match to always return 100
            })
        }
    }))
}));
describe('AI Job Matching Score Service', () => {

    const baseStudent = {
        cgpa: 8.5,
        marks_10th: 90,
        marks_12th: 92,
        branch: 'CSE',
        skills: ['JavaScript', 'Node.js', 'React']
    };

    const baseJob = {
        package_lpa: 12.0, title: 'Full Stack Developer',
        description: 'Looking for a developer skilled in node.js and React.',
        min_cgpa: 7.0,
        min_marks_10th: 75,
        min_marks_12th: 75,
        eligible_branch: 'CSE'
    };

    it('should return a high score for a perfectly matching student', async () => {
        const score = await calculateMatchScore(baseStudent, baseJob);
        // Academic Base: 90. (CGPA: 40 + 10 excess = 50. 10th: 25. 12th: 25). Normalizes to 100 * 0.3 = 30 points
        // Branch: 100 * 0.2 = 20 points
        // Skills: JD has 'node.js' and 'React'. 2/3 skills match = 66%. Boosted: 132% -> caps at 100%. * 0.5 = 50 points.
        // Total expected: 30 + 20 + 50 = 100
        expect(score).toBeGreaterThan(95);
    });

    it('should return 0 branch score if student is not eligible', async () => {
        const ineligibleStudent = { ...baseStudent, branch: 'MECH' };
        const score = await calculateMatchScore(ineligibleStudent, baseJob);
        // Total should drop by exactly the branch weight (20 points max out of 100)
        expect(score).toBeLessThanOrEqual(80);
    });

    it('should calculate academic score properly without excess bonuses', async () => {
        const averageStudent = { ...baseStudent, cgpa: 7.2 }; // Meets 7.0 but no big bonus
        const score = await calculateMatchScore(averageStudent, baseJob);

        const highStudent = { ...baseStudent, cgpa: 9.5 };
        const highScore = await calculateMatchScore(highStudent, baseJob);

        expect(highScore).toBeGreaterThan(score);
    });

    it('should handle students with 0 skills', async () => {
        const noSkillStudent = { ...baseStudent, skills: [] };
        const score = await calculateMatchScore(noSkillStudent, baseJob);
        // Drops 50 points max
        expect(score).toBeLessThanOrEqual(50);
    });

    it('should give full branch points if eligible_branch is ALL', async () => {
        const openJob = { ...baseJob, eligible_branch: 'ALL' };
        const mechStudent = { ...baseStudent, branch: 'MECH' };
        const score = await calculateMatchScore(mechStudent, openJob);

        // Even though they are MECH, branch is ALL, so branch points should be awarded.
        expect(score).toBeGreaterThan(80);
    });

});
