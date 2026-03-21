const pdf = require('pdf-parse');
const logger = require('./logger');

/**
 * Predefined list of technical skills to extract.
 * In a real-world SaaS, this would be a much larger list or use a trained ML model.
 */
const SKILLS_DATABASE = [
    // Languages
    'JavaScript', 'Python', 'Java', 'C\\+\\+', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin', 'TypeScript',
    // Web Technologies
    'HTML', 'CSS', 'React', 'Angular', 'Vue', 'Node\\.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Next\\.js', 'Redux', 'Tailwind', 'Bootstrap',
    // Mobile
    'React Native', 'Flutter', 'iOS', 'Android',
    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'SQL', 'Redis', 'Oracle', 'Cassandra', 'DynamoDB',
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'Terraform', 'Ansible', 'CircleCI', 'TravisCI',
    // AI/ML & Data
    'Machine Learning', 'Deep Learning', 'Data Science', 'AI', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Spark', 'Hadoop',
    // Security & Infrastructure
    'Cyber Security', 'Penetration Testing', 'Firewall', 'Blockchain', 'Linux', 'Unix', 'Nginx', 'Apache'
];

/**
 * Extracts technical skills from a PDF buffer.
 * @param {Buffer} buffer - The resume file buffer (PDF).
 * @returns {Promise<Array<string>>} - A unique list of matched skills.
 */
exports.extractSkillsFromResume = async (buffer) => {
    try {
        if (!buffer || buffer.length === 0) {
            return [];
        }

        // Parse PDF to plain text
        const data = await pdf(buffer);
        const text = data.text;

        if (!text) {
            return [];
        }

        const matchedSkills = new Set();
        
        // Iterate through the database and search for each skill as a case-insensitive match
        // We use word boundaries \b to avoid partial matches (e.g., "Java" in "JavaScript")
        SKILLS_DATABASE.forEach(skill => {
            // Some skills have special characters that need to be handled if not escaped in database
            // (Database above already has escapes for +, ., etc.)
            const regex = new RegExp(`\\b${skill}\\b`, 'gi');
            if (regex.test(text)) {
                // Return the canonical form from the database, not what matched in text
                matchedSkills.add(skill.replace(/\\\\/g, '')); // Clean up double escapes if any
            }
        });

        // Specific handling for common variations if needed
        if (text.toLowerCase().includes('nodejs')) matchedSkills.add('Node.js');
        if (text.toLowerCase().includes('cpp')) matchedSkills.add('C++');

        const finalSkills = Array.from(matchedSkills);
        logger.info(`Extracted ${finalSkills.length} skills from resume.`);
        
        return finalSkills;
    } catch (err) {
        logger.error(`Error in Resume Analysis: ${err.message}`);
        // Return empty array instead of throwing to allow the upload process to continue
        return [];
    }
};
