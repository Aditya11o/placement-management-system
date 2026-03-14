export interface Resource {
    title: string;
    url: string;
    type: 'DOCS' | 'COURSE' | 'PRACTICE';
    effort: string;
}

export const skillResources: Record<string, Resource[]> = {
    'React': [
        { title: 'Official React Documentation', url: 'https://react.dev', type: 'DOCS', effort: '2-3 days' },
        { title: 'Scrimba: Learn React for Free', url: 'https://scrimba.com/learn/learnreact', type: 'COURSE', effort: '1 week' }
    ],
    'Node.js': [
        { title: 'Node.js Learning Path', url: 'https://nodejs.org/en/learn', type: 'DOCS', effort: '3-4 days' }
    ],
    'TypeScript': [
        { title: 'TypeScript in 5 Minutes', url: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html', type: 'DOCS', effort: '1 day' },
        { title: 'TypeScript Exercises', url: 'https://typescript-exercises.github.io/', type: 'PRACTICE', effort: '2 days' }
    ],
    'Python': [
        { title: 'The Python Tutorial', url: 'https://docs.python.org/3/tutorial/index.html', type: 'DOCS', effort: '1 week' },
        { title: 'HackerRank Python Path', url: 'https://www.hackerrank.com/domains/python', type: 'PRACTICE', effort: 'Ongoing' }
    ],
    'SQL': [
        { title: 'SQLZoo Interactive Tutorial', url: 'https://sqlzoo.net/wiki/SQL_Tutorial', type: 'PRACTICE', effort: '3 days' },
        { title: 'Select Star SQL', url: 'https://selectstarsql.com/', type: 'COURSE', effort: '2 days' }
    ],
    'AWS': [
        { title: 'AWS Cloud Practitioner Essentials', url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials', type: 'COURSE', effort: '15-20 hours' }
    ],
    'Docker': [
        { title: 'Docker Official Get Started', url: 'https://docs.docker.com/get-started/', type: 'DOCS', effort: '2 days' }
    ],
    'JavaScript': [
        { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'DOCS', effort: '1 week' },
        { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'COURSE', effort: '2-3 weeks' }
    ]
};

export const getResourcesForSkill = (skill: string): Resource[] => {
    // Basic fuzzy match or direct lookup
    const key = Object.keys(skillResources).find(k => k.toLowerCase() === skill.toLowerCase());
    return key ? skillResources[key] : [
        { title: `Search ${skill} on MDN`, url: `https://developer.mozilla.org/en-US/search?q=${skill}`, type: 'DOCS', effort: '1-2 days' }
    ];
};
