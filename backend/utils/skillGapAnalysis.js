const prisma = require('./prisma');

/**
 * Skill Categories Mapping
 */
const SKILL_MAP = {
  'Languages': ['javascript', 'python', 'java', 'cpp', 'c++', 'c#', 'typescript', 'go', 'ruby', 'swift', 'php', 'kotlin', 'rust'],
  'Frontend': ['react', 'vue', 'angular', 'html', 'css', 'tailwind', 'next.js', 'redux', 'flutter', 'sass', 'bootstrap', 'webpack'],
  'Backend': ['node.js', 'express', 'django', 'flask', 'spring boot', 'laravel', 'fastapi', 'microservices', 'rest api', 'graphql'],
  'Database': ['sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'firebase', 'oracle', 'dynamodb', 'cassandra'],
  'DevOps/Cloud': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'ci/cd', 'terraform', 'linux', 'git', 'ansible'],
  'Data/ML': ['machine learning', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'nlp', 'deep learning', 'tableau', 'power bi'],
  'Soft Skills': ['communication', 'leadership', 'problem solving', 'teamwork', 'critical thinking', 'agile', 'scrum', 'time management']
};

/**
 * Normalizes a skill string for comparison
 */
const normalize = (skill) => skill.toLowerCase().trim();

/**
 * Analyzes the skill gap for a specific student
 * @param {string} studentProfileId 
 * @returns {Promise<Array>} Data formatted for Radar chart
 */
const analyzeSkillGap = async (studentProfileId) => {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    include: {
      watchlist: { include: { job: true } },
      applications: { include: { job: true } }
    }
  });

  if (!profile) return [];

  // GLOBAL BENCHMARKS: Default demand distribution if no real job data is available
  const GLOBAL_BENCHMARK = {
    'Languages': 85,
    'Frontend': 70,
    'Backend': 75,
    'Database': 60,
    'DevOps/Cloud': 50,
    'Data/ML': 45,
    'Soft Skills': 90
  };

  const studentSkills = (profile.skills || []).map(normalize);
  
  // Collect all job demands from watchlist and applications
  const untrackedJobsDemands = await prisma.job.findMany({
    where: { status: 'open', deadline: { gte: new Date() } },
    orderBy: { viewsCount: 'desc' },
    take: 15
  });

  const allJobsDemands = [
    ...profile.watchlist.map(w => w.job.requiredSkills),
    ...profile.applications.map(a => a.job.requiredSkills),
    ...untrackedJobsDemands.map(j => j.requiredSkills)
  ].flat().filter(Boolean).map(normalize);

  const marketDemandFreq = {};
  allJobsDemands.forEach(skill => {
    marketDemandFreq[skill] = (marketDemandFreq[skill] || 0) + 1;
  });

  const chartData = Object.keys(SKILL_MAP).map(category => {
    const categorySkills = SKILL_MAP[category].map(normalize);
    
    // User Score: How many of these category skills does the user have?
    const userOwnedInCategory = categorySkills.filter(s => studentSkills.includes(s)).length;
    // Scale it to 0-100 based on assumed baseline (e.g., having 3-4 key skills in a category is "strong")
    const userScore = Math.min((userOwnedInCategory / 3) * 100, 100);

    // Market Demand: Frequency of these category skills in relevant jobs
    let totalDemandPoints = 0;
    categorySkills.forEach(s => {
      totalDemandPoints += (marketDemandFreq[s] || 0);
    });
    
    return {
      subject: category,
      me: Math.round(userScore),
      market: GLOBAL_BENCHMARK[category] || 20, // default to benchmark
      rawDemand: totalDemandPoints,
      missing: categorySkills.filter(s => !studentSkills.includes(s) && (marketDemandFreq[s] > 0 || GLOBAL_BENCHMARK[category] > 50))
    };
  });

  // Second pass: If we have real data, override benchmarks with normalized real-world demand
  const maxRawDemand = Math.max(...chartData.map(d => d.rawDemand)) || 0;
  
  return chartData.map(d => {
    if (maxRawDemand > 0) {
      // Scale market demand relative to the most in-demand category in the current set
      d.market = Math.round(Math.min((d.rawDemand / (maxRawDemand * 0.9)) * 100, 100));
      // Ensure it doesn't drop too low for key categories
      d.market = Math.max(d.market, 30);
    }
    return d;
  });
};

module.exports = { analyzeSkillGap };
